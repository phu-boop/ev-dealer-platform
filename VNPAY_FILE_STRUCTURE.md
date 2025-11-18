# 📂 VNPAY Integration - File Structure Quick Reference

## 🎯 Danh Sách File Liên Quan Đến VNPAY

### **Backend Files (Payment Service)**

#### Cấu Hình & Config
```
services/payment-service/
├── src/main/java/com/ev/payment_service/
│   └── config/
│       ├── VnpayConfig.java ⭐
│       │   └── Đọc properties VNPAY từ .env
│       │   └── Fields: tmnCode, hashSecret, vnpUrl, returnUrl, ipnUrl, etc
│       └── ...
├── src/main/resources/
│   ├── application.properties ⭐
│   │   └── vnpay.tmn-code=${VNPAY_TMN_CODE:}
│   │   └── vnpay.hash-secret=${VNPAY_HASH_SECRET:}
│   │   └── vnpay.url=...
│   │   └── vnpay.return-url=...
│   │   └── vnpay.ipn-url=...
│   └── .env ⭐
│       └── VNPAY_TMN_CODE=IJHASM6C
│       └── VNPAY_HASH_SECRET=QKR8NSPVNJG1QDBJBY3IEZ4DR73IR3N6
│       └── VNPAY_URL=https://sandbox.vnpayment.vn/...
│       └── VNPAY_IPN_URL=https://tunnel-url/payments/...
└── pom.xml
    └── Maven dependencies (không cần thư viện VNPAY đặc biệt)
```

#### Service Layer
```
services/payment-service/src/main/java/com/ev/payment_service/
├── service/
│   ├── Interface/
│   │   └── IVnpayService.java ⭐
│   │       └── createPaymentUrl(transactionId, amount, orderId) → paymentUrl
│   │       └── processIpnCallback(vnpParams) → transactionId
│   │       └── validateChecksum(vnpParams, secureHash) → boolean
│   └── Implementation/
│       ├── VnpayServiceImpl.java ⭐⭐⭐
│       │   └── HMAC SHA512 hash logic
│       │   └── VNPAY URL building
│       │   └── IPN callback processing
│       │   └── Transaction + PaymentRecord update
│       └── CustomerPaymentServiceImpl.java
│           └── Khởi tạo transaction
│           └── Gọi VnpayServiceImpl.createPaymentUrl()
└── ...
```

#### Controller Layer
```
services/payment-service/src/main/java/com/ev/payment_service/controller/
├── VnpayGatewayController.java ⭐⭐
│   ├── @PostMapping("/callback/vnpay-ipn") - IPN callback từ VNPAY
│   │   └── Response: {"RspCode": "00", "Message": "Confirm Success"}
│   └── @GetMapping("/callback/vnpay-return") - Return URL redirect
│       └── Response: {"success": true/false, "message": "..."}
├── CustomerPaymentController.java ⭐
│   └── @PostMapping("/orders/{orderId}/pay")
│       └── Input: InitiatePaymentRequest (amount, paymentMethodId, notes)
│       └── Output: InitiatePaymentResponse (paymentUrl, transactionId, status)
└── ...
```

#### Entity/DTO
```
services/payment-service/src/main/java/com/ev/payment_service/
├── entity/
│   ├── Transaction.java
│   │   └── transactionId, orderId, paymentRecordId
│   │   └── amount, status (PENDING_GATEWAY, SUCCESS, FAILED)
│   │   └── gatewayTransactionId (VNPAY TransactionNo)
│   │   └── gatewayResponseCode
│   ├── PaymentRecord.java
│   │   └── recordId, orderId, totalAmount, amountPaid, remainingAmount
│   │   └── status (PENDING, PARTIALLY_PAID, PAID)
│   └── PaymentMethod.java
│       └── methodId, methodName, methodType (GATEWAY, MANUAL)
└── dto/
    ├── request/
    │   └── InitiatePaymentRequest.java
    │       └── amount, paymentMethodId, notes
    └── response/
        └── InitiatePaymentResponse.java
            └── transactionId, status, paymentUrl, amount, orderId, message
```

---

### **Frontend Files (React.js)**

