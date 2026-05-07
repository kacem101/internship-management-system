package com.enscs.internship.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EvaluationRequest {

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("20.0")
    private Double grade;

    private String technicalFeedback;

    private String professionalFeedback;

    private String generalComments;

    private String companyFeedback;
}
