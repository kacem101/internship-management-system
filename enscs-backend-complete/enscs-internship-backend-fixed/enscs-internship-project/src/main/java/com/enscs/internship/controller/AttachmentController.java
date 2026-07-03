package com.enscs.internship.controller;

import com.enscs.internship.dto.response.AttachmentResponse;
import com.enscs.internship.entity.Attachment;
import com.enscs.internship.entity.User;
import com.enscs.internship.enums.AttachmentType;
import com.enscs.internship.exception.ResourceNotFoundException;
import com.enscs.internship.repository.AttachmentRepository;
import com.enscs.internship.repository.UserRepository;
import com.enscs.internship.service.AttachmentService;
import com.enscs.internship.service.DocumentStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
@Tag(name = "Attachments")
@SecurityRequirement(name = "bearerAuth")
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final AttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final DocumentStorageService storageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload an attachment")
    public ResponseEntity<AttachmentResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") AttachmentType type,
            @RequestParam("ownerType") String ownerType,
            @RequestParam("ownerId") Long ownerId,
            Principal principal) {

        User u = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(attachmentService.upload(file, type, ownerType, ownerId, u.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download or view an attachment (owner or admin)")
    public ResponseEntity<byte[]> getById(@PathVariable Long id, Principal principal) {
        Attachment a = attachmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + id));
        User requester = userRepository.findByEmail(principal.getName()).orElseThrow();
        boolean isOwner = a.getUploadedBy() != null && a.getUploadedBy().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() != null && requester.getRole().name().equals("ADMIN");
        if (!isOwner && !isAdmin) throw new ResourceNotFoundException("Attachment not accessible");

        byte[] data = storageService.loadFile(a.getPath());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(a.getMimeType() != null ? a.getMimeType() : MediaType.APPLICATION_OCTET_STREAM_VALUE));
        headers.setContentDisposition(ContentDisposition.attachment().filename("attachment_" + id).build());
        return ResponseEntity.ok().headers(headers).body(data);
    }
}
