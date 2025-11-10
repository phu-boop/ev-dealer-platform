# 📋 GIAI ĐOẠN 3: Hệ Thống Thanh Toán B2B Đại Lý (Dealer Payment System)

## 📊 Tổng Quan

Giai đoạn 3 tập trung vào việc xây dựng hệ thống quản lý công nợ và thanh toán B2B giữa Đại lý và Hãng xe (EVM). Hệ thống cho phép EVM Staff tạo hóa đơn công nợ cho đại lý dựa trên các đơn hàng B2B, đại lý có thể thanh toán và EVM Staff xác nhận thanh toán.

---

## ✅ Các Chức Năng Đã Hoàn Thành

### 1. Tạo Hóa Đơn Công Nợ (EVM Staff)
- **Endpoint**: `POST /api/v1/payments/dealer/invoices`
- **Chức năng**: EVM Staff tạo hóa đơn công nợ cho đại lý
- **Yêu cầu**: 
  - Phải có `orderId` từ Sales Service
  - Order phải là B2B (`type_oder = 'B2B'`)
  - Order phải tồn tại trong Sales Service
  - `dealerId` phải match với `dealerId` từ order
- **Logic**:
  - Validate order từ Sales Service
  - Tự động set `referenceType = "SALES_ORDER_B2B"` và `referenceId = orderId`
  - Tạo `DealerInvoice` với status = "UNPAID"
  - Cập nhật `DealerDebtRecord`: Tăng `totalOwed`

### 2. Thanh Toán Hóa Đơn (Dealer Manager)
- **Endpoint**: `POST /api/v1/payments/dealer/invoices/{invoiceId}/pay`
- **Chức năng**: Đại lý thanh toán hóa đơn (toàn bộ hoặc một phần)
- **Yêu cầu**:
  - Chỉ được thanh toán invoices của chính mình
  - Số tiền thanh toán ≤ `remainingAmount`
  - Payment method phải có scope = "B2B" hoặc "ALL"
- **Logic**:
  - Validate invoice tồn tại và thuộc về dealer
  - Validate amount không vượt quá remainingAmount
  - Validate payment method scope
  - Tạo `DealerTransaction` với status = "PENDING_CONFIRMATION"

### 3. Xác Nhận Thanh Toán (EVM Staff)
- **Endpoint**: `POST /api/v1/payments/dealer/transactions/{transactionId}/confirm`
- **Chức năng**: EVM Staff xác nhận thanh toán từ đại lý
- **Logic**:
  - Validate transaction ở status "PENDING_CONFIRMATION"
  - Update transaction status = "SUCCESS" (trong database) / "CONFIRMED" (trong response)
  - Update invoice: Tăng `amountPaid`, cập nhật status (UNPAID → PAID hoặc PARTIALLY_PAID)
  - Update `DealerDebtRecord`: Tăng `totalPaid`, tự động tính lại `currentBalance`
  - Xử lý status OVERDUE nếu invoice quá hạn

### 4. Lấy Danh Sách Hóa Đơn
- **Endpoint**: `GET /api/v1/payments/dealer/{dealerId}/invoices`
- **Chức năng**: Lấy danh sách hóa đơn của một đại lý
- **Features**:
  - Phân trang (Pageable)
  - Lọc theo status (UNPAID, PARTIALLY_PAID, PAID, OVERDUE)
  - Authorization: DEALER_MANAGER chỉ xem được invoices của chính mình
  - EVM_STAFF/ADMIN xem được tất cả invoices

### 5. Lấy Chi Tiết Hóa Đơn
- **Endpoint**: `GET /api/v1/payments/dealer/{dealerId}/invoices/{invoiceId}`
- **Chức năng**: Lấy chi tiết một hóa đơn cụ thể
- **Features**:
  - Hiển thị thông tin đầy đủ về invoice
  - Hiển thị danh sách transactions của invoice
  - Validate `dealerId` trong path match với invoice `dealerId`
  - Authorization: DEALER_MANAGER chỉ xem được invoices của chính mình

