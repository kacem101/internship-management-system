package com.enscs.internship.service;

import com.enscs.internship.dto.response.ReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ReportService {

    ReportResponse submitReport(Long studentId, Long applicationId,
                                MultipartFile reportFile, MultipartFile dailyLog);

    ReportResponse getReportById(Long reportId);

    ReportResponse getReportByApplication(Long applicationId);

    Page<ReportResponse> getAllSubmittedReports(Pageable pageable);

    Page<ReportResponse> getOverdueReports(Pageable pageable);

    byte[] downloadReportFile(Long reportId);

    byte[] downloadDailyLog(Long reportId);
}
