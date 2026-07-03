package com.enscs.internship.controller;

import com.enscs.internship.dto.request.ApplicationRequest;
import com.enscs.internship.dto.request.WithdrawRequest;
import com.enscs.internship.dto.response.ApplicationResponse;
import com.enscs.internship.enums.ApplicationStatus;
import com.enscs.internship.service.ApplicationService;
import com.enscs.internship.service.DocumentStorageService;
import com.enscs.internship.exception.ResourceNotFoundException;
import com.enscs.internship.repository.InternshipApplicationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Student application submission and status tracking")
@SecurityRequirement(name = "bearerAuth")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final DocumentStorageService documentStorageService;
    private final InternshipApplicationRepository applicationRepository;

    @PostMapping(value = "/offers/{offerId}/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Apply to an internship offer (Student only)")
    public ResponseEntity<ApplicationResponse> apply(
            @PathVariable Long offerId,
            @RequestParam Long studentId,
            @Valid @RequestPart("data") ApplicationRequest request,
            @RequestPart(value = "resume", required = false) MultipartFile resume) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.applyToOffer(studentId, offerId, request, resume));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get application details by ID")
    public ResponseEntity<ApplicationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all applications (Admin only), optional ?status= filter")
    public ResponseEntity<Page<ApplicationResponse>> getAll(
            @RequestParam(required = false) ApplicationStatus status,
            @PageableDefault(size = 20, sort = "appliedAt") Pageable pageable) {
        return ResponseEntity.ok(applicationService.getAllApplications(status, pageable));
    }

    @GetMapping("/students/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @Operation(summary = "Get all applications for a specific student")
    public ResponseEntity<Page<ApplicationResponse>> getByStudent(
            @PathVariable Long studentId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(applicationService.getApplicationsByStudent(studentId, pageable));
    }

    @GetMapping("/offers/{offerId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all applications for a specific offer (Admin only)")
    public ResponseEntity<Page<ApplicationResponse>> getByOffer(
            @PathVariable Long offerId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(applicationService.getApplicationsByOffer(offerId, pageable));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update the status of an application (Admin only)")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status,
            @RequestParam(required = false) String adminNotes) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status, adminNotes));
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Confirm an accepted application (Student only)")
    public ResponseEntity<ApplicationResponse> confirmApplication(
            @PathVariable Long id,
            @RequestParam Long studentId) {
        return ResponseEntity.ok(applicationService.confirmApplication(studentId, id));
    }

    /**
     * SPRINT 1 — withdraw now accepts optional JSON body with withdrawalReason.
     * Required when status is UNDER_REVIEW (min 20 chars). Blocked within cutoff days of start.
     */
    @PatchMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Withdraw an application (Student only)")
    public ResponseEntity<Void> withdraw(
            @PathVariable Long id,
            @RequestParam Long studentId,
            @RequestBody(required = false) WithdrawRequest request) {
        applicationService.withdrawApplication(id, studentId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/resume/download")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Download the resume file for an application (Admin only)")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long id) {
        var application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
        if (application.getResumePath() == null)
            throw new ResourceNotFoundException("No resume uploaded for application: " + id);
        byte[] data = documentStorageService.loadFile(application.getResumePath());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("resume_application_" + id + ".pdf").build());
        return ResponseEntity.ok().headers(headers).body(data);
    }
}
