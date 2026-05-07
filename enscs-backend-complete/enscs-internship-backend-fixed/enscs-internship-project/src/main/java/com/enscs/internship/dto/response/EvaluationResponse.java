package com.enscs.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EvaluationResponse {
    private Long id;
    private Long supervisorId;
    private String supervisorName;
    private Long reportId;
    private String studentName;
    private String offerTitle;
    private Double grade;
    private String technicalFeedback;
    private String professionalFeedback;
    private String generalComments;
    private String companyFeedback;
    private LocalDateTime evaluatedAt;
}
