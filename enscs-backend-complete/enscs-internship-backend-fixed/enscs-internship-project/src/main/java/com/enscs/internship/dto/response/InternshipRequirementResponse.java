package com.enscs.internship.dto.response;

import com.enscs.internship.enums.RequirementStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InternshipRequirementResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String academicYear;
    private RequirementStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
