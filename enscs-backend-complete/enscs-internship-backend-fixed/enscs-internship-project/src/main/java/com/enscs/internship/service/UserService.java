package com.enscs.internship.service;

import com.enscs.internship.dto.response.UserResponse;
import com.enscs.internship.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse getCurrentUser(String email);
    Page<UserResponse> getAllUsers(Role role, Pageable pageable);
    UserResponse getUserById(Long id);
    UserResponse setUserEnabled(Long id, boolean enabled);
    void deleteUser(Long id);
}
