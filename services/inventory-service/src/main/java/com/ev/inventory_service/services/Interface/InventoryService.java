package com.ev.inventory_service.services.Interface;

import com.ev.inventory_service.dto.request.TransactionRequestDto;
import com.ev.inventory_service.dto.request.UpdateReorderLevelRequest;
import com.ev.inventory_service.dto.response.InventoryStatusDto;
import com.ev.inventory_service.model.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.io.OutputStream;
import java.io.IOException;
import java.time.LocalDate;
// import java.time.LocalTime;
// import java.time.LocalDateTime;

public interface InventoryService {

    // Lấy trạng thái tồn kho chi tiết của một sản phẩm
    InventoryStatusDto getInventoryStatusForVariant(Long variantId);

    // Lấy tồn kho chi tiết của tất cả sản phẩm
    Page<InventoryStatusDto> getAllInventory(String search, Long dealerId, String status, Pageable pageable);
    
    // Thực hiện một giao dịch kho
    void executeTransaction(TransactionRequestDto request);
    
    // Cập nhật ngưỡng cảnh báo tồn kho cho đại lí
    void updateDealerReorderLevel(Long dealerId, UpdateReorderLevelRequest request);

    // Cập nhật ngưỡng cảnh báo tồn kho cho hãng
    void updateCentralReorderLevel(UpdateReorderLevelRequest request, String updatedByEmail);
    
    // Xuất báo cáo tồn kho
    // Excel
    void generateInventoryReport(OutputStream outputStream, LocalDate startDate, LocalDate endDate) throws IOException;
    // PDF
    void generatePdfReport(OutputStream outputStream, LocalDate startDate, LocalDate endDate) throws IOException;

    // Lấy lịch sử giao dịch
    Page<InventoryTransaction> getTransactionHistory(LocalDate startDate,LocalDate endDate ,Pageable pageable);

}
