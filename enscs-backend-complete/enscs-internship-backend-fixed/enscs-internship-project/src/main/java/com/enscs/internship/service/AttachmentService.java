package com.enscs.internship.service;

import com.enscs.internship.dto.response.AttachmentResponse;
import com.enscs.internship.enums.AttachmentType;
import org.springframework.web.multipart.MultipartFile;

public interface AttachmentService {
    AttachmentResponse upload(MultipartFile file, AttachmentType type, String ownerType, Long ownerId, Long uploaderId);
    AttachmentResponse getById(Long id, Long currentUserId);
}