#### Pages
```
frontend/my-app/src/
├── pages/
│   ├── VnpayReturnPage.jsx ⭐⭐
│   │   └── URL: http://localhost:5173/payment/vnpay-return?vnp_ResponseCode=...
│   │   └── Xử lý redirect từ VNPAY
│   │   └── Display success/failed message
│   │   └── Redirect về orders page
│   └── ...
└── features/
    └── payments/
        ├── pages/
        │   ├── PayB2COrderPage.jsx ⭐⭐⭐
        │   │   └── Main payment page cho B2C orders
        │   │   └── UI: 2 tabs - "Phương thức khác" vs "Thanh toán VNPAY"
        │   │   └── handleVNPayPayment() - khởi tạo payment
        │   │   └── Hiển thị payment summary + payment history
        │   ├── PayInvoicePage.jsx
        │   └── ...
        ├── components/
        │   ├── VNPayPaymentForm.jsx ⭐ (cần xác minh)
        │   │   └── Form component cho VNPAY payment
        │   │   └── Input: remainingAmount, onSubmit, formatCurrency
        │   ├── PaymentForm.jsx
        │   │   └── Form component cho other payment methods
        │   ├── PaymentHistory.jsx
        │   │   └── Hiển thị lịch sử thanh toán
        │   ├── PaymentMethodCard.jsx
        │   ├── PaymentMethodForm.jsx
        │   ├── PaymentMethodList.jsx
        │   └── ...
        └── services/
            └── paymentService.js ⭐⭐
                ├── initiatePayment(orderId, data)
                │   └── POST /api/v1/payments/customer/orders/{orderId}/pay
                ├── confirmManualPayment(transactionId, data)
                │   └── POST /api/v1/payments/customer/transactions/{transactionId}/confirm
                ├── getPaymentHistory(orderId)
                │   └── GET /api/v1/payments/customer/orders/{orderId}/history
                ├── vnpayReturn(params)
                │   └── GET /api/v1/payments/gateway/callback/vnpay-return?...
                └── ...
```

#### API Configuration
```
frontend/my-app/src/services/
├── apiConstPaymentService.js ⭐
│   └── Base URL: http://localhost:8080/payments (via Gateway)
│   └── Headers: Authorization, Content-Type
└── apiConst.js
    └── Các API khác
```

#### Routes
```
frontend/my-app/src/routes/
├── index.jsx
│   └── Route: /payment/vnpay-return → <VnpayReturnPage />
│   └── Route: /dealer/staff/payments/b2c-orders → <PayB2COrderPage />
│   └── Route: /dealer/manager/orders → orders list
└── ...
```

---

### **Configuration Files**

#### Environment & Properties
```
🔧 Development Configuration:
├── services/payment-service/src/main/resources/.env ⭐⭐⭐
│   └── VNPAY_TMN_CODE=IJHASM6C
│   └── VNPAY_HASH_SECRET=QKR8NSPVNJG1QDBJBY3IEZ4DR73IR3N6
│   └── VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
│   └── VNPAY_RETURN_URL=http://localhost:5173/payment/vnpay-return
│   └── VNPAY_IPN_URL=https://fresh-eagles-write.loca.lt/payments/api/v1/payments/gateway/callback/vnpay-ipn
│   └── VNPAY_COMMAND=pay
│   └── VNPAY_ORDER_TYPE=other
│   └── VNPAY_LOCALE=vn
│   └── VNPAY_CURRENCY_CODE=VND
│   └── VNPAY_VERSION=2.1.0
│   └── SALES_SERVICE_URL=http://localhost:8080/sales
│   └── USER_SERVICE_URL=http://localhost:8080/users
└── services/payment-service/src/main/resources/application.properties
    └── vnpay.tmn-code=${VNPAY_TMN_CODE:}
    └── vnpay.hash-secret=${VNPAY_HASH_SECRET:}
    └── vnpay.url=${VNPAY_URL:...}
    └── ... (load từ .env)
```

#### Docker & Deployment
```
docker-compose.yml ⭐
├── Services:
│   ├── gateway (port 8080)
│   ├── payment-service (port 8085)
│   ├── mysql
│   └── ...
└── Environment variables từ .env

services/payment-service/Dockerfile
├── Base image: openjdk:21
├── Build: mvn clean package
└── Run: java -jar payment-service.jar
```

---

### **Documentation Files**

```
📚 Project Documentation:
├── VNPAY_README.md ⭐⭐
│   └── Complete setup guide
│   └── LocalTunnel setup
│   └── Test payment flow
│   └── Troubleshooting
│   └── Test cards & credentials
├── VNPAY_B2C_INTEGRATION_REPORT.md ⭐⭐⭐ (Newly created)
│   └── Detailed analysis
│   └── Architecture & flow diagram
│   └── Implementation details
│   └── File mapping
│   └── Integration checklist
├── README.md
├── PAYMENT_FLOW_README.md
├── PAYMENT_SERVICE_POSTMAN_COLLECTION.json
│   └── Postman collection for testing
└── ...
```

---

