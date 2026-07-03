package com.enscs.internship.controller;

import com.enscs.internship.dto.request.ReportVerificationRequest;
import com.enscs.internship.dto.response.ReportResponse;
import com.enscs.internship.dto.response.ReportVerificationResponse;
import com.enscs.internship.service.ReportService;
import com.enscs.internship.service.ReportVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Internship report and daily log submission")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;
    private final ReportVerificationService reportVerificationService;

    @PostMapping(value = "/applications/{applicationId}/submit",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit / update report and daily log for an accepted internship")
    public ResponseEntity<ReportResponse> submit(
            @PathVariable Long applicationId,
            @RequestParam Long studentId,
            @RequestPart(value = "reportFile", required = false) MultipartFile reportFile,
            @RequestPart(value = "dailyLog",   required = false) MultipartFile dailyLog) {
        return ResponseEntity.ok(reportService.submitReport(studentId, applicationId, reportFile, dailyLog));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report metadata by ID")
    public ResponseEntity<ReportResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    @GetMapping("/applications/{applicationId}")
    @Operation(summary = "Get report by application ID")
    public ResponseEntity<ReportResponse> getByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(reportService.getReportByApplication(applicationId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @Operation(summary = "List all submitted reports (Supervisor / Admin)")
    public ResponseEntity<Page<ReportResponse>> getAllSubmitted(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(reportService.getAllSubmittedReports(pageable));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List overdue reports (Admin only)")
    public ResponseEntity<Page<ReportResponse>> getOverdue(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(reportService.getOverdueReports(pageable));
    }

    @GetMapping("/{id}/download/report")
    @PreAuthorize("hasAnyRole('STUDENT', 'SUPERVISOR', 'ADMIN')")
    @Operation(summary = "Download the main report file")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long id) {
        byte[] data = reportService.downloadReportFile(id);
        return buildDownloadResponse(data, "report_" + id + ".pdf");
    }

    @GetMapping("/{id}/download/daily-log")
    @PreAuthorize("hasAnyRole('STUDENT', 'SUPERVISOR', 'ADMIN')")
    @Operation(summary = "Download the daily log file")
    public ResponseEntity<byte[]> downloadDailyLog(@PathVariable Long id) {
        byte[] data = reportService.downloadDailyLog(id);
        return buildDownloadResponse(data, "daily_log_" + id + ".pdf");
    }

    /**
     * Company Contact confirms or disputes a report. The verifier identity is taken
     * from the authenticated principal (JWT), never from a client-supplied ID —
     * a request param here would let any COMPANY_CONTACT impersonate another one.
     * Company-ownership matching happens inside the service, not here.
     */
    @PostMapping("/{id}/verification")
    @PreAuthorize("hasRole('COMPANY_CONTACT')")
    @Operation(summary = "Submit or update a report verification (Company Contact)")
    public ResponseEntity<ReportVerificationResponse> submitVerification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody ReportVerificationRequest request) {
        return ResponseEntity.ok(reportVerificationService.submit(id, principal.getUsername(), request));
    }

    /**
     * Readable by: the owning student, any Supervisor/Admin, or a Company Contact
     * whose company matches the internship's company. All of that is enforced in
     * the service based on the authenticated principal — not left to the caller.
     */
    @GetMapping("/{id}/verification")
    @PreAuthorize("hasAnyRole('STUDENT', 'SUPERVISOR', 'ADMIN', 'COMPANY_CONTACT')")
    @Operation(summary = "Get report verification")
    public ResponseEntity<ReportVerificationResponse> getVerification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(reportVerificationService.getByReportId(id, principal.getUsername()));
    }

    private ResponseEntity<byte[]> buildDownloadResponse(byte[] data, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
        return ResponseEntity.ok().headers(headers).body(data);
    }
}