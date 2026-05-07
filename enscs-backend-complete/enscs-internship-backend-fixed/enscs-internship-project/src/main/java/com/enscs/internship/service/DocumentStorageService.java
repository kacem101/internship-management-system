package com.enscs.internship.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction / Polymorphism: this interface decouples storage logic from controllers.
 * Switch between LocalStorageService and CloudStorageService without touching any controller.
 */
public interface DocumentStorageService {

    /**
     * Store a file and return the path/URL by which it can be retrieved.
     *
     * @param file      the multipart file to store
     * @param subFolder logical sub-directory (e.g. "resumes", "reports")
     * @return the stored file's path or URL
     */
    String storeFile(MultipartFile file, String subFolder);

    /**
     * Delete a previously stored file.
     *
     * @param filePath the path/URL returned by {@link #storeFile}
     */
    void deleteFile(String filePath);

    /**
     * Retrieve the raw bytes of a stored file.
     *
     * @param filePath the path/URL returned by {@link #storeFile}
     * @return byte array of the file content
     */
    byte[] loadFile(String filePath);
}
