package com.enscs.internship.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * SPRINT 3 — Records every admin action for accountability.
 * Immutable after creation (no @LastModifiedDate, no setters for audit fields).
 */
@Entity
@Table(name = "audit_log", indexes = {
    @Index(name = "idx_audit_actor",  columnList = "actor_id"),
    @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
    @Index(name = "idx_audit_time",   columnList = "created_at"),
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    /** What happened — e.g. APPLICATION_STATUS_CHANGED, OFFER_CREATED, USER_DISABLED */
    @Column(nullable = false)
    private String action;

    /** Which domain entity was affected */
    @Column(nullable = false)
    private String entityType;   // APPLICATION, OFFER, USER, REPORT

    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String oldValue;

    @Column(columnDefinition = "TEXT")
    private String newValue;

    /** Human-readable summary for the admin log page */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
