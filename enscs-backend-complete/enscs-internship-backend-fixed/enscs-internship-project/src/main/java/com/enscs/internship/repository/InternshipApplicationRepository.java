package com.enscs.internship.repository;

import com.enscs.internship.entity.InternshipApplication;
import com.enscs.internship.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InternshipApplicationRepository extends JpaRepository<InternshipApplication, Long> {

    Page<InternshipApplication> findByStudentId(Long studentId, Pageable pageable);

    Page<InternshipApplication> findByOfferId(Long offerId, Pageable pageable);

    Page<InternshipApplication> findByStatus(ApplicationStatus status, Pageable pageable);

    /** SPRINT 1 — returns the existing application (any status) for re-apply check */
    Optional<InternshipApplication> findByStudentIdAndOfferId(Long studentId, Long offerId);

    boolean existsByStudentIdAndOfferId(Long studentId, Long offerId);
}