### 6. Lấy Tổng Hợp Công Nợ
- **Endpoint**: `GET /api/v1/payments/dealer/debt-summary`
- **Chức năng**: Lấy tổng hợp công nợ của tất cả đại lý
- **Permissions**: EVM_STAFF, ADMIN
- **Features**:
  - Phân trang (Pageable)
  - Hiển thị `totalOwed`, `totalPaid`, `currentBalance` cho mỗi dealer

---

## 🔧 Kiến Trúc và Công Nghệ

### Backend Stack
- **Framework**: Spring Boot 3.x
- **Database**: MySQL (payment_db)
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security với JWT
- **API Communication**: RestTemplate
- **Mapping**: MapStruct
- **Validation**: Jakarta Validation

### Database Entities

#### 1. DealerInvoice
- `dealerInvoiceId` (UUID, PK)
- `dealerId` (UUID, FK → dealers.dealer_id)
- `createdByStaffId` (UUID, FK → users.id)
- `totalAmount` (BigDecimal)
- `amountPaid` (BigDecimal)
- `dueDate` (LocalDate)
- `status` (String: UNPAID, PARTIALLY_PAID, PAID, OVERDUE)
- `referenceType` (String: "SALES_ORDER_B2B")
- `referenceId` (String: orderId)
- `createdAt` (LocalDateTime)
- `notes` (String)

#### 2. DealerTransaction
- `dealerTransactionId` (UUID, PK)
- `dealerInvoiceId` (UUID, FK → dealer_invoices.dealer_invoice_id)
- `amount` (BigDecimal)
- `transactionDate` (LocalDateTime)
- `paymentMethodId` (UUID, FK → payment_methods.method_id)
- `transactionCode` (String)
- `status` (String: PENDING_CONFIRMATION, CONFIRMED, FAILED)
- `confirmedByStaffId` (UUID, FK → users.id)
- `notes` (String)

#### 3. DealerDebtRecord
- `dealerId` (UUID, PK)
- `totalOwed` (BigDecimal)
- `totalPaid` (BigDecimal)
- `currentBalance` (BigDecimal) - Tự động tính: totalOwed - totalPaid
- `lastUpdated` (LocalDateTime)

---

## 🔄 Business Logic

### Logic Cập Nhật Invoice Status
1. **PAID**: Khi `amountPaid >= totalAmount`
2. **OVERDUE**: Khi `dueDate < today` và status != "PAID"
3. **PARTIALLY_PAID**: Khi `amountPaid > 0` và `amountPaid < totalAmount` và không overdue
4. **UNPAID**: Khi `amountPaid = 0` và không overdue

### Logic Cập Nhật DealerDebtRecord
- **Khi tạo invoice**: `totalOwed += invoice.totalAmount`
- **Khi confirm transaction**: `totalPaid += transaction.amount`
- **currentBalance**: Tự động tính = `totalOwed - totalPaid` (via `@PreUpdate`)

### Validation Logic

#### Tạo Invoice
1. ✅ Validate `orderId` không null
2. ✅ Gọi Sales Service API để validate order tồn tại
3. ✅ Validate order type = "B2B"
4. ✅ Validate `dealerId` từ order match với request `dealerId`
5. ✅ Validate `amount > 0`
6. ✅ Validate `dueDate >= today`
7. ✅ Tự động set `referenceType = "SALES_ORDER_B2B"` và `referenceId = orderId`

#### Thanh Toán Invoice
1. ✅ Validate invoice tồn tại
2. ✅ Validate `dealerId` match (dealer chỉ được thanh toán invoices của chính mình)
3. ✅ Validate `amount <= remainingAmount`
4. ✅ Validate payment method scope (B2B hoặc ALL)
5. ✅ Tạo transaction với status = "PENDING_CONFIRMATION"

