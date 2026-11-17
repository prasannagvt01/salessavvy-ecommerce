package com.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "admin_activity_logs")
@EntityListeners(AuditingEntityListener.class)
public class AdminActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String adminId;
    private String adminName;
    private String adminEmail;

    private String action; // e.g., "CREATE_PRODUCT", "UPDATE_ORDER_STATUS", "DELETE_COUPON"
    private String entityType; // e.g., "PRODUCT", "ORDER", "COUPON"
    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String details; // JSON string for extra details

    private String ipAddress;

    @CreatedDate
    private LocalDateTime timestamp;
}
