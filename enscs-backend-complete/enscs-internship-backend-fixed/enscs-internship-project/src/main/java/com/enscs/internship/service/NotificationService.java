package com.enscs.internship.service;

import com.enscs.internship.dto.response.NotificationResponse;
import com.enscs.internship.entity.InternshipApplication;
import com.enscs.internship.entity.InternshipReport;
import com.enscs.internship.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    /** Called when a student applies — notifies all admins */
    void notifyNewApplication(InternshipApplication application);

    /** Called when admin changes application status — notifies the student */
    void notifyApplicationStatusChanged(InternshipApplication application, ApplicationStatus oldStatus);

    /** Called when student withdraws — notifies admin (especially if UNDER_REVIEW) */
    void notifyApplicationWithdrawn(InternshipApplication application, ApplicationStatus previousStatus);

    /** Called when student submits a report — notifies all admins */
    void notifyReportSubmitted(InternshipReport report);

    /** Called by scheduled job for overdue reports — notifies student */
    void notifyReportOverdue(InternshipReport report);

    // ── Query methods (used by NotificationController) ────────────────────────

    Page<NotificationResponse> getNotifications(Long userId, Pageable pageable);

    long getUnreadCount(Long userId);

    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);
}
