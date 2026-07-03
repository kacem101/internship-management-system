package com.enscs.internship.service.impl;

import com.enscs.internship.dto.request.ReportVerificationRequest;
import com.enscs.internship.dto.response.ReportVerificationResponse;
import com.enscs.internship.entity.*;
import com.enscs.internship.enums.VerificationStatus;
import com.enscs.internship.exception.BadRequestException;
import com.enscs.internship.exception.ResourceNotFoundException;
import com.enscs.internship.repository.CompanyContactRepository;
import com.enscs.internship.repository.InternshipReportRepository;
import com.enscs.internship.repository.ReportVerificationRepository;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.ReportVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ReportVerificationServiceImpl implements ReportVerificationService {

    private final ReportVerificationRepository verificationRepository;
    private final InternshipReportRepository reportRepository;
    private final CompanyContactRepository companyContactRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ReportVerificationResponse submit(Long reportId, String companyContactEmail, ReportVerificationRequest request) {
        if (request.getStatus() == null) {
            throw new BadRequestException("status is required");
        }
        if (request.getStatus() != VerificationStatus.CONFIRMED && request.getStatus() != VerificationStatus.DISPUTED) {
            throw new BadRequestException("status must be CONFIRMED or DISPUTED for report verification");
        }
        if (request.getStatus() == VerificationStatus.DISPUTED
                && (request.getComment() == null || request.getComment().isBlank())) {
            throw new BadRequestException("comment is required when disputing a report");
        }

        InternshipReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        CompanyContact verifier = companyContactRepository.findByEmail(companyContactEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Company contact not found: " + companyContactEmail));

        if (verifier.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new AccessDeniedException(
                    "Your company contact account has not been verified by an admin yet.");
        }

        Company reportCompany = resolveReportCompany(report);
        if (reportCompany == null) {
            throw new BadRequestException(
                    "This internship is not linked to a registered company record — verification is unavailable.");
        }
        if (!Objects.equals(reportCompany.getId(), verifier.getCompany().getId())) {
            throw new AccessDeniedException("You may only verify reports for your own company's interns.");
        }

        ReportVerification v = verificationRepository.findByReportId(reportId)
                .orElseGet(() -> {
                    ReportVerification rv = new ReportVerification();
                    rv.setReport(report);
                    return rv;
                });

        v.setStatus(request.getStatus());
        v.setComment(request.getComment());
        v.setVerifiedAt(LocalDateTime.now());
        v.setVerifiedBy(verifier);

        ReportVerification saved = verificationRepository.save(v);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ReportVerificationResponse getByReportId(Long reportId, String requesterEmail) {
        InternshipReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterEmail));

        assertCanRead(report, requester);

        ReportVerification v = verificationRepository.findByReportId(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification not found for report: " + reportId));
        return toResponse(v);
    }

    // ── Access control ──────────────────────────────────────────────────────

    private void assertCanRead(InternshipReport report, User requester) {
        if (requester instanceof Admin || requester instanceof Supervisor) {
            return; // full visibility
        }
        if (requester instanceof Student) {
            if (Objects.equals(report.getStudent().getId(), requester.getId())) return;
            throw new AccessDeniedException("You may only view your own report's verification.");
        }
        if (requester instanceof CompanyContact contact) {
            Company reportCompany = resolveReportCompany(report);
            if (reportCompany != null && contact.getCompany() != null
                    && Objects.equals(reportCompany.getId(), contact.getCompany().getId())) {
                return;
            }
            throw new AccessDeniedException("You may only view verifications for your own company's interns.");
        }
        throw new AccessDeniedException("Not authorized to view this verification.");
    }

    /**
     * Report → Application → Offer → Company. `Offer.company` is nullable during the
     * companyName→Company transition (see PHASE1_PLAN.md §3), so this can legitimately
     * return null for older/unlinked offers — callers must handle that case explicitly.
     */
    private Company resolveReportCompany(InternshipReport report) {
        InternshipApplication application = report.getApplication();
        if (application == null || application.getOffer() == null) return null;
        return application.getOffer().getCompany();
    }

    private ReportVerificationResponse toResponse(ReportVerification v) {
        return ReportVerificationResponse.builder()
                .id(v.getId())
                .reportId(v.getReport() != null ? v.getReport().getId() : null)
                .status(v.getStatus())
                .comment(v.getComment())
                .verifiedByName(v.getVerifiedBy() != null ? v.getVerifiedBy().getFullName() : null)
                .verifiedAt(v.getVerifiedAt())
                .build();
    }
}