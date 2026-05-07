package com.enscs.internship.service.impl;

import com.enscs.internship.dto.request.InternshipOfferRequest;
import com.enscs.internship.dto.response.InternshipOfferResponse;
import com.enscs.internship.entity.Admin;
import com.enscs.internship.entity.InternshipOffer;
import com.enscs.internship.enums.OfferStatus;
import com.enscs.internship.exception.ResourceNotFoundException;
import com.enscs.internship.repository.InternshipOfferRepository;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.AuditService;
import com.enscs.internship.service.InternshipOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InternshipOfferServiceImpl implements InternshipOfferService {

    private final InternshipOfferRepository offerRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;   // SPRINT 3

    @Value("${app.report.deadline-days:14}")
    private int defaultDeadlineDays;

    @Override
    @Transactional
    public InternshipOfferResponse createOffer(InternshipOfferRequest request, Long adminId) {
        Admin admin = (Admin) userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + adminId));

        InternshipOffer offer = InternshipOffer.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .companyName(request.getCompanyName())
                .companyLocation(request.getCompanyLocation())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .durationWeeks(request.getDurationWeeks())
                .requiredSkills(request.getRequiredSkills())
                .status(OfferStatus.OPEN)
                .createdBy(admin)
                .reportDeadlineDays(request.getReportDeadlineDays() != null
                        ? request.getReportDeadlineDays() : defaultDeadlineDays)
                .build();

        InternshipOfferResponse saved = toResponse(offerRepository.save(offer));

        // SPRINT 3 — audit
        auditService.log(currentUserEmail(), "OFFER_CREATED", "OFFER", saved.getId(),
                null, saved.getTitle(),
                "Admin created offer: " + saved.getTitle() + " at " + saved.getCompanyName());

        return saved;
    }

    @Override
    @Transactional
    public InternshipOfferResponse updateOffer(Long offerId, InternshipOfferRequest request) {
        InternshipOffer offer = findOffer(offerId);
        String oldTitle = offer.getTitle();
        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setCompanyName(request.getCompanyName());
        offer.setCompanyLocation(request.getCompanyLocation());
        offer.setStartDate(request.getStartDate());
        offer.setEndDate(request.getEndDate());
        offer.setDurationWeeks(request.getDurationWeeks());
        offer.setRequiredSkills(request.getRequiredSkills());
        if (request.getReportDeadlineDays() != null)
            offer.setReportDeadlineDays(request.getReportDeadlineDays());

        InternshipOfferResponse saved = toResponse(offerRepository.save(offer));

        // SPRINT 3 — audit
        auditService.log(currentUserEmail(), "OFFER_UPDATED", "OFFER", offerId,
                oldTitle, saved.getTitle(),
                "Admin updated offer #" + offerId + ": " + oldTitle);

        return saved;
    }

    @Override
    @Transactional
    public void deleteOffer(Long offerId) {
        InternshipOffer offer = findOffer(offerId);
        String title = offer.getTitle();
        offerRepository.delete(offer);

        // SPRINT 3 — audit
        auditService.log(currentUserEmail(), "OFFER_DELETED", "OFFER", offerId,
                title, null, "Admin permanently deleted offer: " + title);
    }

    @Override
    @Transactional(readOnly = true)
    public InternshipOfferResponse getOfferById(Long offerId) {
        return toResponse(findOffer(offerId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InternshipOfferResponse> getAllOffers(OfferStatus status, Pageable pageable) {
        if (status != null) return offerRepository.findByStatus(status, pageable).map(this::toResponse);
        return offerRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InternshipOfferResponse> searchOffers(String keyword, OfferStatus status, Pageable pageable) {
        OfferStatus effectiveStatus = status != null ? status : OfferStatus.OPEN;
        return offerRepository.searchOffers(keyword, effectiveStatus, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public InternshipOfferResponse updateOfferStatus(Long offerId, OfferStatus status) {
        InternshipOffer offer = findOffer(offerId);
        OfferStatus oldStatus = offer.getStatus();
        offer.setStatus(status);
        InternshipOfferResponse saved = toResponse(offerRepository.save(offer));

        // SPRINT 3 — audit
        auditService.log(currentUserEmail(), "OFFER_STATUS_CHANGED", "OFFER", offerId,
                oldStatus.name(), status.name(),
                "Offer " + offer.getTitle() + " status changed: " + oldStatus + " → " + status);

        return saved;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private InternshipOffer findOffer(Long id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Internship offer not found: " + id));
    }

    private String currentUserEmail() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "system";
        }
    }

    private InternshipOfferResponse toResponse(InternshipOffer offer) {
        return InternshipOfferResponse.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .description(offer.getDescription())
                .companyName(offer.getCompanyName())
                .companyLocation(offer.getCompanyLocation())
                .startDate(offer.getStartDate())
                .endDate(offer.getEndDate())
                .durationWeeks(offer.getDurationWeeks())
                .requiredSkills(offer.getRequiredSkills())
                .status(offer.getStatus().name())
                .applicationCount(offer.getApplications() != null ? offer.getApplications().size() : 0)
                .reportDeadlineDays(offer.getReportDeadlineDays())
                .createdAt(offer.getCreatedAt())
                .build();
    }
}