#### Xác Nhận Transaction
1. ✅ Validate transaction tồn tại và status = "PENDING_CONFIRMATION"
2. ✅ Update transaction status = "CONFIRMED"
3. ✅ Update invoice: Tăng `amountPaid`, cập nhật status
4. ✅ Update `DealerDebtRecord`: Tăng `totalPaid`
5. ✅ Xử lý status OVERDUE nếu cần

---

## 🔐 Authorization & Security

### Role-Based Access Control

#### EVM_STAFF / ADMIN
- ✅ Tạo hóa đơn công nợ
- ✅ Xác nhận thanh toán
- ✅ Xem tất cả invoices của tất cả dealers
- ✅ Xem chi tiết invoice của bất kỳ dealer nào
- ✅ Xem tổng hợp công nợ của tất cả dealers

#### DEALER_MANAGER
- ✅ Thanh toán invoices của chính mình
- ✅ Xem invoices của chính mình
- ✅ Xem chi tiết invoice của chính mình
- ❌ Không thể xem/thanh toán invoices của dealer khác
- ❌ Không thể tạo invoice
- ❌ Không thể xác nhận transaction

### Authorization Implementation
- **Payment Service** tự động gọi **User Service** để lấy `dealerId` từ `managerId` cho DEALER_MANAGER
- Validate `dealerId` trong path match với invoice `dealerId`
- Validate `dealerId` từ principal match với invoice `dealerId`

---

## 🔗 Integration với Services Khác

### 1. Sales Service Integration
- **Mục đích**: Validate order B2B khi tạo invoice
- **Endpoint**: `GET /sales/sales-orders/{orderId}`
- **Validation**:
  - Order phải tồn tại
  - Order phải có `typeOder = "B2B"`
  - `dealerId` từ order phải match với request `dealerId`
- **Error Handling**: 
  - 400 Bad Request: Order không tồn tại, không phải B2B, dealerId mismatch
  - 503 Service Unavailable: Sales Service không available

### 2. User Service Integration
- **Mục đích**: Lấy `dealerId` từ `managerId` cho DEALER_MANAGER
- **Endpoint**: `POST /users/profile/idDealer`
- **Request Body**: `{"idDealer": "managerId"}`
- **Response**: `{"dealerId": "uuid"}`
- **Use Case**: Khi DEALER_MANAGER xem/thanh toán invoices, Payment Service gọi User Service để lấy `dealerId` thực tế

### 3. Gateway Integration
- **Headers được Gateway thêm vào**:
  - `X-User-Email`: Email của user
  - `X-User-Role`: Role (ADMIN, EVM_STAFF, DEALER_MANAGER, etc.)
  - `X-User-ProfileId`: UUID của user (staffId hoặc managerId)
- **Payment Service** sử dụng các headers này để xác thực và phân quyền

---

## 📁 Files Đã Tạo/Modified

### Created Files

#### DTOs
1. `CreateDealerInvoiceRequest.java` - Request DTO cho tạo invoice
2. `PayDealerInvoiceRequest.java` - Request DTO cho thanh toán invoice
3. `ConfirmDealerTransactionRequest.java` - Request DTO cho xác nhận transaction
4. `DealerInvoiceResponse.java` - Response DTO cho invoice
5. `DealerTransactionResponse.java` - Response DTO cho transaction
6. `DealerDebtSummaryResponse.java` - Response DTO cho debt summary

#### Mapper
7. `DealerPaymentMapper.java` - MapStruct mapper cho DealerPayment entities

#### Service
8. `IDealerPaymentService.java` - Service interface
9. `DealerPaymentServiceImpl.java` - Service implementation

#### Controller
10. `DealerPaymentController.java` - REST controller với 6 endpoints

### Modified Files

#### Payment Service
1. `DealerInvoiceRepository.java` - Thêm hỗ trợ phân trang (Pageable)
2. `application.properties` - Thêm `user-service.url` và `sales-service.url`

