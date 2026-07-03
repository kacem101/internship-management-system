package com.enscs.internship.service;

import com.enscs.internship.dto.response.CompanyContactResponse;

public interface CompanyContactService {
    CompanyContactResponse getMe(Long userId);
}
