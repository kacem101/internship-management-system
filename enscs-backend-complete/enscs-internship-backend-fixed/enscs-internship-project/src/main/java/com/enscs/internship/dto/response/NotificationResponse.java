package com.enscs.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private String entityType;
    private Long entityId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
