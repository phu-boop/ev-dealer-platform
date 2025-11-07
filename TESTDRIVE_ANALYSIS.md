# TESTDRIVE MANAGEMENT MODULE - PHÂN TÍCH CHI TIẾT

## 📋 TỔNG QUAN

Module "Quản lý lịch hẹn lái thử xe" cho phép Dealer Staff quản lý lịch hẹn lái thử xe điện với khách hàng, bao gồm tạo, cập nhật, hủy lịch, kiểm tra trùng lịch, và gửi thông báo tự động.

---

## 1. BUSINESS FLOW - LUỒNG NGHIỆP VỤ

### 🎯 User Story 1: Dealer Staff tạo lịch hẹn lái thử

**Actors:** Dealer Staff, Customer, System

**Flow:**
```
1. Dealer Staff nhận yêu cầu từ khách hàng (điện thoại/email/trực tiếp)
2. Staff truy cập hệ thống và chọn "Tạo lịch hẹn lái thử"
3. Staff nhập thông tin:
   - Chọn khách hàng (từ danh sách hoặc tạo mới)
   - Chọn mẫu xe muốn lái thử
   - Chọn ngày/giờ lái thử
   - Nhập địa điểm lái thử
   - Chọn thời lượng (default 60 phút)
   - Chọn nhân viên phụ trách (optional)
   - Nhập ghi chú
4. System kiểm tra:
   ✓ Ngày/giờ phải trong tương lai
   ✓ Nhân viên không bị trùng lịch
   ✓ Xe không bị trùng lịch
5. Nếu hợp lệ:
   - System tạo lịch hẹn với status "SCHEDULED"
   - Gửi email/SMS xác nhận cho khách hàng
   - Gửi thông báo cho nhân viên được phân công
6. Staff nhận confirmation và thông báo khách hàng
```

**Business Rules:**
- Một nhân viên không thể có 2 lịch hẹn chồng thời gian
- Một xe không thể được đặt lái thử cùng lúc ở 2 nơi
- Thời gian lái thử tối thiểu: 15 phút
- Thời gian đặt lịch phải trước ít nhất 2 giờ

### 🎯 User Story 2: Dealer Staff cập nhật/hủy lịch hẹn

**Flow Cập Nhật:**
```
1. Staff tìm lịch hẹn cần cập nhật
2. Staff chỉnh sửa:
   - Thời gian mới
   - Mẫu xe mới
   - Nhân viên mới
   - Địa điểm mới
3. System kiểm tra lại trùng lịch
4. Nếu hợp lệ:
   - Cập nhật thông tin
   - Gửi email/SMS thông báo thay đổi cho khách hàng
   - Cập nhật notification cho nhân viên mới (nếu có)
```

**Flow Hủy:**
```
1. Staff chọn lịch hẹn cần hủy
2. Staff nhập lý do hủy
3. System:
   - Đổi status thành "CANCELLED"
   - Lưu lý do hủy và người hủy
   - Gửi email/SMS thông báo hủy cho khách hàng
4. Lịch bị hủy không thể cập nhật lại (chỉ có thể tạo mới)
```

**Business Rules:**
- Không thể cập nhật lịch đã hủy hoặc đã hoàn thành
- Phải có lý do khi hủy lịch
- Khách hàng được thông báo trong vòng 5 phút

### 🎯 User Story 3: Dealer Manager xem toàn bộ lịch hẹn

**Flow:**
```
1. Manager truy cập Dashboard/Calendar View
2. Manager chọn view:
   - Calendar (ngày/tuần/tháng)
   - List view
   - Statistics view
3. Manager áp dụng filters:
   - Theo ngày/tuần/tháng
   - Theo khách hàng
   - Theo mẫu xe
   - Theo nhân viên
   - Theo trạng thái (Scheduled/Confirmed/Completed/Cancelled)
4. System hiển thị:
   - Lịch theo format yêu cầu
   - Màu sắc theo status
   - Thống kê tổng quan
5. Manager phân tích và điều phối:
   - Cân bằng lịch nhân viên
   - Đảm bảo xe luôn sẵn sàng
   - Theo dõi completion rate
```

**Business Rules:**
- Manager có quyền xem toàn bộ lịch của dealer
- Staff chỉ xem lịch của mình hoặc được phân công
- Real-time update khi có thay đổi

---

## 2. DATABASE DESIGN - CẤU TRÚC CSDL

### 📊 Bảng: test_drive_appointments

