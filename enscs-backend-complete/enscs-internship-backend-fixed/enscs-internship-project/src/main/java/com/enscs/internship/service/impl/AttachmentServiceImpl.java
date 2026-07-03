package com.enscs.internship.service.impl;

import com.enscs.internship.dto.response.AttachmentResponse;
import com.enscs.internship.entity.Attachment;
import com.enscs.internship.entity.User;
import com.enscs.internship.enums.AttachmentType;
import com.enscs.internship.exception.BadRequestException;
import com.enscs.internship.exception.ResourceNotFoundException;
import com.enscs.internship.repository.AttachmentRepository;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.AttachmentService;
import com.enscs.internship.service.DocumentStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final DocumentStorageService storageService;

    private static final Set<String> IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    @Override
    @Transactional
    public AttachmentResponse upload(MultipartFile file, AttachmentType type, String ownerType, Long ownerId, Long uploaderId) {
        if (file == null || file.isEmpty()) throw new BadRequestException("File is required");
        String contentType = file.getContentType();
        long size = file.getSize();

        switch (type) {
            case PROFILE_PHOTO, COMPANY_LOGO -> {
                if (!IMAGE_TYPES.contains(contentType)) throw new BadRequestException("Only jpg/png/webp allowed for photos/logos");
                if (size > 5L * 1024 * 1024) throw new BadRequestException("File too large: max 5MB");
            }
            case OFFER_ATTACHMENT -> {
                if (!"application/pdf".equals(contentType)) throw new BadRequestException("Only PDF allowed for offer attachments");
                if (size > 10L * 1024 * 1024) throw new BadRequestException("File too large: max 10MB");
            }
            case ID_VERIFICATION -> {
                if (!(IMAGE_TYPES.contains(contentType) || "application/pdf".equals(contentType)))
                    throw new BadRequestException("Only PDF or image allowed for ID verification");
                if (size > 10L * 1024 * 1024) throw new BadRequestException("File too large: max 10MB");
            }
            default -> throw new BadRequestException("Unsupported attachment type");
        }

        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new ResourceNotFoundException("Uploader not found: " + uploaderId));

        String path = storageService.storeFile(file, "attachments");

        Attachment a = Attachment.builder()
                .type(type)
                .path(path)
                .mimeType(contentType)
                .sizeBytes(size)
                .ownerType(ownerType)
                .ownerId(ownerId)
                .uploadedBy(uploader)
                .uploadedAt(LocalDateTime.now())
                .build();

        Attachment saved = attachmentRepository.save(a);
        return AttachmentResponse.builder()
                .id(saved.getId())
                .type(saved.getType())
                .path(saved.getPath())
                .mimeType(saved.getMimeType())
                .sizeBytes(saved.getSizeBytes())
                .uploadedByName(saved.getUploadedBy() != null ? saved.getUploadedBy().getFullName() : null)
                .uploadedAt(saved.getUploadedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AttachmentResponse getById(Long id, Long currentUserId) {
        Attachment a = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + id));
        // ownership check is done by controller/service callsite; here just map
        return AttachmentResponse.builder()
                .id(a.getId())
                .type(a.getType())
                .path(a.getPath())
                .mimeType(a.getMimeType())
                .sizeBytes(a.getSizeBytes())
                .uploadedByName(a.getUploadedBy() != null ? a.getUploadedBy().getFullName() : null)
                .uploadedAt(a.getUploadedAt())
                .build();
    }
}
