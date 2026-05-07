package com.enscs.internship.service.impl;

import com.enscs.internship.dto.response.AuditLogResponse;
import com.enscs.internship.entity.AuditLog;
import com.enscs.internship.entity.User;
import com.enscs.internship.repository.AuditLogRepository;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /**
     * Saves audit entry asynchronously in a new transaction so a failure
     * in audit logging never rolls back the main business operation.
     */
    @Override
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String actorEmail, String action, String entityType, Long entityId,
                    String oldValue, String newValue, String description) {
        try {
            User actor = userRepository.findByEmail(actorEmail).orElse(null);
            if (actor == null) {
                log.warn("AuditService: actor not found for email {}", actorEmail);
                return;
            }
            auditLogRepository.save(AuditLog.builder()
                    .actor(actor)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .description(description)
                    .build());
        } catch (Exception e) {
            log.error("AuditService: failed to save audit log entry: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAll(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getByActor(Long actorId, Pageable pageable) {
        return auditLogRepository.findByActorIdOrderByCreatedAtDesc(actorId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getByEntity(String entityType, Long entityId, Pageable pageable) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getByDateRange(LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return auditLogRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(from, to, pageable)
                .map(this::toResponse);
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .actorId(log.getActor().getId())
                .actorName(log.getActor().getFullName())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .description(log.getDescription())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
