package com.enscs.internship.entity;

import com.enscs.internship.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "internship_applications",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "offer_id"}))
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InternshipApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private InternshipOffer offer;

    private String resumePath;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    /**
     * SPRINT 1 — Reason provided by student when withdrawing (required for UNDER_REVIEW).
     */
    @Column(columnDefinition = "TEXT")
    private String withdrawalReason;

    /**
     * SPRINT 1 — Admin can block re-application after withdrawal (e.g. repeated no-shows).
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean canReapply = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime appliedAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime confirmedAt;

    @Column(columnDefinition = "TEXT")
    private String autoWithdrawnReason;
}
