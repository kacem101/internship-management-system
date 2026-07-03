package com.enscs.internship.repository;

import com.enscs.internship.entity.InternshipRequirement;
import com.enscs.internship.enums.RequirementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipRequirementRepository extends JpaRepository<InternshipRequirement, Long> {
    Optional<InternshipRequirement> findByStudentIdAndAcademicYear(Long studentId, String academicYear);
    List<InternshipRequirement> findByStudentId(Long studentId);
    List<InternshipRequirement> findByStatus(RequirementStatus status);
    List<InternshipRequirement> findByStatusIn(List<RequirementStatus> statuses);
}
