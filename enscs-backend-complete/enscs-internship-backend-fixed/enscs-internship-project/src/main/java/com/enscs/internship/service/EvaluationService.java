package com.enscs.internship.service;

import com.enscs.internship.dto.request.EvaluationRequest;
import com.enscs.internship.dto.response.EvaluationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EvaluationService {

    EvaluationResponse submitEvaluation(Long supervisorId, Long reportId, EvaluationRequest request);

    EvaluationResponse updateEvaluation(Long evaluationId, EvaluationRequest request);

    EvaluationResponse getEvaluationById(Long evaluationId);

    EvaluationResponse getEvaluationByReport(Long reportId);

    Page<EvaluationResponse> getEvaluationsBySupervisor(Long supervisorId, Pageable pageable);
}
