package com.enscs.internship.service.impl;

import com.enscs.internship.dto.request.ReportVerificationRequest;
import com.enscs.internship.dto.response.ReportVerificationResponse;
import com.enscs.internship.entity.InternshipReport;
import com.enscs.internship.entity.ReportVerification;
import com.enscs.internship.entity.CompanyContact;
import com.enscs.internship.enums.VerificationStatus;
import com.enscs.internship.exception.BadRequestException;
import com.enscs.internship.exception.ResourceNotFoundException;
import com.enscs.internship.repository.InternshipReportRepository;
import com.enscs.internship.repository.ReportVerificationRepository;
import com.enscs.internship.repository.CompanyContactRepository;
import com.enscs.internship.service.ReportVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReportVerificationServiceImpl implements ReportVerificationService {

    private final ReportVerificationRepository verificationRepository;
    private final InternshipReportRepository reportRepository;
    private final CompanyContactRepository companyContactRepository;

    @Override
    @Transactional
    public ReportVerificationResponse submit(Long reportId, Long companyContactId, ReportVerificationRequest request) {
        if (request.getStatus() == null) throw new BadRequestException("status is required");
        if (request.getStatus() == VerificationStatus.DISPUTED && (request.getComment() == null || request.getComment().isBlank())) {
            throw new BadRequestException("comment is required when disputing a report");
        }
        if (!(request.getStatus() == VerificationStatus.CONFIRMED || request.getStatus() == VerificationStatus.DISPUTED)) {
            throw new BadRequestException("status must be CONFIRMED or DISPUTED for report verification");
        }

        InternshipReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        CompanyContact verifier = companyContactRepository.findById(companyContactId)
                .orElseThrow(() -> new ResourceNotFoundException("Company contact not found: " + companyContactId));

        ReportVerification v = verificationRepository.findByReportId(reportId).orElseGet(() -> {
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
    public ReportVerificationResponse getByReportId(Long reportId) {
        ReportVerification v = verificationRepository.findByReportId(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification not found for report: " + reportId));
        return toResponse(v);
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
