package com.enscs.internship.dto.request;

import com.enscs.internship.enums.VerificationStatus;
import lombok.Data;

@Data
public class ReportVerificationRequest {
    private VerificationStatus status;
    private String comment;
}
