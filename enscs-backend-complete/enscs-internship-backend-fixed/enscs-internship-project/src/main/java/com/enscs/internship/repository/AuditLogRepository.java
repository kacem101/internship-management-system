package com.enscs.internship.repository;

import com.enscs.internship.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByActorIdOrderByCreatedAtDesc(Long actorId, Pageable pageable);

    Page<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
            String entityType, Long entityId, Pageable pageable);

    Page<AuditLog> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
