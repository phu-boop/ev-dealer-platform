package com.ev.sales_service.repository;

import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.enums.OrderStatus; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page; 
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, UUID>, JpaSpecificationExecutor<SalesOrder> {
    /**
     * Tìm tất cả đơn hàng theo trạng thái, có phân trang.
     */
    Page<SalesOrder> findAllByOrderStatus(OrderStatus status, Pageable pageable);

    /**
     * Tìm tất cả đơn hàng của một đại lý cụ thể (có phân trang)
     */
    Page<SalesOrder> findAllByDealerId(UUID dealerId, Pageable pageable);

    /**
     * Tìm tất cả đơn hàng của một đại lý VÀ lọc theo trạng thái
     */
    Page<SalesOrder> findAllByDealerIdAndOrderStatus(UUID dealerId, OrderStatus status, Pageable pageable);
    

    List<SalesOrder> findAllByOrderStatusAndDeliveryDateBetween(
        OrderStatus status, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
}
