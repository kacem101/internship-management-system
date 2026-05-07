package com.enscs.internship.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Supervisor evaluation of a student's internship performance.
 * Linked to a specific report; includes grade and standardized feedback.
 */
@Entity
@Table(name = "supervisor_evaluations")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupervisorEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id", nullable = false)
    private Supervisor supervisor;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private InternshipReport report;

    // Grade on a 20-point scale (standard in Algerian higher education)
    @Column(nullable = false)
    private Double grade;

    @Column(columnDefinition = "TEXT")
    private String technicalFeedback;

    @Column(columnDefinition = "TEXT")
    private String professionalFeedback;

    @Column(columnDefinition = "TEXT")
    private String generalComments;

    // Company feedback text forwarded to supervisor
    @Column(columnDefinition = "TEXT")
    private String companyFeedback;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime evaluatedAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
