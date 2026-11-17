package com.ecommerce.dto.response;

import com.ecommerce.model.Product;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private String id;
    private String name;
    private String description;
    private String brand;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private int discountPercentage;
    private String categoryId;
    private String categoryName;
    private List<String> images;
    private int stockQuantity;
    private boolean active;
    private boolean featured;
    private double averageRating;
    private int reviewCount;
    private List<String> tags;
    private ProductSpecsDto specs;
    private LocalDateTime createdAt;

    @JsonProperty("product_id")
    public String getProductId() {
        return id;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSpecsDto {
        private String weight;
        private String dimensions;
        private String color;
        private String material;
        private String warranty;
    }

    public static ProductResponse fromProduct(Product product) {
        ProductSpecsDto specsDto = null;
        if (product.getSpecs() != null) {
            Product.ProductSpecs s = product.getSpecs();
            specsDto = ProductSpecsDto.builder()
                    .weight(s.getWeight())
                    .dimensions(s.getDimensions())
                    .color(s.getColor())
                    .material(s.getMaterial())
                    .warranty(s.getWarranty())
                    .build();
        }

        List<String> imgList = product.getImages();
        if (imgList == null || imgList.isEmpty()) {
            imgList = List.of("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800");
        }

        return ProductResponse.builder()
                .id(product.getId() != null ? product.getId().toString() : "")
                .name(product.getName())
                .description(product.getDescription())
                .brand(product.getBrand())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .discountPercentage(product.getDiscountPercentage())
                .categoryId(product.getCategoryId())
                .categoryName(product.getCategoryName())
                .images(imgList)
                .stockQuantity(product.getStockQuantity())
                .active(product.isActive())
                .featured(product.isFeatured())
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .specs(specsDto)
                .createdAt(product.getCreatedAt())
                .build();
    }
}
