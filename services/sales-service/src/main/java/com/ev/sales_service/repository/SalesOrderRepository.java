package com.ev.sales_service.repository;

import com.ev.sales_service.entity.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.ev.sales_service.enums.OrderStatus; 
import org.springframework.data.domain.Page; 
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, UUID>, JpaSpecificationExecutor<SalesOrder> {
    /**
     * Tìm tất cả đơn hàng theo trạng thái, có phân trang.
     */
    Page<SalesOrder> findAllByOrderStatus(OrderStatus status, Pageable pageable);
    
}
