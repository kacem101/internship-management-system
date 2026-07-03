package com.enscs.internship.dto.response;

import com.enscs.internship.enums.AttachmentType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AttachmentResponse {
    private Long id;
    private AttachmentType type;
    private String path;
    private String mimeType;
    private Long sizeBytes;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
}
