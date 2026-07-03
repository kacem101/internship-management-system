package com.enscs.internship.service.impl;

import com.enscs.internship.dto.response.CompanyContactResponse;
import com.enscs.internship.entity.CompanyContact;
import com.enscs.internship.exception.ResourceNotFoundException;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.CompanyContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyContactServiceImpl implements CompanyContactService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CompanyContactResponse getMe(Long userId) {
        CompanyContact cc = (CompanyContact) userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company contact not found: " + userId));

        return CompanyContactResponse.builder()
                .id(cc.getId())
                .firstName(cc.getFirstName())
                .lastName(cc.getLastName())
                .email(cc.getEmail())
                .jobTitle(cc.getJobTitle())
                .companyId(cc.getCompany() != null ? cc.getCompany().getId() : null)
                .companyName(cc.getCompany() != null ? cc.getCompany().getName() : null)
                .verificationStatus(cc.getVerificationStatus())
                .build();
    }
}
