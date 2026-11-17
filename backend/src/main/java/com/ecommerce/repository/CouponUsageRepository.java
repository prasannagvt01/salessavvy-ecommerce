package com.ecommerce.repository;

import com.ecommerce.model.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    long countByCouponId(String couponId);

    boolean existsByCouponIdAndUserId(String couponId, String userId);
}
