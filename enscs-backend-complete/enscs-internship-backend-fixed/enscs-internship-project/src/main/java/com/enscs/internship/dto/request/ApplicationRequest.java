package com.enscs.internship.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplicationRequest {

    @NotBlank(message = "Cover letter is required")
    private String coverLetter;
}
