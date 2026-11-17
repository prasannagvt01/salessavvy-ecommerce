package com.ecommerce.repository;

import com.ecommerce.model.AdminActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Long> {
    List<AdminActivityLog> findByAdminId(String adminId);

    List<AdminActivityLog> findByEntityTypeOrderByTimestampDesc(String entityType);
}
