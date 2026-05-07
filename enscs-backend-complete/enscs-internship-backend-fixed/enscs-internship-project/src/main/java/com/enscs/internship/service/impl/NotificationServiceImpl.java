package com.enscs.internship.service.impl;

import com.enscs.internship.dto.response.NotificationResponse;
import com.enscs.internship.entity.InternshipApplication;
import com.enscs.internship.entity.InternshipReport;
import com.enscs.internship.entity.Notification;
import com.enscs.internship.entity.User;
import com.enscs.internship.enums.ApplicationStatus;
import com.enscs.internship.enums.Role;
import com.enscs.internship.repository.NotificationRepository;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // ── Event triggers ────────────────────────────────────────────────────────

    @Override
    @Async
    @Transactional
    public void notifyNewApplication(InternshipApplication application) {
        String title = "New Application Received";
        String msg = application.getStudent().getFullName() + " applied for " + application.getOffer().getTitle() + ".";
        notifyAllAdmins(title, msg, "NEW_APPLICATION", "APPLICATION", application.getId());
    }

    @Override
    @Async
    @Transactional
    public void notifyApplicationStatusChanged(InternshipApplication application, ApplicationStatus oldStatus) {
        String newStatus = application.getStatus().name().replace('_', ' ');
        String title = "Application " + capitalize(newStatus.toLowerCase());
        String msg = buildStatusMessage(application);
        notify(application.getStudent(), title, msg, "APPLICATION_STATUS", "APPLICATION", application.getId());
    }

    @Override
    @Async
    @Transactional
    public void notifyApplicationWithdrawn(InternshipApplication application, ApplicationStatus previousStatus) {
        String title = "Application Withdrawn";
        String msg = application.getStudent().getFullName() +
                " withdrew their application for " + application.getOffer().getTitle() + ".";
        if (previousStatus == ApplicationStatus.UNDER_REVIEW) {
            msg += " (was under review)";
            if (application.getWithdrawalReason() != null) {
                msg += ". Reason: " + application.getWithdrawalReason();
            }
        }
        notifyAllAdmins(title, msg, "WITHDRAWAL", "APPLICATION", application.getId());
    }

    @Override
    @Async
    @Transactional
    public void notifyReportSubmitted(InternshipReport report) {
        String title = "Report Submitted";
        String msg = report.getStudent().getFullName() +
                " submitted their report for " + report.getApplication().getOffer().getTitle() + ".";
        notifyAllAdmins(title, msg, "REPORT_SUBMITTED", "REPORT", report.getId());
    }

    @Override
    @Async
    @Transactional
    public void notifyReportOverdue(InternshipReport report) {
        String title = "Report Submission Overdue";
        String msg = "Your internship report for " + report.getApplication().getOffer().getTitle() +
                " was due on " + report.getSubmissionDeadline() +
                ". Please submit as soon as possible or contact administration.";
        notify(report.getStudent(), title, msg, "OVERDUE", "REPORT", report.getId());
    }

    // ── Query ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.markAsRead(notificationId, userId);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void notify(User recipient, String title, String message,
                        String type, String entityType, Long entityId) {
        try {
            notificationRepository.save(Notification.builder()
                    .recipient(recipient)
                    .title(title)
                    .message(message)
                    .type(type)
                    .entityType(entityType)
                    .entityId(entityId)
                    .build());
        } catch (Exception e) {
            log.error("Failed to create notification for user {}: {}", recipient.getId(), e.getMessage());
        }
    }

    private void notifyAllAdmins(String title, String message, String type, String entityType, Long entityId) {
        List<User> admins = userRepository.findByRole(Role.ADMIN, Pageable.unpaged()).getContent();
        admins.forEach(admin -> notify(admin, title, message, type, entityType, entityId));
    }

    private String buildStatusMessage(InternshipApplication app) {
        return switch (app.getStatus()) {
            case ACCEPTED     -> "Your application for " + app.getOffer().getTitle() +
                                 " has been ACCEPTED. Congratulations!";
            case REJECTED     -> "Your application for " + app.getOffer().getTitle() +
                                 " was not selected." +
                                 (app.getAdminNotes() != null ? " Note: " + app.getAdminNotes() : "");
            case UNDER_REVIEW -> "Your application for " + app.getOffer().getTitle() +
                                 " is now under review.";
            default           -> "Your application status changed to " + app.getStatus().name();
        };
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .entityType(n.getEntityType())
                .entityId(n.getEntityId())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
