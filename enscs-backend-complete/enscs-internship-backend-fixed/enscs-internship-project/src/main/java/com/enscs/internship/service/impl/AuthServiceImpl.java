package com.enscs.internship.service.impl;

import com.enscs.internship.dto.request.LoginRequest;
import com.enscs.internship.dto.request.RegisterRequest;
import com.enscs.internship.dto.response.AuthResponse;
import com.enscs.internship.entity.Admin;
import com.enscs.internship.entity.Student;
import com.enscs.internship.entity.Supervisor;
import com.enscs.internship.entity.User;
import com.enscs.internship.enums.Role;
import com.enscs.internship.exception.BadRequestException;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.security.JwtService;
import com.enscs.internship.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User user = buildUserByRole(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return AuthResponse.builder()
                .id(user.getId())
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return AuthResponse.builder()
                .id(user.getId())
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .build();
    }

    // ── Factory ───────────────────────────────────────────────────────────────

    private User buildUserByRole(RegisterRequest req) {
        return switch (req.getRole()) {
            case STUDENT -> {
                Student s = new Student();
                s.setFirstName(req.getFirstName());
                s.setLastName(req.getLastName());
                s.setEmail(req.getEmail());
                s.setRole(Role.STUDENT);
                s.setMatricule(req.getMatricule());
                s.setDepartment(req.getDepartment());
                s.setYearOfStudy(req.getYearOfStudy());
                s.setPhoneNumber(req.getPhoneNumber());   // new
                yield s;
            }
            case SUPERVISOR -> {
                Supervisor sv = new Supervisor();
                sv.setFirstName(req.getFirstName());
                sv.setLastName(req.getLastName());
                sv.setEmail(req.getEmail());
                sv.setRole(Role.SUPERVISOR);
                sv.setSpecialization(req.getSpecialization());
                sv.setOfficeNumber(req.getOfficeNumber()); // new
                yield sv;
            }
            case ADMIN -> {
                Admin a = new Admin();
                a.setFirstName(req.getFirstName());
                a.setLastName(req.getLastName());
                a.setEmail(req.getEmail());
                a.setRole(Role.ADMIN);
                a.setAdminCode(req.getAdminCode());
                yield a;
            }
        };
    }
}
