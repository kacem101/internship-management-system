package com.enscs.internship.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * SPRINT 2 — Stores in-app notifications for all users.
 * Each row targets a single user. The frontend polls GET /api/notifications.
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_user", columnList = "user_id"),
    @Index(name = "idx_notification_read", columnList = "user_id, is_read"),
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /** Category for frontend icon/colour routing */
    @Column(nullable = false)
    private String type;   // APPLICATION_STATUS, REPORT_SUBMITTED, OVERDUE, WITHDRAWAL, NEW_APPLICATION

    /** Entity type for frontend navigation */
    private String entityType;   // APPLICATION, REPORT, OFFER

    private Long entityId;

    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
