package com.enscs.internship.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a student's final internship report and daily log.
 * Uploaded via the Reporting Module; reviewed by Supervisors.
 */
@Entity
@Table(name = "internship_reports")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private InternshipApplication application;

    private String reportFilePath;

    private String dailyLogFilePath;

    @Column(nullable = false)
    private LocalDate submissionDeadline;

    private LocalDateTime submittedAt;

    private boolean isLate = false;

    // Allowed MIME types enforced at service layer
    private String reportFileType;

    private Long reportFileSizeBytes;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
