package com.enscs.internship.service;

import com.enscs.internship.dto.request.InternshipOfferRequest;
import com.enscs.internship.dto.response.InternshipOfferResponse;
import com.enscs.internship.enums.OfferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InternshipOfferService {

    InternshipOfferResponse createOffer(InternshipOfferRequest request, Long adminId);

    InternshipOfferResponse updateOffer(Long offerId, InternshipOfferRequest request);

    void deleteOffer(Long offerId);

    InternshipOfferResponse getOfferById(Long offerId);

    Page<InternshipOfferResponse> getAllOffers(OfferStatus status, Pageable pageable);

    Page<InternshipOfferResponse> searchOffers(String keyword, OfferStatus status, Pageable pageable);

    InternshipOfferResponse updateOfferStatus(Long offerId, OfferStatus status);
}