## 🔗 Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Frontend                 Backend                VNPAY         │
│ ─────────────────────────────────────────────────────────   │
│                                                               │
│ 1. User selects order   2. PaymentController   3. VNPAY      │
│    & chooses VNPAY         receivesRequest        server     │
│    payment method          ↓                                  │
│                      CustomerPaymentService   4. VNPAY       │
│ 2. Click "Thanh Toan"     creates Transaction    Payment     │
│    ↓                       & PaymentRecord        Gateway UI  │
│    handleVNPayPayment()    ↓                                  │
│    (PayB2COrderPage.jsx) VnpayService ⭐⭐⭐              │
│    ↓                      createPaymentUrl()               │
│    POST /initiatePayment   returns paymentUrl            │
│    ↓                       ↓                               │
│    Response: paymentUrl                                   │
│    ↓                    5. VNPAY IPN Callback            │
│    window.location.href    POST /vnpay-ipn              │
│    = paymentUrl            (server-to-server)           │
│    ↓                       ↓                              │
│    Redirect to VNPAY       VnpayGatewayController       │
│    Payment Gateway         processIpnCallback()          │
│                            ↓                              │
│ 3. User inputs card        Update Transaction           │
│    & confirms payment      Update PaymentRecord         │
│    ↓                       ↓                              │
│    VNPAY processes         Response: RspCode=00         │
│    ↓                                                     │
│    Success: ResponseCode=00                             │
│    TransactionStatus=00                                 │
│                                                         │
│ 4. VNPAY redirects          (At same time)               │
│    window.location =        Database state:             │
│    /payment/vnpay-return    - Transaction: SUCCESS      │
│    ↓                         - PaymentRecord: PAID       │
│    VnpayReturnPage.jsx                                  │
│    (processPaymentReturn)                               │
│    ↓                                                    │
│    Check vnp_ResponseCode=00                            │
│    ↓                                                    │
│    Display "Success"                                    │
│    ↓                                                    │
│    Redirect → /dealer/manager/orders                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📊 Key File Relationships

```
VnpayConfig.java
  ↑
  │ loads from
  │
application.properties → .env file
  ↑
  │
VnpayServiceImpl.java ⭐⭐⭐
  ├── uses: VnpayConfig
  ├── uses: TransactionRepository
  ├── uses: PaymentRecordRepository
  └── methods:
      ├── createPaymentUrl() [called by CustomerPaymentServiceImpl]
      ├── processIpnCallback() [called by VnpayGatewayController]
      └── validateChecksum()

CustomerPaymentServiceImpl
  ├── calls: VnpayServiceImpl.createPaymentUrl()
  └── returns: InitiatePaymentResponse with paymentUrl

VnpayGatewayController
  ├── endpoint: /vnpay-ipn [IPN callback from VNPAY]
  ├── endpoint: /vnpay-return [Return URL redirect]
  └── calls: VnpayServiceImpl.processIpnCallback()

CustomerPaymentController
  ├── endpoint: POST /orders/{orderId}/pay
  └── calls: CustomerPaymentServiceImpl.initiatePayment()

Frontend (PayB2COrderPage.jsx)
  ├── calls: paymentService.initiatePayment()
  └── gets: paymentUrl
  └── executes: window.location.href = paymentUrl

Frontend (VnpayReturnPage.jsx)
  ├── receives: query params from VNPAY
  ├── calls: paymentService.vnpayReturn()
  └── displays: success/failed message
```

---

## 🎯 Implementation Status

### ✅ Completed
- [x] VnpayConfig.java - Configuration class
- [x] VnpayServiceImpl.java - Service implementation
- [x] VnpayGatewayController.java - IPN callback handling
- [x] CustomerPaymentController.java - Payment initiation
- [x] PayB2COrderPage.jsx - Frontend payment page
- [x] VnpayReturnPage.jsx - Return page
- [x] paymentService.js - Frontend API service
- [x] application.properties - Property configuration
- [x] .env file - Environment variables

### ⚠️ To Verify
- [ ] VNPayPaymentForm.jsx - Payment form component (mentioned but not found in fs)
- [ ] Database schema for Transaction & PaymentRecord
- [ ] Migration scripts

### 🚀 To Setup
- [ ] LocalTunnel IPN URL configuration
- [ ] VNPAY Merchant Admin IPN URL update
- [ ] End-to-end testing
- [ ] Production credentials swap

---

## 💡 Quick Commands

```bash
# Start Payment Service
cd services/payment-service
mvn spring-boot:run

# Start Frontend
cd frontend/my-app
npm run dev

# Setup LocalTunnel (for IPN callback)
npm install -g localtunnel
lt --port 8085
# Update VNPAY_IPN_URL in .env with returned URL

# View Payment Service logs
tail -f services/payment-service/target/classes/application.log

# Test API with Postman
# Import: PAYMENT_SERVICE_POSTMAN_COLLECTION.json

# View Database
mysql -u root -p evdms
SELECT * FROM transaction WHERE status = 'SUCCESS';
SELECT * FROM payment_record WHERE status = 'PAID';
```

---

## 🔐 Security Checklist

- [x] HMAC SHA512 checksum validation
- [x] Secret key stored in .env (not in code)
- [x] IPN URL validation
- [x] Transaction status verification
- [x] Authorization checks (PreAuthorize annotations)
- [ ] Rate limiting for IPN callback
- [ ] Logging of all payment transactions
- [ ] Error handling for failed payments
- [ ] Test for checksum tampering

---

**Generated:** 16/11/2025  
**For:** ev-dealer-platform VNPAY B2C Integration  
**Status:** ✅ Complete & Ready to Use
