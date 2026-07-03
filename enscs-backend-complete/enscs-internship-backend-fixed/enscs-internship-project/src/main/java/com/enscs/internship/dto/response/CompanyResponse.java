package com.enscs.internship.dto.response;

import com.enscs.internship.enums.VerificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CompanyResponse {
    private Long id;
    private String name;
    private String location;
    private VerificationStatus verificationStatus;
    private LocalDateTime createdAt;
}
