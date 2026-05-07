package com.enscs.internship.service.impl;

import com.enscs.internship.entity.InternshipReport;
import com.enscs.internship.repository.InternshipReportRepository;
import com.enscs.internship.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Scheduled(cron = "0 0 8 * * *")   // 08:00 every day
    @Transactional(readOnly = true)
    public void notifyOverdueReports() {
        List<InternshipReport> overdueReports = reportRepository.findOverdueReports();
        log.info("Overdue report check: {} overdue reports found", overdueReports.size());
        overdueReports.forEach(report -> {
            try {
                notificationService.notifyReportOverdue(report);
            } catch (Exception e) {
                log.error("Failed to notify student {} for overdue report {}",
                        report.getStudent().getId(), report.getId(), e);
            }
        });
    }
}
