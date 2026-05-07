package com.enscs.internship.entity;

import com.enscs.internship.enums.OfferStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "internship_offers")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InternshipOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String companyName;

    private String companyLocation;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Integer durationWeeks;

    @Column(columnDefinition = "TEXT")
    private String requiredSkills;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferStatus status = OfferStatus.OPEN;

    /**
     * SPRINT 1 — Per-offer report submission grace period in days.
     * Defaults to the global value configured in application.yml (app.report.deadline-days).
     * The actual submissionDeadline = offer.endDate + reportDeadlineDays.
     */
    @Column(nullable = false)
    private Integer reportDeadlineDays = 14;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private Admin createdBy;

    @OneToMany(mappedBy = "offer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InternshipApplication> applications = new ArrayList<>();

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
