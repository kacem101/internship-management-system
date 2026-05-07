package com.enscs.internship.exception;

import com.enscs.internship.dto.response.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex,
                                                            HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleBadRequest(BadRequestException ex,
                                                              HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(StorageException.class)
    public ResponseEntity<ApiErrorResponse> handleStorage(StorageException ex,
                                                           HttpServletRequest request) {
        log.error("Storage error: {}", ex.getMessage());
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Storage Error", ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                                                              HttpServletRequest request) {
        List<String> details = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .toList();
        return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, "Validation Failed",
                "One or more fields are invalid.", request.getRequestURI(), details);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentials(BadCredentialsException ex,
                                                                   HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", "Invalid email or password.", request.getRequestURI(), null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex,
                                                                 HttpServletRequest request) {
        return buildResponse(HttpStatus.FORBIDDEN, "Forbidden", "You do not have permission to access this resource.", request.getRequestURI(), null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneral(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                "An unexpected error occurred.", request.getRequestURI(), null);
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatus status, String error,
                                                             String message, String path,
                                                             List<String> details) {
        ApiErrorResponse body = ApiErrorResponse.builder()
                .status(status.value())
                .error(error)
                .message(message)
                .path(path)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();
        return ResponseEntity.status(status).body(body);
    }
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiErrorResponse> handleDisabledAccount(DisabledException ex,
                                                                 HttpServletRequest request) {
        return buildResponse(
            HttpStatus.FORBIDDEN, 
            "Account Disabled", 
            "Your account has been deactivated. Please contact the administrator.", 
            request.getRequestURI(), 
            null
        );
    }
}