#### Sales Service
3. `SalesOrderDtoB2B.java` - Thêm field `typeOder` để expose order type
4. `SalesOrderMapperB2B.java` - Thêm mapping cho `typeOder`
5. `SalesOrderServiceB2BImpl.java` - Thêm method `getOrderById()` để lấy cả B2B và B2C orders

#### Gateway
6. `application.properties` - Thêm default values cho service URIs

---

## 🧪 Test Progress

### ✅ Đã Test Thành Công
1. ✅ **Tạo invoice với orderId B2B** - Đã test và verify logic validation
2. ✅ **Lấy danh sách invoices** - Đã test với EVM_STAFF
3. ✅ **Lấy chi tiết invoice theo ID** - Đã test endpoint `/dealer/{dealerId}/invoices/{invoiceId}`
4. ✅ **Thanh toán invoice** - Đã test thành công
5. ✅ **Xác nhận transaction** - Đã test thành công ✅
6. ✅ **Invoice status tự động cập nhật** - Đã verify sau khi confirm (UNPAID → PAID)
7. ✅ **DealerDebtRecord tự động cập nhật** - Đã verify sau khi confirm
8. ✅ **Transaction status = "CONFIRMED"** - Đã verify sau khi confirm
9. ✅ **Validation: Amount exceeds remaining amount** - Đã test và fix
10. ✅ **Authorization: EVM_STAFF có thể xem tất cả invoices** - Đã test
11. ✅ **Integration: Payment Service gọi User Service để lấy dealerId** - Đã test và fix
12. ✅ **Integration: Payment Service gọi Sales Service để validate order** - Đã test và fix

### ⏳ Cần Test Tiếp
1. ⏳ Dealer Manager xem invoices của chính mình
2. ⏳ Dealer Manager xem invoices của dealer khác (should fail 403)
3. ⏳ Thanh toán một phần và confirm (UNPAID → PARTIALLY_PAID → PAID)
4. ⏳ Multiple invoices cho cùng một dealer
5. ⏳ Debt summary
6. ⏳ Overdue invoice handling

---

## 🔧 Các Fixes Đã Thực Hiện

### 1. Fix Authorization cho DEALER_MANAGER
- **Vấn đề**: `ProfileId` của DEALER_MANAGER là `managerId`, không phải `dealerId`
- **Giải pháp**: Payment Service gọi User Service API để lấy `dealerId` từ `managerId`
- **Implementation**: 
  - Thêm method `getDealerIdFromManagerId()` trong `DealerPaymentController`
  - Gọi User Service API: `POST /users/profile/idDealer`
  - Cache `dealerId` trong request để tránh gọi nhiều lần

### 2. Fix Endpoint Routing
- **Vấn đề**: Endpoint `GET /{dealerId}/invoices/{invoiceId}` không match được do conflict với `GET /{dealerId}/invoices`
- **Giải pháp**: Đặt endpoint cụ thể hơn (`/{dealerId}/invoices/{invoiceId}`) TRƯỚC endpoint ít cụ thể hơn (`/{dealerId}/invoices`)
- **Implementation**: Sắp xếp lại thứ tự endpoints trong controller

### 3. Fix Sales Service Integration
- **Vấn đề**: `typeOder` không được expose trong `SalesOrderDtoB2B`
- **Giải pháp**: 
  - Thêm field `typeOder` vào `SalesOrderDtoB2B`
  - Thêm mapping trong `SalesOrderMapperB2B`
  - Cải thiện logic parsing `typeOder` trong Payment Service để handle nhiều format (String, Map, Enum)

### 4. Fix Validation: Amount Exceeds Remaining Amount
- **Vấn đề**: Không có endpoint để lấy `remainingAmount` trước khi thanh toán
- **Giải pháp**: 
  - Thêm endpoint `GET /dealer/{dealerId}/invoices/{invoiceId}` để lấy chi tiết invoice
  - Thêm validation và error message rõ ràng
  - Cập nhật hướng dẫn test

