package com.enscs.internship.controller;

import com.enscs.internship.dto.response.AuditLogResponse;
import com.enscs.internship.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/audit-log")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Audit Log", description = "Admin action audit trail — SPRINT 3")
@SecurityRequirement(name = "bearerAuth")
public class AuditLogController {

    private final AuditService auditService;

    /** GET /api/admin/audit-log — all entries, newest first */
    @GetMapping
    @Operation(summary = "Get all audit log entries (Admin only)")
    public ResponseEntity<Page<AuditLogResponse>> getAll(
            @PageableDefault(size = 50, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(auditService.getAll(pageable));
    }

    /** GET /api/admin/audit-log?actorId=1 */
    @GetMapping("/actor/{actorId}")
    @Operation(summary = "Get audit entries by actor (Admin only)")
    public ResponseEntity<Page<AuditLogResponse>> getByActor(
            @PathVariable Long actorId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(auditService.getByActor(actorId, pageable));
    }

    /** GET /api/admin/audit-log/entity/{type}/{id} — history of a specific entity */
    @GetMapping("/entity/{entityType}/{entityId}")
    @Operation(summary = "Get audit history for a specific entity (Admin only)")
    public ResponseEntity<Page<AuditLogResponse>> getByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(auditService.getByEntity(entityType, entityId, pageable));
    }

    /** GET /api/admin/audit-log/range?from=...&to=... */
    @GetMapping("/range")
    @Operation(summary = "Get audit entries within a date range (Admin only)")
    public ResponseEntity<Page<AuditLogResponse>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(auditService.getByDateRange(from, to, pageable));
    }
}
