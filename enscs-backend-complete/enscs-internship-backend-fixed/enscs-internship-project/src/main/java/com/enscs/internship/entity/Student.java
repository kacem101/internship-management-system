package com.enscs.internship.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Student entity — extends User (Inheritance).
 * Encapsulates student-specific fields: matricule, department, year.
 */
@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Student extends User {

    @Column(unique = true)
    private String matricule;

    private String department;

    private Integer yearOfStudy;

    private String phoneNumber;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InternshipApplication> applications = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InternshipReport> reports = new ArrayList<>();
}
