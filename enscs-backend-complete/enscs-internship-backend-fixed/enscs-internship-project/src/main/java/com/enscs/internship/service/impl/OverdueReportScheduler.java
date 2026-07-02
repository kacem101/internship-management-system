package com.enscs.internship.service.impl;

import com.enscs.internship.entity.InternshipReport;
import com.enscs.internship.repository.InternshipReportRepository;
import com.enscs.internship.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * SPRINT 2 — Runs every morning at 08:00 to notify students whose
 * report submission deadline has passed but no report has been submitted.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OverdueReportScheduler {

    private final InternshipReportRepository reportRepository;
    private final NotificationService notificationService;

    @Value("${app.report.deadline-days:14}")
    private int globalDeadlineDays;

    @Scheduled(cron = "0 0 8 * * *")   // 08:00 every day
    @Transactional(readOnly = true)
    public void notifyOverdueReports() {
        // Use our new left-join query strategy
        List<InternshipReport> overdueReports = reportRepository.findOverdueReports(globalDeadlineDays);
        
        log.info("Overdue report check: {} entries found", overdueReports.size());
        
        overdueReports.forEach(report -> {
            // If the report row is null, it means the student hasn't touched the system yet
            if (report == null) {
                return; 
            }

            // Don't email them if they already turned it in late
            if (report.getSubmittedAt() != null) {
                return; 
            }

            try {
                notificationService.notifyReportOverdue(report);
            } catch (Exception e) {
                log.error("Failed to notify student for overdue report ID {}", report.getId(), e);
            }
        });
    }
}