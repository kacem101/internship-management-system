package com.enscs.internship.service.impl;

import com.enscs.internship.dto.request.EvaluationRequest;
import com.enscs.internship.dto.response.EvaluationResponse;
import com.enscs.internship.entity.InternshipReport;
import com.enscs.internship.entity.Supervisor;
import com.enscs.internship.entity.SupervisorEvaluation;
import com.enscs.internship.exception.BadRequestException;
import com.enscs.internship.exception.ResourceNotFoundException;
import com.enscs.internship.repository.InternshipReportRepository;
import com.enscs.internship.repository.SupervisorEvaluationRepository;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {

    private final SupervisorEvaluationRepository evaluationRepository;
    private final InternshipReportRepository reportRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public EvaluationResponse submitEvaluation(Long supervisorId, Long reportId, EvaluationRequest request) {
        if (evaluationRepository.existsByReportId(reportId)) {
            throw new BadRequestException("An evaluation already exists for this report.");
        }

        Supervisor supervisor = (Supervisor) userRepository.findById(supervisorId)
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor not found: " + supervisorId));

        InternshipReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        if (report.getSubmittedAt() == null) {
            throw new BadRequestException("Cannot evaluate a report that has not been submitted yet.");
        }

        validateGrade(request.getGrade());

        SupervisorEvaluation evaluation = SupervisorEvaluation.builder()
                .supervisor(supervisor)
                .report(report)
                .grade(request.getGrade())
                .technicalFeedback(request.getTechnicalFeedback())
                .professionalFeedback(request.getProfessionalFeedback())
                .generalComments(request.getGeneralComments())
                .companyFeedback(request.getCompanyFeedback())
                .build();

        return toResponse(evaluationRepository.save(evaluation));
    }

    @Override
    @Transactional
    public EvaluationResponse updateEvaluation(Long evaluationId, EvaluationRequest request) {
        SupervisorEvaluation evaluation = findEvaluation(evaluationId);
        validateGrade(request.getGrade());
        evaluation.setGrade(request.getGrade());
        evaluation.setTechnicalFeedback(request.getTechnicalFeedback());
        evaluation.setProfessionalFeedback(request.getProfessionalFeedback());
        evaluation.setGeneralComments(request.getGeneralComments());
        evaluation.setCompanyFeedback(request.getCompanyFeedback());
        return toResponse(evaluationRepository.save(evaluation));
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluationResponse getEvaluationById(Long evaluationId) {
        return toResponse(findEvaluation(evaluationId));
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluationResponse getEvaluationByReport(Long reportId) {
        SupervisorEvaluation evaluation = evaluationRepository.findByReportId(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("No evaluation found for report: " + reportId));
        return toResponse(evaluation);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EvaluationResponse> getEvaluationsBySupervisor(Long supervisorId, Pageable pageable) {
        return evaluationRepository.findBySupervisorId(supervisorId, pageable).map(this::toResponse);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private SupervisorEvaluation findEvaluation(Long id) {
        return evaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found: " + id));
    }

    private void validateGrade(Double grade) {
        if (grade == null || grade < 0 || grade > 20) {
            throw new BadRequestException("Grade must be between 0 and 20.");
        }
    }

    private EvaluationResponse toResponse(SupervisorEvaluation e) {
        return EvaluationResponse.builder()
                .id(e.getId())
                .supervisorId(e.getSupervisor().getId())
                .supervisorName(e.getSupervisor().getFullName())
                .reportId(e.getReport().getId())
                .studentName(e.getReport().getStudent().getFullName())
                .offerTitle(e.getReport().getApplication().getOffer().getTitle())
                .grade(e.getGrade())
                .technicalFeedback(e.getTechnicalFeedback())
                .professionalFeedback(e.getProfessionalFeedback())
                .generalComments(e.getGeneralComments())
                .companyFeedback(e.getCompanyFeedback())
                .evaluatedAt(e.getEvaluatedAt())
                .build();
    }
}
