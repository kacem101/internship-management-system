package com.enscs.internship.service.impl;

import com.enscs.internship.exception.StorageException;
import com.enscs.internship.service.DocumentStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Local filesystem implementation of DocumentStorageService (Polymorphism).
 * Can be swapped for a CloudStorageService without altering any controller.
 */
@Service
@Slf4j
public class LocalDocumentStorageService implements DocumentStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg", "image/png", "image/webp"
    );

    private final Path baseStorageLocation;

    public LocalDocumentStorageService(@Value("${app.upload-dir:./uploads}") String uploadDir) {
        this.baseStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.baseStorageLocation);
        } catch (IOException ex) {
            throw new StorageException("Could not create upload directory: " + uploadDir, ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new StorageException("Cannot store an empty file.");
        }
        validateContentType(file);

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "file"
        );
        String extension = extractExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID() + extension;

        Path targetDir = baseStorageLocation.resolve(subFolder);
        try {
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored file {} → {}", originalFilename, targetPath);
            return subFolder + "/" + uniqueFilename;
        } catch (IOException ex) {
            throw new StorageException("Failed to store file " + originalFilename, ex);
        }
    }

    @Override
    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) return;
        try {
            Path path = baseStorageLocation.resolve(filePath).normalize();
            Files.deleteIfExists(path);
            log.info("Deleted file: {}", path);
        } catch (IOException ex) {
            log.warn("Could not delete file {}: {}", filePath, ex.getMessage());
        }
    }

    @Override
    public byte[] loadFile(String filePath) {
        try {
            Path path = baseStorageLocation.resolve(filePath).normalize();
            return Files.readAllBytes(path);
        } catch (IOException ex) {
            throw new StorageException("Could not load file: " + filePath, ex);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void validateContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new StorageException("File type not allowed: " + contentType);
        }
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex >= 0) ? filename.substring(dotIndex) : "";
    }
}
