package com.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stock_history")
public class StockHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productId;
    private int changeQuantity;
    private int newQuantity;

    @Enumerated(EnumType.STRING)
    private StockChangeType type;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String referenceId; // orderId or manual update reference
    private LocalDateTime timestamp;

    public enum StockChangeType {
        MANUAL_UPDATE,
        ORDER_PLACEMENT,
        ORDER_CANCELLATION,
        ORDER_RETURN,
        RESTOCK
    }
}
