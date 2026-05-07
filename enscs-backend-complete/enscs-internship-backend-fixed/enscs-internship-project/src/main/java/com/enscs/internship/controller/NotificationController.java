package com.enscs.internship.controller;

import com.enscs.internship.dto.response.NotificationResponse;
import com.enscs.internship.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notifications", description = "In-app notification bell endpoints")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    /**
     * GET /api/notifications
     * Returns paginated notifications for the authenticated user, newest first.
     */
    @GetMapping
    @Operation(summary = "Get notifications for the authenticated user")
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20) Pageable pageable) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(notificationService.getNotifications(userId, pageable));
    }

    /**
     * GET /api/notifications/unread-count
     * Returns the unread notification count — used for the bell badge.
     */
    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count (for bell badge)")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    /**
     * PATCH /api/notifications/{id}/read
     * Marks a single notification as read.
     */
    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAsRead(id, resolveUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/notifications/read-all
     * Marks all notifications as read for the authenticated user.
     */
    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAllAsRead(resolveUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
    }
}
