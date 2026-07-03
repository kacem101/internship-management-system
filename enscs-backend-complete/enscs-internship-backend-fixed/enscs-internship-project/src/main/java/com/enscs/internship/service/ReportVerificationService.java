package com.enscs.internship.service;

import com.enscs.internship.dto.request.ReportVerificationRequest;
import com.enscs.internship.dto.response.ReportVerificationResponse;

public interface ReportVerificationService {
    ReportVerificationResponse submit(Long reportId, Long companyContactId, ReportVerificationRequest request);
    ReportVerificationResponse getByReportId(Long reportId);
}
