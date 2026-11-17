package com.ecommerce.service;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final MailService mailService;

    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email is required");
        }
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already registered");
        }

        String firstName = request.getFirstName();
        String lastName = request.getLastName();

        if ((firstName == null || firstName.trim().isEmpty()) && request.getUsername() != null) {
            String[] parts = request.getUsername().trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }
        if (firstName == null || firstName.trim().isEmpty()) {
            firstName = "User";
        }
        if (lastName == null) {
            lastName = "";
        }

        User.Role role = User.Role.USER;
        if (request.getRole() != null && request.getRole().trim().equalsIgnoreCase("ADMIN")) {
            role = User.Role.ADMIN;
        }

        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone() : "")
                .roles(Set.of(role))
                .active(true)
                .build();

        user = userRepository.save(user);

        // Async welcome email so registration is instantaneous
        final User savedUser = user;
        CompletableFuture.runAsync(() -> {
            try {
                mailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFirstName() + " " + savedUser.getLastName());
            } catch (Exception e) {
                System.err.println("Async welcome email note: " + e.getMessage());
            }
        });

        String token = jwtTokenProvider.generateToken(user.getEmail());
        return AuthResponse.of(token, UserResponse.fromUser(user));
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEffectiveIdentifier();
        if (identifier.isEmpty()) {
            throw new BadRequestException("Email or username is required");
        }

        User user = userRepository.findByEmailOrUsername(identifier)
                .orElseThrow(() -> new BadRequestException("Invalid credentials: user not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid credentials: password incorrect");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword()));

        final User loggedInUser = user;
        CompletableFuture.runAsync(() -> {
            try {
                mailService.sendLoginAlertEmail(loggedInUser.getEmail(), loggedInUser.getFirstName() + " " + loggedInUser.getLastName(),
                        "Web Browser",
                        "Localhost");
            } catch (Exception e) {
                System.err.println("Async login alert note: " + e.getMessage());
            }
        });

        String token = jwtTokenProvider.generateToken(authentication);
        return AuthResponse.of(token, UserResponse.fromUser(user));
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found with this email"));

        if (user.getOtpLockoutUntil() != null && user.getOtpLockoutUntil().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Too many attempts. Please try again after " + user.getOtpLockoutUntil());
        }

        String otp = String.format("%06d", (int) (Math.random() * 1000000));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        CompletableFuture.runAsync(() -> {
            try {
                mailService.sendPasswordResetOtp(user.getEmail(), otp);
            } catch (Exception e) {
                System.err.println("OTP email note: " + e.getMessage());
            }
        });
    }

    public String verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP expired");
        }

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        user.setOtp(null);
        userRepository.save(user);

        return resetToken;
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
}
