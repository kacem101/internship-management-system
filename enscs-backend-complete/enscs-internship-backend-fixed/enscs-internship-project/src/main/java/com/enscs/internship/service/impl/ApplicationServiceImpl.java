package com.enscs.internship.service.impl;

import com.enscs.internship.dto.request.ApplicationRequest;
import com.enscs.internship.dto.request.WithdrawRequest;
import com.enscs.internship.dto.response.ApplicationResponse;
import com.enscs.internship.entity.InternshipApplication;
import com.enscs.internship.entity.InternshipOffer;
import com.enscs.internship.entity.Student;
import com.enscs.internship.enums.ApplicationStatus;
import com.enscs.internship.enums.OfferStatus;
import com.enscs.internship.enums.RequirementStatus;
import com.enscs.internship.exception.BadRequestException;
import com.enscs.internship.exception.ResourceNotFoundException;
import com.enscs.internship.repository.InternshipApplicationRepository;
import com.enscs.internship.repository.InternshipOfferRepository;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.ApplicationService;
import com.enscs.internship.service.AuditService;
import com.enscs.internship.service.DocumentStorageService;
import com.enscs.internship.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.enscs.internship.repository.InternshipRequirementRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final InternshipApplicationRepository applicationRepository;
    private final InternshipOfferRepository offerRepository;
    private final InternshipRequirementRepository requirementRepository;
    private final UserRepository userRepository;
    private final DocumentStorageService documentStorageService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Value("${app.withdrawal.cutoff-days:7}")
    private int withdrawalCutoffDays;

    @Override
    @Transactional
    public ApplicationResponse applyToOffer(Long studentId, Long offerId,
                                             ApplicationRequest request, MultipartFile resume) {
        Student student = (Student) userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        InternshipOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found: " + offerId));

        if (offer.getStatus() != OfferStatus.OPEN)
            throw new BadRequestException("This internship offer is no longer accepting applications.");

        if (offer.getVisibility() == com.enscs.internship.enums.OfferVisibility.PRIVATE
                && (offer.getSourcedByStudent() == null || !offer.getSourcedByStudent().getId().equals(studentId))) {
            throw new BadRequestException("This internship offer is private and cannot be applied to.");
        }

        if (offerRepository.countByOfferIdAndStatusIn(offerId, List.of(
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.CONFIRMED)) >= offer.getCapacity()) {
            throw new BadRequestException("This internship offer has reached its capacity.");
        }

        applicationRepository.findByStudentIdAndOfferId(studentId, offerId).ifPresent(prev -> {
            if (prev.getStatus() == ApplicationStatus.WITHDRAWN && !prev.isCanReapply())
                throw new BadRequestException("You are not permitted to re-apply to this offer.");
            if (prev.getStatus() != ApplicationStatus.WITHDRAWN)
                throw new BadRequestException("You have already applied to this offer.");
        });

        String resumePath = null;
        if (resume != null && !resume.isEmpty())
            resumePath = documentStorageService.storeFile(resume, "resumes");

        InternshipApplication application = InternshipApplication.builder()
                .student(student)
                .offer(offer)
                .resumePath(resumePath)
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.PENDING)
                .build();

        InternshipApplication saved = applicationRepository.save(application);
        notificationService.notifyNewApplication(saved);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long applicationId) {
        return toResponse(findApplication(applicationId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplicationsByStudent(Long studentId, Pageable pageable) {
        return applicationRepository.findByStudentId(studentId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplicationsByOffer(Long offerId, Pageable pageable) {
        return applicationRepository.findByOfferId(offerId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getAllApplications(ApplicationStatus status, Pageable pageable) {
        if (status != null)
            return applicationRepository.findByStatus(status, pageable).map(this::toResponse);
        return applicationRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public ApplicationResponse confirmApplication(Long studentId, Long applicationId) {
        InternshipApplication selected = findApplication(applicationId);
        if (!selected.getStudent().getId().equals(studentId)) {
            throw new BadRequestException("You are not authorized to confirm this application.");
        }
        if (selected.getStatus() != ApplicationStatus.ACCEPTED) {
            throw new BadRequestException("Only accepted applications can be confirmed.");
        }

        if (!requirementRepository.findByStudentIdAndStatusIn(studentId, List.of(RequirementStatus.CONFIRMED)).isEmpty()) {
            throw new BadRequestException("You have already confirmed another internship for this period.");
        }

        selected.setStatus(ApplicationStatus.CONFIRMED);
        selected.setConfirmedAt(LocalDateTime.now());
        InternshipApplication confirmed = applicationRepository.save(selected);
        notificationService.notifyApplicationStatusChanged(confirmed, ApplicationStatus.ACCEPTED);

        List<InternshipApplication> others = applicationRepository.findByStudentIdAndStatusIn(studentId, List.of(
                ApplicationStatus.PENDING,
                ApplicationStatus.UNDER_REVIEW,
                ApplicationStatus.ACCEPTED
        ));
        for (InternshipApplication other : others) {
            if (other.getId().equals(applicationId)) continue;
            ApplicationStatus oldStatus = other.getStatus();
            other.setStatus(ApplicationStatus.WITHDRAWN_AUTO);
            other.setAutoWithdrawnReason("Student confirmed another offer: " + applicationId);
            applicationRepository.save(other);
            notificationService.notifyApplicationStatusChanged(other, oldStatus);
            auditService.log(currentUserEmail(), "APPLICATION_WITHDRAWN_AUTO",
                    "APPLICATION", other.getId(),
                    oldStatus.name(), ApplicationStatus.WITHDRAWN_AUTO.name(),
                    "Auto-withdrew application #" + other.getId() + " after student confirmed application #" + applicationId);
        }

        requirementRepository.findByStudentIdAndAcademicYear(studentId, selected.getOffer().getStartDate().getYear() + "-" + (selected.getOffer().getStartDate().getYear() + 1))
                .ifPresent(requirement -> {
                    requirement.setStatus(RequirementStatus.CONFIRMED);
                    requirementRepository.save(requirement);
                });

        auditService.log(currentUserEmail(), "APPLICATION_CONFIRMED",
                "APPLICATION", applicationId,
                ApplicationStatus.ACCEPTED.name(), ApplicationStatus.CONFIRMED.name(),
                "Student " + selected.getStudent().getFullName() + " confirmed application #" + applicationId);

        return toResponse(confirmed);
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, ApplicationStatus status,
                                                        String adminNotes) {
        InternshipApplication application = findApplication(applicationId);
        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(status);
        if (adminNotes != null) application.setAdminNotes(adminNotes);
        InternshipApplication saved = applicationRepository.save(application);

        if (oldStatus != status) {
            notificationService.notifyApplicationStatusChanged(saved, oldStatus);
        }

        // FIX: use currentUserEmail() helper defined below
        auditService.log(
                currentUserEmail(),
                "APPLICATION_STATUS_CHANGED",
                "APPLICATION", applicationId,
                oldStatus.name(), status.name(),
                "Application #" + applicationId + " for \"" + saved.getOffer().getTitle() +
                "\" set to " + status.name() +
                (adminNotes != null ? " with notes: " + adminNotes : "")
        );

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void withdrawApplication(Long applicationId, Long studentId, WithdrawRequest request) {
        InternshipApplication application = findApplication(applicationId);

        if (!application.getStudent().getId().equals(studentId))
            throw new BadRequestException("You are not authorized to withdraw this application.");

        // FIX: capture status BEFORE mutating it — this is the previousStatus
        ApplicationStatus statusBeforeWithdrawal = application.getStatus();

        if (statusBeforeWithdrawal == ApplicationStatus.ACCEPTED)
            throw new BadRequestException(
                    "Accepted applications cannot be withdrawn through the system. " +
                    "Please contact the administration.");

        if (statusBeforeWithdrawal == ApplicationStatus.REJECTED
                || statusBeforeWithdrawal == ApplicationStatus.WITHDRAWN)
            throw new BadRequestException("This application cannot be withdrawn.");

        LocalDate startDate = application.getOffer().getStartDate();
        if (startDate != null && LocalDate.now().isAfter(startDate.minusDays(withdrawalCutoffDays))) {
            throw new BadRequestException(
                    "Withdrawal is not allowed within " + withdrawalCutoffDays +
                    " days of the internship start date. Please contact the administration directly.");
        }

        if (statusBeforeWithdrawal == ApplicationStatus.UNDER_REVIEW) {
            String reason = request != null ? request.getWithdrawalReason() : null;
            if (reason == null || reason.trim().length() < 20)
                throw new BadRequestException(
                        "A withdrawal reason of at least 20 characters is required " +
                        "when the application is under review.");
            application.setWithdrawalReason(reason.trim());
        } else if (request != null && request.getWithdrawalReason() != null) {
            application.setWithdrawalReason(request.getWithdrawalReason().trim());
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);

        notificationService.notifyApplicationWithdrawn(application, statusBeforeWithdrawal);

        // FIX: use statusBeforeWithdrawal (not the undefined previousStatus)
        //      and use "student:<id>" as actor since this action is done by the student
        auditService.log(
                "student:" + studentId,
                "APPLICATION_WITHDRAWN",
                "APPLICATION", applicationId,
                statusBeforeWithdrawal.name(), ApplicationStatus.WITHDRAWN.name(),
                "Student " + application.getStudent().getFullName() +
                " withdrew application #" + applicationId +
                " (was " + statusBeforeWithdrawal.name() + ")"
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private InternshipApplication findApplication(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
    }

    /**
     * Resolves the email of the currently authenticated user from the Spring Security context.
     * Returns "system" if no authentication is present (e.g. scheduled jobs).
     */
    private String currentUserEmail() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return "system";
            return auth.getName();
        } catch (Exception e) {
            return "system";
        }
    }

    private ApplicationResponse toResponse(InternshipApplication app) {
        return ApplicationResponse.builder()
                .id(app.getId())
                .studentId(app.getStudent().getId())
                .studentName(app.getStudent().getFullName())
                .offerId(app.getOffer().getId())
                .offerTitle(app.getOffer().getTitle())
                .companyName(app.getOffer().getCompanyName())
                .coverLetter(app.getCoverLetter())
                .status(app.getStatus().name())
                .adminNotes(app.getAdminNotes())
                .hasResume(app.getResumePath() != null)
                .appliedAt(app.getAppliedAt())
                .withdrawalReason(app.getWithdrawalReason())
                .canReapply(app.isCanReapply())
                .reportDeadlineDays(app.getOffer().getReportDeadlineDays())
                .build();
    }
}