package com.enscs.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String role;
    private boolean enabled;
    private LocalDateTime createdAt;

    // ── Student-specific ──────────────────────────────────────────────────────
    private String matricule;
    private String department;
    private Integer yearOfStudy;
    private String phoneNumber;

    // ── Supervisor-specific ───────────────────────────────────────────────────
    private String specialization;
    private String officeNumber;
}
