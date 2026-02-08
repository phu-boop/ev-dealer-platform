# 🚗 Electric Vehicle Dealer Management System

> Hệ thống quản lý bán xe điện thông qua kênh đại lý

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://www.oracle.com/java/)
[![Java](https://img.shields.io/badge/Java-21+-orange.svg)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0+-green.svg)](https://spring.io/projects/spring-boot)

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Sử dụng](#-sử-dụng)
- [Actors](#-actors)

---

## 🌟 Giới thiệu

**Electric Vehicle Dealer Management System** là phần mềm quản lý toàn diện cho việc bán xe điện thông qua mạng lưới đại lý. Hệ thống kết nối hãng xe điện (EVM) với các đại lý, tối ưu hóa quy trình bán hàng, quản lý tồn kho và dự báo nhu cầu thông qua AI.

### Lợi ích chính

- ✅ Tự động hóa quy trình bán hàng và quản lý đơn hàng
- 📊 Báo cáo và phân tích dữ liệu real-time
- 🤖 Dự báo nhu cầu bằng AI
- 🔄 Đồng bộ tồn kho giữa hãng và đại lý
- 👥 Quản lý khách hàng và chăm sóc sau bán

---

## 🎯 Actors

<<<<<<< HEAD
Hệ thống phục vụ 5 nhóm người dùng chính:

| Actor              | Mô tả                         | Cổng truy cập |
| ------------------ | ----------------------------- | ------------- |
| **Customer**       | Khách hàng phổ thông (B2C)    | Port 5174     |
| **Dealer Staff**   | Nhân viên bán hàng tại đại lý | Port 5173     |
| **Dealer Manager** | Quản lý đại lý                | Port 5173     |
| **EVM Staff**      | Nhân viên hãng xe điện        | Port 5173     |
| **Admin**          | Quản trị viên hệ thống        | Port 5173     |
=======
Hệ thống phục vụ 4 nhóm người dùng chính:

| Actor              | Mô tả                         |
| ------------------ | ----------------------------- |
| **Dealer Staff**   | Nhân viên bán hàng tại đại lý |
| **Dealer Manager** | Quản lý đại lý                |
| **EVM Staff**      | Nhân viên hãng xe điện        |
| **Admin**          | Quản trị viên hệ thống        |
>>>>>>> newrepo/main

---

## 🚀 Tính năng

<<<<<<< HEAD
### 1️⃣ Chức năng cho Khách hàng (Customer B2C) - **HOÀN THÀNH**

#### 🛒 a. Mua sắm trực tuyến
- Xem danh mục xe điện với bộ lọc và tìm kiếm
- Xem chi tiết xe (thông số, hình ảnh, tính năng)
- So sánh xe (tối đa 3 xe cùng lúc)
- Thêm vào giỏ hàng và thanh toán
- Theo dõi đơn hàng
- Thanh toán VNPay

#### ⭐ b. Tương tác với sản phẩm
- **Đánh giá và đánh sao** xe đã mua (5 sao + chi tiết)
- Xem đánh giá từ người dùng khác
- Thống kê rating trung bình và phân bố
- **Đặt lịch lái thử** xe (chọn ngày, giờ, đại lý)
- Quản lý lịch lái thử của bản thân

#### 🔌 c. Dịch vụ hỗ trợ
- **Bản đồ trạm sạc** với Google Maps
- Tìm trạm sạc gần nhất
- Xem thông tin chi tiết trạm (loại sạc, công suất, giá)
- Chỉ đường đến trạm sạc

---

### 2️⃣ Chức năng cho Đại lý (Dealer Staff, Dealer Manager)
=======
### 1️⃣ Chức năng cho Đại lý (Dealer Staff, Dealer Manager)
>>>>>>> newrepo/main

#### 🔍 a. Truy vấn thông tin xe

- Xem danh mục xe, cấu hình kỹ thuật, giá bán
- So sánh các mẫu xe và tính năng
<<<<<<< HEAD
- Duyệt đánh giá khách hàng
=======
>>>>>>> newrepo/main

#### 💼 b. Quản lý bán hàng

- Tạo báo giá, đơn hàng, hợp đồng bán hàng
- Quản lý chương trình khuyến mãi
- Đặt xe từ hãng theo nhu cầu
- Theo dõi tình trạng giao xe cho khách hàng
- Quản lý thanh toán (trả thẳng, trả góp)

#### 👥 c. Quản lý khách hàng

- Lưu trữ và quản lý hồ sơ khách hàng
- Quản lý lịch hẹn lái thử
- Ghi nhận phản hồi và xử lý khiếu nại

#### 📈 d. Báo cáo

- Doanh số theo nhân viên bán hàng
- Báo cáo công nợ khách hàng và công nợ với hãng xe

---

### 2️⃣ Chức năng cho Hãng xe (EVM Staff, Admin)

#### 📦 a. Quản lý sản phẩm & phân phối

- Quản lý danh mục xe điện (mẫu, phiên bản, màu sắc)
- Quản lý tồn kho tổng và điều phối xe cho từng đại lý
- Quản lý giá sỉ, chính sách chiết khấu, khuyến mãi theo đại lý

#### 🏢 b. Quản lý đại lý

- Quản lý hợp đồng và chỉ tiêu doanh số
- Theo dõi công nợ của đại lý
- Quản lý tài khoản đại lý trên hệ thống

#### 📊 c. Báo cáo & phân tích

- Doanh số theo khu vực và từng đại lý
- Tình trạng tồn kho và tốc độ tiêu thụ
- **🤖 AI dự báo nhu cầu** để lên kế hoạch sản xuất và phân phối

---

## 🏗️ Kiến trúc hệ thống

```
Application
├── common-lib                # Lib For Project
<<<<<<< HEAD
├── frontend/
│   ├── my-app/              # React Frontend (Admin/Dealer - Port 5173)
│   └── customer-app/        # React Frontend (B2C Customer - Port 5174)
=======
├── frontend/my-app/          # React Frontend
>>>>>>> newrepo/main
├── gateway/                  # Spring Boot API Gateway
├── services/                 # Microservices
│   ├── user-service/
│   ├── sales-service/
│   ├── dealer-service/
│   ├── vehicle-service/
│   ├── inventory-service/
│   ├── reporting-service/
│   ├── customer-service/
│   ├── payment-service/
│   └── ai-service/
└── database/                 # Database schemas
```

### Tech Stack

**Frontend:**

- React 18 (Vite Build Tool)
- TypeScript
- Tailwind CSS & Ant Design (UI Library)
- TanStack Query (Data Fetching & Caching)
- React Router DOM v7
- Axios (API Communication)
- React Hook Form (Form Handling)
- WebSocket / StompJS (Real-time features)

<<<<<<< HEAD
**Frontend Ports:**

- Port 5173: Admin/Dealer Portal (`frontend/my-app/`)
- Port 5174: Customer B2C Portal (`frontend/customer-app/`)

=======
>>>>>>> newrepo/main
**Backend:**

- Spring Boot 3.0+
- Java 17+, 21+
- Spring Cloud Gateway
- MySQL
- Redis (Caching)

**AI/ML:**

- Python (FastAPI)

---

## 💻 Cài đặt

### Yêu cầu hệ thống

- Node.js 18+ và npm
- Java 17+, 21+
- Maven 3.8+
- MySQL 8+
- Redis (optional)

### Bước 1: Clone repository

```bash
<<<<<<< HEAD
git clone https://github.com/BinhLN1105/VMS-Commerce.git
=======
git clone https://github.com/phu-boop/ev-dealer-platform.git
>>>>>>> newrepo/main
cd ev-dealer-management
```

### Bước 2: Cài đặt dependencies

<<<<<<< HEAD
**Frontend (Admin/Dealer Portal):**
=======
**Frontend:**
>>>>>>> newrepo/main

```bash
cd frontend/my-app/
npm install
```

<<<<<<< HEAD
**Frontend (Customer B2C Portal):**

```bash
cd frontend/customer-app/
npm install
```

=======
>>>>>>> newrepo/main
**Backend:**

```bash
cd common-lib/
mvn clean install
```

### Bước 3: Cấu hình

Tạo file `.env` cho frontend và `application.properties` cho backend với các thông tin kết nối database, API keys, etc.

---

## 📱 Screenshots

_Coming soon..._

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Font Awesome](https://fontawesome.com/)

---

<div align="center">
  <sub>Built with ❤️ by <b>My Team</b></sub>
</div>
