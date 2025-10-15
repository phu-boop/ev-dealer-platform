package com.ev.inventory_service.services.Implementation;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.inventory_service.dto.request.TransactionRequestDto;
import com.ev.inventory_service.dto.request.UpdateReorderLevelRequest;
import com.ev.inventory_service.dto.response.DealerInventoryDto;
import com.ev.inventory_service.dto.response.InventoryStatusDto;
import com.ev.inventory_service.model.CentralInventory;
import com.ev.inventory_service.model.DealerAllocation;
import com.ev.inventory_service.model.InventoryTransaction;
import com.ev.inventory_service.repository.CentralInventoryRepository;
import com.ev.inventory_service.repository.DealerAllocationRepository;
import com.ev.inventory_service.repository.InventoryTransactionRepository;
import com.ev.inventory_service.services.Interface.InventoryService;
import com.ev.inventory_service.specification.InventorySpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.beans.factory.annotation.Value;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.OutputStream;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
// import java.lang.RuntimeException;
//PDF Lib
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Tự động inject dependency qua constructor
public class InventoryServiceImpl implements InventoryService {

    private final CentralInventoryRepository centralRepo;
    private final DealerAllocationRepository dealerRepo;
    private final InventoryTransactionRepository transactionRepo;
    private final RestTemplate restTemplate;

    @Value("${app.services.catalog.url}")
    private String vehicleCatalogUrl;

    @Override
    public InventoryStatusDto getInventoryStatusForVariant(Long variantId) {
        CentralInventory central = centralRepo.findByVariantId(variantId).orElse(new CentralInventory());
        List<DealerAllocation> dealers = dealerRepo.findByVariantId(variantId);

        List<DealerInventoryDto> dealerDtos = dealers.stream()
                .map(d -> DealerInventoryDto.builder()
                        .dealerId(d.getDealerId())
                        .allocatedQuantity(d.getAllocatedQuantity())
                        .availableQuantity(d.getAvailableQuantity())
                        .build())
                .collect(Collectors.toList());

        int totalInSystem = (central.getTotalQuantity() != null ? central.getTotalQuantity() : 0);

        return InventoryStatusDto.builder()
                .variantId(variantId)
                .totalInSystem(totalInSystem)
                .centralWarehouseAvailable(central.getAvailableQuantity() != null ? central.getAvailableQuantity() : 0)
                .dealerStock(dealerDtos)
                .build();
    }

    @Override
    public Page<InventoryStatusDto> getAllInventory(
            String search, 
            Long dealerId, 
            String status, 
            Pageable pageable) {
        
        List<Specification<CentralInventory>> specs = new ArrayList<>();

        // --- LOGIC TÌM KIẾM THEO TÊN XE ---
        if (search != null && !search.isBlank()) {
            // 1. Gọi API của vehicle-catalog-service để lấy danh sách variantId
            String searchUrl = vehicleCatalogUrl + "/vehicle-catalog/variants/search?keyword=" + search; // Cổng của vehicle-catalog-service
            
            ResponseEntity<ApiRespond<List<Long>>> response = restTemplate.exchange(
                searchUrl,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiRespond<List<Long>>>() {}
            );
            
            List<Long> variantIds = response.getBody().getData();

            // 2. Thêm điều kiện tìm kiếm vào Specification
            if (variantIds != null && !variantIds.isEmpty()) {
                specs.add(InventorySpecification.hasVariantIdIn(variantIds));
            } else {
                // Nếu tìm kiếm không ra kết quả nào, trả về trang rỗng
                return Page.empty(pageable);
            }
        }

        // --- LOGIC LỌC THEO ĐẠI LÝ ---
        if (dealerId != null) {
            // 1. Từ dealerId, tìm ra danh sách các variantId mà đại lý đó có hàng
            List<Long> variantIdsForDealer = dealerRepo.findByDealerId(dealerId).stream()
                    .map(DealerAllocation::getVariantId)
                    .distinct()
                    .collect(Collectors.toList());
            
            // Nếu đại lý không có xe nào thì trả về trang rỗng
            if (variantIdsForDealer.isEmpty()) {
                return Page.empty(pageable);
            }

            // 2. Thêm điều kiện "variantId phải nằm trong danh sách trên" vào Specification
            specs.add(InventorySpecification.hasVariantIdIn(variantIdsForDealer));
        }

        Specification<CentralInventory> finalSpec = specs.stream().reduce(Specification::and).orElse(null);
        Page<CentralInventory> inventoryPage = centralRepo.findAll(finalSpec, pageable);
        
        return inventoryPage.map(item -> getInventoryStatusForVariant(item.getVariantId()));
    }

