package com.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payments")
@EntityListeners(AuditingEntityListener.class)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;
    private String userId;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;
    private String currency;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String transactionId;
    private String razorpayOrderId;

    @Column(columnDefinition = "TEXT")
    private String gatewayResponse;

    private String cardLast4;
    private String cardBrand;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    public enum PaymentMethod {
        CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, COD, WALLET
    }

    public enum PaymentStatus {
        INITIATED, PROCESSING, SUCCESS, FAILED, REFUNDED, CANCELLED
    }
}
