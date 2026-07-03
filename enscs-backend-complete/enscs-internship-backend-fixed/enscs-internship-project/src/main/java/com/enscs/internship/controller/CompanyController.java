package com.enscs.internship.controller;

import com.enscs.internship.dto.request.CompanyContactRequest;
import com.enscs.internship.dto.request.CompanyRequest;
import com.enscs.internship.dto.response.CompanyContactResponse;
import com.enscs.internship.dto.response.CompanyResponse;
import com.enscs.internship.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Tag(name = "Companies")
@SecurityRequirement(name = "bearerAuth")
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a company (Admin)")
    public ResponseEntity<CompanyResponse> create(@RequestBody CompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<List<CompanyResponse>> getAll() {
        return ResponseEntity.ok(companyService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR','COMPANY_CONTACT')")
    public ResponseEntity<CompanyResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.findById(id));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyResponse> verify(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(companyService.verify(id, status));
    }

    @PostMapping("/{id}/contacts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyContactResponse> addContact(@PathVariable Long id, @RequestBody CompanyContactRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.addContact(id, request));
    }
}
