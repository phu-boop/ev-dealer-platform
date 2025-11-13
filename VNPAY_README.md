# 🚀 VNPAY Integration - Complete Guide

> **File hướng dẫn duy nhất** để setup và test VNPAY Payment Gateway Integration

## ⚡ Quick Start (5 phút)

### Bước 1: Kiểm Tra Setup
```bash
# Terminal 1: Gateway (port 8080) - đã chạy sẵn
# Terminal 2: Payment Service (port 8085)
cd services/payment-service
mvn spring-boot:run

# Terminal 3: LocalTunnel (tunnel đến payment-service port 8085)
lt --port 8085
# URL: https://fresh-eagles-write.loca.lt
```

### Bước 2: Cập Nhật File .env
File `.env` đã được cập nhật tại: `services/payment-service/src/main/resources/.env`
- IPN URL: `https://fresh-eagles-write.loca.lt/payments/api/v1/payments/gateway/callback/vnpay-ipn`

### Bước 3: Cập Nhật VNPAY Merchant Admin
- Đăng nhập: https://sandbox.vnpayment.vn/merchantv2/
- Email: `dangtrong2608@gmail.com`
- Cập nhật IPN URL: `https://fresh-eagles-write.loca.lt/payments/api/v1/payments/gateway/callback/vnpay-ipn`

