# Kế Hoạch Triển Khai B2C cho Hệ Thống EV Dealer Platform

## Tổng Quan
Phát triển chức năng B2C (Business-to-Consumer) cho phép khách hàng phổ thông mua xe điện trực tiếp qua website, tách biệt với cổng quản lý dành cho hãng và đại lý.

## Kiến Trúc
- **Backend**: Microservices (giữ nguyên kiến trúc hiện tại)
- **Frontend**: 
  - Port 5173: Cổng quản lý cho Hãng (EVM) và Đại lý (Dealer)
  - Port 5174: Cổng B2C cho khách hàng phổ thông (Customer)

## Phần 1: Backend - Role CUSTOMER ✅

### 1.1 Thêm Role CUSTOMER
- ✅ Thêm `CUSTOMER` vào enum `RoleName`
- ✅ Thêm các permissions cho customer:
  - `VIEW_OWN_PROFILE`, `UPDATE_OWN_PROFILE`
  - `VIEW_OWN_ORDERS`, `CREATE_OWN_ORDER`, `CANCEL_OWN_ORDER`
  - `VIEW_OWN_PAYMENTS`, `MAKE_PAYMENT`
  - `REQUEST_TEST_DRIVE`, `VIEW_PROMOTIONS`, `CREATE_FEEDBACK`

### 1.2 CustomerProfile Entity
- ✅ Tạo `CustomerProfile` entity với các trường:
  - `customerId`, `customerCode` (auto-generated)
  - `preferredDealerId` (optional)
  - `loyaltyPoints`, `membershipTier`
  - `registrationDate`, `isVerified`

### 1.3 Customer Registration & Authentication
- ✅ Tạo `CustomerRegistrationRequest` DTO
- ✅ Thêm endpoint `/auth/register/customer` (public, không cần authentication)
- ✅ Cập nhật `AuthService.registerCustomer()` để tạo user với role CUSTOMER
- ✅ Cập nhật các endpoint `/auth/me`, `/auth/refresh`, `/auth/logout`, `/auth/change-password` để hỗ trợ CUSTOMER

### 1.4 Data Initialization
- ✅ Thêm `initializeCustomerRole()` trong `DataInitializer` để tự động tạo role và permissions khi khởi động

## Phần 2: Frontend - Customer Portal (Đang thực hiện)

### 2.1 Tạo Frontend Mới
- [ ] Tạo thư mục `frontend/customer-app/` (tách biệt với `frontend/my-app/`)
- [ ] Cấu hình Vite để chạy trên port 5174
- [ ] Setup React, TypeScript, Tailwind CSS, Ant Design (giống frontend hiện tại)

### 2.2 Authentication & Routing
- [ ] Tạo trang đăng ký (`/register`)
- [ ] Tạo trang đăng nhập (`/login`)
- [ ] Tạo `CustomerLayout` với header, footer, navigation
- [ ] Setup protected routes cho customer

### 2.3 Features Cần Phát Triển
- [ ] **Trang chủ**: Hiển thị danh sách xe, khuyến mãi
- [ ] **Danh mục xe**: Xem danh sách, filter, search, so sánh
- [ ] **Chi tiết xe**: Thông tin kỹ thuật, hình ảnh, giá
- [ ] **Đặt hàng**: Tạo đơn hàng B2C
- [ ] **Quản lý đơn hàng**: Xem lịch sử, chi tiết, hủy đơn
- [ ] **Thanh toán**: Tích hợp VNPAY, xem lịch sử thanh toán
- [ ] **Đặt lịch lái thử**: Request test drive
- [ ] **Hồ sơ**: Xem và cập nhật thông tin cá nhân
- [ ] **Phản hồi**: Gửi feedback

### 2.4 Integration với Backend
- [ ] Tạo API service để gọi các endpoints
- [ ] Tích hợp với Gateway (port 8080)
- [ ] Xử lý authentication (JWT tokens)

## Phần 3: Gateway & Infrastructure

### 3.1 Gateway Configuration
- [ ] Cập nhật routing để hỗ trợ customer frontend
- [ ] Đảm bảo CORS cho port 5174

### 3.2 Docker Configuration
- [ ] Thêm service `customer-frontend` vào `docker-compose.yml`
- [ ] Cấu hình nginx cho customer frontend

## Phần 4: Sales Service Integration

### 4.1 B2C Order Management
- [x] Hệ thống đã có `SalesOrderB2C` entity và service
- [ ] Cập nhật để customer có thể tạo đơn hàng trực tiếp (không cần quotation)
- [ ] Thêm validation để đảm bảo customer chỉ xem/sửa đơn hàng của chính họ

### 4.2 Payment Integration
- [x] Hệ thống đã có `CustomerPaymentController`
- [ ] Đảm bảo customer chỉ xem thanh toán của chính họ

## Phần 5: Testing & Documentation

### 5.1 Testing
- [ ] Unit tests cho customer registration
- [ ] Integration tests cho customer authentication
- [ ] E2E tests cho flow đặt hàng B2C

### 5.2 Documentation
- [ ] Cập nhật README với hướng dẫn chạy customer frontend
- [ ] API documentation cho customer endpoints
- [ ] User guide cho khách hàng

## Lưu Ý Quan Trọng

1. **Tách biệt hoàn toàn**: Customer frontend (5174) và Admin/Dealer frontend (5173) là 2 ứng dụng riêng biệt
2. **Security**: Customer chỉ có quyền truy cập dữ liệu của chính họ
3. **Microservices**: Giữ nguyên kiến trúc, không thay đổi cấu trúc services hiện có
4. **Database**: CustomerProfile sử dụng cùng database với User service, không cần database riêng

## Tiến Độ

- ✅ Backend: Role CUSTOMER và Authentication (100%)
- 🔄 Frontend: Customer Portal (0%)
- ⏳ Gateway & Infrastructure (0%)
- ⏳ Testing & Documentation (0%)

