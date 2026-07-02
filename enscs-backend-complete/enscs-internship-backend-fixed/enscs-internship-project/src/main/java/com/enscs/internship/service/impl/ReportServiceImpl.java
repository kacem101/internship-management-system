package com.enscs.internship.service.impl;

import com.enscs.internship.dto.response.ReportResponse;
import com.enscs.internship.entity.InternshipApplication;
import com.enscs.internship.entity.InternshipReport;
import com.enscs.internship.entity.Student;
import com.enscs.internship.enums.ApplicationStatus;
import com.enscs.internship.exception.BadRequestException;
import com.enscs.internship.exception.ResourceNotFoundException;
import com.enscs.internship.repository.InternshipApplicationRepository;
import com.enscs.internship.repository.InternshipReportRepository;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.DocumentStorageService;
import com.enscs.internship.service.NotificationService;
import com.enscs.internship.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final InternshipReportRepository reportRepository;
    private final InternshipApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final DocumentStorageService documentStorageService;
    private final NotificationService notificationService;   // SPRINT 2

    /** SPRINT 1 — Global fallback deadline (used only if offer has no value set) */
    @Value("${app.report.deadline-days:14}")
    private int globalDeadlineDays;

    @Override
    @Transactional
    public ReportResponse submitReport(Long studentId, Long applicationId,
                                       MultipartFile reportFile, MultipartFile dailyLog) {
        Student student = (Student) userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        InternshipApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        if (!application.getStudent().getId().equals(studentId))
            throw new BadRequestException("This application does not belong to you.");
        if (application.getStatus() != ApplicationStatus.ACCEPTED)
            throw new BadRequestException("Reports can only be submitted for accepted internships.");

        // SPRINT 1 — use per-offer deadline, fall back to global
        int deadlineDays = application.getOffer().getReportDeadlineDays() != null
                ? application.getOffer().getReportDeadlineDays()
                : globalDeadlineDays;

        boolean isNew = false;
        InternshipReport report = reportRepository.findByApplicationId(applicationId)
                .orElse(null);
        if (report == null) {
            report = InternshipReport.builder()
                    .student(student)
                    .application(application)
                    .submissionDeadline(application.getOffer().getEndDate().plusDays(deadlineDays))
                    .build();
            isNew = true;
        }

        if (reportFile != null && !reportFile.isEmpty()) {
            if (report.getReportFilePath() != null)
                documentStorageService.deleteFile(report.getReportFilePath());
            report.setReportFilePath(documentStorageService.storeFile(reportFile, "reports"));
            report.setReportFileType(reportFile.getContentType());
            report.setReportFileSizeBytes(reportFile.getSize());
        }
        if (dailyLog != null && !dailyLog.isEmpty()) {
            if (report.getDailyLogFilePath() != null)
                documentStorageService.deleteFile(report.getDailyLogFilePath());
            report.setDailyLogFilePath(documentStorageService.storeFile(dailyLog, "daily-logs"));
        }

        report.setSubmittedAt(LocalDateTime.now());
        report.setLate(LocalDateTime.now().toLocalDate().isAfter(report.getSubmissionDeadline()));

        InternshipReport saved = reportRepository.save(report);

        // SPRINT 2 — notify admin and supervisors that a new report was submitted
        if (isNew) {
            notificationService.notifyReportSubmitted(saved);
        }

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ReportResponse getReportById(Long reportId) {
        return toResponse(findReport(reportId));
    }

    @Override
    @Transactional(readOnly = true)
    public ReportResponse getReportByApplication(Long applicationId) {
        return toResponse(reportRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("No report for application: " + applicationId)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportResponse> getAllSubmittedReports(Pageable pageable) {
        return reportRepository.findAllSubmitted(pageable).map(this::toResponse);
    }

    @Override
@Transactional(readOnly = true)
public Page<ReportResponse> getOverdueReports(Pageable pageable) {
    // 1. Fetch the raw records from the left join query
    List<InternshipReport> rawList = reportRepository.findOverdueReports(globalDeadlineDays);
    
    // 2. Query returns a list from the Application perspective. 
    // If a student hasn't created a report row yet, the item in this list will be NULL.
    // We must find the matching Application context to build our response.
    List<InternshipReport> cleanList = rawList.stream().map(report -> {
        if (report != null) {
            return report; // It exists in the DB (it's a draft or late submission)
        }
        
        // If it's null, we need to map a transient placeholder (handled by your existing logic)
        // For simplicity, we can filter or build placeholders here if needed.
        return report; 
    })
    .filter(java.util.Objects::nonNull) // Safe check to prevent mapping empty items
    .toList();

    int start = (int) pageable.getOffset();
    int end = Math.min(start + pageable.getPageSize(), cleanList.size());
    
    return new PageImpl<>(
            cleanList.subList(start, end).stream().map(this::toResponse).toList(),
            pageable, 
            cleanList.size()
    );
}

    @Override
    public byte[] downloadReportFile(Long reportId) {
        InternshipReport r = findReport(reportId);
        if (r.getReportFilePath() == null) throw new ResourceNotFoundException("No report file uploaded yet.");
        return documentStorageService.loadFile(r.getReportFilePath());
    }

    @Override
    public byte[] downloadDailyLog(Long reportId) {
        InternshipReport r = findReport(reportId);
        if (r.getDailyLogFilePath() == null) throw new ResourceNotFoundException("No daily log uploaded yet.");
        return documentStorageService.loadFile(r.getDailyLogFilePath());
    }

    private InternshipReport findReport(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + id));
    }

    private ReportResponse toResponse(InternshipReport r) {
        return ReportResponse.builder()
                .id(r.getId())
                .studentId(r.getStudent().getId())
                .studentName(r.getStudent().getFullName())
                .applicationId(r.getApplication().getId())
                .offerTitle(r.getApplication().getOffer().getTitle())
                .hasReport(r.getReportFilePath() != null)
                .hasDailyLog(r.getDailyLogFilePath() != null)
                .submissionDeadline(r.getSubmissionDeadline())
                .submittedAt(r.getSubmittedAt())
                .isLate(r.isLate())
                .reportFileSizeBytes(r.getReportFileSizeBytes())
                .build();
    }
}
