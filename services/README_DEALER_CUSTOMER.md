# EV Dealer Platform - Dealer & Customer Services

## 📋 Tổng quan

Dự án xây dựng 2 microservices cho hệ thống quản lý bán xe điện qua kênh đại lý:
- **Dealer Service** (Port 8083): Quản lý đại lý, hợp đồng, chỉ tiêu và hiệu suất
- **Customer Service** (Port 8082): Quản lý khách hàng, lịch hẹn lái thử và phản hồi

## 🏗️ Kiến trúc

### Dealer Service Structure
```
dealer-service/
├── entity/               # JPA Entities
│   ├── Dealer.java
│   ├── DealerContract.java
│   ├── DealerTarget.java
│   ├── DealerPerformance.java
│   └── DealerLocation.java
├── dto/
│   ├── request/         # Request DTOs
│   └── response/        # Response DTOs
├── repository/          # JPA Repositories
├── service/            # Business Logic
├── controller/         # REST Controllers
├── exception/          # Custom Exceptions
└── config/            # Configuration Classes
```

### Customer Service Structure
```
customer-service/
├── entity/               # JPA Entities
│   ├── Customer.java
│   ├── CustomerProfile.java
│   ├── TestDriveAppointment.java
│   ├── Complaint.java
│   ├── CustomerFeedback.java
│   └── CommunicationHistory.java
├── dto/
│   ├── request/         # Request DTOs
│   └── response/        # Response DTOs
├── repository/          # JPA Repositories
├── service/            # Business Logic
├── controller/         # REST Controllers
├── exception/          # Custom Exceptions
└── config/            # Configuration Classes
```

## 🔧 Công nghệ sử dụng

- **Java 21**
- **Spring Boot 3.5.6**
- **Spring Data JPA**
- **MySQL Database** (Aiven Cloud)
- **Lombok** - Giảm boilerplate code
- **ModelMapper** - Object mapping
- **Jakarta Validation** - Input validation

## 📦 Dependencies chính

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
    <dependency>
        <groupId>org.modelmapper</groupId>
        <artifactId>modelmapper</artifactId>
        <version>3.2.0</version>
    </dependency>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
    </dependency>