```sql
CREATE TABLE test_drive_appointments (
    -- Primary Key
    appointment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Foreign Keys
    customer_id BIGINT NOT NULL,
    dealer_id BIGINT NOT NULL,
    model_id BIGINT NOT NULL,
    variant_id BIGINT,
    staff_id BIGINT,
    
    -- Appointment Details
    appointment_date DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    test_drive_location VARCHAR(500) NOT NULL,
    
    -- Status & Tracking
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
        -- SCHEDULED: Đã đặt lịch
        -- CONFIRMED: Đã xác nhận
        -- COMPLETED: Đã hoàn thành
        -- CANCELLED: Đã hủy
    
    -- Cancellation Info
    cancellation_reason TEXT,
    cancelled_by VARCHAR(255),
    cancelled_at DATETIME,
    
    -- Status Timestamps
    confirmed_at DATETIME,
    completed_at DATETIME,
    
    -- Notes
    customer_notes TEXT,
    staff_notes TEXT,
    
    -- Notification Tracking
    notification_sent BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    
    -- Feedback
    feedback_rating INT,
    feedback_comment TEXT,
    
    -- Audit Fields
    created_by VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_appointment_customer 
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    
    -- Indexes for Performance
    INDEX idx_dealer_date (dealer_id, appointment_date),
    INDEX idx_staff_date (staff_id, appointment_date),
    INDEX idx_model_date (model_id, appointment_date),
    INDEX idx_status (status)
);
```

### 🔗 Related Tables

#### customers (đã có)
```sql
- customer_id (PK)
- first_name, last_name
- email, phone
- address
```

#### vehicle_models (trong vehicle-service)
```sql
- model_id (PK)
- model_name
- brand
- thumbnail_url
```

#### vehicle_variants (trong vehicle-service)
```sql
- variant_id (PK)
- model_id (FK)
- variant_name
- color
```

#### users (trong user-service - staff info)
```sql
- user_id (PK - UUID)
- email
- full_name
- phone
- role
```

### 📈 Indexes Explanation

1. **idx_dealer_date**: Tăng tốc query "Lấy lịch hẹn theo dealer trong khoảng thời gian"
2. **idx_staff_date**: Kiểm tra trùng lịch nhân viên nhanh
3. **idx_model_date**: Kiểm tra trùng lịch xe nhanh
4. **idx_status**: Filter theo status (SCHEDULED, CANCELLED, etc.)

---

## 3. API SPECIFICATION - DANH SÁCH ENDPOINTS

### Base URL
```
http://localhost:8082/api/test-drives
```

### 📌 1. Tạo lịch hẹn mới

**Endpoint:** `POST /api/test-drives`

**Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "customerId": 123,
  "dealerId": 5,
  "modelId": 10,
  "variantId": 25,
  "staffId": 7,
  "appointmentDate": "2025-11-05T14:00:00",
  "durationMinutes": 60,
  "testDriveLocation": "Showroom VinFast Hà Nội, 458 Minh Khai",
  "customerNotes": "Khách muốn test trên đường cao tốc",
  "createdBy": "staff@dealer.com"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Test drive appointment created successfully",
  "data": {
    "appointmentId": 501,
    "customerId": 123,
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0912345678",
    "customerEmail": "nguyenvana@email.com",
    "dealerId": 5,
    "dealerName": "VinFast Hà Nội",
    "modelId": 10,
    "modelName": "VF8",
    "variantId": 25,
    "variantName": "VF8 Plus - Xanh",
    "staffId": 7,
    "staffName": "Trần Thị B",
    "appointmentDate": "2025-11-05T14:00:00",
    "endTime": "2025-11-05T15:00:00",
    "durationMinutes": 60,
    "testDriveLocation": "Showroom VinFast Hà Nội, 458 Minh Khai",
    "status": "SCHEDULED",
    "customerNotes": "Khách muốn test trên đường cao tốc",
    "notificationSent": true,
    "createdAt": "2025-11-01T10:30:00"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request - Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "appointmentDate": "Appointment date must be in the future",
    "testDriveLocation": "Test drive location is required"
  }
}

// 409 Conflict - Staff/Vehicle Conflict
{
  "success": false,
  "message": "Staff is not available at this time. Conflicting appointment ID: 498"
}

