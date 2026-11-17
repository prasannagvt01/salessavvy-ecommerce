package com.ecommerce.controller;

import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.model.User;
import com.ecommerce.model.User.Role;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.ExternalDataSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/seed")
@RequiredArgsConstructor
public class SeedController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ExternalDataSyncService externalDataSyncService;

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> seedData() {
        ensureDefaultAdmin();
        Map<String, Object> summary = externalDataSyncService.syncAllExternalData();
        return ResponseEntity.ok(ApiResponse.success("DummyJSON and Fake Store API data synced successfully!", summary));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> seedDataGet() {
        ensureDefaultAdmin();
        Map<String, Object> summary = externalDataSyncService.syncAllExternalData();
        return ResponseEntity.ok(ApiResponse.success("DummyJSON and Fake Store API data synced successfully!", summary));
    }

    private void ensureDefaultAdmin() {
        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(Collections.singleton(Role.ADMIN));
            userRepository.save(admin);
        }
    }
}