</dependencies>
```

## 🚀 Chạy ứng dụng

### Yêu cầu
- JDK 21+
- Maven 3.6+
- MySQL Database (hoặc sử dụng cloud database đã cấu hình)

### Chạy Dealer Service
```bash
cd services/dealer-service
mvnw spring-boot:run
```
Service sẽ chạy tại: http://localhost:8083

### Chạy Customer Service
```bash
cd services/customer-service
mvnw spring-boot:run
```
Service sẽ chạy tại: http://localhost:8082

## 📡 API Endpoints

### Dealer Service (Port 8083)

#### Dealer Management
- `GET /api/dealers` - Danh sách tất cả đại lý
- `GET /api/dealers?search={keyword}` - Tìm kiếm đại lý
- `GET /api/dealers?city={city}` - Lọc theo thành phố
- `GET /api/dealers/{id}` - Chi tiết đại lý
- `GET /api/dealers/code/{code}` - Lấy đại lý theo mã
- `POST /api/dealers` - Tạo đại lý mới (EVMStaff/Admin)
- `PUT /api/dealers/{id}` - Cập nhật đại lý (EVMStaff/Admin)
- `DELETE /api/dealers/{id}` - Xóa đại lý (EVMStaff/Admin)

#### Dealer Contract Management
- `GET /api/dealers/{dealerId}/contract` - Danh sách hợp đồng của đại lý
- `GET /api/dealers/contracts/{id}` - Chi tiết hợp đồng
- `POST /api/dealers/{dealerId}/contract` - Tạo hợp đồng mới (EVMStaff/Admin)
- `PUT /api/dealers/contracts/{id}` - Cập nhật hợp đồng (EVMStaff/Admin)

### Customer Service (Port 8082)

#### Customer Management
- `GET /api/customers` - Danh sách khách hàng
- `GET /api/customers?search={keyword}` - Tìm kiếm khách hàng
- `GET /api/customers/{id}` - Chi tiết khách hàng
- `POST /api/customers` - Tạo khách hàng mới (DealerStaff+)
- `PUT /api/customers/{id}` - Cập nhật thông tin (DealerStaff+)
- `DELETE /api/customers/{id}` - Xóa khách hàng (DealerStaff+)

#### Test Drive Management
- `GET /api/test-drives/dealer/{dealerId}` - Lịch lái thử theo đại lý
- `GET /api/test-drives/{id}` - Chi tiết lịch hẹn
- `POST /api/test-drives` - Đặt lịch lái thử (Customer+)
- `PUT /api/test-drives/{id}` - Cập nhật lịch (DealerStaff+)

#### Feedback Management
- `GET /api/feedback/dealer/{dealerId}` - Feedback theo đại lý
- `POST /api/feedback` - Gửi feedback (Customer+)

## 📝 Ví dụ Request/Response

### Tạo Dealer mới
```json
POST /api/dealers
{
  "dealerCode": "DL001",
  "dealerName": "Đại lý ABC Hà Nội",
  "address": "123 Phố Huế",
  "city": "Hà Nội",
  "region": "Miền Bắc",
  "phone": "0912345678",
  "email": "abc@dealer.com",
  "taxNumber": "0123456789",
  "status": "ACTIVE"
}
```

Response:
```json
{
  "success": true,
  "message": "Dealer created successfully",
  "data": {
    "dealerId": 1,
    "dealerCode": "DL001",
    "dealerName": "Đại lý ABC Hà Nội",
    "city": "Hà Nội",
    "status": "ACTIVE",
    "createdAt": "2025-10-10T10:30:00"
  }
}
```

### Tạo Customer mới
```json
POST /api/customers
{
  "firstName": "Nguyễn",
  "lastName": "Văn A",
  "email": "nguyenvana@email.com",
  "phone": "0987654321",
  "address": "456 Đường ABC",
  "idNumber": "001234567890",
  "customerType": "INDIVIDUAL",
  "status": "ACTIVE",
  "preferredDealerId": 1
}
```

### Đặt lịch lái thử
```json
POST /api/test-drives
{
  "customerId": 1,
  "dealerId": 1,
  "modelId": 10,
  "appointmentDate": "2025-10-15T14:00:00",
  "durationMinutes": 60,
  "status": "SCHEDULED"
}
```

## 🗃️ Database Schema

### Dealer Service Database Tables
- `dealers` - Thông tin đại lý
- `dealer_contracts` - Hợp đồng đại lý
- `dealer_targets` - Chỉ tiêu bán hàng
- `dealer_performance` - Hiệu suất đại lý
- `dealer_locations` - Địa điểm showroom

### Customer Service Database Tables
- `customers` - Thông tin khách hàng
- `customer_profiles` - Hồ sơ chi tiết khách hàng
- `test_drive_appointments` - Lịch hẹn lái thử
- `complaints` - Khiếu nại
- `customer_feedback` - Phản hồi khách hàng
- `communication_history` - Lịch sử tương tác

## 🔐 Validation Rules

### Dealer
- `dealerCode`: Required, max 50 chars, unique
- `dealerName`: Required, max 200 chars
- `email`: Valid email format, max 100 chars
- `status`: ACTIVE, INACTIVE, SUSPENDED

### Customer
- `email`: Required, valid email, unique
- `idNumber`: Unique if provided
- `customerType`: INDIVIDUAL, CORPORATE
- `status`: ACTIVE, INACTIVE, BLOCKED

### Test Drive Appointment
- `appointmentDate`: Required, future date
- `status`: SCHEDULED, CONFIRMED, COMPLETED, CANCELLED
- `feedbackRating`: 1-5

## ⚠️ Error Handling

Tất cả API đều trả về cấu trúc response thống nhất:

Success:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

Validation Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Invalid email format",
    "phone": "Phone must not exceed 20 characters"
  }
}
```

## 🧪 Testing

### Test bằng cURL

```bash
# Get all dealers
curl http://localhost:8083/api/dealers

# Create new customer
curl -X POST http://localhost:8082/api/customers \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}'
```

### Test bằng Postman
Import collection từ file `postman_collection.json` (nếu có)

## 📚 Tài liệu tham khảo

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Lombok Documentation](https://projectlombok.org/)
- [ModelMapper](http://modelmapper.org/)

## 👥 Thành viên

**Thành viên 3**: Dealer & Customer Service
- Quản lý thông tin đại lý và hợp đồng
- Quản lý hồ sơ khách hàng
- Quản lý lịch hẹn lái thử
- Xử lý feedback và khiếu nại

## 📄 License

This project is for educational purposes as part of Object-Oriented Software Engineering course.
