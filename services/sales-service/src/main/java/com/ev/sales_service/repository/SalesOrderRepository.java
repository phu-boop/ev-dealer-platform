package com.ev.sales_service.repository;

import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.enums.OrderStatus;
import com.ev.sales_service.enums.SaleOderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page; 
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

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

     /**
     * Tìm tất cả đơn hàng của một đại lý VÀ lọc theo kieeu B2B hay B2C
     */
    Optional<SalesOrder> findByOrderIdAndTypeOder(UUID orderId, SaleOderType typeOder);

     // Lấy tất cả đơn B2B || B2C với trạng thái cụ thể cos phan trang
    Page<SalesOrder> findAllByTypeOderAndOrderStatus(SaleOderType typeOder, OrderStatus orderStatus, Pageable pageable);

    // Lấy tất cả đơn B2B || B2C khong phan trang
    Page<SalesOrder> findAllByTypeOder(SaleOderType typeOder, Pageable pageable);

    // Lấy tất cả đơn B2B || B2C  của dealer với status
    Page<SalesOrder> findAllByDealerIdAndTypeOderAndOrderStatus(UUID dealerId, SaleOderType typeOder, OrderStatus orderStatus, Pageable pageable);

    // Lấy tất cả đơn B2B || B2C  của dealer mà không cần filter status
    Page<SalesOrder> findAllByDealerIdAndTypeOder(UUID dealerId, SaleOderType typeOder, Pageable pageable);
}
