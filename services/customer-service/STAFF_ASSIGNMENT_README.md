# Staff Assignment Feature - Customer Service

## Mô tả
Tính năng phân công nhân viên cho khách hàng, cho phép Dealer Manager phân công nhân viên chăm sóc cho từng khách hàng và tự động gửi thông báo.

## Các thành phần đã xây dựng

### 1. Entity & Database
- **Customer.java**: Thêm trường `assignedStaffId` (Long)
- **Migration SQL**: `V1__add_assigned_staff_to_customers.sql`
  - Thêm cột `assigned_staff_id` vào bảng `customers`
  - Thêm index cho tối ưu query

### 2. DTOs
- **AssignStaffRequest.java**: Request để phân công nhân viên
  - `staffId` (required): ID của nhân viên
  - `note` (optional): Ghi chú khi phân công
  
- **AssignmentResponse.java**: Response sau khi phân công
  - `customerId`, `customerCode`, `customerName`
  - `assignedStaffId`, `assignedStaffName`
  - `assignedAt`, `message`

- **StaffDTO.java**: DTO chứa thông tin nhân viên từ User Service
  - `userId`, `username`, `email`
  - `firstName`, `lastName`, `phone`
  - `role`, `active`

### 3. Services

#### UserServiceClient.java
Client để gọi API từ User Service
- `getStaffById(Long staffId)`: Lấy thông tin nhân viên
- `getAllStaff()`: Lấy danh sách tất cả nhân viên
- `isStaffActive(Long staffId)`: Kiểm tra nhân viên có active không

**⚠️ TODO - Cần cập nhật:**
- Thay URL trong `application.properties`: `user.service.url`
- Có thể cần điều chỉnh response structure phù hợp với API thực tế

#### NotificationServiceClient.java
Client để gửi thông báo
- `sendAssignmentNotification()`: Gửi thông báo phân công
- `sendUnassignmentNotification()`: Gửi thông báo hủy phân công

**⚠️ TODO - Cần cập nhật:**
- Thay URL trong `application.properties`: `notification.service.url`
- Điều chỉnh payload structure phù hợp với API thực tế

#### StaffAssignmentService.java
Service chính xử lý logic phân công
- `assignStaffToCustomer()`: Phân công nhân viên
  - Kiểm tra customer và staff tồn tại
  - Kiểm tra staff active
  - Gửi thông báo cho staff mới
  - Gửi thông báo hủy cho staff cũ (nếu có)
- `unassignStaffFromCustomer()`: Hủy phân công
- `getAssignedStaff()`: Lấy thông tin staff được phân công

### 4. Controllers

#### StaffAssignmentController.java
REST API endpoints:

**1. Phân công nhân viên**
```
POST /customers/{customerId}/assign-staff
Content-Type: application/json

Request Body:
{
  "staffId": 123,
  "note": "Ghi chú tùy chọn"
}

Response:
{
  "status": 200,
  "message": "Staff assigned to customer successfully",
  "data": {
    "customerId": 1,
    "customerCode": "CUS-20250101-0001",
    "customerName": "Nguyen Van A",
    "assignedStaffId": 123,
    "assignedStaffName": "Tran Thi B",
    "assignedAt": "2025-10-30T10:30:00",
    "message": "Staff assigned successfully and notification sent"
  }
}
```

**2. Hủy phân công nhân viên**
```
DELETE /customers/{customerId}/assign-staff

Response:
{
  "status": 200,
  "message": "Staff unassigned from customer successfully",
  "data": {
    "customerId": 1,
    "customerCode": "CUS-20250101-0001",
    "customerName": "Nguyen Van A",
    "assignedStaffId": null,
    "assignedStaffName": null,
    "assignedAt": "2025-10-30T10:35:00",
    "message": "Staff unassigned successfully"
  }
}
```

**3. Xem nhân viên được phân công**
```
GET /customers/{customerId}/assigned-staff

Response:
{
  "status": 200,
  "message": "Assigned staff retrieved successfully",
  "data": {
    "userId": 123,
    "username": "staff01",
    "email": "staff01@example.com",
    "firstName": "Tran",
    "lastName": "Thi B",
    "phone": "0912345678",
    "role": "STAFF",
    "active": true
  }
}
```