// 404 Not Found
{
  "success": false,
  "message": "Customer not found with id: 123"
}
```

---

### 📌 2. Cập nhật lịch hẹn

**Endpoint:** `PUT /api/test-drives/{id}`

**Request Body:**
```json
{
  "appointmentDate": "2025-11-05T15:00:00",
  "staffId": 8,
  "testDriveLocation": "Showroom VinFast Hà Nội, 458 Minh Khai",
  "staffNotes": "Đã confirm lại với khách",
  "updatedBy": "staff@dealer.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Test drive appointment updated successfully",
  "data": {
    "appointmentId": 501,
    // ... full appointment details
    "updatedBy": "staff@dealer.com",
    "updatedAt": "2025-11-01T11:00:00"
  }
}
```

---

### 📌 3. Hủy lịch hẹn

**Endpoint:** `DELETE /api/test-drives/{id}/cancel`

**Request Body:**
```json
{
  "cancellationReason": "Khách hàng đột xuất có việc bận, hẹn lại tuần sau",
  "cancelledBy": "staff@dealer.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Test drive appointment cancelled successfully",
  "data": null
}
```

---

### 📌 4. Xác nhận lịch hẹn

**Endpoint:** `PUT /api/test-drives/{id}/confirm`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Test drive appointment confirmed successfully",
  "data": null
}
```

---

### 📌 5. Hoàn thành lịch hẹn

**Endpoint:** `PUT /api/test-drives/{id}/complete`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Test drive appointment completed successfully",
  "data": null
}
```

---

### 📌 6. Lấy chi tiết lịch hẹn

**Endpoint:** `GET /api/test-drives/{id}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "appointmentId": 501,
    "customerId": 123,
    "customerName": "Nguyễn Văn A",
    // ... full details
  }
}
```

---

### 📌 7. Filter lịch hẹn

**Endpoint:** `POST /api/test-drives/filter`

**Request Body:**
```json
{
  "dealerId": 5,
  "statuses": ["SCHEDULED", "CONFIRMED"],
  "startDate": "2025-11-01T00:00:00",
  "endDate": "2025-11-30T23:59:59",
  "staffId": 7,
  "customerName": "Nguyễn"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "appointmentId": 501,
      // ... appointment details
    },
    {
      "appointmentId": 502,
      // ... appointment details
    }
  ]
}
```

---

### 📌 8. Calendar View (cho Dealer Manager)

**Endpoint:** `GET /api/test-drives/calendar`

**Query Parameters:**
```
?dealerId=5
&startDate=2025-11-01T00:00:00
&endDate=2025-11-30T23:59:59
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "appointmentId": 501,
      "title": "Lái thử VF8 - Nguyễn Văn A",
      "start": "2025-11-05T14:00:00",
      "end": "2025-11-05T15:00:00",
      "status": "SCHEDULED",
      "statusColor": "#FFA500",
      "customerId": 123,
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0912345678",
      "modelId": 10,
      "modelName": "VF8",
      "staffId": 7,
      "staffName": "Trần Thị B",
      "location": "Showroom VinFast Hà Nội"
    }
  ]
}
```

**Color Codes:**
- `#FFA500` (Orange): SCHEDULED
- `#4CAF50` (Green): CONFIRMED
- `#2196F3` (Blue): COMPLETED
- `#F44336` (Red): CANCELLED

---

### 📌 9. Statistics (cho Dealer Manager)

**Endpoint:** `GET /api/test-drives/statistics`

**Query Parameters:**
```
?dealerId=5
&startDate=2025-11-01T00:00:00
&endDate=2025-11-30T23:59:59
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalAppointments": 50,
    "scheduledCount": 15,
    "confirmedCount": 10,
    "completedCount": 20,
    "cancelledCount": 5,
    "completionRate": 40.0,
    "cancellationRate": 10.0,
    "appointmentsByModel": {
      "VF8": 25,
      "VF9": 15,
      "VFe34": 10
    },
    "appointmentsByStaff": {
      "Trần Thị B": 20,
      "Lê Văn C": 18,
      "Phạm Thị D": 12
    },
    "appointmentsByDay": {
      "2025-11-05": 8,
      "2025-11-06": 5,
      "2025-11-07": 10
    }
  }
}
```

---

## 4. VALIDATION LOGIC - KIỂM TRA TRÙNG LỊCH

### 🔍 Algorithm: Conflict Detection

#### Kiểm tra trùng lịch nhân viên

```java
// Hai khoảng thời gian [A1, A2] và [B1, B2] trùng nhau nếu:
// A1 < B2 AND A2 > B1

boolean hasConflict = 
    (newStart < existingEnd) && (newEnd > existingStart);
```

