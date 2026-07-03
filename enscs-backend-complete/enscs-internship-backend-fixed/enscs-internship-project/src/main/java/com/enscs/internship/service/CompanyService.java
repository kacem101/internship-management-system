package com.enscs.internship.service;

import com.enscs.internship.dto.request.CompanyContactRequest;
import com.enscs.internship.dto.request.CompanyRequest;
import com.enscs.internship.dto.response.CompanyContactResponse;
import com.enscs.internship.dto.response.CompanyResponse;

import java.util.List;

public interface CompanyService {
    CompanyResponse create(CompanyRequest request);
    List<CompanyResponse> findAll();
    CompanyResponse findById(Long id);
    CompanyResponse verify(Long id, String status);
    CompanyContactResponse addContact(Long companyId, CompanyContactRequest request);
}
