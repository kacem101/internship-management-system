package com.enscs.internship.entity;

import com.enscs.internship.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_contacts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CompanyContact extends User {

    private String jobTitle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
}