**SQL Query:**
```sql
SELECT * FROM test_drive_appointments
WHERE staff_id = ?
  AND status IN ('SCHEDULED', 'CONFIRMED')
  AND appointment_date < ? -- newEnd
  AND DATE_ADD(appointment_date, INTERVAL duration_minutes MINUTE) > ? -- newStart
```

**Logic Flow:**
```
Input:
- staffId: 7
- newStart: 2025-11-05 14:00
- newEnd: 2025-11-05 15:00 (14:00 + 60 phút)

Query tìm các appointment của staff 7:
- Appointment A: 13:00 - 14:30 → CONFLICT (14:00 < 14:30 AND 15:00 > 13:00)
- Appointment B: 15:30 - 16:30 → NO CONFLICT
- Appointment C: 12:00 - 13:00 → NO CONFLICT

Result: CONFLICT với Appointment A
```

#### Kiểm tra trùng lịch xe

```sql
SELECT * FROM test_drive_appointments
WHERE (model_id = ? OR variant_id = ?)
  AND status IN ('SCHEDULED', 'CONFIRMED')
  AND appointment_date < ? -- newEnd
  AND DATE_ADD(appointment_date, INTERVAL duration_minutes MINUTE) > ? -- newStart
```

**Business Rules:**
1. Nếu chỉ đặt `modelId` (không có variantId): Kiểm tra có xe nào của model đó đang được đặt không
2. Nếu đặt cả `variantId`: Kiểm tra variant cụ thể đó có đang được đặt không
3. Nếu tìm thấy conflict: Reject và trả về appointment_id bị trùng

### 🛡️ Additional Validations

1. **Thời gian trong tương lai:**
```java
if (appointmentDate.isBefore(LocalDateTime.now().plusHours(2))) {
    throw new ValidationException("Appointment must be at least 2 hours from now");
}
```

2. **Thời lượng tối thiểu:**
```java
if (durationMinutes < 15) {
    throw new ValidationException("Duration must be at least 15 minutes");
}
```

3. **Business hours:**
```java
int hour = appointmentDate.getHour();
if (hour < 8 || hour > 18) {
    throw new ValidationException("Appointments only available from 8:00 to 18:00");
}
```

---

## 5. NOTIFICATION LOGIC - GỬI EMAIL/SMS

### 📧 Email Integration Options

#### Option 1: SendGrid (Recommended)
```java
// Add dependency
<dependency>
    <groupId>com.sendgrid</groupId>
    <artifactId>sendgrid-java</artifactId>
    <version>4.9.3</version>
</dependency>

// Configuration
sendgrid.api.key=SG.xxxxxxxxxxxxxxxxxxxxx
sendgrid.from.email=noreply@evdealer.com
sendgrid.from.name=EV Dealer System
```

**Code Example:**
```java
@Service
public class SendGridEmailService {
    
    @Value("${sendgrid.api.key}")
    private String apiKey;
    
    public void sendEmail(String to, String subject, String htmlContent) {
        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();
        
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            
            Mail mail = new Mail();
            mail.setFrom(new Email("noreply@evdealer.com", "EV Dealer"));
            mail.setSubject(subject);
            mail.addContent(new Content("text/html", htmlContent));
            mail.addPersonalization(new Personalization()
                .addTo(new Email(to)));
            
            request.setBody(mail.build());
            Response response = sg.api(request);
            
            log.info("Email sent successfully: {}", response.getStatusCode());
        } catch (IOException e) {
            log.error("Failed to send email", e);
        }
    }
}
```

#### Option 2: AWS SES (Simple Email Service)
```java
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-ses</artifactId>
    <version>1.12.x</version>
</dependency>
```

#### Option 3: SMTP Server (Gmail, Outlook)
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### 📱 SMS Integration Options

#### Option 1: Twilio (Recommended)
```java
<dependency>
    <groupId>com.twilio.sdk</groupId>
    <artifactId>twilio</artifactId>
    <version>9.2.0</version>
</dependency>

// Configuration
twilio.account.sid=ACxxxxxxxxxxxxxxxxxxxxx
twilio.auth.token=your_auth_token
twilio.phone.number=+84xxxxxxxxx
```

