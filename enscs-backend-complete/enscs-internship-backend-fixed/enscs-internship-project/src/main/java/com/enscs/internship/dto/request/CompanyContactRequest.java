package com.enscs.internship.dto.request;

import lombok.Data;

@Data
public class CompanyContactRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String jobTitle;
}
