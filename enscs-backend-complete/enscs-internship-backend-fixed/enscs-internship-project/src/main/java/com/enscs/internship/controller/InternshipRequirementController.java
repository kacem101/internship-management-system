package com.enscs.internship.controller;

import com.enscs.internship.dto.response.InternshipRequirementResponse;
import com.enscs.internship.enums.RequirementStatus;
import com.enscs.internship.entity.User;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.InternshipRequirementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/requirements")
@RequiredArgsConstructor
@Tag(name = "Requirements")
@SecurityRequirement(name = "bearerAuth")
public class InternshipRequirementController {

    private final InternshipRequirementService requirementService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my requirements (student)")
    public ResponseEntity<List<InternshipRequirementResponse>> getMine(Principal principal) {
        User u = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(requirementService.findMine(u.getId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    @Operation(summary = "List requirements")
    public ResponseEntity<List<InternshipRequirementResponse>> getAll(@RequestParam(required = false) RequirementStatus status,
                                                                      @RequestParam(required = false) String academicYear) {
        return ResponseEntity.ok(requirementService.findAll(status, academicYear));
    }
}
