package com.ev.inventory_service.services.Implementation;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.common_lib.model.enums.*;

import com.ev.common_lib.dto.inventory.AllocationRequestDto;
import com.ev.common_lib.dto.inventory.ShipmentRequestDto;
import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.inventory_service.dto.request.TransactionRequestDto;
import com.ev.inventory_service.dto.request.UpdateReorderLevelRequest;
import com.ev.inventory_service.dto.request.CreateTransferRequestDto;
import com.ev.inventory_service.dto.response.DealerInventoryDto;
import com.ev.inventory_service.model.PhysicalVehicle;
import com.ev.inventory_service.model.Enum.VehiclePhysicalStatus;
import com.ev.inventory_service.model.Enum.InventoryLevelStatus;
// import com.ev.inventory_service.dto.response.DealerInventoryDto;
import com.ev.inventory_service.dto.response.InventoryStatusDto;
import com.ev.inventory_service.model.CentralInventory;
import com.ev.inventory_service.model.DealerAllocation;
import com.ev.inventory_service.model.InventoryTransaction;
import com.ev.inventory_service.model.TransferRequest;
import com.ev.inventory_service.model.Enum.TransferRequestStatus;
import com.ev.inventory_service.repository.CentralInventoryRepository;
import com.ev.inventory_service.repository.DealerAllocationRepository;
import com.ev.inventory_service.repository.InventoryTransactionRepository;
import com.ev.inventory_service.repository.PhysicalVehicleRepository;
import com.ev.inventory_service.repository.TransferRequestRepository;
import com.ev.inventory_service.services.Interface.InventoryService;
import com.ev.inventory_service.specification.InventorySpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;

import java.io.OutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Collections;
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

import org.springframework.kafka.core.KafkaTemplate;

import lombok.RequiredArgsConstructor;
import java.util.UUID;

@Service
@RequiredArgsConstructor // Tự động inject dependency qua constructor
public class InventoryServiceImpl implements InventoryService {

    private final CentralInventoryRepository centralRepo;
    private final DealerAllocationRepository dealerRepo;
    private final InventoryTransactionRepository transactionRepo;
    private final RestTemplate restTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final PhysicalVehicleRepository physicalVehicleRepo;
    private final TransferRequestRepository transferRequestRepo;

    @Value("${app.services.catalog.url}")
    private String vehicleCatalogUrl;

    @Override
    public InventoryStatusDto getInventoryStatusForVariant(Long variantId) {
        // 1. Chỉ lấy dữ liệu từ kho trung tâm
        CentralInventory central = centralRepo.findByVariantId(variantId)
                .orElse(null); // Trả về null nếu chưa có bản ghi tồn kho

        // Nếu không có bản ghi tồn kho nào, trả về DTO rỗng
        if (central == null) {
            return InventoryStatusDto.builder()
                .variantId(variantId)
                .totalQuantity(0)
                .allocatedQuantity(0)
                .availableQuantity(0)
                .reorderLevel(0)
                .status(InventoryLevelStatus.OUT_OF_STOCK)
                .build();
        }

        // 2. Tính toán trạng thái chỉ dựa trên kho trung tâm
        int available = central.getAvailableQuantity();
        int reorder = central.getReorderLevel() != null ? central.getReorderLevel() : 0;
        
        InventoryLevelStatus currentStatus;
        if (available <= 0) {
            currentStatus = InventoryLevelStatus.OUT_OF_STOCK;
        } else if (available <= reorder) {
            currentStatus = InventoryLevelStatus.LOW_STOCK;
        } else {
            currentStatus = InventoryLevelStatus.IN_STOCK;
        }

        // 3. Xây dựng DTO chỉ với thông tin kho trung tâm
        return InventoryStatusDto.builder()
                .variantId(variantId)
                .totalQuantity(central.getTotalQuantity())
                .allocatedQuantity(central.getAllocatedQuantity())
                .availableQuantity(central.getAvailableQuantity())
                .reorderLevel(central.getReorderLevel())
                .status(currentStatus)
                .build();
    }

    @Override
    public Page<InventoryStatusDto> getAllInventory(
            String search,
            UUID dealerId,
            String status,
            Pageable pageable) {

        //Demo cách lấy id và ProfileId dùng chổ nào cx đc
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getDetails() instanceof Map<?, ?> detailsMap) {
            String userId = (String) detailsMap.get("userId");
            String profileId = (String) detailsMap.get("profileId");

            System.out.println("User ID: " + userId);
            System.out.println("Profile ID: " + profileId);
        }

        List<Specification<CentralInventory>> specs = new ArrayList<>();