**Code Example:**
```java
@Service
public class TwilioSMSService {
    
    @Value("${twilio.account.sid}")
    private String accountSid;
    
    @Value("${twilio.auth.token}")
    private String authToken;
    
    @Value("${twilio.phone.number}")
    private String fromNumber;
    
    public void sendSMS(String to, String message) {
        Twilio.init(accountSid, authToken);
        
        Message.creator(
            new PhoneNumber(to),
            new PhoneNumber(fromNumber),
            message
        ).create();
        
        log.info("SMS sent to: {}", to);
    }
}
```

#### Option 2: AWS SNS (Simple Notification Service)

#### Option 3: Local Provider (Vietnam)
- VNPT SMS
- Viettel SMS
- FPT SMS

### 🔔 Push Notification: Firebase Cloud Messaging (FCM)

```java
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.1.1</version>
</dependency>
```

**Initialization:**
```java
@PostConstruct
public void initialize() {
    try {
        FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(
                new FileInputStream("firebase-service-account.json")))
            .build();
        
        FirebaseApp.initializeApp(options);
    } catch (IOException e) {
        log.error("Failed to initialize Firebase", e);
    }
}
```

**Send Notification:**
```java
public void sendPushNotification(String fcmToken, String title, String body) {
    Message message = Message.builder()
        .setToken(fcmToken)
        .setNotification(Notification.builder()
            .setTitle(title)
            .setBody(body)
            .build())
        .build();
    
    FirebaseMessaging.getInstance().send(message);
}
```

### 📨 Notification Templates

