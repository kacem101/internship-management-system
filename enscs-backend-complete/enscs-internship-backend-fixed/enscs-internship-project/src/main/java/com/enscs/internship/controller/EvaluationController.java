package com.enscs.internship.controller;

import com.enscs.internship.dto.request.EvaluationRequest;
import com.enscs.internship.dto.response.EvaluationResponse;
import com.enscs.internship.service.EvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
@Tag(name = "Evaluations", description = "Supervisor evaluation of student internship reports")
@SecurityRequirement(name = "bearerAuth")
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping("/reports/{reportId}")
    @PreAuthorize("hasRole('SUPERVISOR')")
    @Operation(summary = "Submit a new evaluation for a report (Supervisor only)")
    public ResponseEntity<EvaluationResponse> submit(
            @PathVariable Long reportId,
            @RequestParam Long supervisorId,
            @Valid @RequestBody EvaluationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(evaluationService.submitEvaluation(supervisorId, reportId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERVISOR')")
    @Operation(summary = "Update an existing evaluation (Supervisor only)")
    public ResponseEntity<EvaluationResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody EvaluationRequest request) {
        return ResponseEntity.ok(evaluationService.updateEvaluation(id, request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @Operation(summary = "Get evaluation by ID")
    public ResponseEntity<EvaluationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(evaluationService.getEvaluationById(id));
    }

    @GetMapping("/reports/{reportId}")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN', 'STUDENT')")
    @Operation(summary = "Get the evaluation for a specific report")
    public ResponseEntity<EvaluationResponse> getByReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(evaluationService.getEvaluationByReport(reportId));
    }

    @GetMapping("/supervisors/{supervisorId}")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @Operation(summary = "List all evaluations by a supervisor")
    public ResponseEntity<Page<EvaluationResponse>> getBySupervisor(
            @PathVariable Long supervisorId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(evaluationService.getEvaluationsBySupervisor(supervisorId, pageable));
    }
}
