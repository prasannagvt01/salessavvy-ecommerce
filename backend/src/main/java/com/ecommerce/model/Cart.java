package com.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "carts")
@EntityListeners(AuditingEntityListener.class)
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String userId;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "cart_id")
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Builder.Default
    private int totalItems = 0;

    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    private String appliedCoupon;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Entity
    @Table(name = "cart_items")
    public static class CartItem {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long cartItemId;

        private String productId;
        private String productName;

        @Column(columnDefinition = "LONGTEXT")
        private String productImage;

        @Column(precision = 10, scale = 2)
        private BigDecimal price;

        private int quantity;

        @Column(precision = 10, scale = 2)
        private BigDecimal subtotal;
    }

    public void recalculateTotals() {
        this.totalItems = items.stream().mapToInt(CartItem::getQuantity).sum();
        BigDecimal subtotal = items.stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalPrice = subtotal.subtract(this.discount != null ? this.discount : BigDecimal.ZERO)
                .max(BigDecimal.ZERO);
    }
}
