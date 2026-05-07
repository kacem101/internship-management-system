package com.enscs.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ApplicationResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long offerId;
    private String offerTitle;
    private String companyName;
    private String coverLetter;
    private String status;
    private String adminNotes;
    private boolean hasResume;
    private LocalDateTime appliedAt;
    // SPRINT 1
    private String withdrawalReason;
    private boolean canReapply;
    private Integer reportDeadlineDays;
}
