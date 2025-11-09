# 📘 HƯỚNG DẪN TEST PAYMENT SERVICE BẰNG POSTMAN QUA GATEWAY

## 📋 MỤC LỤC
1. [Thiết lập môi trường](#thiết-lập-môi-trường)
2. [Authentication](#authentication)
3. [API Payment Methods (Giai đoạn 1)](#api-payment-methods-giai-đoạn-1)
4. [API Customer Payment (Giai đoạn 2)](#api-customer-payment-giai-đoạn-2)
5. [Test Cases](#test-cases)

---

## 🔧 THIẾT LẬP MÔI TRƯỜNG

### 1. Cấu hình Gateway
- **Gateway URL**: `http://localhost:8080`
- **Payment Service Route**: `/payments/**` -> rewrite thành `/api/v1/payments/**`

### 2. Chuẩn bị dữ liệu
1. Chạy script `payment-service-test-data.sql` trên server **payment_db**
2. Chạy script `sales-service-test-data.sql` trên server **sales_db**
3. Đảm bảo có user với các roles: ADMIN, DEALER_STAFF, DEALER_MANAGER, CUSTOMER

### 3. Biến môi trường Postman
Tạo các biến trong Postman Environment:
```
baseUrl: http://localhost:8080
token: (sẽ được lấy sau khi login)
orderId1: 684e4a1a-aa4b-4c01-9072-ccc6624ada9c
orderId2: b2c3d4e5-f6a7-4890-b123-456789012345
orderId3: c3d4e5f6-a7b8-4901-c234-567890123456
paymentMethodId: 02c1aef0-5482-4119-9d46-693710b77145
customerId: 3
transactionId: (sẽ được lấy từ response initiate payment)
```

**Hoặc Import Postman Collection**: File `PAYMENT_SERVICE_POSTMAN_COLLECTION.json` đã được tạo sẵn với tất cả các API.

**Lưu ý về Gateway Route**:
- **Gateway route**: `/payments/**` 
- **Gateway rewrite**: `/payments/(?<remaining>.*)` -> `/${remaining}`
- **Payment Service Controller**: `/api/v1/payments/**`
- **URL đầy đủ qua Gateway**: `http://localhost:8080/payments/api/v1/payments/...`
  - Ví dụ: `http://localhost:8080/payments/api/v1/payments/methods`
  - Gateway sẽ rewrite: `/payments/api/v1/payments/methods` -> `/api/v1/payments/methods`
  - Payment Service nhận: `/api/v1/payments/methods` ✅

---

## 🔐 AUTHENTICATION

### ⚠️ QUAN TRỌNG: Về Token và Gateway

**Kiến trúc xác thực và phân quyền**:
1. **Gateway (Authentication - Xác thực)**:
   - Gateway **YÊU CẦU TOKEN** cho TẤT CẢ các path (trừ `/auth` và `/users`)
   - Gateway validate token (kiểm tra signature, expiration, blacklist)
   - Gateway trích xuất thông tin user (email, role, userId, profileId)
   - Gateway thêm headers `X-User-Email`, `X-User-Role`, `X-User-Id`, `X-User-ProfileId` vào request
   - Nếu không có token hoặc token không hợp lệ → Gateway trả về **401 Unauthorized**

2. **Payment Service (Authorization - Phân quyền)**:
   - Payment Service **KHÔNG XÁC THỰC** - chỉ phân quyền
   - Payment Service tin tưởng headers từ Gateway (Gateway đã xác thực rồi)
   - `HeaderAuthenticationFilter` đọc headers từ Gateway và tạo `UserPrincipal`
   - Controller sử dụng `@PreAuthorize` để kiểm tra quyền (role-based authorization)
   - Nếu user không đủ quyền → Payment Service trả về **403 Forbidden**

**⚠️ LƯU Ý QUAN TRỌNG**:
- **TẤT CẢ** các API của Payment Service (kể cả public) đều **PHẢI CÓ TOKEN** khi gọi qua Gateway
- Gateway sẽ **KHÔNG CHO PHÉP** request đi qua nếu không có token (trừ `/auth` và `/users`)
- Payment Service sẽ phân biệt public/protected bằng cách kiểm tra `@PreAuthorize`:
  - `@PreAuthorize("permitAll()")` → Cho phép mọi user (nhưng vẫn cần token từ Gateway)
  - `@PreAuthorize("hasAnyRole(...)")` → Yêu cầu role cụ thể
  - `@PreAuthorize("isAuthenticated()")` → Yêu cầu đã đăng nhập (có token)

**Lỗi thường gặp**:
- **401 Unauthorized**: Không có token hoặc token không hợp lệ (Gateway level) - **XẢY RA Ở GATEWAY**
- **403 Forbidden**: Token hợp lệ nhưng không đủ quyền (ví dụ: user không có role `ADMIN` hoặc `EVM_STAFF`) - **XẢY RA Ở PAYMENT SERVICE**

### Bước 1: Đăng nhập để lấy JWT Token

**Endpoint**: `POST {{baseUrl}}/auth/login`

**Request Body** (ví dụ với user ADMIN):
```json
{
  "email": "admin@gmail.com",
  "password": "your_password"
}
```

**Request Body** (ví dụ với user EVM_STAFF):
```json
{
  "email": "evm_staff@gmail.com",
  "password": "your_password"
}
```

**Response**:
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

**Lưu token vào biến `token` trong Postman**:
1. Copy giá trị `accessToken` từ response
2. Trong Postman Environment, set biến `token` = giá trị `accessToken`

### Bước 2: Cấu hình Authorization trong Postman
Trong Postman:
1. Vào tab **Authorization**
2. Chọn Type: **Bearer Token**
3. Nhập token: `{{token}}`

**Hoặc** thêm header thủ công:
```
Authorization: Bearer {{token}}
```

### Bước 3: Kiểm tra Token
Sau khi login, đảm bảo:
- ✅ Token được lưu vào biến `token` trong Postman Environment
- ✅ Token được gửi trong header `Authorization: Bearer {{token}}`
- ✅ Token còn hiệu lực (chưa hết hạn)
- ✅ User có đủ quyền (role `ADMIN` hoặc `EVM_STAFF` cho API `/methods`)

---

## 💳 API PAYMENT METHODS (GIAI ĐOẠN 1)

### 1. GET - Lấy tất cả Payment Methods (ADMIN, EVM_STAFF)

**Endpoint**: `GET {{baseUrl}}/payments/api/v1/payments/methods`

**⚠️ QUAN TRỌNG**: 
- **Gateway**: Yêu cầu token (xác thực) - nếu không có token → **401 Unauthorized**
- **Payment Service**: Yêu cầu role `ADMIN` hoặc `EVM_STAFF` (phân quyền) - nếu không đủ quyền → **403 Forbidden**

**Lưu ý**: Gateway route `/payments/**` sẽ rewrite thành `/api/v1/payments/**`, nên URL đầy đủ là:
- Gateway: `http://localhost:8080/payments/api/v1/payments/methods`
- Service trực tiếp: `http://localhost:8085/api/v1/payments/methods`

**Headers** (BẮT BUỘC):
```
Authorization: Bearer {{token}}
```

**Lưu ý về Token**:
- Token phải từ user có role `ADMIN` hoặc `EVM_STAFF`
- Token phải còn hiệu lực (chưa hết hạn)
- Token không được nằm trong blacklist (đã logout)

**Response** (200 OK):
```json
{
  "data": [
    {
      "methodId": "02c1aef0-5482-4119-9d46-693710b77145",
      "methodName": "Thanh toán tiền mặt (Test 8085)",
      "methodType": "MANUAL",
      "scope": "B2C",
      "isActive": true
    }
  ]
}
```

---

### 2. GET - Lấy Payment Methods Active (PUBLIC)

**Endpoint**: `GET {{baseUrl}}/payments/api/v1/payments/methods/active-public`

**⚠️ LƯU Ý**: API này là **PUBLIC** ở Payment Service level (cho phép mọi user), nhưng **VẪN CẦN TOKEN** khi gọi qua Gateway.

**Headers** (BẮT BUỘC - Gateway yêu cầu):
```
Authorization: Bearer {{token}}
```

**Lưu ý**:
- Gateway **YÊU CẦU TOKEN** cho tất cả các path (trừ `/auth` và `/users`)
- Payment Service cho phép mọi user (có token) gọi API này (`@PreAuthorize("permitAll()")`)
- Bạn vẫn phải đăng nhập và lấy token, nhưng không cần role đặc biệt

**Response** (200 OK):
```json
{
  "data": [
    {
      "methodId": "02c1aef0-5482-4119-9d46-693710b77145",
      "methodName": "Thanh toán tiền mặt (Test 8085)",
      "methodType": "MANUAL",
      "scope": "B2C",
      "isActive": true
    }
  ]
}
```

---

### 3. GET - Lấy Payment Method theo ID

**Endpoint**: `GET {{baseUrl}}/payments/api/v1/payments/methods/{{paymentMethodId}}`

**Ví dụ**: `GET http://localhost:8080/payments/api/v1/payments/methods/02c1aef0-5482-4119-9d46-693710b77145`

**Path Variables**:
- `methodId`: UUID của payment method (ví dụ: `02c1aef0-5482-4119-9d46-693710b77145`)

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response** (200 OK):
```json
{
  "data": {
    "methodId": "02c1aef0-5482-4119-9d46-693710b77145",
    "methodName": "Thanh toán tiền mặt (Test 8085)",
    "methodType": "MANUAL",
    "scope": "B2C",
    "isActive": true,
    "configJson": null
  }
}
```

---

### 4. POST - Tạo Payment Method (ADMIN ONLY)

**Endpoint**: `POST {{baseUrl}}/payments/api/v1/payments/methods`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Request Body**:
```json
{
  "methodName": "VNPAY Gateway",
  "methodType": "GATEWAY",
  "scope": "B2C",
  "isActive": true,
  "configJson": "{\"gatewayUrl\": \"https://sandbox.vnpayment.vn\", \"tmnCode\": \"TEST\"}"
}
```

**Response** (201 Created):
```json
{
  "data": {
    "methodId": "550e8400-e29b-41d4-a716-446655440001",
    "methodName": "VNPAY Gateway",
    "methodType": "GATEWAY",
    "scope": "B2C",
    "isActive": true
  }
}
```

---

### 5. PUT - Cập nhật Payment Method (ADMIN ONLY)

**Endpoint**: `PUT {{baseUrl}}/payments/api/v1/payments/methods/{{paymentMethodId}}`

**Path Variables**:
- `methodId`: UUID của payment method

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Request Body**:
```json
{
  "methodName": "Thanh toán tiền mặt (Đã cập nhật)",
  "methodType": "MANUAL",
  "scope": "B2C",
  "isActive": false,
  "configJson": null
}
```

**Response** (200 OK):
```json
{
  "data": {
    "methodId": "02c1aef0-5482-4119-9d46-693710b77145",
    "methodName": "Thanh toán tiền mặt (Đã cập nhật)",
    "methodType": "MANUAL",
    "scope": "B2C",
    "isActive": false
  }
}
```

---

## 💰 API CUSTOMER PAYMENT (GIAI ĐOẠN 2)

### 1. POST - Khởi tạo Thanh toán

**Endpoint**: `POST {{baseUrl}}/payments/api/v1/payments/customer/orders/{{orderId1}}/pay`

**Ví dụ**: `POST http://localhost:8080/payments/api/v1/payments/customer/orders/684e4a1a-aa4b-4c01-9072-ccc6624ada9c/pay`

**Path Variables**:
- `orderId`: UUID của sales order (ví dụ: `684e4a1a-aa4b-4c01-9072-ccc6624ada9c`)
  - Order 1 (test cơ bản): `684e4a1a-aa4b-4c01-9072-ccc6624ada9c` (totalAmount = 50000)
  - Order 2 (test partial): `b2c3d4e5-f6a7-4890-b123-456789012345` (totalAmount = 100000)
  - Order 3 (test full): `c3d4e5f6-a7b8-4901-c234-567890123456` (totalAmount = 75000)

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 50000.00,
  "paymentMethodId": "02c1aef0-5482-4119-9d46-693710b77145",
  "notes": "Thanh toán đặt cọc đơn hàng"
}
```

**Lưu ý**: 
- `paymentMethodId`: Sử dụng ID từ Payment Method đã có (ví dụ: `02c1aef0-5482-4119-9d46-693710b77145`)
- `amount`: Phải <= `remainingAmount` của PaymentRecord
- Nếu Order chưa có PaymentRecord, hệ thống sẽ tự động tạo

**Response** (201 Created):
```json
{
  "data": {
    "transactionId": "d2680f26-f69a-4c35-b3af-244fadfd6947",
    "status": "PENDING_CONFIRMATION",
    "message": "Đã tạo yêu cầu thanh toán. Chờ đại lý xác nhận."
  }
}
```

**Lưu `transactionId` vào biến để dùng cho bước tiếp theo**

---

### 2. POST - Xác nhận Thanh toán (MANUAL)

**Endpoint**: `POST {{baseUrl}}/payments/api/v1/payments/customer/transactions/{transactionId}/confirm`

**Ví dụ**: `POST http://localhost:8080/payments/api/v1/payments/customer/transactions/d2680f26-f69a-4c35-b3af-244fadfd6947/confirm`

**Lưu ý**: `transactionId` lấy từ response của API khởi tạo thanh toán

**Path Variables**:
- `transactionId`: UUID của transaction (lấy từ bước 1)

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response** (200 OK):
```json
{
  "data": {
    "transactionId": "d2680f26-f69a-4c35-b3af-244fadfd6947",
    "paymentMethodName": "Thanh toán tiền mặt (Test 8085)",
    "amount": 50000.00,
    "transactionDate": "2025-11-08T10:30:00",
    "status": "SUCCESS",
    "notes": "Thanh toán đặt cọc đơn hàng"
  }
}
```

---

### 3. GET - Lấy Lịch sử Thanh toán

**Endpoint**: `GET {{baseUrl}}/payments/api/v1/payments/customer/orders/{{orderId1}}/history`

**Ví dụ**: `GET http://localhost:8080/payments/api/v1/payments/customer/orders/684e4a1a-aa4b-4c01-9072-ccc6624ada9c/history`

**Path Variables**:
- `orderId`: UUID của sales order

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "transactionId": "d2680f26-f69a-4c35-b3af-244fadfd6947",
      "paymentMethodName": "Thanh toán tiền mặt (Test 8085)",
      "amount": 50000.00,
      "transactionDate": "2025-11-08T10:30:00",
      "status": "SUCCESS",
      "notes": "Thanh toán đặt cọc đơn hàng"
    }
  ]
}
```

---

### 4. GET - Lấy Tổng Công nợ của Khách hàng

**Endpoint**: `GET {{baseUrl}}/payments/api/v1/payments/customer/{{customerId}}/debt`

**Ví dụ**: `GET http://localhost:8080/payments/api/v1/payments/customer/3/debt`

**Lưu ý**: `customerId` là Long (BIGINT), không phải UUID. Ví dụ: `3`

**Path Variables**:
- `customerId`: Long ID của customer (ví dụ: `3`)

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response** (200 OK):
```json
{
  "data": 50000.00
}
```

---

## 🧪 TEST CASES

### Test Case 1: Tạo Payment Method (ADMIN)
1. Login với tài khoản ADMIN
2. POST `/api/v1/payments/methods` với body hợp lệ
3. **Expected**: 201 Created, trả về payment method mới

### Test Case 2: Khởi tạo Thanh toán (CUSTOMER/DEALER_STAFF)
1. Login với tài khoản CUSTOMER hoặc DEALER_STAFF
2. GET `/api/v1/payments/methods/active-public` để lấy payment method ID
3. POST `/api/v1/payments/customer/orders/{orderId}/pay` với:
   - `amount`: 50000
   - `paymentMethodId`: ID từ bước 2
4. **Expected**: 201 Created, trả về transactionId và status PENDING_CONFIRMATION

### Test Case 3: Xác nhận Thanh toán (DEALER_STAFF)
1. Login với tài khoản DEALER_STAFF
2. POST `/api/v1/payments/customer/transactions/{transactionId}/confirm`
3. **Expected**: 200 OK, transaction status = SUCCESS

### Test Case 4: Thanh toán Nhiều lần (Partial Payment)
1. Tạo order với `totalAmount` = 100000
2. Thanh toán lần 1: `amount` = 30000
3. Xác nhận thanh toán lần 1
4. Thanh toán lần 2: `amount` = 70000
5. Xác nhận thanh toán lần 2
6. **Expected**: PaymentRecord status = PAID sau lần 2

### Test Case 5: Lấy Lịch sử Thanh toán
1. GET `/api/v1/payments/customer/orders/{orderId}/history`
2. **Expected**: 200 OK, trả về danh sách các transaction của order

### Test Case 6: Lấy Tổng Công nợ
1. GET `/api/v1/payments/customer/{customerId}/debt`
2. **Expected**: 200 OK, trả về tổng remainingAmount của các PaymentRecord chưa PAID

### Test Case 7: Validation - Amount > Remaining Amount
1. POST `/api/v1/payments/customer/orders/{orderId}/pay` với `amount` > `remainingAmount`
2. **Expected**: 400 Bad Request

### Test Case 8: Validation - PaymentRecord đã PAID
1. Tạo và xác nhận thanh toán đầy đủ
2. Thử thanh toán thêm lần nữa
3. **Expected**: 400 Bad Request hoặc 409 Conflict

---

## 📝 LƯU Ý

1. **Order ID**: Đảm bảo orderId tồn tại trong sales_db và có `type_oder` = 'B2C'
2. **Customer ID**: CustomerId trong PaymentRecord phải là Long, không phải UUID
3. **Payment Method**: Phải là MANUAL để có thể confirm thủ công
4. **Authorization**: Mỗi API yêu cầu role khác nhau, đảm bảo user có đúng role
5. **Gateway Route**: Gateway rewrite `/payments/**` -> `/api/v1/payments/**`

---

## 🔍 DEBUG

### Kiểm tra PaymentRecord trong Database
```sql
SELECT 
    HEX(record_id) as record_id,
    HEX(order_id) as order_id,
    customer_id,
    total_amount,
    amount_paid,
    remaining_amount,
    status
FROM payment_records
WHERE order_id = UNHEX('684e4a1aaa4b4c019072ccc6624ada9c');
```

### Kiểm tra Transaction trong Database
```sql
SELECT 
    HEX(transaction_id) as transaction_id,
    HEX(record_id) as record_id,
    HEX(method_id) as method_id,
    amount,
    status,
    transaction_date
FROM transactions
ORDER BY transaction_date DESC;
```

### Kiểm tra Sales Order trong Database
```sql
SELECT 
    HEX(order_id) as order_id,
    HEX(customer_id) as customer_id,
    total_amount,
    order_status,
    order_status_b2c
FROM sales_orders
WHERE order_id = UNHEX('684e4a1aaa4b4c019072ccc6624ada9c');
```

---

## 📞 HỖ TRỢ

Nếu gặp lỗi:
1. Kiểm tra logs của Payment Service
2. Kiểm tra logs của Gateway
3. Kiểm tra database connections
4. Kiểm tra JWT token có hợp lệ không

