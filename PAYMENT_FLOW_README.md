# 📋 HỆ THỐNG QUẢN LÝ THANH TOÁN - TÀI LIỆU KỸ THUẬT

## 📑 MỤC LỤC
1. [Danh Sách File Liên Quan](#danh-sách-file-liên-quan)
2. [Danh Sách Bảng Database](#danh-sách-bảng-database)
3. [Luồng Hoạt Động Chi Tiết](#luồng-hoạt-động-chi-tiết)
4. [Ví Dụ Thực Tế](#ví-dụ-thực-tế)

---

## 📁 DANH SÁCH FILE LIÊN QUAN

### 🔹 Backend - Payment Service

#### ⭐ **File Quan Trọng (Core Logic)**

**Service Implementation:**
- ⭐ `services/payment-service/src/main/java/com/ev/payment_service/service/Implementation/DealerPaymentServiceImpl.java`
  - Xử lý logic thanh toán B2B (tạo hóa đơn, thanh toán, xác nhận)
  - Quản lý công nợ đại lý
  - Cập nhật DealerInvoice, DealerTransaction, DealerDebtRecord

- ⭐ `services/payment-service/src/main/java/com/ev/payment_service/service/Implementation/CustomerPaymentServiceImpl.java`
  - Xử lý logic thanh toán B2C (khởi tạo, xác nhận thủ công)
  - Quản lý PaymentRecord và Transaction cho B2C orders
  - Cập nhật payment status trong Sales Service

**Controller:**
- ⭐ `services/payment-service/src/main/java/com/ev/payment_service/controller/DealerPaymentController.java`
  - REST API endpoints cho B2B payment flow
  - `/api/v1/payments/dealer/invoices` - Tạo hóa đơn
  - `/api/v1/payments/dealer/invoices/{invoiceId}/pay` - Thanh toán
  - `/api/v1/payments/dealer/transactions/{transactionId}/confirm` - Xác nhận

- ⭐ `services/payment-service/src/main/java/com/ev/payment_service/controller/CustomerPaymentController.java`
  - REST API endpoints cho B2C payment flow
  - `/api/v1/payments/customer/orders/{orderId}/pay` - Khởi tạo thanh toán
  - `/api/v1/payments/customer/transactions/{transactionId}/confirm` - Xác nhận thủ công
  - `/api/v1/payments/customer/orders/{orderId}/history` - Lịch sử thanh toán

**Entity (Database Models):**
- ⭐ `services/payment-service/src/main/java/com/ev/payment_service/entity/DealerInvoice.java`
  - Bảng: `dealer_invoices`
  - Lưu thông tin hóa đơn công nợ của đại lý

- ⭐ `services/payment-service/src/main/java/com/ev/payment_service/entity/DealerTransaction.java`
  - Bảng: `dealer_transactions`
  - Lưu lịch sử giao dịch thanh toán của đại lý

- ⭐ `services/payment-service/src/main/java/com/ev/payment_service/entity/DealerDebtRecord.java`
  - Bảng: `dealer_debt_records`
  - Tổng hợp công nợ của từng đại lý

- ⭐ `services/payment-service/src/main/java/com/ev/payment_service/entity/PaymentRecord.java`
  - Bảng: `payment_records`
  - Sổ thanh toán cho B2C orders

- ⭐ `services/payment-service/src/main/java/com/ev/payment_service/entity/Transaction.java`
  - Bảng: `transactions`
  - Lịch sử giao dịch thanh toán B2C

**Repository:**
- `services/payment-service/src/main/java/com/ev/payment_service/repository/DealerInvoiceRepository.java`
- `services/payment-service/src/main/java/com/ev/payment_service/repository/DealerTransactionRepository.java`
- `services/payment-service/src/main/java/com/ev/payment_service/repository/DealerDebtRecordRepository.java`
- `services/payment-service/src/main/java/com/ev/payment_service/repository/PaymentRecordRepository.java`
- `services/payment-service/src/main/java/com/ev/payment_service/repository/TransactionRepository.java`

**Interface:**
- `services/payment-service/src/main/java/com/ev/payment_service/service/Interface/IDealerPaymentService.java`
- `services/payment-service/src/main/java/com/ev/payment_service/service/Interface/ICustomerPaymentService.java`

**Mapper:**
- `services/payment-service/src/main/java/com/ev/payment_service/mapper/DealerPaymentMapper.java`
- `services/payment-service/src/main/java/com/ev/payment_service/mapper/TransactionMapper.java`

**Config:**
- `services/payment-service/src/main/java/com/ev/payment_service/config/SecurityConfig.java`

---

### 🔹 Backend - Sales Service

**Controller:**
- ⭐ `services/sales-service/src/main/java/com/ev/sales_service/controller/SalesOrderControllerB2B.java`
  - Endpoint: `PUT /sales-orders/{orderId}/payment-status?status={status}`
  - Cập nhật payment status của order (B2B và B2C)

**Service:**
- ⭐ `services/sales-service/src/main/java/com/ev/sales_service/service/Implementation/SalesOrderServiceB2BImpl.java`
  - Method: `updatePaymentStatus(UUID orderId, PaymentStatus paymentStatus)`
  - Cập nhật payment status trong bảng `sales_orders`

**Entity:**
- ⭐ `services/sales-service/src/main/java/com/ev/sales_service/entity/SalesOrder.java`
  - Bảng: `sales_orders`
  - Chứa trường `paymentStatus` (NONE, UNPAID, PARTIALLY_PAID, PAID)

**DTO:**
- `services/sales-service/src/main/java/com/ev/sales_service/dto/response/SalesOrderDtoB2B.java`
- `services/sales-service/src/main/java/com/ev/sales_service/dto/response/SalesOrderB2CResponse.java`

**Enum:**
- `services/sales-service/src/main/java/com/ev/sales_service/enums/PaymentStatus.java`

---

### 🔹 Frontend

**Pages:**
- ⭐ `frontend/my-app/src/features/payments/pages/B2BOrdersManagementPage.jsx`
  - Trang quản lý đơn hàng B2B (EVM Staff)
  - Hiển thị danh sách orders, tạo hóa đơn

- ⭐ `frontend/my-app/src/features/payments/pages/CreateInvoiceFromOrderPage.jsx`
  - Form tạo hóa đơn từ order (EVM Staff)

- ⭐ `frontend/my-app/src/features/payments/pages/DealerInvoicesPage.jsx`
  - Danh sách hóa đơn của đại lý (Dealer Manager)

- ⭐ `frontend/my-app/src/features/payments/pages/PayInvoicePage.jsx`
  - Form thanh toán hóa đơn (Dealer Manager)

- ⭐ `frontend/my-app/src/features/payments/pages/DealerPaymentPage.jsx`
  - Chi tiết hóa đơn và lịch sử thanh toán (Dealer Manager)

- ⭐ `frontend/my-app/src/features/payments/pages/CashPaymentsManagementPage.jsx`
  - Duyệt thanh toán tiền mặt B2B (EVM Staff)

- ⭐ `frontend/my-app/src/features/payments/pages/B2COrdersListPage.jsx`
  - Danh sách đơn hàng B2C (Dealer Staff)

- ⭐ `frontend/my-app/src/features/payments/pages/PayB2COrderPage.jsx`
  - Form thanh toán đơn hàng B2C (Dealer Staff)

- ⭐ `frontend/my-app/src/features/payments/pages/B2COrderDetailPage.jsx`
  - Chi tiết đơn hàng B2C và lịch sử thanh toán

- ⭐ `frontend/my-app/src/features/payments/pages/B2CCashPaymentsManagementPage.jsx`
  - Duyệt thanh toán tiền mặt B2C (Dealer Manager)

- ⭐ `frontend/my-app/src/features/payments/pages/B2CDebtManagementPage.jsx`
  - Quản lý công nợ B2C (Dealer Manager)

**Services:**
- ⭐ `frontend/my-app/src/features/payments/services/paymentService.js`
  - Tất cả API calls cho Payment Service

**Components:**
- `frontend/my-app/src/features/payments/components/DealerInvoiceList.jsx`
- `frontend/my-app/src/features/payments/components/DealerInvoiceCard.jsx`
- `frontend/my-app/src/features/payments/components/DealerInvoiceDetail.jsx`
- `frontend/my-app/src/features/payments/components/DealerTransactionHistory.jsx`
- `frontend/my-app/src/features/payments/components/PaymentHistory.jsx`
- `frontend/my-app/src/features/payments/components/PaymentForm.jsx`
- `frontend/my-app/src/features/payments/components/PayInvoiceForm.jsx`

**Routes:**
- ⭐ `frontend/my-app/src/routes/index.jsx`
  - Định nghĩa tất cả routes cho payment pages

**Menu Items:**
- `frontend/my-app/src/layouts/evmLayout/data/menuItems.jsx`
- `frontend/my-app/src/layouts/dealerLayout/data/menuItems.jsx`

---

## 🗄️ DANH SÁCH BẢNG DATABASE

### 🔹 Payment Service Database

#### ⭐ **Bảng Quan Trọng**

**⭐ `dealer_invoices`**
- **Mô tả:** Lưu thông tin hóa đơn công nợ của đại lý
- **Các trường chính:**
  - `dealer_invoice_id` (PK, UUID)
  - `dealer_id` (FK → dealers.dealer_id)
  - `total_amount` - Tổng tiền hóa đơn
  - `amount_paid` - Số tiền đã thanh toán
  - `status` - UNPAID, PARTIALLY_PAID, PAID, OVERDUE
  - `reference_type` - Loại tham chiếu (SALES_ORDER_B2B)
  - `reference_id` - ID đơn hàng B2B
  - `due_date` - Hạn thanh toán

**⭐ `dealer_transactions`**
- **Mô tả:** Lưu lịch sử giao dịch thanh toán của đại lý
- **Các trường chính:**
  - `dealer_transaction_id` (PK, UUID)
  - `dealer_invoice_id` (FK → dealer_invoices)
  - `amount` - Số tiền giao dịch
  - `status` - PENDING_CONFIRMATION, SUCCESS, FAILED
  - `payment_method_id` (FK → payment_methods)
  - `transaction_code` - Mã giao dịch ngân hàng
  - `confirmed_by_staff_id` - ID EVM Staff duyệt
  - `notes` - Ghi chú

**⭐ `dealer_debt_records`**
- **Mô tả:** Tổng hợp công nợ của từng đại lý
- **Các trường chính:**
  - `dealer_id` (PK, UUID)
  - `total_owed` - Tổng nợ
  - `total_paid` - Tổng đã trả
  - `current_balance` - Dư nợ hiện tại (tự động tính)

**⭐ `payment_records`**
- **Mô tả:** Sổ thanh toán cho B2C orders
- **Các trường chính:**
  - `record_id` (PK, UUID)
  - `order_id` (FK → sales_orders.order_id, unique)
  - `customer_id` (FK → customers.customer_id)
  - `total_amount` - Tổng giá trị đơn hàng
  - `amount_paid` - Số tiền đã thanh toán
  - `remaining_amount` - Số tiền còn lại
  - `status` - PENDING, PARTIALLY_PAID, PAID, OVERDUE

**⭐ `transactions`**
- **Mô tả:** Lịch sử giao dịch thanh toán B2C
- **Các trường chính:**
  - `transaction_id` (PK, UUID)
  - `record_id` (FK → payment_records)
  - `payment_method_id` (FK → payment_methods)
  - `amount` - Số tiền giao dịch
  - `status` - PENDING, SUCCESS, FAILED
  - `gateway_transaction_id` - Mã giao dịch VNPAY
  - `notes` - Ghi chú

**Bảng Khác:**
- `payment_methods` - Phương thức thanh toán
- `payment_plans` - Kế hoạch trả góp
- `installment_schedules` - Lịch trả góp

---

### 🔹 Sales Service Database

**⭐ `sales_orders`**
- **Mô tả:** Bảng đơn hàng (B2B và B2C)
- **Trường liên quan:**
  - `order_id` (PK, UUID)
  - `dealer_id` (FK → dealers.dealer_id)
  - `customer_id` (FK → customers.customer_id) - null nếu B2B
  - `type_oder` - B2B hoặc B2C
  - `total_amount` - Tổng tiền đơn hàng
  - ⭐ `payment_status` - NONE, UNPAID, PARTIALLY_PAID, PAID (mới thêm)
  - `order_status` - Trạng thái đơn hàng

---

## 🔄 LUỒNG HOẠT ĐỘNG CHI TIẾT

### 📌 **LUỒNG 1: TẠO HÓA ĐƠN CÔNG NỢ B2B (EVM Staff)**

#### **Mô Tả:**
EVM Staff tạo hóa đơn công nợ cho đại lý dựa trên đơn hàng B2B đã giao.

#### **Luồng Code:**

1. **Frontend:** `B2BOrdersManagementPage.jsx`
   - EVM Staff chọn đơn hàng B2B có status = "DELIVERED"
   - Click "Lập hóa đơn" → Navigate đến `CreateInvoiceFromOrderPage.jsx`

2. **Frontend:** `CreateInvoiceFromOrderPage.jsx`
   - Form nhập: `dueDate`, `notes` (optional)
   - Gọi API: `paymentService.createDealerInvoice({ orderId, dealerId, totalAmount, dueDate, notes })`

3. **Backend:** `DealerPaymentController.createDealerInvoice()`
   - Endpoint: `POST /api/v1/payments/dealer/invoices`
   - Validate request → Gọi `DealerPaymentServiceImpl.createDealerInvoice()`

4. **Backend:** `DealerPaymentServiceImpl.createDealerInvoice()`
   ```
   a. Gọi Sales Service API để lấy thông tin order:
      GET /sales-orders/{orderId}
      → Lấy: dealerId, totalAmount, typeOder
   
   b. Validate:
      - Order phải là B2B (typeOder = "B2B")
      - Order phải tồn tại
      - dealerId phải match
   
   c. Tạo DealerInvoice:
      - dealerId = từ order
      - totalAmount = từ order
      - amountPaid = 0
      - status = "UNPAID"
      - referenceType = "SALES_ORDER_B2B"
      - referenceId = orderId
      → INSERT vào bảng dealer_invoices
   
   d. Cập nhật DealerDebtRecord:
      - Tìm hoặc tạo record cho dealerId
      - totalOwed += totalAmount
      - currentBalance = totalOwed - totalPaid (tự động tính)
      → UPDATE bảng dealer_debt_records
   
   e. Gọi Sales Service để cập nhật payment status:
      PUT /sales-orders/{orderId}/payment-status?status=UNPAID
      → UPDATE sales_orders.payment_status = "UNPAID"
   ```

5. **Response:** Trả về `DealerInvoiceResponse` → Frontend hiển thị success và redirect

#### **Dữ Liệu Database:**

**INSERT vào `dealer_invoices`:**
```sql
INSERT INTO dealer_invoices (
    dealer_invoice_id, dealer_id, created_by_staff_id,
    total_amount, amount_paid, due_date, status,
    reference_type, reference_id, created_at
) VALUES (
    UUID(), dealerId, staffId,
    totalAmount, 0, dueDate, 'UNPAID',
    'SALES_ORDER_B2B', orderId, NOW()
);
```

**UPDATE `dealer_debt_records`:**
```sql
UPDATE dealer_debt_records
SET total_owed = total_owed + totalAmount,
    current_balance = total_owed - total_paid,
    last_updated = NOW()
WHERE dealer_id = dealerId;
```

**UPDATE `sales_orders`:**
```sql
UPDATE sales_orders
SET payment_status = 'UNPAID'
WHERE order_id = orderId;
```

---

### 📌 **LUỒNG 2: THANH TOÁN HÓA ĐƠN B2B (Dealer Manager)**

#### **Mô Tả:**
Dealer Manager thanh toán hóa đơn (toàn bộ hoặc một phần) bằng VNPAY hoặc tiền mặt.

#### **Luồng Code:**

1. **Frontend:** `DealerInvoicesPage.jsx`
   - Hiển thị danh sách hóa đơn của đại lý
   - Click "Thanh Toán" → Navigate đến `PayInvoicePage.jsx`

2. **Frontend:** `PayInvoicePage.jsx`
   - Load invoice details và payment methods
   - Form nhập: `amount`, `paymentMethodId`, `transactionCode` (nếu VNPAY), `notes`
   - Gọi API: `paymentService.payDealerInvoice(invoiceId, { amount, paymentMethodId, transactionCode, notes })`

3. **Backend:** `DealerPaymentController.payDealerInvoice()`
   - Endpoint: `POST /api/v1/payments/dealer/invoices/{invoiceId}/pay`
   - Validate dealerId từ JWT → Gọi `DealerPaymentServiceImpl.payDealerInvoice()`

4. **Backend:** `DealerPaymentServiceImpl.payDealerInvoice()`
   ```
   a. Validate invoice:
      - Invoice tồn tại
      - Invoice thuộc về dealer (dealerId match)
      - amount ≤ remainingAmount
   
   b. Validate payment method:
      - Payment method tồn tại
      - Scope phải là "B2B" hoặc "ALL"
   
   c. Xác định transaction status:
      - Nếu methodType = "GATEWAY" (VNPAY):
        → transactionStatus = "SUCCESS" (tự động confirm)
      - Nếu methodType = "MANUAL" (Tiền mặt):
        → transactionStatus = "PENDING_CONFIRMATION" (chờ EVM Staff duyệt)
   
   d. Tạo DealerTransaction:
      - dealerInvoiceId = invoiceId
      - amount = từ request
      - status = transactionStatus
      - paymentMethodId = từ request
      - transactionCode = từ request (nếu có)
      - notes = từ request
      → INSERT vào bảng dealer_transactions
   
   e. Nếu transactionStatus = "SUCCESS" (VNPAY):
      - Cập nhật invoice: amountPaid += amount
      - Cập nhật invoice status: PAID hoặc PARTIALLY_PAID
      - Cập nhật DealerDebtRecord: totalPaid += amount
      → UPDATE dealer_invoices, dealer_debt_records
   
   f. Nếu transactionStatus = "PENDING_CONFIRMATION" (Tiền mặt):
      - Chưa cập nhật gì, chờ EVM Staff duyệt
   ```

5. **Response:** 
   - Nếu VNPAY: Trả về payment URL để redirect
   - Nếu Tiền mặt: Trả về message "Chờ duyệt"

#### **Dữ Liệu Database:**

**INSERT vào `dealer_transactions`:**
```sql
INSERT INTO dealer_transactions (
    dealer_transaction_id, dealer_invoice_id, amount,
    transaction_date, method_id, transaction_code,
    status, notes
) VALUES (
    UUID(), invoiceId, amount,
    NOW(), paymentMethodId, transactionCode,
    'SUCCESS' hoặc 'PENDING_CONFIRMATION', notes
);
```

**Nếu VNPAY (SUCCESS):**
```sql
-- UPDATE dealer_invoices
UPDATE dealer_invoices
SET amount_paid = amount_paid + amount,
    status = CASE
        WHEN amount_paid + amount >= total_amount THEN 'PAID'
        ELSE 'PARTIALLY_PAID'
    END
WHERE dealer_invoice_id = invoiceId;

-- UPDATE dealer_debt_records
UPDATE dealer_debt_records
SET total_paid = total_paid + amount,
    current_balance = total_owed - total_paid,
    last_updated = NOW()
WHERE dealer_id = dealerId;
```

---

### 📌 **LUỒNG 3: XÁC NHẬN THANH TOÁN TIỀN MẶT B2B (EVM Staff)**

#### **Mô Tả:**
EVM Staff duyệt thanh toán tiền mặt từ đại lý, cập nhật công nợ và lịch sử thanh toán.

#### **Luồng Code:**

1. **Frontend:** `CashPaymentsManagementPage.jsx`
   - Hiển thị danh sách transactions có status = "PENDING_CONFIRMATION"
   - Click "Duyệt" → Mở modal xác nhận
   - Nhập notes (optional) → Gọi API: `paymentService.confirmDealerTransaction(transactionId, { notes })`

2. **Backend:** `DealerPaymentController.confirmDealerTransaction()`
   - Endpoint: `POST /api/v1/payments/dealer/transactions/{transactionId}/confirm`
   - Gọi `DealerPaymentServiceImpl.confirmDealerTransaction()`

3. **Backend:** `DealerPaymentServiceImpl.confirmDealerTransaction()`
   ```
   a. Validate transaction:
      - Transaction tồn tại
      - Status = "PENDING_CONFIRMATION"
   
   b. Cập nhật transaction:
      - status = "SUCCESS"
      - confirmedByStaffId = staffId
      - notes = từ request (nếu có)
      → UPDATE dealer_transactions
   
   c. Cập nhật invoice:
      - amountPaid += transaction.amount
      - status = "PAID" nếu amountPaid >= totalAmount
      - status = "PARTIALLY_PAID" nếu amountPaid > 0 và < totalAmount
      - status = "OVERDUE" nếu dueDate < today và chưa trả hết
      → UPDATE dealer_invoices
   
   d. Cập nhật DealerDebtRecord:
      - totalPaid += transaction.amount
      - currentBalance = totalOwed - totalPaid (tự động tính)
      → UPDATE dealer_debt_records
   ```

4. **Response:** Trả về `DealerTransactionResponse` → Frontend hiển thị success và reload

#### **Dữ Liệu Database:**

**UPDATE `dealer_transactions`:**
```sql
UPDATE dealer_transactions
SET status = 'SUCCESS',
    confirmed_by_staff_id = staffId,
    notes = notes
WHERE dealer_transaction_id = transactionId;
```

**UPDATE `dealer_invoices`:**
```sql
UPDATE dealer_invoices
SET amount_paid = amount_paid + transaction.amount,
    status = CASE
        WHEN amount_paid + transaction.amount >= total_amount THEN 'PAID'
        WHEN due_date < CURDATE() THEN 'OVERDUE'
        ELSE 'PARTIALLY_PAID'
    END
WHERE dealer_invoice_id = invoiceId;
```

**UPDATE `dealer_debt_records`:**
```sql
UPDATE dealer_debt_records
SET total_paid = total_paid + transaction.amount,
    current_balance = total_owed - total_paid,
    last_updated = NOW()
WHERE dealer_id = dealerId;
```

---

### 📌 **LUỒNG 4: THANH TOÁN ĐƠN HÀNG B2C (Dealer Staff)**

#### **Mô Tả:**
Dealer Staff thanh toán đơn hàng B2C bằng VNPAY hoặc tiền mặt.

#### **Luồng Code:**

1. **Frontend:** `B2COrdersListPage.jsx`
   - Hiển thị danh sách B2C orders của đại lý
   - Click "Thanh Toán" → Navigate đến `PayB2COrderPage.jsx`

2. **Frontend:** `PayB2COrderPage.jsx`
   - Form nhập: `amount`, `paymentMethodId`, `transactionCode` (nếu VNPAY), `notes`
   - Gọi API: `paymentService.initiatePayment(orderId, { amount, paymentMethodId, transactionCode, notes })`

3. **Backend:** `CustomerPaymentController.initiatePayment()`
   - Endpoint: `POST /api/v1/payments/customer/orders/{orderId}/pay`
   - Gọi `CustomerPaymentServiceImpl.initiatePayment()`

4. **Backend:** `CustomerPaymentServiceImpl.initiatePayment()`
   ```
   a. Gọi Sales Service để lấy order:
      GET /sales-orders/{orderId}
      → Lấy: totalAmount, customerId, dealerId
   
   b. Tìm hoặc tạo PaymentRecord:
      - Tìm theo orderId
      - Nếu không có, tạo mới với:
        * orderId = orderId
        * customerId = từ order
        * totalAmount = từ order
        * amountPaid = 0
        * status = "PENDING"
        → INSERT vào payment_records
   
   c. Validate amount:
      - amount ≤ remainingAmount
   
   d. Validate payment method:
      - Method tồn tại và active
   
   e. Xác định transaction status:
      - Nếu methodType = "GATEWAY" (VNPAY):
        → status = "PENDING" (chờ callback từ VNPAY)
        → Tạo payment URL và redirect
      - Nếu methodType = "MANUAL" (Tiền mặt):
        → status = "PENDING" (chờ Dealer Manager duyệt)
   
   f. Tạo Transaction:
      - recordId = PaymentRecord.recordId
      - amount = từ request
      - status = "PENDING"
      - paymentMethodId = từ request
      - notes = từ request
      → INSERT vào transactions
   
   g. Nếu VNPAY:
      - Trả về payment URL để redirect
   ```

5. **Response:**
   - Nếu VNPAY: Redirect đến payment URL
   - Nếu Tiền mặt: Message "Chờ Dealer Manager duyệt"

#### **Dữ Liệu Database:**

**INSERT/UPDATE `payment_records`:**
```sql
-- Nếu chưa có, INSERT
INSERT INTO payment_records (
    record_id, order_id, customer_id,
    total_amount, amount_paid, remaining_amount, status
) VALUES (
    UUID(), orderId, customerId,
    totalAmount, 0, totalAmount, 'PENDING'
);

-- Nếu đã có, không cần UPDATE (chưa thanh toán)
```

**INSERT vào `transactions`:**
```sql
INSERT INTO transactions (
    transaction_id, record_id, method_id,
    amount, transaction_date, status, notes
) VALUES (
    UUID(), recordId, paymentMethodId,
    amount, NOW(), 'PENDING', notes
);
```

---

### 📌 **LUỒNG 5: XÁC NHẬN THANH TOÁN TIỀN MẶT B2C (Dealer Manager)**

#### **Mô Tả:**
Dealer Manager duyệt thanh toán tiền mặt B2C từ Dealer Staff, cập nhật payment status và lịch sử.

#### **Luồng Code:**

1. **Frontend:** `B2CCashPaymentsManagementPage.jsx`
   - Hiển thị danh sách transactions B2C có status = "PENDING"
   - Click "Duyệt" → Mở modal xác nhận
   - Nhập notes (optional) → Gọi API: `paymentService.confirmManualPayment(transactionId, { notes })`

2. **Backend:** `CustomerPaymentController.confirmManualPayment()`
   - Endpoint: `POST /api/v1/payments/customer/transactions/{transactionId}/confirm`
   - Gọi `CustomerPaymentServiceImpl.confirmManualPayment()`

3. **Backend:** `CustomerPaymentServiceImpl.confirmManualPayment()`
   ```
   a. Validate transaction:
      - Transaction tồn tại
      - Status = "PENDING"
      - PaymentMethod.methodType = "MANUAL"
      - PaymentRecord.status ≠ "PAID"
   
   b. Cập nhật transaction:
      - status = "SUCCESS"
      - notes = từ request (nếu có)
      → UPDATE transactions
   
   c. Cập nhật PaymentRecord:
      - amountPaid += transaction.amount
      - remainingAmount = totalAmount - amountPaid (tự động tính)
      - status = "PAID" nếu amountPaid >= totalAmount
      - status = "PARTIALLY_PAID" nếu amountPaid > 0 và < totalAmount
      → UPDATE payment_records
   
   d. Gọi Sales Service để cập nhật payment status:
      PUT /sales-orders/{orderId}/payment-status?status={PAID|PARTIALLY_PAID|UNPAID}
      → UPDATE sales_orders.payment_status
   ```

4. **Response:** Trả về `TransactionResponse` → Frontend hiển thị success và reload

#### **Dữ Liệu Database:**

**UPDATE `transactions`:**
```sql
UPDATE transactions
SET status = 'SUCCESS',
    notes = notes
WHERE transaction_id = transactionId;
```

**UPDATE `payment_records`:**
```sql
UPDATE payment_records
SET amount_paid = amount_paid + transaction.amount,
    remaining_amount = total_amount - amount_paid,
    status = CASE
        WHEN amount_paid + transaction.amount >= total_amount THEN 'PAID'
        ELSE 'PARTIALLY_PAID'
    END
WHERE record_id = recordId;
```

**UPDATE `sales_orders`:**
```sql
UPDATE sales_orders
SET payment_status = CASE
    WHEN amountPaid >= totalAmount THEN 'PAID'
    WHEN amountPaid > 0 THEN 'PARTIALLY_PAID'
    ELSE 'UNPAID'
END
WHERE order_id = orderId;
```

---

## 💡 VÍ DỤ THỰC TẾ

### **Ví Dụ 1: Tạo Hóa Đơn B2B**

**Tình huống:**
- EVM Staff tạo hóa đơn cho đơn hàng B2B #75c41df2
- Tổng tiền: 320.000 ₫
- Hạn thanh toán: 30/11/2025

**Luồng dữ liệu:**
```
1. Frontend gọi: POST /api/v1/payments/dealer/invoices
   Body: { orderId: "75c41df2-...", dealerId: "6c8c229d-...", totalAmount: 320000, dueDate: "2025-11-30" }

2. Backend gọi Sales Service: GET /sales-orders/75c41df2-...
   → Lấy: { dealerId: "6c8c229d-...", totalAmount: 320000, typeOder: "B2B" }

3. INSERT vào dealer_invoices:
   - dealer_invoice_id: "abc123..."
   - dealer_id: "6c8c229d-..."
   - total_amount: 320000
   - amount_paid: 0
   - status: "UNPAID"

4. UPDATE dealer_debt_records:
   - dealer_id: "6c8c229d-..."
   - total_owed: 320000 (tăng thêm)
   - current_balance: 320000

5. UPDATE sales_orders:
   - order_id: "75c41df2-..."
   - payment_status: "UNPAID"
```

---

### **Ví Dụ 2: Thanh Toán Hóa Đơn B2B (Tiền Mặt)**

**Tình huống:**
- Dealer Manager thanh toán 200.000 ₫ cho hóa đơn 320.000 ₫ bằng tiền mặt
- Chờ EVM Staff duyệt

**Luồng dữ liệu:**
```
1. Frontend gọi: POST /api/v1/payments/dealer/invoices/{invoiceId}/pay
   Body: { amount: 200000, paymentMethodId: "manual-id", notes: "Thanh toán đợt 1" }

2. INSERT vào dealer_transactions:
   - dealer_transaction_id: "xyz789..."
   - dealer_invoice_id: "abc123..."
   - amount: 200000
   - status: "PENDING_CONFIRMATION"
   - method_id: "manual-id"
   - notes: "Thanh toán đợt 1"

3. (Chưa cập nhật invoice và debt - chờ duyệt)

4. EVM Staff duyệt:
   POST /api/v1/payments/dealer/transactions/xyz789.../confirm
   Body: { notes: "Đã xác nhận nhận tiền" }

5. UPDATE dealer_transactions:
   - status: "SUCCESS"
   - confirmed_by_staff_id: "staff-id"
   - notes: "Đã xác nhận nhận tiền"

6. UPDATE dealer_invoices:
   - amount_paid: 200000
   - status: "PARTIALLY_PAID"

7. UPDATE dealer_debt_records:
   - total_paid: 200000 (tăng thêm)
   - current_balance: 120000 (giảm)
```

---

### **Ví Dụ 3: Thanh Toán B2C (Tiền Mặt)**

**Tình huống:**
- Dealer Staff thanh toán 30.000 ₫ cho đơn hàng B2C 47.000 ₫ bằng tiền mặt
- Chờ Dealer Manager duyệt

**Luồng dữ liệu:**
```
1. Frontend gọi: POST /api/v1/payments/customer/orders/{orderId}/pay
   Body: { amount: 30000, paymentMethodId: "manual-id", notes: "Thanh toán đợt 1" }

2. Tìm hoặc tạo PaymentRecord:
   - record_id: "rec123..."
   - order_id: "order-id"
   - customer_id: 123
   - total_amount: 47000
   - amount_paid: 0
   - status: "PENDING"

3. INSERT vào transactions:
   - transaction_id: "txn456..."
   - record_id: "rec123..."
   - amount: 30000
   - status: "PENDING"
   - method_id: "manual-id"

4. Dealer Manager duyệt:
   POST /api/v1/payments/customer/transactions/txn456.../confirm
   Body: { notes: "Đã xác nhận" }

5. UPDATE transactions:
   - status: "SUCCESS"
   - notes: "Đã xác nhận"

6. UPDATE payment_records:
   - amount_paid: 30000
   - remaining_amount: 17000
   - status: "PARTIALLY_PAID"

7. UPDATE sales_orders:
   - order_id: "order-id"
   - payment_status: "PARTIALLY_PAID"
```

---

## 🔗 LIÊN KẾT GIỮA CÁC BẢNG

### **B2B Payment Flow:**
```
sales_orders (order_id)
    ↓
dealer_invoices (reference_id = order_id)
    ↓
dealer_transactions (dealer_invoice_id)
    ↓
dealer_debt_records (dealer_id)
```

### **B2C Payment Flow:**
```
sales_orders (order_id)
    ↓
payment_records (order_id)
    ↓
transactions (record_id)
```

---

## 📝 GHI CHÚ QUAN TRỌNG

1. **Payment Status trong Sales Service:**
   - Được cập nhật tự động khi có thay đổi trong Payment Service
   - B2B: Cập nhật khi tạo invoice (UNPAID)
   - B2C: Cập nhật khi confirm payment (PAID/PARTIALLY_PAID)

2. **Transaction Status:**
   - **B2B:** PENDING_CONFIRMATION → SUCCESS (sau khi EVM Staff duyệt)
   - **B2C:** PENDING → SUCCESS (sau khi Dealer Manager duyệt)
   - **VNPAY:** PENDING → SUCCESS (sau khi callback từ gateway)

3. **Auto-confirm:**
   - VNPAY (GATEWAY) cho B2B: Tự động confirm ngay khi tạo transaction
   - Tiền mặt (MANUAL): Luôn cần approval từ staff

4. **Debt Calculation:**
   - `current_balance` trong `dealer_debt_records` được tính tự động bằng `@PreUpdate`
   - `remaining_amount` trong `payment_records` được tính tự động bằng `@PreUpdate`

---

## 🎯 TÓM TẮT

### **B2B Payment:**
1. EVM Staff tạo invoice → `dealer_invoices`, `dealer_debt_records`, `sales_orders.payment_status`
2. Dealer Manager thanh toán → `dealer_transactions` (PENDING_CONFIRMATION nếu tiền mặt)
3. EVM Staff duyệt → `dealer_transactions` (SUCCESS), `dealer_invoices`, `dealer_debt_records`

### **B2C Payment:**
1. Dealer Staff thanh toán → `payment_records`, `transactions` (PENDING)
2. Dealer Manager duyệt → `transactions` (SUCCESS), `payment_records`, `sales_orders.payment_status`

---

**Tài liệu được cập nhật lần cuối:** 2025-01-XX

