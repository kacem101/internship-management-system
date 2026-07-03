package com.enscs.internship.dto.response;

import com.enscs.internship.enums.VerificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReportVerificationResponse {
    private Long id;
    private Long reportId;
    private VerificationStatus status;
    private String comment;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
}
