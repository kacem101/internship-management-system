package com.enscs.internship.service.impl;

import com.enscs.internship.dto.response.InternshipRequirementResponse;
import com.enscs.internship.entity.InternshipRequirement;
import com.enscs.internship.enums.RequirementStatus;
import com.enscs.internship.repository.InternshipRequirementRepository;
import com.enscs.internship.service.InternshipRequirementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InternshipRequirementServiceImpl implements InternshipRequirementService {

    private final InternshipRequirementRepository requirementRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InternshipRequirementResponse> findMine(Long studentId) {
        return requirementRepository.findByStudentId(studentId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InternshipRequirementResponse> findAll(RequirementStatus status, String academicYear) {
        if (status != null) {
            return requirementRepository.findByStatus(status).stream().map(this::toResponse).collect(Collectors.toList());
        }
        if (academicYear != null) {
            // no direct query; fallback to filtering
            return requirementRepository.findAll().stream()
                    .filter(r -> academicYear.equals(r.getAcademicYear()))
                    .map(this::toResponse).collect(Collectors.toList());
        }
        return requirementRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    private InternshipRequirementResponse toResponse(InternshipRequirement r) {
        return InternshipRequirementResponse.builder()
                .id(r.getId())
                .studentId(r.getStudent() != null ? r.getStudent().getId() : null)
                .studentName(r.getStudent() != null ? r.getStudent().getFullName() : null)
                .academicYear(r.getAcademicYear())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
