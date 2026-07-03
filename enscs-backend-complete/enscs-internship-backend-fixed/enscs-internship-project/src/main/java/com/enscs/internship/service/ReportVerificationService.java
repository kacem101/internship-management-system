package com.enscs.internship.service;

import com.enscs.internship.dto.request.ReportVerificationRequest;
import com.enscs.internship.dto.response.ReportVerificationResponse;

public interface ReportVerificationService {

    /**
     * @param reportId            the report being verified
     * @param companyContactEmail the AUTHENTICATED caller's email (from the JWT principal) —
     *                             never a client-supplied ID. The service resolves this to a
     *                             CompanyContact and checks it against the report's company.
     */
    ReportVerificationResponse submit(Long reportId, String companyContactEmail, ReportVerificationRequest request);

    /**
     * @param reportId      the report being read
     * @param requesterEmail the AUTHENTICATED caller's email. Access is scoped inside the
     *                       implementation: owning student, Supervisor, Admin, or a
     *                       Company Contact from the matching company.
     */
    ReportVerificationResponse getByReportId(Long reportId, String requesterEmail);
}