package com.enscs.internship.service.impl;

import com.enscs.internship.dto.response.UserResponse;
import com.enscs.internship.entity.Student;
import com.enscs.internship.entity.Supervisor;
import com.enscs.internship.entity.User;
import com.enscs.internship.enums.Role;
import com.enscs.internship.exception.ResourceNotFoundException;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.UserService;
import com.enscs.internship.service.AuditService;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        return toResponse(userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Role role, Pageable pageable) {
        if (role != null) {
            return userRepository.findByRole(role, pageable).map(this::toResponse);
        }
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return toResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)));
    }

    @Override
    @Transactional
    public UserResponse setUserEnabled(Long id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        String oldVal = user.isEnabled() ? "ENABLED" : "DISABLED";
        String newVal = enabled ? "ENABLED" : "DISABLED";
        user.setEnabled(enabled);
        UserResponse result = toResponse(userRepository.save(user));
        // SPRINT 3 — audit
        String actor = SecurityContextHolder.getContext().getAuthentication().getName();
        auditService.log(actor, "USER_" + newVal, "USER", id,
                oldVal, newVal,
                "User " + user.getFullName() + " (" + user.getEmail() + ") was " + newVal.toLowerCase());
        return result;
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        String name = user.getFullName();
        String email = user.getEmail();
        userRepository.delete(user);
        // SPRINT 3 — audit
        String actor = SecurityContextHolder.getContext().getAuthentication().getName();
        auditService.log(actor, "USER_DELETED", "USER", id,
                email, null,
                "User " + name + " (" + email + ") was permanently deleted");
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private UserResponse toResponse(User user) {
        UserResponse.UserResponseBuilder b = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt());

        if (user instanceof Student s) {
            b.matricule(s.getMatricule())
             .department(s.getDepartment())
             .yearOfStudy(s.getYearOfStudy())
             .phoneNumber(s.getPhoneNumber());
        } else if (user instanceof Supervisor sv) {
            b.specialization(sv.getSpecialization())
             .officeNumber(sv.getOfficeNumber());
        }

        return b.build();
    }
}
