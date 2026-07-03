package com.enscs.internship.service.impl;

import com.enscs.internship.dto.request.CompanyContactRequest;
import com.enscs.internship.dto.request.CompanyRequest;
import com.enscs.internship.dto.response.CompanyContactResponse;
import com.enscs.internship.dto.response.CompanyResponse;
import com.enscs.internship.entity.Company;
import com.enscs.internship.entity.CompanyContact;
import com.enscs.internship.enums.Role;
import com.enscs.internship.enums.VerificationStatus;
import com.enscs.internship.exception.ResourceNotFoundException;
import com.enscs.internship.repository.CompanyRepository;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public CompanyResponse create(CompanyRequest request) {
        Company c = Company.builder()
                .name(request.getName())
                .location(request.getLocation())
                .verificationStatus(VerificationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        Company saved = companyRepository.save(c);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> findAll() {
        return companyRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse findById(Long id) {
        return toResponse(companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id)));
    }

    @Override
    @Transactional
    public CompanyResponse verify(Long id, String status) {
        Company c = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        c.setVerificationStatus(VerificationStatus.valueOf(status));
        return toResponse(companyRepository.save(c));
    }

    @Override
    @Transactional
    public CompanyContactResponse addContact(Long companyId, CompanyContactRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        CompanyContact cc = new CompanyContact();
        cc.setFirstName(request.getFirstName());
        cc.setLastName(request.getLastName());
        cc.setEmail(request.getEmail());
        cc.setJobTitle(request.getJobTitle());
        cc.setCompany(company);
        cc.setRole(Role.COMPANY_CONTACT);
        cc.setVerificationStatus(VerificationStatus.PENDING);
        cc.setEnabled(false);
        // set a random password; admin will later communicate or reset
        cc.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

        CompanyContact saved = (CompanyContact) userRepository.save(cc);
        return CompanyContactResponse.builder()
                .id(saved.getId())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .email(saved.getEmail())
                .jobTitle(saved.getJobTitle())
                .companyId(company.getId())
                .companyName(company.getName())
                .verificationStatus(saved.getVerificationStatus())
                .build();
    }

    private CompanyResponse toResponse(Company c) {
        return CompanyResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .location(c.getLocation())
                .verificationStatus(c.getVerificationStatus())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