### 5. Configuration

**application.properties**
```properties
# External Service URLs
# TODO: Cập nhật các URL này khi các service khác hoàn thành
user.service.url=${USER_SERVICE_URL:http://localhost:8081/api/users}
notification.service.url=${NOTIFICATION_SERVICE_URL:http://localhost:8085/api/notifications}
```

## Cách sử dụng

### 1. Chạy migration SQL
```sql
-- Chạy file: V1__add_assigned_staff_to_customers.sql
-- Hoặc để Hibernate tự động update schema (đã config ddl-auto=update)
```

### 2. Cập nhật environment variables (nếu cần)
```bash
# Docker / Kubernetes
USER_SERVICE_URL=http://user-service:8081/api/users
NOTIFICATION_SERVICE_URL=http://notification-service:8085/api/notifications
```

### 3. Test API với Postman/Curl

**Phân công nhân viên:**
```bash
curl -X POST http://localhost:8082/customers/1/assign-staff \
  -H "Content-Type: application/json" \
  -d '{
    "staffId": 123,
    "note": "Nhân viên chăm sóc chính"
  }'
```

**Hủy phân công:**
```bash
curl -X DELETE http://localhost:8082/customers/1/assign-staff
```

**Xem staff được phân công:**
```bash
curl -X GET http://localhost:8082/customers/1/assigned-staff
```

## TODO - Cần hoàn thiện

### 1. User Service Integration ⚠️
- [ ] Cập nhật `user.service.url` trong `application.properties`
- [ ] Kiểm tra và điều chỉnh endpoint paths trong `UserServiceClient.java`:
  - `GET /api/users/{userId}` - Lấy thông tin user theo ID
  - `GET /api/users?role=STAFF` - Lấy danh sách staff
- [ ] Điều chỉnh response structure của `StaffDTO` nếu API trả về format khác

### 2. Notification Service Integration ⚠️
- [ ] Cập nhật `notification.service.url` trong `application.properties`
- [ ] Kiểm tra và điều chỉnh endpoint path trong `NotificationServiceClient.java`:
  - `POST /api/notifications/send`
- [ ] Điều chỉnh payload structure phù hợp với API thực tế

### 3. Database Migration
- [ ] Chạy migration script hoặc để Hibernate auto-update
- [ ] Verify cột `assigned_staff_id` đã được tạo

### 4. Testing
- [ ] Test integration với User Service
- [ ] Test integration với Notification Service
- [ ] Test các edge cases:
  - Staff không tồn tại
  - Staff không active
  - Customer không tồn tại
  - Network errors khi gọi external services

### 5. Security (Optional)
- [ ] Thêm authorization check: Chỉ Dealer Manager mới được phân công
- [ ] Add role-based access control trong SecurityConfig

## Error Handling

Service đã handle các trường hợp lỗi:
- `ResourceNotFoundException`: Customer hoặc Staff không tồn tại
- `IllegalStateException`: Staff không active, Customer chưa được phán công
- `DuplicateResourceException`: Các lỗi duplicate (nếu có)
- Network errors khi gọi external services được catch và log

## Notes

1. **Microservices Architecture**: `assignedStaffId` không có foreign key constraint vì staff data ở User Service
2. **Async Notifications**: Notification failures không làm gián đoạn flow chính, chỉ log error
3. **Audit Trail**: Có thể mở rộng thêm audit log cho staff assignment changes
4. **Frontend Integration**: Frontend đã sẵn sàng, chỉ cần update API base URL

## Flow Diagram

```
Frontend (Customer Profile)
    |
    | POST /assign-staff
    |
    v
StaffAssignmentController
    |
    v
StaffAssignmentService
    |
    +---> UserServiceClient.getStaffById() --> User Service API
    |
    +---> CustomerRepository.save()
    |
    +---> NotificationServiceClient.sendNotification() --> Notification Service API
    |
    v
Return AssignmentResponse
```

## Contact
Nếu có thắc mắc về implementation, vui lòng liên hệ team backend.
