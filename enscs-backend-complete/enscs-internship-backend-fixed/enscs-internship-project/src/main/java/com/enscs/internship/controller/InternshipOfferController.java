package com.enscs.internship.controller;

import com.enscs.internship.dto.request.InternshipOfferRequest;
import com.enscs.internship.dto.response.InternshipOfferResponse;
import com.enscs.internship.enums.OfferStatus;
import com.enscs.internship.service.InternshipOfferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@Tag(name = "Internship Offers", description = "Publish, manage, and browse internship opportunities")
@SecurityRequirement(name = "bearerAuth")
public class InternshipOfferController {

    private final InternshipOfferService offerService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new internship offer (Admin only)")
    public ResponseEntity<InternshipOfferResponse> create(
            @Valid @RequestBody InternshipOfferRequest request,
            @RequestParam Long adminId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(offerService.createOffer(request, adminId));
    }

    @GetMapping
    @Operation(summary = "List all offers, optionally filtered by status")
    public ResponseEntity<Page<InternshipOfferResponse>> getAll(
            @RequestParam(required = false) OfferStatus status,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(offerService.getAllOffers(status, pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Search offers by keyword (title, description, skills, company)")
    public ResponseEntity<Page<InternshipOfferResponse>> search(
            @RequestParam String keyword,
            @RequestParam(required = false) OfferStatus status,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(offerService.searchOffers(keyword, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single offer by ID")
    public ResponseEntity<InternshipOfferResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(offerService.getOfferById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing offer (Admin only)")
    public ResponseEntity<InternshipOfferResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody InternshipOfferRequest request) {
        return ResponseEntity.ok(offerService.updateOffer(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Change the status of an offer (OPEN / CLOSED / ARCHIVED)")
    public ResponseEntity<InternshipOfferResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam OfferStatus status) {
        return ResponseEntity.ok(offerService.updateOfferStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an offer (Admin only)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        offerService.deleteOffer(id);
        return ResponseEntity.noContent().build();
    }
}