#### Template 1: Confirmation Email
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1976D2; color: white; padding: 20px; }
        .content { padding: 20px; background: #f5f5f5; }
        .button { background: #4CAF50; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Xác nhận lịch hẹn lái thử xe</h2>
        </div>
        <div class="content">
            <p>Kính gửi <strong>{{customerName}}</strong>,</p>
            <p>Lịch hẹn lái thử xe của bạn đã được xác nhận:</p>
            <ul>
                <li>📅 Thời gian: <strong>{{appointmentDate}}</strong></li>
                <li>⏱️ Thời lượng: <strong>{{duration}} phút</strong></li>
                <li>📍 Địa điểm: <strong>{{location}}</strong></li>
                <li>🚗 Mẫu xe: <strong>{{modelName}}</strong></li>
                <li>👤 Nhân viên: <strong>{{staffName}}</strong></li>
            </ul>
            <p>Vui lòng đến đúng giờ. Nếu có thay đổi, vui lòng liên hệ: {{phone}}</p>
            <a href="{{cancelLink}}" class="button">Hủy lịch hẹn</a>
        </div>
    </div>
</body>
</html>
```

#### Template 2: SMS Confirmation
```
EVDMS: Lịch hẹn lái thử xe {{modelName}} đã xác nhận.
Thời gian: {{appointmentDate}}
Địa điểm: {{location}}
Hotline: {{phone}}
```

### 📅 Reminder System (Scheduled Job)

```java
@Component
public class AppointmentReminderScheduler {
    
    @Scheduled(cron = "0 0 10 * * *") // Chạy lúc 10:00 mỗi ngày
    public void sendReminders() {
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);
        LocalDateTime startOfDay = tomorrow.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        List<TestDriveAppointment> appointments = 
            appointmentRepository.findAppointmentsNeedingReminder(startOfDay, endOfDay);
        
        for (TestDriveAppointment appointment : appointments) {
            // Gửi reminder
            notificationService.sendAppointmentReminder(appointment, ...);
            
            // Đánh dấu đã gửi
            appointment.setReminderSent(true);
            appointmentRepository.save(appointment);
        }
        
        log.info("Sent {} reminders", appointments.size());
    }
}
```

---

## 6. UI/UX SUGGESTION - GỢI Ý GIAO DIỆN

### 🎨 1. Form Tạo Lịch Hẹn (Dealer Staff)

**Layout:** Modal hoặc Side Panel

**Components:**

```
┌─────────────────────────────────────────┐
│  📝 TẠO LỊCH HẸN LÁI THỬ                │
├─────────────────────────────────────────┤
│                                          │
│  👤 Khách hàng *                         │
│  [Search/Select Customer ▼]             │
│  [+ Tạo khách hàng mới]                 │
│                                          │
│  🚗 Mẫu xe *                             │
│  [Select Model ▼] [Select Variant ▼]   │
│                                          │
│  📅 Ngày/Giờ *                           │
│  [Date Picker] [Time Picker]            │
│                                          │
│  ⏱️ Thời lượng (phút)                    │
│  [⬜ 30] [✓ 60] [⬜ 90] [⬜ 120]         │
│                                          │
│  📍 Địa điểm lái thử *                   │
│  [Textarea]                              │
│                                          │
│  👔 Nhân viên phụ trách                  │
│  [Select Staff ▼]                       │
│                                          │
│  💬 Ghi chú                              │
│  [Textarea]                              │
│                                          │
│  [Hủy]              [Kiểm tra lịch]     │
│                     [✓ Tạo lịch hẹn]    │
└─────────────────────────────────────────┘
```

**Features:**
- Auto-complete cho customer search
- Real-time validation
- "Kiểm tra lịch" button: Hiển thị lịch staff và xe trong ngày đó
- Toast notification khi tạo thành công
- Error message rõ ràng nếu trùng lịch

### 🗓️ 2. Calendar View (Dealer Manager)

**Library:** FullCalendar.js, React Big Calendar, hoặc custom

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  📊 QUẢN LÝ LỊCH HẸN LÁI THỬ                            │
├─────────────────────────────────────────────────────────┤
│  Filters:                                               │
│  [Dealer ▼] [Staff ▼] [Model ▼] [Status ▼]            │
│                                                          │
│  View: [Day] [Week] [Month] [List]                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│      Monday   Tuesday   Wednesday  Thursday   Friday    │
│  8:00                                                    │
│  9:00  ┌───────┐                   ┌────────┐          │
│ 10:00  │VF8-A  │  ┌──────┐        │VF9-C   │          │
│ 11:00  │Staff B│  │VFe34 │        │Staff D │          │
│ 12:00  └───────┘  │Staff │        └────────┘          │
│ 13:00             └──────┘                              │
│ 14:00  ┌──────────┐                                     │
│ 15:00  │VF8-E     │  ┌─────┐                          │
│ 16:00  │Staff F   │  │VF9  │                          │
│ 17:00  └──────────┘  └─────┘                          │
│ 18:00                                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Color Coding:**
- 🟠 Orange: SCHEDULED
- 🟢 Green: CONFIRMED
- 🔵 Blue: COMPLETED
- 🔴 Red: CANCELLED

**Interactions:**
- Click on appointment → Show detail modal
- Drag & drop để reschedule (nếu không trùng lịch)
- Right-click → Context menu (Edit, Cancel, Confirm, Complete)
- Hover → Tooltip hiển thị quick info

### 📋 3. List View với Filters

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  🔍 Filters                                                   │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │
│  │Start Date│End Date  │Staff     │Model     │Status    │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘   │
│  [Search customer name...]                      [Export CSV] │
├──────────────────────────────────────────────────────────────┤
│  ✓  ID  Customer   Model    Date/Time    Staff    Status     │
│  [ ] 501 Nguyễn A  VF8      05/11 14:00  Trần B  🟠SCHEDULED │
│  [ ] 502 Lê B      VF9      05/11 15:30  Phạm C  🟢CONFIRMED │
│  [ ] 503 Hoàng C   VFe34    06/11 10:00  Trần B  🔴CANCELLED │
│  [ ] 504 Vũ D      VF8      06/11 14:00  Lê D    🔵COMPLETED │
│                                                                │
│  Showing 1-10 of 50                            [< 1 2 3 4 >] │
└──────────────────────────────────────────────────────────────┘
```

**Actions:**
- Bulk actions: Cancel selected, Export selected
- Row click → Detail view
- Action buttons: Edit, Cancel, Confirm, Complete
- Sort by any column
- Pagination

### 📊 4. Statistics Dashboard

**Layout:**

```
┌──────────────────────────────────────────────────┐
│  📈 THỐNG KÊ LỊCH HẸN                            │
│  From: [01/11/2025] To: [30/11/2025] [Filter]   │
├──────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │  50  │  │  20  │  │  40% │  │  10% │        │
│  │Total │  │Comp. │  │Rate  │  │Cancel│        │
│  └──────┘  └──────┘  └──────┘  └──────┘        │
│                                                   │
│  📊 Appointments by Model                        │
│  ████████████████████ VF8 (25)                   │
│  ████████████ VF9 (15)                           │
│  ████████ VFe34 (10)                             │
│                                                   │
│  👥 Appointments by Staff                        │
│  ████████████████ Trần B (20)                    │
│  ██████████████ Lê C (18)                        │
│  ██████████ Phạm D (12)                          │
│                                                   │
│  📅 Appointments by Day (Line Chart)             │
│  [Line chart showing daily trends]               │
└──────────────────────────────────────────────────┘
```

### 📱 5. Mobile Responsive

**Considerations:**
- Bottom sheet cho forms
- Swipe actions (swipe right: edit, swipe left: cancel)
- Mobile-optimized calendar (Day view mặc định)
- Push notifications

---

## 7. TEST SCENARIOS - TÌNH HUỐNG KIỂM THỬ

### 🧪 Test Cases cho User Story 1: Tạo lịch hẹn

#### TC01: Tạo lịch hẹn thành công
```
Given: Staff đăng nhập với quyền DEALER_STAFF
  And: Khách hàng ID 123 tồn tại
  And: Mẫu xe ID 10 tồn tại
  And: Staff ID 7 không có lịch trùng
  And: Xe không có lịch trùng
When: Staff tạo lịch hẹn:
  - Customer: 123
  - Model: 10
  - Date: 05/11/2025 14:00
  - Duration: 60 minutes
  - Location: "Showroom HN"
Then: 
  ✓ Lịch hẹn được tạo với status "SCHEDULED"
  ✓ Email xác nhận được gửi đến customer
  ✓ Notification được gửi đến staff
  ✓ Response 201 Created
```

#### TC02: Tạo lịch hẹn - Trùng lịch nhân viên
```
Given: Staff ID 7 đã có lịch 14:00-15:00
When: Tạo lịch mới cho Staff 7 từ 14:30-15:30
Then: 
  ✗ Response 409 Conflict
  ✗ Error message: "Staff is not available at this time"
  ✗ Không tạo lịch
  ✗ Không gửi notification
```

#### TC03: Tạo lịch hẹn - Trùng lịch xe
```
Given: VF8 (Model 10) đã có lịch 14:00-15:00
When: Tạo lịch mới cho VF8 từ 14:30-15:30
Then: 
  ✗ Response 409 Conflict
  ✗ Error message: "Vehicle is not available at this time"
```

#### TC04: Tạo lịch hẹn - Thời gian trong quá khứ
```
When: Tạo lịch với appointmentDate = "2025-10-30T14:00" (quá khứ)
Then: 
  ✗ Response 400 Bad Request
  ✗ Error: "Appointment date must be in the future"
```

#### TC05: Tạo lịch hẹn - Thời lượng không hợp lệ
```
When: Tạo lịch với duration = 10 minutes (< 15)
Then: 
  ✗ Response 400 Bad Request
  ✗ Error: "Duration must be at least 15 minutes"
```

#### TC06: Tạo lịch hẹn - Customer không tồn tại
```
When: Tạo lịch với customerId = 9999 (không tồn tại)
Then: 
  ✗ Response 404 Not Found
  ✗ Error: "Customer not found with id: 9999"
```

### 🧪 Test Cases cho User Story 2: Cập nhật/Hủy lịch hẹn

#### TC07: Cập nhật lịch hẹn thành công
```
Given: Appointment 501 tồn tại với status "SCHEDULED"
When: Cập nhật thời gian từ 14:00 sang 15:00
  And: Không có conflict
Then: 
  ✓ Appointment được cập nhật
  ✓ Email thông báo thay đổi được gửi
  ✓ Response 200 OK
```

#### TC08: Cập nhật lịch đã hủy
```
Given: Appointment 502 có status "CANCELLED"
When: Cập nhật thời gian
Then: 
  ✗ Response 400 Bad Request
  ✗ Error: "Cannot update cancelled or completed appointment"
```

#### TC09: Hủy lịch hẹn thành công
```
Given: Appointment 501 có status "SCHEDULED"
When: Hủy lịch với lý do "Khách bận"
Then: 
  ✓ Status đổi thành "CANCELLED"
  ✓ Lưu cancellation_reason và cancelled_by
  ✓ Email thông báo hủy được gửi
  ✓ Response 200 OK
```

#### TC10: Hủy lịch đã hủy rồi
```
Given: Appointment 502 đã có status "CANCELLED"
When: Hủy lại lần nữa
Then: 
  ✗ Response 400 Bad Request
  ✗ Error: "Appointment is already cancelled"
```

### 🧪 Test Cases cho User Story 3: Calendar View & Filters

#### TC11: Lấy calendar view theo tuần
```
Given: Manager đăng nhập
  And: Dealer 5 có 10 appointments trong tuần này
When: GET /calendar?dealerId=5&startDate=...&endDate=...
Then: 
  ✓ Trả về 10 appointments
  ✓ Mỗi appointment có title, start, end, statusColor
  ✓ Response 200 OK
```

#### TC12: Filter theo status
```
When: Filter với statuses=["SCHEDULED", "CONFIRMED"]
Then: 
  ✓ Chỉ trả về appointments có status SCHEDULED hoặc CONFIRMED
  ✓ Không có CANCELLED hoặc COMPLETED
```

#### TC13: Filter theo staff
```
When: Filter với staffId=7
Then: 
  ✓ Chỉ trả về appointments của Staff 7
```

#### TC14: Filter theo customer name
```
When: Filter với customerName="Nguyễn"
Then: 
  ✓ Trả về tất cả appointments có customer name chứa "Nguyễn"
```

#### TC15: Lấy statistics
```
When: GET /statistics?dealerId=5&startDate=...&endDate=...
Then: 
  ✓ Trả về totalAppointments, completionRate, cancellationRate
  ✓ Trả về breakdown by model, staff, day
  ✓ Response 200 OK
```

### 🧪 Integration Tests

#### IT01: End-to-end flow
```
1. Tạo customer mới
2. Tạo appointment cho customer
3. Verify email đã gửi
4. Cập nhật appointment
5. Verify email update đã gửi
6. Hủy appointment
7. Verify email cancellation đã gửi
8. Kiểm tra appointment trong database có đúng status
```

#### IT02: Conflict detection
```
1. Tạo appointment A: Staff 7, 14:00-15:00
2. Tạo appointment B: Staff 7, 14:30-15:30
3. Verify B bị reject với conflict error
4. Tạo appointment C: Staff 7, 15:30-16:30
5. Verify C được tạo thành công (không conflict)
```

### 🧪 Performance Tests

#### PT01: Load test - Concurrent creation
```
- 100 users đồng thời tạo appointments
- Verify không có duplicate
- Verify conflict detection vẫn hoạt động
```

#### PT02: Calendar view performance
```
- Dealer có 1000 appointments
- Load calendar view cho tháng
- Response time < 500ms
```

### 🧪 Security Tests

#### ST01: Authorization
```
- Customer không thể xem appointments của dealer khác
- Staff không thể xem appointments của dealer khác
- Manager có thể xem tất cả appointments của dealer mình
```

#### ST02: JWT validation
```
- Request không có token → 401 Unauthorized
- Token expired → 401 Unauthorized
- Token hợp lệ → 200 OK
```

---

## 8. DEPLOYMENT & CONFIGURATION

### application.properties
```properties
# Notification Settings
notification.enabled=true
notification.service.url=http://payment-service:8085/api/notifications

# Email Settings (SendGrid)
sendgrid.api.key=${SENDGRID_API_KEY}
sendgrid.from.email=noreply@evdealer.com
sendgrid.from.name=EV Dealer System

# SMS Settings (Twilio)
twilio.account.sid=${TWILIO_ACCOUNT_SID}
twilio.auth.token=${TWILIO_AUTH_TOKEN}
twilio.phone.number=+84xxxxxxxxx

# Business Rules
testdrive.min.duration.minutes=15
testdrive.max.duration.minutes=240
testdrive.min.advance.hours=2
testdrive.business.hours.start=8
testdrive.business.hours.end=18

# Reminder Settings
reminder.schedule.cron=0 0 10 * * *
reminder.hours.before=24
```

---

## 9. FUTURE ENHANCEMENTS

1. **Auto-assignment Staff**: Tự động assign staff dựa trên availability
2. **Customer Self-booking**: Khách hàng tự đặt lịch qua portal
3. **Video call integration**: Lái thử online qua video call
4. **Rating & Review**: Khách hàng đánh giá sau khi lái thử
5. **AI Recommendation**: Gợi ý mẫu xe phù hợp dựa trên lịch sử
6. **Multi-language**: Hỗ trợ tiếng Anh, tiếng Việt
7. **Mobile App**: Native app cho iOS/Android

---

## 📚 REFERENCES

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [SendGrid API](https://docs.sendgrid.com/)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [FullCalendar.js](https://fullcalendar.io/docs)
- [React Big Calendar](https://jquense.github.io/react-big-calendar/)

---

**Document Version:** 1.0  
**Last Updated:** November 1, 2025  
**Author:** AI Business Analyst Assistant  
**Review Status:** ✅ Ready for Implementation