    @Override
    @Transactional
    public void executeTransaction(TransactionRequestDto request) {
        // Luôn ghi lại log của giao dịch
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setVariantId(request.getVariantId());
        transaction.setTransactionType(request.getTransactionType());
        transaction.setQuantity(request.getQuantity());
        transaction.setFromDealerId(request.getFromDealerId());
        transaction.setToDealerId(request.getToDealerId());
        transaction.setStaffId(request.getStaffId());
        transaction.setNotes(request.getNotes());
        transactionRepo.save(transaction);
        
        // Xử lý logic nghiệp vụ tùy theo loại giao dịch
        switch (request.getTransactionType()) {
            case RESTOCK:
                handleRestock(request);
                break;
            case TRANSFER_TO_DEALER:
                handleTransferToDealer(request);
                break;
            case SALE:
                handleSale(request);
                break;
            // Có thể thêm các case khác ở đây (SALE, ADJUSTMENT...)
            default:
                throw new IllegalArgumentException("Unsupported transaction type");
        }
    }

    @Override
    public void generateInventoryReport(OutputStream outputStream, LocalDate startDate, LocalDate endDate) throws IOException {
        
        // 1. Lấy tất cả các giao dịch trong khoảng thời gian đã chọn
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        List<InventoryTransaction> transactions = transactionRepo.findAllByTransactionDateBetween(startDateTime, endDateTime);

        // 2. Dùng Apache POI để tạo file Excel từ danh sách giao dịch
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Báo cáo giao dịch kho");

            // --- Tạo Header ---
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = createHeaderStyle(workbook);
            String[] columns = {"ID Giao Dịch", "Ngày", "Loại Giao Dịch", "ID Sản Phẩm", "Số Lượng", "Từ Kho", 
            "Đến Kho", "Nhân Viên", "Ghi Chú"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // --- Đổ dữ liệu ---
            int rowNum = 1;
            for (InventoryTransaction tx : transactions) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(tx.getTransactionId());
                row.createCell(1).setCellValue(tx.getTransactionDate().toString());
                row.createCell(2).setCellValue(tx.getTransactionType().name());
                row.createCell(3).setCellValue(tx.getVariantId());
                row.createCell(4).setCellValue(tx.getQuantity());
                row.createCell(5).setCellValue(tx.getFromDealerId() != null ? "Đại lý " + tx.getFromDealerId() : "Kho Trung Tâm");
                row.createCell(6).setCellValue(tx.getToDealerId() != null ? "Đại lý " + tx.getToDealerId() : "Kho Trung Tâm");
                row.createCell(7).setCellValue(tx.getStaffId());
                row.createCell(8).setCellValue(tx.getNotes());
            }

            // Tự động điều chỉnh độ rộng cột
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
        }
    }

    @Override
    public void generatePdfReport(OutputStream outputStream, LocalDate startDate, LocalDate endDate) throws IOException {
        // 1. Lấy dữ liệu giao dịch
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        List<InventoryTransaction> transactions = transactionRepo.findAllByTransactionDateBetween(startDateTime, endDateTime);

        // 2. Dùng iText để tạo file PDF
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // --- Sửa lỗi Font ---
        PdfFont vietnameseFont = PdfFontFactory.createFont("fonts/DejaVuSans.ttf", PdfEncodings.IDENTITY_H, pdf);
        document.setFont(vietnameseFont);

        // --- Thêm Tiêu đề ---
        document.add(new Paragraph("Báo Cáo Giao Dịch Kho").setBold().setFontSize(16));
        document.add(new Paragraph("Từ Ngày: " + startDate + " Đến Ngày: " + endDate));
        document.add(new Paragraph(" "));

        // --- Tạo Bảng ---
        float[] columnWidths = {1, 3, 2, 2, 1, 3, 3, 2, 4};
        Table table = new Table(UnitValue.createPercentArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));

        // --- Thêm Header cho Bảng ---
        String[] headers = {"ID", "Ngày", "Loại GD", "Variant ID", "SL", "Từ Kho", "Đến Kho", "Nhân Viên", "Ghi Chú"};
        for (String header : headers) {
            // <<< SỬA LỖI: dùng biến `table` >>>
            table.addHeaderCell(new Paragraph(header).setBold());
        }

        // --- Đổ dữ liệu vào Bảng ---
        if (transactions.isEmpty()) {
            document.add(new Paragraph("Không có giao dịch nào trong khoảng thời gian đã chọn."));
        } else {
            for (InventoryTransaction tx : transactions) {
                
                table.addCell(String.valueOf(tx.getTransactionId()));
                table.addCell(tx.getTransactionDate().toLocalDate().toString());
                table.addCell(tx.getTransactionType().name());
                table.addCell(String.valueOf(tx.getVariantId()));
                table.addCell(String.valueOf(tx.getQuantity()));
                table.addCell(tx.getFromDealerId() != null ? "Đại Lý " + tx.getFromDealerId() : "Kho TT");
                table.addCell(tx.getToDealerId() != null ? "Đại Lý " + tx.getToDealerId() : "Kho TT");
                table.addCell(tx.getStaffId());
                table.addCell(tx.getNotes() != null ? tx.getNotes() : "");
            }
            document.add(table);
        }
        
        document.close();
    }

    @Override
    @Transactional
    public void updateDealerReorderLevel(Long dealerId, UpdateReorderLevelRequest request) {
        // Tìm bản ghi phân bổ tương ứng với đại lý và sản phẩm
        DealerAllocation allocation = dealerRepo.findByVariantIdAndDealerId(request.getVariantId(), dealerId)
                    .orElseThrow(() -> new AppException(ErrorCode.ALLOCATION_NOT_FOUND));

        // Cập nhật lại ngưỡng cảnh báo
        allocation.setReorderLevel(request.getReorderLevel());

        // Lưu thay đổi
        dealerRepo.save(allocation);
    }

    @Override
    @Transactional
    public void updateCentralReorderLevel(UpdateReorderLevelRequest request, String updatedByEmail) {
        CentralInventory inventory = centralRepo.findByVariantId(request.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        // Thêm logic ghi log history ở đây nếu bạn muốn
        // saveCentralInventoryHistory(inventory, EVMAction.UPDATE, updatedByEmail);

        inventory.setReorderLevel(request.getReorderLevel());

        centralRepo.save(inventory);
    }

    @Override
    public Page<InventoryTransaction> getTransactionHistory(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        // Luôn sắp xếp theo ngày mới nhất lên đầu
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            Sort.by("transactionDate").descending()
        );
    
        // Nếu người dùng cung cấp cả ngày bắt đầu và kết thúc
        if (startDate != null && endDate != null) {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
            return transactionRepo.findAllByTransactionDateBetween(startDateTime, endDateTime, sortedPageable);
        } else {
            // Nếu không, trả về tất cả lịch sử (có phân trang)
            return transactionRepo.findAll(sortedPageable);
        }
    }