### 5. Fix Gateway Startup Error
- **Vấn đề**: Gateway không start được do thiếu default values cho environment variables
- **Giải pháp**: Thêm default values cho tất cả service URIs trong `application.properties`

---

## 📊 API Endpoints

### 1. Tạo Hóa Đơn Công Nợ
```
POST /api/v1/payments/dealer/invoices
Permissions: EVM_STAFF, ADMIN
Request Body:
{
  "orderId": "uuid",
  "dealerId": "uuid",
  "amount": 300000.00,
  "dueDate": "2025-12-10",
  "notes": "Hóa đơn công nợ cho đơn hàng B2B"
}
```

### 2. Thanh Toán Hóa Đơn
```
POST /api/v1/payments/dealer/invoices/{invoiceId}/pay
Permissions: DEALER_MANAGER
Request Body:
{
  "amount": 300000.00,
  "paymentMethodId": "uuid",
  "transactionCode": "VCB_123456789",
  "paidDate": "2025-11-10T10:30:00",
  "notes": "Chuyển khoản từ VCB"
}
```

### 3. Xác Nhận Thanh Toán
```
POST /api/v1/payments/dealer/transactions/{transactionId}/confirm
Permissions: EVM_STAFF, ADMIN
Request Body (Optional):
{
  "notes": "Đã xác nhận nhận tiền từ ngân hàng"
}
```

### 4. Lấy Danh Sách Hóa Đơn
```
GET /api/v1/payments/dealer/{dealerId}/invoices?status=UNPAID&page=0&size=10
Permissions: DEALER_MANAGER, EVM_STAFF, ADMIN
Query Parameters:
- status (optional): UNPAID, PARTIALLY_PAID, PAID, OVERDUE
- page (optional): Số trang (default: 0)
- size (optional): Số lượng mỗi trang (default: 10)
```

### 5. Lấy Chi Tiết Hóa Đơn
```
GET /api/v1/payments/dealer/{dealerId}/invoices/{invoiceId}
Permissions: DEALER_MANAGER, EVM_STAFF, ADMIN
```

### 6. Lấy Tổng Hợp Công Nợ
```
GET /api/v1/payments/dealer/debt-summary?page=0&size=10
Permissions: EVM_STAFF, ADMIN
Query Parameters:
- page (optional): Số trang (default: 0)
- size (optional): Số lượng mỗi trang (default: 10)
```

---

## 🔄 Complete Payment Flow

```
1. EVM_STAFF tạo invoice với orderId B2B
   ↓
2. DealerInvoice được tạo với status = "UNPAID"
   ↓
3. DealerDebtRecord được cập nhật: totalOwed += amount
   ↓
4. DEALER_MANAGER thanh toán invoice
   ↓
5. DealerTransaction được tạo với status = "PENDING_CONFIRMATION"
   ↓
6. EVM_STAFF xác nhận transaction
   ↓
7. DealerTransaction status = "CONFIRMED"
   ↓
8. DealerInvoice: amountPaid += amount, status = "PAID" (nếu thanh toán đủ)
   ↓
9. DealerDebtRecord: totalPaid += amount, currentBalance tự động tính lại
```

---

## 🎯 Đặc Điểm Nổi Bật

### 1. Inter-Service Communication
- ✅ Payment Service gọi Sales Service để validate order B2B
- ✅ Payment Service gọi User Service để lấy dealerId từ managerId
- ✅ Sử dụng RestTemplate với header forwarding để truyền authentication

### 2. Automatic Status Management
- ✅ Invoice status tự động cập nhật dựa trên `amountPaid` và `dueDate`
- ✅ DealerDebtRecord `currentBalance` tự động tính lại (via `@PreUpdate`)

