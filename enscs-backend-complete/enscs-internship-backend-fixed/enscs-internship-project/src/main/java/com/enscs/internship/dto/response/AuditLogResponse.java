package com.enscs.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private Long actorId;
    private String actorName;
    private String action;
    private String entityType;
    private Long entityId;
    private String oldValue;
    private String newValue;
    private String description;
    private LocalDateTime createdAt;
}
