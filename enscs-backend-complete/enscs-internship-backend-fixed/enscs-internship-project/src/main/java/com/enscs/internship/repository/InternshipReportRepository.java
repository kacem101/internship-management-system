package com.enscs.internship.repository;

import com.enscs.internship.entity.InternshipReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipReportRepository extends JpaRepository<InternshipReport, Long> {

    List<InternshipReport> findByStudentId(Long studentId);

    Optional<InternshipReport> findByApplicationId(Long applicationId);

    Page<InternshipReport> findByIsLate(boolean isLate, Pageable pageable);

    @Query("SELECT r FROM InternshipReport r WHERE r.submittedAt IS NULL AND r.submissionDeadline < CURRENT_DATE")
    List<InternshipReport> findOverdueReports();

    @Query("SELECT r FROM InternshipReport r WHERE r.submittedAt IS NOT NULL ORDER BY r.submittedAt DESC")
    Page<InternshipReport> findAllSubmitted(Pageable pageable);
}
