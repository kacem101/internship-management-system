package com.enscs.internship.repository;

import com.enscs.internship.entity.SupervisorEvaluation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupervisorEvaluationRepository extends JpaRepository<SupervisorEvaluation, Long> {

    List<SupervisorEvaluation> findBySupervisorId(Long supervisorId);

    Optional<SupervisorEvaluation> findByReportId(Long reportId);

    boolean existsByReportId(Long reportId);

    Page<SupervisorEvaluation> findBySupervisorId(Long supervisorId, Pageable pageable);

    @Query("SELECT AVG(e.grade) FROM SupervisorEvaluation e WHERE e.supervisor.id = :supervisorId")
    Double findAverageGradeBySupervisor(@Param("supervisorId") Long supervisorId);

    @Query("SELECT AVG(e.grade) FROM SupervisorEvaluation e")
    Double findOverallAverageGrade();
}
