package com.enscs.internship.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Admin entity — extends User (Inheritance).
 * Administrators can manage offers, users, and system configuration.
 */
@Entity
@Table(name = "admins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Admin extends User {

    private String adminCode;
}
