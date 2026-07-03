package com.enscs.internship.service;

import com.enscs.internship.dto.response.InternshipRequirementResponse;
import com.enscs.internship.enums.RequirementStatus;

import java.util.List;

public interface InternshipRequirementService {
    List<InternshipRequirementResponse> findMine(Long studentId);
    List<InternshipRequirementResponse> findAll(RequirementStatus status, String academicYear);
}
