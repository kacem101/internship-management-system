package com.enscs.internship.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Supervisor entity — extends User (Inheritance).
 * Academic supervisors who evaluate student reports and submissions.
 */
@Entity
@Table(name = "supervisors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Supervisor extends User {

    private String specialization;

    private String officeNumber;

    @OneToMany(mappedBy = "supervisor", fetch = FetchType.LAZY)
    private List<SupervisorEvaluation> evaluations = new ArrayList<>();
}
