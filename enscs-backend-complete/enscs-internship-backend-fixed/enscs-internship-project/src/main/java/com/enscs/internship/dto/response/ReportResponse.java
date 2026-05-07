package com.enscs.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ReportResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long applicationId;
    private String offerTitle;
    private boolean hasReport;
    private boolean hasDailyLog;
    private LocalDate submissionDeadline;
    private LocalDateTime submittedAt;
    private boolean isLate;
    private Long reportFileSizeBytes;
}
