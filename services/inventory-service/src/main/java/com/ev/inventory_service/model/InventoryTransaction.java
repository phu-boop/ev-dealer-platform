package com.ev.inventory_service.model;

import com.ev.inventory_service.model.Enum.TransactionType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
@Data
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @Column(nullable = false)
    private Long variantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType transactionType;

    @Column(nullable = false)
    private Integer quantity;

    private Long fromDealerId; // null nếu từ kho trung tâm

    private Long toDealerId; // null nếu về kho trung tâm hoặc bán lẻ

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime transactionDate;

    private String staffId; // Email hoặc ID của nhân viên thực hiện

    private String referenceId; // ID của đơn hàng, phiếu xuất/nhập kho

    private String notes;
}
