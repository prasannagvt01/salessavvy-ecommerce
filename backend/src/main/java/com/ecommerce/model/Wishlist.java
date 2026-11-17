package com.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wishlists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Wishlist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "wishlist_products", joinColumns = @JoinColumn(name = "wishlist_id"), inverseJoinColumns = @JoinColumn(name = "product_id"))
    private List<Product> products = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public void addProduct(Product product) {
        if (!products.contains(product)) {
            products.add(product);
            updatedAt = LocalDateTime.now();
        }
    }

    public void removeProduct(Product product) {
        if (products.remove(product)) {
            updatedAt = LocalDateTime.now();
        }
    }

    public boolean containsProduct(Product product) {
        return products.contains(product);
    }

    public void clearProducts() {
        products.clear();
        updatedAt = LocalDateTime.now();
    }
}
