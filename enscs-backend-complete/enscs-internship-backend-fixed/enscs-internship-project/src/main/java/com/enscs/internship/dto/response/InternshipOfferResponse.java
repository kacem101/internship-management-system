package com.enscs.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class InternshipOfferResponse {
    private Long id;
    private String title;
    private String description;
    private String companyName;
    private String companyLocation;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer durationWeeks;
    private String requiredSkills;
    private String status;
    private int applicationCount;
    private Integer reportDeadlineDays;   // SPRINT 1
    private LocalDateTime createdAt;
}
