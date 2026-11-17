package com.ecommerce.controller;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final com.ecommerce.service.CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getAllUsers(org.springframework.data.domain.PageRequest.of(page, size))));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @GetMapping("/{id:\\d+}/carts")
    public ResponseEntity<ApiResponse<com.ecommerce.dto.response.CartResponse>> getUserCart(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCartByUserId(id)));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<java.util.List<UserResponse.AddressDto>>> getAddresses() {
        UserResponse profile = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success(
                profile.getAddresses() != null ? profile.getAddresses() : java.util.Collections.emptyList()));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        UserResponse response = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@RequestBody UpdateProfileRequest request) {
        UserResponse response = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PutMapping(value = "/avatar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatarMultipart(
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "avatar", required = false) org.springframework.web.multipart.MultipartFile avatar) {
        try {
            org.springframework.web.multipart.MultipartFile target = file != null ? file : avatar;
            if (target == null || target.isEmpty()) {
                throw new com.ecommerce.exception.BadRequestException("Please select an image file to upload");
            }
            String contentType = target.getContentType() != null ? target.getContentType() : "image/jpeg";
            String base64 = java.util.Base64.getEncoder().encodeToString(target.getBytes());
            String dataUrl = "data:" + contentType + ";base64," + base64;
            UserResponse response = userService.updateProfileImage(dataUrl);
            return ResponseEntity.ok(ApiResponse.success("Profile photo updated successfully", response));
        } catch (java.io.IOException e) {
            throw new com.ecommerce.exception.BadRequestException("Failed to read uploaded image");
        }
    }

    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<UserResponse>> updateAvatarJson(@RequestBody java.util.Map<String, String> body) {
        String profileImage = body.getOrDefault("profileImage", body.get("avatar"));
        UserResponse response = userService.updateProfileImage(profileImage);
        return ResponseEntity.ok(ApiResponse.success("Profile photo updated successfully", response));
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<ApiResponse<UserResponse>> removeAvatar() {
        UserResponse response = userService.updateProfileImage(null);
        return ResponseEntity.ok(ApiResponse.success("Profile photo removed", response));
    }

    @PostMapping("/change-password-init")
    public ResponseEntity<ApiResponse<Void>> initiateChangePassword(
            @RequestBody java.util.Map<String, String> request) {
        String currentPassword = request.get("currentPassword");
        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            throw new com.ecommerce.exception.BadRequestException("Current password is required");
        }
        userService.initiateChangePassword(currentPassword);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email", null));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<UserResponse>> addAddress(@RequestBody AddressRequest request) {
        UserResponse response = userService.addAddress(request);
        return ResponseEntity.ok(ApiResponse.success("Address added successfully", response));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateAddress(@PathVariable String id,
            @RequestBody AddressRequest request) {
        UserResponse response = userService.updateAddress(id, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", response));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> deleteAddress(@PathVariable String id) {
        UserResponse response = userService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", response));
    }

    @PutMapping("/addresses/{id}/default")
    public ResponseEntity<ApiResponse<UserResponse>> setDefaultAddress(@PathVariable String id) {
        UserResponse response = userService.setDefaultAddress(id);
        return ResponseEntity.ok(ApiResponse.success("Default address updated successfully", response));
    }
}
