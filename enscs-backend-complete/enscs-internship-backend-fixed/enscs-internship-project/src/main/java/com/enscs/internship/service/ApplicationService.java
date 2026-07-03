package com.enscs.internship.service;

import com.enscs.internship.dto.request.ApplicationRequest;
import com.enscs.internship.dto.request.WithdrawRequest;
import com.enscs.internship.dto.response.ApplicationResponse;
import com.enscs.internship.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ApplicationService {

    ApplicationResponse applyToOffer(Long studentId, Long offerId,
                                     ApplicationRequest request, MultipartFile resume);

    ApplicationResponse getApplicationById(Long applicationId);

    Page<ApplicationResponse> getApplicationsByStudent(Long studentId, Pageable pageable);

    Page<ApplicationResponse> getApplicationsByOffer(Long offerId, Pageable pageable);

    Page<ApplicationResponse> getAllApplications(ApplicationStatus status, Pageable pageable);

    ApplicationResponse updateApplicationStatus(Long applicationId, ApplicationStatus status, String adminNotes);

    ApplicationResponse confirmApplication(Long studentId, Long applicationId);

    /** SPRINT 1 — withdrawal with reason + cutoff enforcement */
    void withdrawApplication(Long applicationId, Long studentId, WithdrawRequest request);
}
