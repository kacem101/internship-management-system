package com.enscs.internship.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private Long id;
    private String token;
    private String email;
    private String role;
    private String fullName;
}