//--Helper methods--
    private void handleRestock(TransactionRequestDto request) {
        CentralInventory inventory = centralRepo.findByVariantId(request.getVariantId())
                .orElseGet(() -> {
                    CentralInventory newInv = new CentralInventory();
                    newInv.setVariantId(request.getVariantId());
                    newInv.setTotalQuantity(0);
                    newInv.setAllocatedQuantity(0);
                    newInv.setAvailableQuantity(0);
                    return newInv;
                });

        inventory.setTotalQuantity(inventory.getTotalQuantity() + request.getQuantity());
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() + request.getQuantity());
        centralRepo.save(inventory);
    }

    private void handleTransferToDealer(TransactionRequestDto request) {
        // 1. Trừ kho trung tâm
        CentralInventory central = centralRepo.findByVariantId(request.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));
        
        if (central.getAvailableQuantity() < request.getQuantity()) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }
        central.setAvailableQuantity(central.getAvailableQuantity() - request.getQuantity());
        central.setAllocatedQuantity(central.getAllocatedQuantity() + request.getQuantity());
        centralRepo.save(central);

        // 2. Cộng kho đại lý
        DealerAllocation allocation = dealerRepo.findByVariantIdAndDealerId(request.getVariantId(), request.getToDealerId())
                .orElseGet(() -> {
                    DealerAllocation newAlloc = new DealerAllocation();
                    newAlloc.setVariantId(request.getVariantId());
                    newAlloc.setDealerId(request.getToDealerId());
                    newAlloc.setAllocatedQuantity(0);
                    newAlloc.setAvailableQuantity(0);
                    return newAlloc;
                });
        
        allocation.setAllocatedQuantity(allocation.getAllocatedQuantity() + request.getQuantity());
        allocation.setAvailableQuantity(allocation.getAvailableQuantity() + request.getQuantity());
        dealerRepo.save(allocation);
    }

    private void handleSale(TransactionRequestDto request) {
        // Khi bán hàng, toDealerId chính là dealer đã bán chiếc xe đó
        Long dealerId = request.getToDealerId();
        if (dealerId == null) {
            throw new IllegalArgumentException("Dealer ID is required for a sale transaction.");
        }
    
        DealerAllocation allocation = dealerRepo.findByVariantIdAndDealerId(request.getVariantId(), dealerId)
                .orElseThrow(() -> new AppException(ErrorCode.ALLOCATION_NOT_FOUND));
        
        if (allocation.getAvailableQuantity() < request.getQuantity()) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }
        
        // Trừ cả số lượng khả dụng và số lượng đã phân bổ
        allocation.setAvailableQuantity(allocation.getAvailableQuantity() - request.getQuantity());
        allocation.setAllocatedQuantity(allocation.getAllocatedQuantity() - request.getQuantity());
        dealerRepo.save(allocation);
    
        // Đồng thời, cần cập nhật lại số lượng tổng trong kho trung tâm
        CentralInventory central = centralRepo.findByVariantId(request.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));
        central.setTotalQuantity(central.getTotalQuantity() - request.getQuantity());
        central.setAllocatedQuantity(central.getAllocatedQuantity() - request.getQuantity());
        centralRepo.save(central);
    }

    // private String formatDealerStock(List<DealerInventoryDto> dealerStock) {
    //     if (dealerStock == null || dealerStock.isEmpty()) {
    //         return "Không có";
    //     }
    //     return dealerStock.stream()
    //             .map(d -> "Đại lý " + d.getDealerId() + ": " + d.getAvailableQuantity() + " xe")
    //             .collect(Collectors.joining("; ")); // Ngăn cách bằng dấu chấm phẩy
    // }
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }
}
