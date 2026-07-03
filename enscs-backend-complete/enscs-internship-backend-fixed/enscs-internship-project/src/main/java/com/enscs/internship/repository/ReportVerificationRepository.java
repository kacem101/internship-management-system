package com.enscs.internship.repository;

import com.enscs.internship.entity.ReportVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportVerificationRepository extends JpaRepository<ReportVerification, Long> {
    Optional<ReportVerification> findByReportId(Long reportId);
}
