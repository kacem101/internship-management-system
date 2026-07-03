package com.enscs.internship.dto.response;

import com.enscs.internship.enums.VerificationStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompanyContactResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String jobTitle;
    private Long companyId;
    private String companyName;
    private VerificationStatus verificationStatus;
}