### Bước 4: Test Payment Flow
Xem chi tiết từng bước ở phần [Test VNPAY Payment Flow](#test-vnpay-payment-flow)

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Architecture & Ports](#architecture--ports)
3. [Setup & Configuration](#setup--configuration)
4. [Tổng Quan Chức Năng Payment Theo Role](#tổng-quan-chức-năng-payment-theo-role)
5. [Test Frontend UI (Giao Diện Web)](#test-frontend-ui-giao-diện-web)
6. [Test VNPAY Payment Flow](#test-vnpay-payment-flow)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)
9. [Quick Reference](#quick-reference)

---

## 🎯 Tổng Quan

### Thông Tin VNPAY Sandbox

- **Terminal ID (vnp_TmnCode)**: `IJHASM6C`
- **Secret Key (vnp_HashSecret)**: `QKR8NSPVNJG1QDBJBY3IEZ4DR73IR3N6`
- **Payment URL**: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- **Merchant Admin**: `https://sandbox.vnpayment.vn/merchantv2/`
- **Login**: `dangtrong2608@gmail.com`

### Thẻ Test

- **Ngân hàng**: NCB
- **Số thẻ**: `9704198526191432198`
- **Tên chủ thẻ**: `NGUYEN VAN A`
- **Ngày phát hành**: `07/15`
- **Mật khẩu OTP**: `123456`

---

## 🏗️ Architecture & Ports

### Ports Configuration

- **Gateway**: Port `8080` (Frontend và Postman gọi API qua Gateway)
- **Payment Service**: Port `8085` (Backend service)

### Flow Diagram

```
┌─────────────┐         ┌──────────┐         ┌──────────────────┐
│  Frontend   │────────▶│ Gateway  │────────▶│ Payment Service  │
│  Postman    │         │  :8080   │         │     :8085        │
└─────────────┘         └──────────┘         └──────────────────┘
                                                      ▲
                                                      │
┌─────────────┐         ┌──────────┐                │
│   VNPAY     │────────▶│LocalTunnel│───────────────┘
│   Server    │         │  (IPN)   │
└─────────────┘         └──────────┘
```

### API Calls

**From Frontend/Postman** (qua Gateway):
```
POST http://localhost:8080/payments/api/v1/payments/methods
POST http://localhost:8080/payments/api/v1/payments/customer/orders/{orderId}/pay
GET http://localhost:8080/payments/api/v1/payments/customer/orders/{orderId}/history
```

**From VNPAY IPN** (qua tunnel):
```
POST https://fresh-eagles-write.loca.lt/payments/api/v1/payments/gateway/callback/vnpay-ipn
```

---

## ⚙️ Setup & Configuration

### 1. File .env Configuration

File `.env` đã được tạo tại: `services/payment-service/src/main/resources/.env`

**Nội dung**:
```env
# VNPAY Configuration
VNPAY_TMN_CODE=IJHASM6C
VNPAY_HASH_SECRET=QKR8NSPVNJG1QDBJBY3IEZ4DR73IR3N6
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/payment/vnpay-return
VNPAY_IPN_URL=https://fresh-eagles-write.loca.lt/payments/api/v1/payments/gateway/callback/vnpay-ipn
VNPAY_COMMAND=pay
VNPAY_ORDER_TYPE=other
VNPAY_LOCALE=vn
VNPAY_CURRENCY_CODE=VND
VNPAY_VERSION=2.1.0

# Service URLs (via Gateway)
SALES_SERVICE_URL=http://localhost:8080/sales
USER_SERVICE_URL=http://localhost:8080/users
```

### 2. Setup LocalTunnel (Cho Development) - ⚡ Recommended

**Bước 1: Cài đặt LocalTunnel**
```bash
npm install -g localtunnel
```

**Bước 2: Start LocalTunnel**
```bash
# Tunnel đến payment-service (port 8085)
# Lưu ý: Tunnel trực tiếp đến payment-service, KHÔNG qua Gateway
lt --port 8085
```

**Kết quả**:
```
your url is: https://fresh-eagles-write.loca.lt
```

**Bước 3: Cập Nhật File .env**
Mở file: `services/payment-service/src/main/resources/.env`
```env
VNPAY_IPN_URL=https://fresh-eagles-write.loca.lt/payments/api/v1/payments/gateway/callback/vnpay-ipn
```

**Bước 4: Cập Nhật VNPAY Merchant Admin**
1. Đăng nhập: https://sandbox.vnpayment.vn/merchantv2/
2. Email: `dangtrong2608@gmail.com`
3. Vào phần **Cấu hình IPN URL**
4. Cập nhật IPN URL: `https://fresh-eagles-write.loca.lt/payments/api/v1/payments/gateway/callback/vnpay-ipn`
5. **Lưu lại**

**Bước 5: Restart Payment Service**
Restart payment-service để load cấu hình mới từ file `.env`.

### 3. Alternative: Setup Ngrok (Nếu muốn)

**Bước 1: Đăng ký tài khoản Ngrok** (miễn phí)
- Truy cập: https://dashboard.ngrok.com/signup
- Đăng ký và xác thực email

**Bước 2: Lấy Authtoken**
- Đăng nhập: https://dashboard.ngrok.com/get-started/your-authtoken
- Copy authtoken

**Bước 3: Cài đặt Authtoken**
```bash
# Windows (PowerShell)
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE

# Linux/Mac
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

**Bước 4: Start Ngrok**
```bash
# Tunnel đến payment-service (port 8085)
ngrok http 8085
```

**Bước 5: Cập Nhật File .env và VNPAY Merchant Admin**
- Copy ngrok URL và cập nhật `VNPAY_IPN_URL` trong file `.env`
- Cập nhật IPN URL trong VNPAY Merchant Admin

---

## 🧪 Test VNPAY Payment Flow

### Bước 1: Kiểm Tra Setup

**1.1. Đảm bảo Gateway đang chạy**
```bash
# Gateway chạy trên port 8080
# Frontend và Postman gọi API qua Gateway
# URL: http://localhost:8080/payments/api/v1/payments/...
```

**1.2. Đảm bảo Payment Service đang chạy**
```bash
cd services/payment-service
mvn spring-boot:run
# Payment-service chạy trên port 8085
# Kiểm tra logs để đảm bảo service đã start thành công
```

**1.3. Đảm bảo LocalTunnel đang chạy**
```bash
# Terminal riêng (đã chạy)
lt --port 8085
# URL: https://fresh-eagles-write.loca.lt
# Lưu ý: LocalTunnel tunnel trực tiếp đến payment-service (port 8085)
```

**1.4. Test LocalTunnel Connection**
Mở browser và truy cập:
```
https://fresh-eagles-write.loca.lt/payments/api/v1/payments/methods/active-public
```
✅ Nếu trả về data (hoặc `[]`) → LocalTunnel OK
❌ Nếu lỗi connection → Kiểm tra payment-service và LocalTunnel đang chạy

### Bước 2: Tạo Payment Method VNPAY

**API**: `POST http://localhost:8080/payments/api/v1/payments/methods` (qua Gateway)

**Headers**:
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Body**:
```json
{
  "methodName": "VNPAY Gateway",
  "methodType": "GATEWAY",
  "scope": "ALL",
  "isActive": true,
  "configJson": null
}
```

**Response**:
```json
{
  "data": {
    "methodId": "uuid-here",
    "methodName": "VNPAY Gateway",
    "methodType": "GATEWAY",
    "scope": "ALL",
    "isActive": true
  }
}
```

**Lưu `methodId`** để sử dụng ở bước sau.

### Bước 3: Tạo Order B2C (Nếu chưa có)

Tạo một order B2C trong Sales Service để test thanh toán. Hoặc sử dụng order ID có sẵn.

### Bước 4: Khởi Tạo Thanh Toán

**API**: `POST http://localhost:8080/payments/api/v1/payments/customer/orders/{orderId}/pay` (qua Gateway)

**Headers**:
```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

**Body**:
```json
{
  "amount": 100000,
  "paymentMethodId": "<PAYMENT_METHOD_ID>",
  "notes": "Test payment với VNPAY"
}
```

**Response thành công**:
```json
{
  "data": {
    "transactionId": "uuid-transaction-id",
    "status": "PENDING_GATEWAY",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=10000000&vnp_Command=pay&...",
    "message": "Đang chuyển đến cổng thanh toán VNPAY..."
  }
}
```

**Copy `paymentUrl`** từ response.

### Bước 5: Thanh Toán với VNPAY

**5.1. Mở Payment URL**
- Mở `paymentUrl` trong browser
- Bạn sẽ thấy trang thanh toán VNPAY

**5.2. Thanh Toán với Thẻ Test**
- **Ngân hàng**: NCB
- **Số thẻ**: `9704198526191432198`
- **Tên chủ thẻ**: `NGUYEN VAN A`
- **Ngày phát hành**: `07/15`
- **Mật khẩu OTP**: `123456`

**5.3. Hoàn Tất Thanh Toán**
1. Nhập thông tin thẻ
2. Nhập OTP: `123456`
3. Click "Thanh toán"
4. VNPAY sẽ xử lý và redirect về Return URL

### Bước 6: Kiểm Tra Kết Quả

**6.1. Kiểm Tra IPN Callback**
- **Xem logs** của payment-service:
  ```
  VNPAY IPN Callback received - Params: {...}
  Transaction updated - TransactionId: ..., Status: SUCCESS
  ```

- **Hoặc kiểm tra trong VNPAY Merchant Admin**:
  1. Đăng nhập: https://sandbox.vnpayment.vn/merchantv2/
  2. Vào phần **Giao dịch** hoặc **Transaction History**
  3. Tìm transaction vừa thanh toán

**6.2. Kiểm Tra Transaction Status**
**API**: `GET http://localhost:8080/payments/api/v1/payments/customer/orders/{orderId}/history` (qua Gateway)

**Response**:
```json
{
  "data": [
    {
      "transactionId": "uuid-transaction-id",
      "status": "SUCCESS",
      "amount": 100000,
      "paymentMethod": {
        "methodName": "VNPAY Gateway"
      },
      "transactionDate": "2025-11-11T10:00:00"
    }
  ]
}
```

**6.3. Kiểm Tra Return URL**
- VNPAY sẽ redirect về: `http://localhost:5173/payment/vnpay-return?vnp_ResponseCode=00&vnp_TransactionStatus=00&...`
- Frontend sẽ xử lý và hiển thị kết quả thanh toán

---

## 🎨 Test Frontend UI (Giao Diện Web)

### 📋 Tổng Quan Routes Frontend

| Route | Mô Tả | Role | URL |
|-------|-------|------|-----|
| `/evm/admin/payments/methods` | Quản lý Payment Methods | ADMIN | http://localhost:5173/evm/admin/payments/methods |
| `/evm/staff/payments/dealer-invoices` | Quản lý hóa đơn đại lý | EVM_STAFF | http://localhost:5173/evm/staff/payments/dealer-invoices |
| `/dealer/manager/payments/invoices` | Xem danh sách hóa đơn | DEALER_MANAGER | http://localhost:5173/dealer/manager/payments/invoices |
| `/dealer/manager/payments/invoices/:invoiceId` | Chi tiết và thanh toán hóa đơn | DEALER_MANAGER | http://localhost:5173/dealer/manager/payments/invoices/{invoiceId} |
| `/dealer/manager/payments/orders/:orderId` | Thanh toán đơn hàng B2C | DEALER_MANAGER | http://localhost:5173/dealer/manager/payments/orders/{orderId} |
| `/dealer/staff/payments/orders/:orderId` | Thanh toán đơn hàng B2C | DEALER_STAFF | http://localhost:5173/dealer/staff/payments/orders/{orderId} |
| `/payment/vnpay-return` | Xử lý redirect từ VNPAY | PUBLIC | http://localhost:5173/payment/vnpay-return |

### 🚀 Bước 1: Chuẩn Bị

**1.1. Đảm bảo Frontend đang chạy**
```bash
cd frontend/my-app
npm run dev
# Frontend chạy trên port 5173 (hoặc port khác nếu 5173 đã được sử dụng)
# URL: http://localhost:5173
```

**1.2. Đảm bảo Gateway đang chạy**
```bash
# Gateway chạy trên port 8080
# Frontend gọi API qua Gateway
```

**1.3. Đảm bảo Payment Service đang chạy**
```bash
cd services/payment-service
mvn spring-boot:run
# Payment-service chạy trên port 8085
```

**1.4. Đảm bảo LocalTunnel đang chạy** (cho VNPAY IPN)
```bash
lt --port 8085
# URL: https://fresh-eagles-write.loca.lt
```

**1.5. Đăng nhập vào Frontend**
- Mở browser: `http://localhost:5173`
- Đăng nhập với tài khoản phù hợp (ADMIN, EVM_STAFF, DEALER_MANAGER, DEALER_STAFF)

---

## 📍 Tổng Quan Chức Năng Payment Theo Role

### 👨‍💼 ADMIN
**Chức năng:**
- ✅ **Quản lý Payment Methods**: Tạo, sửa, xóa các phương thức thanh toán (Cash, Bank Transfer, VNPAY Gateway, etc.)
- ✅ **Xem tất cả Payment Methods**: Xem danh sách tất cả các phương thức thanh toán

**Cách truy cập:**
- Sidebar: `Quản Trị Hệ Thống` → `Quản Lý Phương Thức Thanh Toán`
- Route: `/evm/admin/payments/methods`

---

### 👨‍💼 EVM_STAFF
**Chức năng:**
- ✅ **Quản lý Hóa Đơn Đại Lý (B2B)**: Tạo, xem, quản lý hóa đơn công nợ cho đại lý
- ✅ **Xác nhận Thanh Toán**: Xác nhận các giao dịch thanh toán từ đại lý
- ✅ **Xem Payment Methods**: Xem danh sách các phương thức thanh toán (chỉ xem)

**Cách truy cập:**
- Sidebar: `Quản Lý Đại Lý` → `Hóa Đơn Đại Lý`
- Route: `/evm/staff/payments/dealer-invoices`

---

### 👨‍💼 DEALER_MANAGER
**Chức năng:**
- ✅ **Xem Hóa Đơn Của Tôi (B2B)**: Xem danh sách hóa đơn công nợ của đại lý
- ✅ **Thanh Toán Hóa Đơn (B2B)**: Thanh toán hóa đơn công nợ (Manual Payment)
- ✅ **Thanh Toán Đơn Hàng (B2C)**: Thanh toán đơn hàng từ khách hàng (VNPAY Gateway, Manual Payment)
- ✅ **Xem Lịch Sử Thanh Toán**: Xem lịch sử thanh toán của đơn hàng
- ✅ **Xác nhận Manual Payment**: Xác nhận thanh toán thủ công (Cash, Bank Transfer)

**Cách truy cập:**
1. **Hóa Đơn Của Tôi**:
   - Sidebar: `Tài Chính & Thanh Toán` → `Hóa Đơn Của Tôi`
   - Route: `/dealer/manager/payments/invoices`

2. **Thanh Toán Đơn Hàng (B2C)**:
   - Sidebar: `Quy Trình Bán Hàng` → `Danh Sách Đơn Hàng` → Click vào đơn hàng → Click "Thanh Toán"
   - Route: `/dealer/manager/payments/orders/{orderId}`

---

### 👨‍💼 DEALER_STAFF
**Chức năng:**
- ✅ **Thanh Toán Đơn Hàng (B2C)**: Thanh toán đơn hàng từ khách hàng (VNPAY Gateway, Manual Payment)
- ✅ **Xem Lịch Sử Thanh Toán**: Xem lịch sử thanh toán của đơn hàng
- ✅ **Xác nhận Manual Payment**: Xác nhận thanh toán thủ công (Cash, Bank Transfer)

**Cách truy cập:**
- Sidebar: `Quy Trình Bán Hàng` → `Danh Sách Đơn Hàng` → Click vào đơn hàng → Click "Thanh Toán"
- Route: `/dealer/staff/payments/orders/{orderId}`

---

### 👨‍💼 Test 1: Quản Lý Payment Methods (Admin)

**Mục đích**: Tạo và quản lý các phương thức thanh toán (Payment Methods)

**Bước 1: Truy cập trang Quản Lý Payment Methods**

**Cách 1: Qua Sidebar (Khuyến nghị)**
1. Đăng nhập với tài khoản **ADMIN**
2. Trong sidebar, mở menu **"Quản Trị Hệ Thống"**
3. Click **"Quản Lý Phương Thức Thanh Toán"**
4. ✅ Bạn sẽ thấy danh sách các Payment Methods hiện có

**Cách 2: Qua URL trực tiếp**
1. Đăng nhập với tài khoản **ADMIN**
2. Truy cập: `http://localhost:5173/evm/admin/payments/methods`
3. ✅ Bạn sẽ thấy danh sách các Payment Methods hiện có

**Bước 2: Tạo Payment Method VNPAY**
1. Click nút **"+ Tạo Phương Thức Thanh Toán"**
2. Điền thông tin:
   - **Tên phương thức**: `VNPAY Gateway`
   - **Loại phương thức**: `GATEWAY`
   - **Phạm vi**: `ALL` (hoặc `B2C`, `B2B`)
   - **Trạng thái**: `Active` (✓)
3. Click **"Lưu"**
4. ✅ Kiểm tra Payment Method đã được tạo thành công

**Bước 3: Kiểm Tra Payment Method**
- ✅ Payment Method hiển thị trong danh sách
- ✅ Trạng thái là **Active**
- ✅ Có thể Edit/Delete Payment Method

---

### 🛒 Test 2: Thanh Toán B2C (Customer Payment Flow)

**Mục đích**: Test thanh toán đơn hàng B2C với VNPAY Gateway

**Bước 1: Truy cập trang Thanh Toán**

**Cách 1: Qua Sidebar (Khuyến nghị)**
1. Đăng nhập với tài khoản **DEALER_MANAGER** hoặc **DEALER_STAFF**
2. Trong sidebar, mở menu **"Quy Trình Bán Hàng"**
3. Click **"Danh Sách Đơn Hàng"**
4. Tìm và click vào một đơn hàng (Order) cần thanh toán
5. Trong trang chi tiết đơn hàng, click nút **"Thanh Toán"** hoặc truy cập tab **"Thanh Toán"**
6. ✅ Bạn sẽ thấy:
   - **Form thanh toán** (bên trái)
   - **Lịch sử thanh toán** (bên phải)

**Cách 2: Qua URL trực tiếp**
1. Đăng nhập với tài khoản **DEALER_MANAGER** hoặc **DEALER_STAFF**
2. Truy cập: `http://localhost:5173/dealer/manager/payments/orders/{orderId}`
   - Thay `{orderId}` bằng Order ID thực tế (UUID)
   - **Lưu ý**: Với DEALER_STAFF, route là `/dealer/staff/payments/orders/{orderId}`
3. ✅ Bạn sẽ thấy:
   - **Form thanh toán** (bên trái)
   - **Lịch sử thanh toán** (bên phải)

**Bước 2: Khởi Tạo Thanh Toán với VNPAY**
1. Trong form thanh toán:
   - **Số tiền**: Nhập số tiền (VND)
   - **Phương thức thanh toán**: Chọn **"VNPAY Gateway"**
   - **Ghi chú**: (Optional) Nhập ghi chú
2. Click **"Thanh Toán"**
3. ✅ Hệ thống sẽ redirect đến trang thanh toán VNPAY

**Bước 3: Thanh Toán với VNPAY**
1. Trang VNPAY hiển thị thông tin thanh toán
2. Nhập thông tin thẻ test:
   - **Ngân hàng**: NCB
   - **Số thẻ**: `9704198526191432198`
   - **Tên chủ thẻ**: `NGUYEN VAN A`
   - **Ngày phát hành**: `07/15`
   - **Mật khẩu OTP**: `123456`
3. Click **"Thanh toán"**
4. ✅ VNPAY xử lý và redirect về frontend

**Bước 4: Kiểm Tra Kết Quả**
1. Frontend redirect về: `http://localhost:5173/payment/vnpay-return?vnp_ResponseCode=00&...`
2. ✅ Hiển thị thông báo **"Thanh Toán Thành Công!"**
3. ✅ Tự động redirect về trang đơn hàng sau 3 giây
4. ✅ Kiểm tra lịch sử thanh toán:
   - Transaction mới hiển thị
   - Trạng thái: **SUCCESS**
   - Phương thức: **VNPAY Gateway**

---

### 🏢 Test 3: Quản Lý Hóa Đơn Đại Lý (EVM Staff)

**Mục đích**: Tạo và quản lý hóa đơn công nợ cho đại lý

**Bước 1: Truy cập trang Quản Lý Hóa Đơn**

**Cách 1: Qua Sidebar (Khuyến nghị)**
1. Đăng nhập với tài khoản **EVM_STAFF**
2. Trong sidebar, mở menu **"Quản Lý Đại Lý"**
3. Click **"Hóa Đơn Đại Lý"**
4. ✅ Bạn sẽ thấy:
   - **Input field** để nhập Dealer ID
   - **Danh sách hóa đơn** (sau khi nhập Dealer ID)

**Cách 2: Qua URL trực tiếp**
1. Đăng nhập với tài khoản **EVM_STAFF**
2. Truy cập: `http://localhost:5173/evm/staff/payments/dealer-invoices`
3. ✅ Bạn sẽ thấy:
   - **Input field** để nhập Dealer ID
   - **Danh sách hóa đơn** (sau khi nhập Dealer ID)

**Bước 2: Xem Danh Sách Hóa Đơn**
1. Nhập **Dealer ID** (UUID) vào input field
2. Click **"Tìm kiếm"** (hoặc tự động load khi nhập)
3. ✅ Danh sách hóa đơn hiển thị:
   - Invoice ID
   - Dealer ID
   - Tổng tiền
   - Số tiền đã thanh toán
   - Số tiền còn lại
   - Trạng thái (UNPAID, PARTIALLY_PAID, PAID, OVERDUE)
   - Ngày tạo
   - Ngày đáo hạn

**Bước 3: Tạo Hóa Đơn Mới**
1. Click nút **"+ Tạo Hóa Đơn"**
2. Điền thông tin:
   - **Dealer ID**: (Tự động điền từ Dealer ID đã chọn)
   - **Order ID**: Nhập Order ID (B2B order)
   - **Tổng tiền**: Nhập tổng tiền (VND)
   - **Ngày đáo hạn**: Chọn ngày đáo hạn
   - **Ghi chú**: (Optional) Nhập ghi chú
3. Click **"Lưu"**
4. ✅ Hóa đơn được tạo thành công
5. ✅ Hóa đơn hiển thị trong danh sách

**Bước 4: Lọc Hóa Đơn**
1. Chọn **Trạng thái** từ dropdown:
   - `Tất cả trạng thái`
   - `Chưa thanh toán` (UNPAID)
   - `Thanh toán một phần` (PARTIALLY_PAID)
   - `Đã thanh toán` (PAID)
   - `Quá hạn` (OVERDUE)
2. ✅ Danh sách hóa đơn được lọc theo trạng thái

---

### 💰 Test 4: Thanh Toán Hóa Đơn Đại Lý (Dealer Manager)

**Mục đích**: Dealer Manager thanh toán hóa đơn công nợ

**Bước 1: Xem Danh Sách Hóa Đơn**

**Cách 1: Qua Sidebar (Khuyến nghị)**
1. Đăng nhập với tài khoản **DEALER_MANAGER**
2. Trong sidebar, mở menu **"Tài Chính & Thanh Toán"**
3. Click **"Hóa Đơn Của Tôi"**
4. ✅ Danh sách hóa đơn của đại lý hiển thị:
   - Chỉ hiển thị hóa đơn của đại lý đăng nhập
   - Không hiển thị hóa đơn của đại lý khác

**Cách 2: Qua URL trực tiếp**
1. Đăng nhập với tài khoản **DEALER_MANAGER**
2. Truy cập: `http://localhost:5173/dealer/manager/payments/invoices`
3. ✅ Danh sách hóa đơn của đại lý hiển thị:
   - Chỉ hiển thị hóa đơn của đại lý đăng nhập
   - Không hiển thị hóa đơn của đại lý khác

**Bước 2: Xem Chi Tiết Hóa Đơn**
1. Click vào một hóa đơn trong danh sách (từ Bước 1)
2. Hoặc truy cập trực tiếp: `http://localhost:5173/dealer/manager/payments/invoices/{invoiceId}`
   - Thay `{invoiceId}` bằng Invoice ID thực tế (UUID)
3. ✅ Chi tiết hóa đơn hiển thị:
   - Invoice ID
   - Order ID
   - Tổng tiền
   - Số tiền đã thanh toán
   - **Số tiền còn lại** (Remaining Amount)
   - Trạng thái
   - Ngày tạo
   - Ngày đáo hạn
   - Lịch sử thanh toán

**Bước 3: Thanh Toán Hóa Đơn**
1. Click nút **"Thanh Toán"**
2. Form thanh toán hiển thị:
   - **Số tiền thanh toán**: (Mặc định = Số tiền còn lại)
   - **Phương thức thanh toán**: Chọn phương thức (Manual Payment)
   - **Mã giao dịch ngân hàng**: Nhập mã giao dịch (Ví dụ: `VCB_123456789`)
   - **Ngày thanh toán**: Chọn ngày thanh toán
   - **Ghi chú**: (Optional) Nhập ghi chú
3. Click **"Gửi Thanh Toán"**
4. ✅ Thông báo: **"Thanh toán đã được gửi. Chờ xác nhận từ EVM Staff."**
5. ✅ Trạng thái hóa đơn chuyển sang **PENDING** (nếu thanh toán một phần) hoặc **PAID** (nếu thanh toán đủ)

**Bước 4: Kiểm Tra Lịch Sử Thanh Toán**
1. Trong chi tiết hóa đơn, xem phần **"Lịch sử thanh toán"**
2. ✅ Transaction mới hiển thị:
   - Transaction ID
   - Số tiền
   - Phương thức thanh toán
   - Trạng thái (PENDING, SUCCESS, FAILED)
   - Ngày thanh toán

---

### 🔄 Test 5: VNPAY Payment Flow Qua Frontend (End-to-End)

**Mục đích**: Test toàn bộ flow thanh toán VNPAY từ frontend

**Bước 1: Setup**
1. ✅ Đảm bảo Payment Method VNPAY đã được tạo và active
2. ✅ Đảm bảo LocalTunnel đang chạy: `lt --port 8085`
3. ✅ Đảm bảo IPN URL đã được cập nhật trong VNPAY Merchant Admin

**Bước 2: Khởi Tạo Thanh Toán**

**Cách 1: Qua Sidebar (Khuyến nghị)**
1. Đăng nhập với tài khoản **DEALER_MANAGER**
2. Trong sidebar, mở menu **"Quy Trình Bán Hàng"** → **"Danh Sách Đơn Hàng"**
3. Tìm và click vào một đơn hàng (Order) cần thanh toán
4. Trong trang chi tiết đơn hàng, click nút **"Thanh Toán"** hoặc truy cập tab **"Thanh Toán"**
5. Trong form thanh toán:
   - **Số tiền**: `100000` (100,000 VND)
   - **Phương thức thanh toán**: Chọn **"VNPAY Gateway"**
6. Click **"Thanh Toán"**
7. ✅ Hệ thống redirect đến trang thanh toán VNPAY

**Cách 2: Qua URL trực tiếp**
1. Đăng nhập với tài khoản **DEALER_MANAGER**
2. Truy cập: `http://localhost:5173/dealer/manager/payments/orders/{orderId}`
   - Thay `{orderId}` bằng Order ID thực tế (UUID)
3. Trong form thanh toán:
   - **Số tiền**: `100000` (100,000 VND)
   - **Phương thức thanh toán**: Chọn **"VNPAY Gateway"**
4. Click **"Thanh Toán"**
5. ✅ Hệ thống redirect đến trang thanh toán VNPAY

**Bước 3: Thanh Toán với VNPAY**
1. Trang VNPAY hiển thị:
   - Số tiền: 100,000 VND
   - Thông tin đơn hàng
2. Nhập thông tin thẻ test:
   - **Ngân hàng**: NCB
   - **Số thẻ**: `9704198526191432198`
   - **Tên chủ thẻ**: `NGUYEN VAN A`
   - **Ngày phát hành**: `07/15`
   - **Mật khẩu OTP**: `123456`
3. Click **"Thanh toán"**
4. ✅ VNPAY xử lý thanh toán

**Bước 4: Xử Lý Return URL**
1. VNPAY redirect về: `http://localhost:5173/payment/vnpay-return?vnp_ResponseCode=00&vnp_TransactionStatus=00&...`
2. ✅ Frontend hiển thị:
   - **Icon thành công** (CheckCircleIcon)
   - **Thông báo**: "Thanh Toán Thành Công!"
   - **Nút**: "Quay Lại Đơn Hàng"
3. ✅ Tự động redirect về trang đơn hàng sau 3 giây

**Bước 5: Kiểm Tra IPN Callback**
1. ✅ Kiểm tra logs của payment-service:
   ```
   VNPAY IPN Callback received - Params: {...}
   Transaction updated - TransactionId: ..., Status: SUCCESS
   ```
2. ✅ Kiểm tra transaction status trong database:
   - Status: **SUCCESS**
   - Confirmed: **true**
   - ConfirmedAt: (timestamp)

**Bước 6: Kiểm Tra Payment History**
1. Quay lại trang thanh toán:
   - **Qua Sidebar**: `Quy Trình Bán Hàng` → `Danh Sách Đơn Hàng` → Click vào đơn hàng → Tab "Thanh Toán"
   - **Qua URL**: `http://localhost:5173/dealer/manager/payments/orders/{orderId}`
2. ✅ Lịch sử thanh toán hiển thị transaction mới:
   - Transaction ID
   - Status: **SUCCESS**
   - Amount: 100,000 VND
   - Payment Method: **VNPAY Gateway**
   - Transaction Date: (timestamp)

---

### 🐛 Troubleshooting Frontend

**Issue 1: Không thể truy cập trang Payment Methods**
- ✅ Kiểm tra đã đăng nhập với tài khoản **ADMIN**
- ✅ Kiểm tra route: `/evm/admin/payments/methods`
- ✅ Kiểm tra Gateway đang chạy (port 8080)

**Issue 2: Không thể thanh toán với VNPAY**
- ✅ Kiểm tra Payment Method VNPAY đã được tạo và active
- ✅ Kiểm tra Payment Service đang chạy (port 8085)
- ✅ Kiểm tra Gateway đang chạy (port 8080)
- ✅ Kiểm tra LocalTunnel đang chạy (cho IPN callback)
- ✅ Kiểm tra file `.env` đã cấu hình VNPAY

**Issue 3: VNPAY redirect về nhưng không hiển thị kết quả**
- ✅ Kiểm tra route: `/payment/vnpay-return`
- ✅ Kiểm tra VnpayReturnPage component đã được import đúng
- ✅ Kiểm tra console log để xem lỗi
- ✅ Kiểm tra API `vnpayReturn` có được gọi không

**Issue 4: Không thể xem danh sách hóa đơn**
- ✅ Kiểm tra đã đăng nhập với tài khoản đúng (EVM_STAFF hoặc DEALER_MANAGER)
- ✅ Kiểm tra Dealer ID đã được nhập (cho EVM_STAFF)
- ✅ Kiểm tra authorization: DEALER_MANAGER chỉ xem được hóa đơn của mình
- ✅ Kiểm tra Gateway đang chạy (port 8080)

**Issue 5: Không thể thanh toán hóa đơn**
- ✅ Kiểm tra số tiền thanh toán không vượt quá số tiền còn lại
- ✅ Kiểm tra Payment Method đã được chọn
- ✅ Kiểm tra Mã giao dịch ngân hàng đã được nhập
- ✅ Kiểm tra Ngày thanh toán đã được chọn
- ✅ Kiểm tra Gateway đang chạy (port 8080)

---

## 🐛 Troubleshooting

### Issue 1: IPN Callback không được gọi

**Nguyên nhân**:
- LocalTunnel không kết nối được đến payment-service
- Payment-service không chạy
- IPN URL không đúng
- Gateway không chạy (không liên quan nhưng cần để test API)

**Giải pháp**:
1. ✅ Kiểm tra payment-service đang chạy trên port **8085**
2. ✅ Kiểm tra Gateway đang chạy trên port **8080**
3. ✅ Kiểm tra LocalTunnel đang chạy: `lt --port 8085` (tunnel đến payment-service)
4. ✅ Test LocalTunnel URL trong browser: `https://fresh-eagles-write.loca.lt/payments/api/v1/payments/methods/active-public`
5. ✅ Kiểm tra IPN URL trong VNPAY Merchant Admin đã cập nhật chưa
6. ✅ Kiểm tra file `.env` đã cập nhật `VNPAY_IPN_URL` chưa
7. ✅ Restart payment-service sau khi cập nhật `.env`
8. ✅ Kiểm tra logs của payment-service để xem IPN callback có được gọi không

### Issue 2: IPN Callback bị lỗi checksum

**Nguyên nhân**:
- VNPAY_HASH_SECRET không đúng
- Checksum validation failed

**Giải pháp**:
1. Kiểm tra `VNPAY_HASH_SECRET` trong file `.env`
2. Đảm bảo secret key khớp với VNPAY Merchant Admin
3. Restart payment-service sau khi cập nhật `.env`

### Issue 3: Transaction không được update

**Nguyên nhân**:
- IPN callback xử lý lỗi
- Transaction ID không tồn tại
- Database connection issue

**Giải pháp**:
1. Kiểm tra logs của payment-service
2. Kiểm tra transaction ID có tồn tại không
3. Kiểm tra database connection
4. Kiểm tra IPN callback có được gọi không

### Issue 4: Payment URL không hoạt động

**Nguyên nhân**:
- VNPAY_TMN_CODE không đúng
- VNPAY_HASH_SECRET không đúng
- Amount format không đúng

**Giải pháp**:
1. Kiểm tra file `.env`
2. Kiểm tra VNPAY config trong code
3. Kiểm tra logs của payment-service
4. Đảm bảo amount được nhân 100 (VND không có decimal)

### Issue 5: LocalTunnel URL thay đổi

**Nguyên nhân**:
- LocalTunnel URL thay đổi mỗi lần chạy (free plan)
- Mỗi lần restart LocalTunnel sẽ có URL mới

**Giải pháp**:
1. Cập nhật `VNPAY_IPN_URL` trong file `.env` với URL mới
2. Cập nhật IPN URL trong VNPAY Merchant Admin với URL mới
3. Restart payment-service để load cấu hình mới
4. **Lưu ý**: Phải cập nhật cả file `.env` và VNPAY Merchant Admin
5. **Alternative**: Sử dụng Ngrok với tài khoản trả phí để có URL tĩnh

---

## 🚀 Production Deployment

### 1. Deploy Payment Service

Deploy payment-service lên server public với domain thực tế.

### 2. Cập Nhật File .env

```env
VNPAY_IPN_URL=https://your-domain.com/payments/api/v1/payments/gateway/callback/vnpay-ipn
VNPAY_RETURN_URL=https://your-domain.com/payment/vnpay-return
```

### 3. Cập Nhật VNPAY Merchant Admin

1. Đăng nhập: https://sandbox.vnpayment.vn/merchantv2/ (hoặc production URL)
2. Vào phần **Cấu hình IPN URL**
3. Cập nhật IPN URL với domain thực tế

### 4. Test Production

1. Test với thẻ test từ VNPAY
2. Verify IPN callback được gọi
3. Verify transaction được update
4. Verify return URL redirect đúng

---

## ✅ Checklist Test

### Setup
- [ ] File `.env` đã được cập nhật với VNPAY config
- [ ] Payment-service đang chạy trên port 8085
- [ ] Gateway đang chạy trên port 8080
- [ ] LocalTunnel đang chạy: `lt --port 8085`
- [ ] IPN URL đã được cập nhật trong VNPAY Merchant Admin

### Payment Flow
- [ ] Payment method VNPAY Gateway đã được tạo và active
- [ ] Order B2C đã được tạo
- [ ] Khởi tạo thanh toán thành công
- [ ] Nhận được paymentUrl từ VNPAY
- [ ] Thanh toán thành công với thẻ test
- [ ] IPN callback được gọi và xử lý thành công
- [ ] Transaction status được update thành SUCCESS
- [ ] Return URL redirect về frontend thành công
- [ ] Payment history hiển thị transaction mới

---

## 📚 Tài Liệu Tham Khảo

- **VNPAY Documentation**: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
- **VNPAY Demo**: https://sandbox.vnpayment.vn/apis/vnpay-demo/
- **VNPAY Support**: support.vnpayment@vnpay.vn
- **VNPAY Hotline**: 1900 55 55 77

---

## 🔒 Security Notes

1. **File `.env`**:
   - ✅ Đã được thêm vào `.gitignore`
   - ✅ **KHÔNG commit file `.env` vào Git**
   - ✅ Thông tin nhạy cảm (VNPAY_HASH_SECRET, DB_PASSWORD) chỉ lưu trong `.env`

2. **IPN URL**:
   - ✅ IPN URL phải là PUBLIC URL (không phải localhost)
   - ✅ Sử dụng tunnel (LocalTunnel/Ngrok) cho development
   - ✅ Deploy lên server với domain thực tế cho production

3. **Checksum Validation**:
   - ✅ VNPAY sử dụng HMAC SHA512 để validate checksum
   - ✅ Secret key phải khớp với VNPAY merchant account
   - ✅ Nếu checksum không hợp lệ, IPN callback sẽ bị reject

---

## 🎯 Quick Reference

### Ports
- **Gateway**: `8080` (Frontend/Postman gọi API qua Gateway)
- **Payment Service**: `8085` (Backend service, LocalTunnel tunnel đến đây)

### URLs
- **Gateway API** (Frontend/Postman): `http://localhost:8080/payments/api/v1/payments/...`
- **LocalTunnel** (VNPAY IPN): `https://fresh-eagles-write.loca.lt/payments/api/v1/payments/...`
- **VNPAY Payment**: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- **VNPAY Merchant Admin**: `https://sandbox.vnpayment.vn/merchantv2/`

### Commands
```bash
# Terminal 1: Start Payment Service (port 8085)
cd services/payment-service
mvn spring-boot:run

# Terminal 2: Start LocalTunnel (tunnel đến payment-service port 8085)
lt --port 8085

# Terminal 3: Start Ngrok (nếu dùng, thay thế LocalTunnel)
ngrok http 8085
```

### Flow Diagram
```
┌─────────────┐         ┌──────────┐         ┌──────────────────┐
│  Frontend   │────────▶│ Gateway  │────────▶│ Payment Service  │
│  Postman    │         │  :8080   │         │     :8085        │
└─────────────┘         └──────────┘         └──────────────────┘
                                                      ▲
                                                      │
┌─────────────┐         ┌──────────┐                │
│   VNPAY     │────────▶│LocalTunnel│───────────────┘
│   Server    │         │  (IPN)   │
└─────────────┘         └──────────┘
```

---

**Last Updated**: 2025-11-11
**Status**: ✅ Complete Guide

