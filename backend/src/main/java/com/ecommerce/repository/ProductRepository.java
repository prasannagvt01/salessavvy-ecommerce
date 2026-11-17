package com.ecommerce.repository;

import com.ecommerce.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryIdAndActiveTrue(String categoryId, Pageable pageable);

    Page<Product> findByCategoryNameIgnoreCaseAndActiveTrue(String categoryName, Pageable pageable);

    boolean existsByName(String name);

    java.util.Optional<Product> findFirstByName(String name);

    Page<Product> findByFeaturedTrueAndActiveTrue(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) AND p.active = true")
    Page<Product> searchByName(@Param("name") String name, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.price >= :minPrice AND p.price <= :maxPrice")
    Page<Product> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.averageRating >= :minRating")
    Page<Product> findByMinRating(@Param("minRating") double minRating, Pageable pageable);

    List<Product> findByCategoryId(String categoryId);

    @Query("SELECT DISTINCT p FROM Product p JOIN p.tags t WHERE p.active = true AND t IN :tags")
    Page<Product> findByTagsIn(@Param("tags") List<String> tags, Pageable pageable);

    long countByActiveTrue();

    long countByStockQuantityLessThan(int stockQuantity);

    List<Product> findByStockQuantityLessThanAndActiveTrue(int stockQuantity);

    List<Product> findTop10ByActiveTrueOrderByReviewCountDesc();
}
