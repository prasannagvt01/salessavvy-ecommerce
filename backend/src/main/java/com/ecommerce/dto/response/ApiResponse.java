package com.ecommerce.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String role;
    private String username;
    private String error;
    private List<?> products;
    private Map<String, Object> user;
    
    public static <T> ApiResponse<T> success(T data) {
        String roleStr = null;
        String userStr = null;
        List<?> prods = null;
        if (data instanceof AuthResponse auth) {
            roleStr = auth.getRole();
            userStr = auth.getUsername();
        } else if (data instanceof Page<?> page) {
            prods = page.getContent();
        } else if (data instanceof List<?> list) {
            prods = list;
        }

        return ApiResponse.<T>builder()
                .success(true)
                .message("Success")
                .data(data)
                .role(roleStr)
                .username(userStr)
                .products(prods)
                .user(userStr != null ? Map.of("name", userStr) : Map.of("name", "User"))
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static <T> ApiResponse<T> success(String message, T data) {
        String roleStr = null;
        String userStr = null;
        List<?> prods = null;
        if (data instanceof AuthResponse auth) {
            roleStr = auth.getRole();
            userStr = auth.getUsername();
        } else if (data instanceof Page<?> page) {
            prods = page.getContent();
        } else if (data instanceof List<?> list) {
            prods = list;
        }

        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .role(roleStr)
                .username(userStr)
                .products(prods)
                .user(userStr != null ? Map.of("name", userStr) : Map.of("name", "User"))
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
