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

Hệ thống phục vụ 4 nhóm người dùng chính:

| Actor              | Mô tả                         |
| ------------------ | ----------------------------- |
| **Dealer Staff**   | Nhân viên bán hàng tại đại lý |
| **Dealer Manager** | Quản lý đại lý                |
| **EVM Staff**      | Nhân viên hãng xe điện        |
| **Admin**          | Quản trị viên hệ thống        |

---

## 🚀 Tính năng

### 1️⃣ Chức năng cho Đại lý (Dealer Staff, Dealer Manager)

#### 🔍 a. Truy vấn thông tin xe

- Xem danh mục xe, cấu hình kỹ thuật, giá bán
- So sánh các mẫu xe và tính năng

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
├── frontend/my-app/          # React Frontend
├── gateway/                  # Spring Boot API Gateway
├── services/                 # Microservices
│   ├── user-service/
│   ├── order-service/
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
git clone https://github.com/phu-boop/ev-dealer-platform.git
cd ev-dealer-management
```

### Bước 2: Cài đặt dependencies

**Frontend:**

```bash
cd frontend/my-app/
npm install
```

**Backend:**

```bash
cd common-lib/
mvn clean install
```

### Bước 3: Cấu hình

Tạo file `.env` cho frontend và `application.properties` cho backend với các thông tin kết nối database, API keys, etc.

---

## 🎮 Sử dụng

### Chạy Frontend

```bash
cd frontend/my-app/
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### Chạy Backend Gateway

```bash
cd gateway/
mvn spring-boot:run
```

API Gateway sẽ chạy tại: `http://localhost:8080`

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
