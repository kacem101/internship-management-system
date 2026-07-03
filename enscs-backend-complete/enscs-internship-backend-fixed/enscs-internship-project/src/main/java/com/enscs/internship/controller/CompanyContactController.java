package com.enscs.internship.controller;

import com.enscs.internship.dto.response.CompanyContactResponse;
import com.enscs.internship.entity.User;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.CompanyContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/company-contacts")
@RequiredArgsConstructor
@Tag(name = "Company Contacts")
@SecurityRequirement(name = "bearerAuth")
public class CompanyContactController {

    private final CompanyContactService companyContactService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('COMPANY_CONTACT')")
    @Operation(summary = "Get my company contact profile")
    public ResponseEntity<CompanyContactResponse> getMe(Principal principal) {
        User u = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(companyContactService.getMe(u.getId()));
    }
}
