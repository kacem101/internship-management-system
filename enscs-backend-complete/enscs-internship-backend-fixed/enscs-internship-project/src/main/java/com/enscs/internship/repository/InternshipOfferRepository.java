package com.enscs.internship.repository;

import com.enscs.internship.entity.InternshipOffer;
import com.enscs.internship.enums.ApplicationStatus;
import com.enscs.internship.enums.OfferStatus;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InternshipOfferRepository extends JpaRepository<InternshipOffer, Long> {

    Page<InternshipOffer> findByStatus(OfferStatus status, Pageable pageable);

    @Query("SELECT o FROM InternshipOffer o WHERE o.status = :status " +
           "AND (LOWER(o.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(o.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(o.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(o.requiredSkills) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<InternshipOffer> searchOffers(@Param("keyword") String keyword,
                                       @Param("status") OfferStatus status,
                                       Pageable pageable);

    Page<InternshipOffer> findByCreatedByIdAndStatus(Long adminId, OfferStatus status, Pageable pageable);

    @Query("SELECT COUNT(a) FROM InternshipApplication a WHERE a.offer.id = :offerId AND a.status IN :statuses")
    Integer countByOfferIdAndStatusIn(@Param("offerId") Long offerId,
                                     @Param("statuses") List<ApplicationStatus> statuses);
}
