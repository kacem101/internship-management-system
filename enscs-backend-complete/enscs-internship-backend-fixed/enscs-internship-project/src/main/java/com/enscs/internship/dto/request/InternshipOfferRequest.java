package com.enscs.internship.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InternshipOfferRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String companyName;

    private String companyLocation;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @NotNull
    @Min(1)
    private Integer durationWeeks;

    private String requiredSkills;

    /**
     * SPRINT 1 — Days after internship endDate within which the student must submit their report.
     * Defaults to global setting (app.report.deadline-days) when null.
     */
    @Min(value = 1, message = "Report deadline must be at least 1 day")
    private Integer reportDeadlineDays;
}
