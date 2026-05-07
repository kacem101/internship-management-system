package com.enscs.internship.controller;

import com.enscs.internship.dto.response.UserResponse;
import com.enscs.internship.enums.Role;
import com.enscs.internship.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users/me
     * Returns the authenticated user's full profile including real id.
     * Called by the frontend immediately after login/register.
     */
    @GetMapping("/me")
    @Operation(summary = "Get the currently authenticated user's profile")
    public ResponseEntity<UserResponse> getMe(Principal principal) {
        return ResponseEntity.ok(userService.getCurrentUser(principal.getName()));
    }

    /**
     * GET /api/users?role=STUDENT|SUPERVISOR|ADMIN&page=0&size=20
     * Paginated user list with optional role filter — Admin only.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List users, optionally filtered by role (Admin only)")
    public ResponseEntity<Page<UserResponse>> getAll(
            @RequestParam(required = false) Role role,
            @PageableDefault(size = 100, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(role, pageable));
    }

    /**
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get a user by ID (Admin only)")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /**
     * PATCH /api/users/{id}/enable?enabled=true|false
     * Enable or disable a user account — Admin only.
     */
    @PatchMapping("/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Enable or disable a user account (Admin only)")
    public ResponseEntity<UserResponse> setEnabled(
            @PathVariable Long id,
            @RequestParam boolean enabled) {
        return ResponseEntity.ok(userService.setUserEnabled(id, enabled));
    }

    /**
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a user permanently (Admin only)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
