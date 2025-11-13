# Test Drive Management Module - Quick Start Guide

## 🚀 Triển khai module

Module này đã được tích hợp vào `customer-service`. Dưới đây là hướng dẫn để chạy và test.

## 📋 Prerequisites

- Java 17+
- MySQL 8.0+
- Maven 3.6+
- Postman hoặc cURL để test API

## 🔧 Cấu hình Database

Module sử dụng database `customer_db` đã có sẵn. Chạy migration script để thêm các trường mới:

```sql
-- Thêm các cột mới vào bảng test_drive_appointments
ALTER TABLE test_drive_appointments
ADD COLUMN variant_id BIGINT AFTER model_id,
ADD COLUMN test_drive_location VARCHAR(500) NOT NULL DEFAULT 'Showroom',
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN cancelled_by VARCHAR(255),
ADD COLUMN cancelled_at DATETIME,
ADD COLUMN confirmed_at DATETIME,
ADD COLUMN completed_at DATETIME,
ADD COLUMN customer_notes TEXT,
ADD COLUMN staff_notes TEXT,
ADD COLUMN notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN created_by VARCHAR(255),
ADD COLUMN updated_by VARCHAR(255);

-- Thêm indexes để tăng performance
CREATE INDEX idx_dealer_date ON test_drive_appointments(dealer_id, appointment_date);
CREATE INDEX idx_staff_date ON test_drive_appointments(staff_id, appointment_date);
CREATE INDEX idx_model_date ON test_drive_appointments(model_id, appointment_date);
CREATE INDEX idx_status ON test_drive_appointments(status);
```

## 🏃 Chạy service

```bash
cd services/customer-service
mvn clean install
mvn spring-boot:run
```

Hoặc với Docker:

```bash
docker-compose up customer-service
```

## 📡 Test APIs

### 1. Tạo lịch hẹn mới

```bash
curl -X POST http://localhost:8082/api/test-drives \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customerId": 1,
    "dealerId": 1,
    "modelId": 1,
    "variantId": 1,
    "staffId": 1,
    "appointmentDate": "2025-11-05T14:00:00",
    "durationMinutes": 60,
    "testDriveLocation": "Showroom VinFast Hà Nội, 458 Minh Khai",
    "customerNotes": "Khách muốn test trên đường cao tốc",
    "createdBy": "staff@dealer.com"
  }'
```

### 2. Cập nhật lịch hẹn

```bash
curl -X PUT http://localhost:8082/api/test-drives/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "appointmentDate": "2025-11-05T15:00:00",
    "testDriveLocation": "Địa điểm mới",
    "staffNotes": "Đã confirm với khách",
    "updatedBy": "staff@dealer.com"
  }'
```

### 3. Hủy lịch hẹn

```bash
curl -X DELETE http://localhost:8082/api/test-drives/1/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "cancellationReason": "Khách hàng đột xuất có việc bận",
    "cancelledBy": "staff@dealer.com"
  }'
```

### 4. Lấy Calendar View

```bash
curl -X GET "http://localhost:8082/api/test-drives/calendar?dealerId=1&startDate=2025-11-01T00:00:00&endDate=2025-11-30T23:59:59" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Filter lịch hẹn

```bash
curl -X POST http://localhost:8082/api/test-drives/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "dealerId": 1,
    "statuses": ["SCHEDULED", "CONFIRMED"],
    "startDate": "2025-11-01T00:00:00",
    "endDate": "2025-11-30T23:59:59"
  }'
```

### 6. Lấy thống kê

```bash
curl -X GET "http://localhost:8082/api/test-drives/statistics?dealerId=1&startDate=2025-11-01T00:00:00&endDate=2025-11-30T23:59:59" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Test Scenarios

### Test Case 1: Kiểm tra trùng lịch nhân viên

```bash
# Tạo lịch hẹn đầu tiên
curl -X POST http://localhost:8082/api/test-drives \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "dealerId": 1,
    "modelId": 1,
    "staffId": 1,
    "appointmentDate": "2025-11-05T14:00:00",
    "durationMinutes": 60,
    "testDriveLocation": "Showroom"
  }'

# Tạo lịch hẹn thứ hai với thời gian chồng lấn
# Expected: 409 Conflict
curl -X POST http://localhost:8082/api/test-drives \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 2,
    "dealerId": 1,
    "modelId": 1,
    "staffId": 1,
    "appointmentDate": "2025-11-05T14:30:00",
    "durationMinutes": 60,
    "testDriveLocation": "Showroom"
  }'
```

### Test Case 2: Kiểm tra validation

```bash
# Thời gian trong quá khứ
# Expected: 400 Bad Request
curl -X POST http://localhost:8082/api/test-drives \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "dealerId": 1,
    "modelId": 1,
    "appointmentDate": "2024-01-01T14:00:00",
    "durationMinutes": 60,
    "testDriveLocation": "Showroom"
  }'

# Thời lượng quá ngắn
# Expected: 400 Bad Request
curl -X POST http://localhost:8082/api/test-drives \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "dealerId": 1,
    "modelId": 1,
    "appointmentDate": "2025-11-05T14:00:00",
    "durationMinutes": 10,
    "testDriveLocation": "Showroom"
  }'
```

## 🔔 Notification Testing

Để test notification, cấu hình trong `application.properties`:

```properties
notification.enabled=true
```

Kiểm tra logs để xem notifications được gửi:

```bash
tail -f logs/customer-service.log | grep "Sending.*notification"
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:8082/actuator/health
```

### Metrics

```bash
curl http://localhost:8082/actuator/metrics/testdrive.appointments.total
```

## 🐛 Troubleshooting

### Issue 1: Database connection error

**Solution:** Kiểm tra MySQL đang chạy và credentials trong application.properties

```bash
mysql -u root -p -e "SHOW DATABASES;"
```

### Issue 2: Conflict detection không hoạt động

**Solution:** Kiểm tra indexes đã được tạo chưa

```sql
SHOW INDEX FROM test_drive_appointments;
```

### Issue 3: Notifications không được gửi

**Solution:** 
1. Kiểm tra `notification.enabled=true` trong config
2. Kiểm tra logs xem có exception không
3. Verify notification service đang chạy

## 📚 Documentation

Xem tài liệu chi tiết tại: [TESTDRIVE_ANALYSIS.md](../TESTDRIVE_ANALYSIS.md)

## 🎯 Next Steps

1. Tích hợp với Vehicle Service để lấy thông tin xe thực tế
2. Tích hợp với User Service để lấy thông tin staff
3. Implement email/SMS providers (SendGrid, Twilio)
4. Xây dựng frontend với Calendar View
5. Thêm unit tests và integration tests

## 📞 Support

Nếu gặp vấn đề, liên hệ:
- Email: dev@evdealer.com
- Slack: #testdrive-support
