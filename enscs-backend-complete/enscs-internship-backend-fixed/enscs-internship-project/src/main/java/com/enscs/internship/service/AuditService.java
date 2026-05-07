package com.enscs.internship.service;

import com.enscs.internship.dto.response.AuditLogResponse;
import com.enscs.internship.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface AuditService {

    /** Log any admin action. actorEmail resolved from Spring Security context. */
    void log(String actorEmail, String action, String entityType, Long entityId,
             String oldValue, String newValue, String description);

    Page<AuditLogResponse> getAll(Pageable pageable);

    Page<AuditLogResponse> getByActor(Long actorId, Pageable pageable);

    Page<AuditLogResponse> getByEntity(String entityType, Long entityId, Pageable pageable);

    Page<AuditLogResponse> getByDateRange(LocalDateTime from, LocalDateTime to, Pageable pageable);
}