        // --- LOGIC TÌM KIẾM THEO TÊN XE ---
        if (search != null && !search.isBlank()) {
            // 1. Gọi API của vehicle-catalog-service để lấy danh sách variantId
            String searchUrl = vehicleCatalogUrl + "/vehicle-catalog/variants/search?keyword=" + search; // Cổng của vehicle-catalog-service

            ResponseEntity<ApiRespond<List<Long>>> response = restTemplate.exchange(
                    searchUrl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiRespond<List<Long>>>() {
                    }
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
    public void executeTransaction(TransactionRequestDto request, String staffEmail, String role, String profileId) {
        
        // Chỉ xử lý RESTOCK ở đây
        if (request.getTransactionType() != TransactionType.RESTOCK) {
            throw new IllegalArgumentException("Invalid transaction type for this endpoint.");
        }
        
        // Kiểm tra quyền
        if (!role.equals("EVM_STAFF") && !role.equals("ADMIN")) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        // Xử lý logic nhập kho bằng VIN
        handleRestock(request); 
        
        // Ghi log giao dịch
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setVariantId(request.getVariantId());
        transaction.setTransactionType(TransactionType.RESTOCK);
        transaction.setQuantity(request.getVins().size()); // Lấy số lượng từ VINs
        transaction.setStaffId(staffEmail);
        transaction.setNotes(request.getNotes());
        InventoryTransaction savedTransaction = transactionRepo.save(transaction);
        
        // Gửi sự kiện Kafka
        try {
            kafkaTemplate.send("inventory_events", savedTransaction);
        } catch (Exception e) {
            System.err.println("WARN: Failed to send inventory event to Kafka. " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void createTransferRequest(CreateTransferRequestDto request) {
        // Kiểm tra kho
        CentralInventory central = centralRepo.findByVariantId(request.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        if (central.getAvailableQuantity() < request.getQuantity()) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }

        // Tạo yêu cầu mới
        TransferRequest newRequest = new TransferRequest();
        newRequest.setVariantId(request.getVariantId());
        newRequest.setQuantity(request.getQuantity());
        newRequest.setToDealerId(request.getToDealerId());
        newRequest.setRequesterEmail(request.getRequesterEmail());
        newRequest.setNotes(request.getNotes());
        newRequest.setStatus(TransferRequestStatus.PENDING); // Trạng thái "Chờ duyệt"

        transferRequestRepo.save(newRequest);
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
    public void updateDealerReorderLevel(UUID dealerId, UpdateReorderLevelRequest request) {
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

    @Override
    @Transactional
    public void allocateStockForOrder(AllocationRequestDto request, String staffEmail) {
        for (AllocationRequestDto.AllocationItem item : request.getItems()) {
            CentralInventory central = centralRepo.findByVariantId(item.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

            if (central.getAvailableQuantity() < item.getQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }

            central.setAvailableQuantity(central.getAvailableQuantity() - item.getQuantity());
            central.setAllocatedQuantity(central.getAllocatedQuantity() + item.getQuantity());
            centralRepo.save(central);
            
            // Ghi log giao dịch "ALLOCATE"
            InventoryTransaction tx = new InventoryTransaction();
            tx.setTransactionType(TransactionType.ALLOCATE);
            tx.setVariantId(item.getVariantId());
            tx.setQuantity(item.getQuantity());
            tx.setStaffId(staffEmail);
            tx.setReferenceId(request.getOrderId().toString());
            transactionRepo.save(tx);
        }
    }

    @Override
    @Transactional
    public void shipAllocatedStock(ShipmentRequestDto request, String staffEmail) {
        UUID dealerId = request.getDealerId();

        for (ShipmentRequestDto.ShipmentItem item : request.getItems()) {
            Long variantId = item.getVariantId();
            List<String> vins = item.getVins();
            int quantity = vins.size();

            // 1. Cập nhật bảng SKU (kho trung tâm)
            CentralInventory central = centralRepo.findByVariantId(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));
            
            if (central.getAllocatedQuantity() < quantity) {
                System.err.println("Lỗi phân bổ: Không đủ hàng đã giữ.");
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }
            central.setAllocatedQuantity(central.getAllocatedQuantity() - quantity);
            central.setTotalQuantity(central.getTotalQuantity() - quantity);
            centralRepo.save(central);

            // 2. Cập nhật bảng SKU (kho đại lý)
            DealerAllocation allocation = dealerRepo.findByVariantIdAndDealerId(variantId, dealerId)
                .orElseGet(() -> {
                    DealerAllocation newAlloc = new DealerAllocation();
                    newAlloc.setVariantId(variantId);
                    newAlloc.setDealerId(dealerId);
                    newAlloc.setAllocatedQuantity(0);
                    newAlloc.setAvailableQuantity(0);
                    return newAlloc; // 
                });
            
            // (Tạm thời) coi như hàng đến ngay
            allocation.setAvailableQuantity(allocation.getAvailableQuantity() + quantity); 
            dealerRepo.save(allocation);

            // 3. Cập nhật bảng VIN (xe vật lý)
            List<PhysicalVehicle> vehicles = physicalVehicleRepo.findAllById(vins);
            for (PhysicalVehicle vehicle : vehicles) {
                if (vehicle.getStatus() != VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE) {
                    System.err.println("Xe " + vehicle.getVin() + " không ở kho trung tâm.");
                    throw new AppException(ErrorCode.BAD_REQUEST);
                }
                vehicle.setStatus(VehiclePhysicalStatus.AT_DEALER); // Cập nhật trạng thái
                vehicle.setLocationId(dealerId); // Cập nhật vị trí
            }
            physicalVehicleRepo.saveAll(vehicles);

            // 4. Ghi log giao dịch
            InventoryTransaction tx = new InventoryTransaction();
            tx.setTransactionType(TransactionType.TRANSFER_TO_DEALER);
            tx.setVariantId(variantId);
            tx.setQuantity(quantity);
            tx.setToDealerId(dealerId);
            tx.setStaffId(staffEmail);
            tx.setReferenceId(request.getOrderId().toString());
            tx.setNotes("Đã giao các VIN: " + String.join(", ", vins));
            transactionRepo.save(tx);
        }
    }

    /**
     * SỬA LẠI: Lấy trạng thái tồn kho cho NHIỀU variant (Tối ưu)
     */
    @Override
    @Transactional(readOnly = true)
    public List<InventoryStatusDto> getInventoryStatusByIds(List<Long> variantIds) {
        if (variantIds == null || variantIds.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Tải TỒN KHO TRUNG TÂM (1 query duy nhất)
        List<CentralInventory> inventories = centralRepo.findByVariantIdIn(variantIds);
        // Tạo Map để tra cứu nhanh
        Map<Long, CentralInventory> inventoryMap = inventories.stream()
                .collect(Collectors.toMap(CentralInventory::getVariantId, inv -> inv));

        // 2. (Đã xóa logic tìm kho đại lý vì DTO không có)

        // 3. Map kết quả (Dùng stream() của variantIds gốc để đảm bảo trả về đủ)
        return variantIds.stream()
            .map(id -> {
                // Lấy thông tin từ Map đã tra cứu
                CentralInventory inventory = inventoryMap.get(id);
                
                // Gọi hàm helper đã sửa (chỉ 2 tham số)
                return mapToInventoryStatusDto(inventory, id);
            })
            .collect(Collectors.toList());
    }

    //--Helper methods--
    private void handleRestock(TransactionRequestDto request) {
        
        if (request.getVins() == null || request.getVins().isEmpty()) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        int quantity = request.getVins().size();

        // 1. Lưu từng chiếc xe vật lý vào bảng VIN
        List<PhysicalVehicle> newVehicles = new ArrayList<>();
        for (String vin : request.getVins()) {
            if (physicalVehicleRepo.existsById(vin)) {
                throw new AppException(ErrorCode.DATA_ALREADY_EXISTS);
            }
            
            PhysicalVehicle vehicle = new PhysicalVehicle();
            vehicle.setVin(vin);
            vehicle.setVariantId(request.getVariantId());
            vehicle.setStatus(VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE); 
            vehicle.setLocationId(null); // null = Kho trung tâm
            newVehicles.add(vehicle);
        }
        physicalVehicleRepo.saveAll(newVehicles);

        // 2. Cập nhật bảng tóm tắt (CentralInventory)
        CentralInventory inventory = centralRepo.findByVariantId(request.getVariantId())
                .orElseGet(() -> {
                    CentralInventory newInv = new CentralInventory();
                    newInv.setVariantId(request.getVariantId());
                    newInv.setTotalQuantity(0);
                    newInv.setAllocatedQuantity(0);
                    newInv.setAvailableQuantity(0);
                    return newInv;
                });

        inventory.setTotalQuantity(inventory.getTotalQuantity() + quantity);
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() + quantity);
        centralRepo.save(inventory);
    }

    /**
     * Map thủ công từ Entity sang DTO.
     * Xử lý cả trường hợp 'inventory' (kho TT) là null (khi xe chưa được nhập kho).
     */
    private InventoryStatusDto mapToInventoryStatusDto(CentralInventory inventory, Long variantId) {
        
        // 1. Dùng Builder() thay vì new InventoryStatusDto()
        InventoryStatusDto.InventoryStatusDtoBuilder dtoBuilder = InventoryStatusDto.builder();
        dtoBuilder.variantId(variantId);

        if (inventory == null) {
            // Trường hợp xe này CHƯA CÓ trong kho trung tâm
            dtoBuilder.availableQuantity(0);
            dtoBuilder.allocatedQuantity(0);
            dtoBuilder.totalQuantity(0);
            dtoBuilder.reorderLevel(0); // Ngưỡng mặc định
            // 2. Dùng Enum thay vì String
            dtoBuilder.status(InventoryLevelStatus.OUT_OF_STOCK); 
        } else {
            // Trường hợp xe ĐÃ CÓ trong kho trung tâm
            // 1. Lấy reorderLevel và kiểm tra null, gán mặc định là 0
            int reorderLvl = (inventory.getReorderLevel() != null) ? inventory.getReorderLevel() : 0;
            
            dtoBuilder.availableQuantity(inventory.getAvailableQuantity());
            dtoBuilder.allocatedQuantity(inventory.getAllocatedQuantity());
            dtoBuilder.totalQuantity(inventory.getTotalQuantity());
            
            // 2. Dùng giá trị đã kiểm tra null
            dtoBuilder.reorderLevel(reorderLvl); 
            
            // Logic xác định trạng thái (Dùng Enum)
            if (inventory.getAvailableQuantity() <= 0) {
                dtoBuilder.status(InventoryLevelStatus.OUT_OF_STOCK);
            } else if (inventory.getAvailableQuantity() <= reorderLvl) { // 3. Dùng giá trị đã kiểm tra null
                dtoBuilder.status(InventoryLevelStatus.LOW_STOCK);
            } else {
                dtoBuilder.status(InventoryLevelStatus.IN_STOCK);
            }
        }

        return dtoBuilder.build(); // Trả về DTO đã được build
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    /**
     * Lấy tồn kho của Đại lý và gộp với thông tin chi tiết từ Vehicle-Service.
     */
    @Override
    public List<DealerInventoryDto> getDealerInventory(UUID dealerId, String search, HttpHeaders headers) {
        
        // 1. Lấy tất cả tồn kho (SKU) của Đại lý này
        List<DealerAllocation> dealerStock = dealerRepo.findByDealerId(dealerId);
        
        // 2. Lấy tất cả ID sản phẩm mà đại lý này có
        List<Long> variantIds = dealerStock.stream()
                                    .map(DealerAllocation::getVariantId)
                                    .collect(Collectors.toList());

        // Nếu đại lý không có xe nào, trả về danh sách rỗng
        if (variantIds.isEmpty()) {
            return new ArrayList<>();
        }

        // 3. GỌI API (ĐỒNG BỘ) sang Vehicle-Service để lấy chi tiết của các xe này
        // (Đây là cách gọi liên service an toàn, chuyển tiếp header)
        String url = vehicleCatalogUrl + "/vehicle-catalog/variants/details-by-ids";
        HttpEntity<List<Long>> requestEntity = new HttpEntity<>(variantIds, headers); // Gửi List<Long> trong body

        ResponseEntity<ApiRespond<List<VariantDetailDto>>> response;
        try {
            response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<ApiRespond<List<VariantDetailDto>>>() {}
            );
        } catch (Exception e) {
            System.err.println("Failed to call vehicle-service /details-by-ids: " + e.getMessage());
            e.printStackTrace(); 
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

        if (response.getBody() == null || response.getBody().getData() == null) {
             throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

        // 4. Tạo Map tra cứu
        // Map<VariantID, ThôngTinChiTiếtXe>
        Map<Long, VariantDetailDto> variantDetailsMap = response.getBody().getData().stream()
                .collect(Collectors.toMap(VariantDetailDto::getVariantId, v -> v));

        // Map<VariantID, ThôngTinKho>
        Map<Long, DealerAllocation> inventoryMap = dealerStock.stream()
                .collect(Collectors.toMap(DealerAllocation::getVariantId, s -> s));

        // 5. Gộp dữ liệu và Lọc (nếu có)
        List<DealerInventoryDto> mergedList = variantIds.stream()
            .map(id -> {
                VariantDetailDto details = variantDetailsMap.get(id);
                DealerAllocation stock = inventoryMap.get(id);
                return DealerInventoryDto.merge(details, stock);
            })
            .filter(dto -> { // Lọc client-side (vì số lượng ít)
                if (search == null || search.isBlank()) return true;
                String query = search.toLowerCase();
                return (dto.getModelName() != null && dto.getModelName().toLowerCase().contains(query)) ||
                       (dto.getVersionName() != null && dto.getVersionName().toLowerCase().contains(query)) ||
                       (dto.getColor() != null && dto.getColor().toLowerCase().contains(query)) ||
                       (dto.getSkuCode() != null && dto.getSkuCode().toLowerCase().contains(query));
            })
            .collect(Collectors.toList());

        return mergedList;
    }
}
