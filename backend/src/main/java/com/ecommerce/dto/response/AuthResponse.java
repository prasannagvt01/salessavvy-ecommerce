package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type;
    private UserResponse user;
    private String role;
    private String username;
    
    public static AuthResponse of(String token, UserResponse user) {
        String roleStr = "CUSTOMER";
        if (user != null && user.getRoles() != null) {
            boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.equalsIgnoreCase("ADMIN"));
            roleStr = isAdmin ? "ADMIN" : "CUSTOMER";
        }
        String name = user != null ? (user.getFirstName() != null ? user.getFirstName() : user.getEmail()) : "User";

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(user)
                .role(roleStr)
                .username(name)
                .build();
    }
}