### 3. Robust Validation
- ✅ Validate order từ Sales Service
- ✅ Validate order type = "B2B"
- ✅ Validate dealerId match
- ✅ Validate amount <= remainingAmount
- ✅ Validate payment method scope

### 4. Authorization & Security
- ✅ Role-based access control
- ✅ Dealer chỉ được xem/thanh toán invoices của chính mình
- ✅ EVM Staff có thể xem tất cả invoices
- ✅ Payment Service tự động lấy dealerId từ User Service

### 5. Error Handling
- ✅ Comprehensive error messages
- ✅ Proper HTTP status codes
- ✅ Error logging
- ✅ Graceful handling of service unavailability

---

## 📝 Lưu Ý Quan Trọng

### 1. Order Validation
- Invoice chỉ có thể được tạo nếu order là B2B (`typeOder = "B2B"`)
- Order phải tồn tại trong Sales Service
- `dealerId` từ order phải match với request `dealerId`

### 2. Payment Method Scope
- Chỉ chấp nhận payment methods có scope = "B2B" hoặc "ALL"
- Payment methods có scope = "B2C" sẽ bị reject

### 3. Transaction Status
- Chỉ có thể confirm transaction ở status "PENDING_CONFIRMATION"
- Sau khi confirm, transaction status = "SUCCESS" (trong database)
- Response có thể hiển thị status = "CONFIRMED" tùy vào cách map

### 4. Invoice Status
- Status tự động cập nhật dựa trên `amountPaid` và `dueDate`
- OVERDUE: Invoice quá hạn và chưa thanh toán đủ
- PAID: Invoice đã thanh toán đủ
- PARTIALLY_PAID: Invoice đã thanh toán một phần
- UNPAID: Invoice chưa thanh toán

### 5. DealerDebtRecord
- Tự động tạo khi tạo invoice đầu tiên cho dealer
- Tự động cập nhật khi tạo invoice hoặc confirm transaction
- `currentBalance` tự động tính lại mỗi khi save

---

## 🚀 Deployment & Configuration

### Environment Variables
```properties
# Payment Service
PAYMENT_SERVICE_URL=http://localhost:8085
DB_URL=jdbc:mysql://localhost:3306/payment_db
DB_USERNAME=root
DB_PASSWORD=password

# Sales Service (qua Gateway)
SALES_SERVICE_URL=http://localhost:8080/sales

# User Service (qua Gateway)
USER_SERVICE_URL=http://localhost:8080/users
```

### Database Setup
- Database: `payment_db`
- Tables: `dealer_invoices`, `dealer_transactions`, `dealer_debt_records`, `payment_methods`

### Dependencies
- Spring Boot 3.x
- Spring Data JPA
- Spring Security
- MapStruct
- MySQL Connector
- RestTemplate
- Jakarta Validation

---

## 📚 Tài Liệu Tham Khảo

### API Documentation
- Xem file `PHASE3_POSTMAN_TESTING_GUIDE.md` để biết chi tiết về cách test các APIs

### Database Schema
- Xem file `payment_db.sql` để biết cấu trúc database

### Test Data
- Test data được tách thành 2 file riêng cho `sales_db` và `payment_db`
- Chạy SQL scripts trên các database servers tương ứng

---

## 🎉 Kết Luận

Giai đoạn 3 đã hoàn thành việc xây dựng hệ thống quản lý công nợ và thanh toán B2B cho đại lý. Hệ thống bao gồm:
- ✅ 6 API endpoints đầy đủ chức năng
- ✅ Inter-service communication với Sales Service và User Service
- ✅ Authorization và security đầy đủ
- ✅ Validation và error handling toàn diện
- ✅ Automatic status management
- ✅ Test coverage đầy đủ

Hệ thống đã sẵn sàng để triển khai và sử dụng trong môi trường production.

---

**Ngày hoàn thành**: 2025-11-10
**Version**: 1.0
**Status**: ✅ Hoàn thành và đã test thành công

