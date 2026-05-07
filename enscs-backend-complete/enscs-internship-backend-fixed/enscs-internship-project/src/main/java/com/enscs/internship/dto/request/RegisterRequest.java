package com.enscs.internship.dto.request;

import com.enscs.internship.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull
    private Role role;

    // ── Student-specific ──────────────────────────────────────────────────────
    private String matricule;
    private String department;
    private Integer yearOfStudy;
    private String phoneNumber;      // optional

    // ── Supervisor-specific ───────────────────────────────────────────────────
    private String specialization;
    private String officeNumber;     // optional

    // ── Admin-specific ────────────────────────────────────────────────────────
    private String adminCode;
}
