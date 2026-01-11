# 🔌 VMS-Commerce API Reference - Phase 3 Endpoints

## Base URLs
- **Customer Service:** `http://localhost:8082/customers/api`
- **Vehicle Service:** `http://localhost:8081/vehicles`
- **Payment Service:** `http://localhost:8083/api/payment`

---

## 🚗 Test Drive Appointments

### Get Customer's Appointments
```http
GET /customers/api/test-drives/customer/{customerId}
Authorization: Bearer {token}
```

### Create Test Drive Appointment
```http
POST /customers/api/test-drives
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "uuid",
  "variantId": 1,
  "dealerId": "uuid",
  "appointmentDate": "2026-01-15",
  "appointmentTime": "14:00",
  "notes": "Interested in test driving the VF e34"
}
```

### Get Appointment by ID
```http
GET /customers/api/test-drives/{id}
Authorization: Bearer {token}
```

### Update Appointment Status
```http
PUT /customers/api/test-drives/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "CONFIRMED"
}
```

### Cancel Appointment
```http
PUT /customers/api/test-drives/{id}/cancel
Authorization: Bearer {token}
```

---

## ⭐ Vehicle Reviews

### Create Review
```http
POST /customers/api/reviews
Authorization: Bearer {token} (CUSTOMER role)
Content-Type: application/json

{
  "customerId": "uuid",
  "modelId": 1,
  "variantId": 1,
  "vehicleModelName": "VinFast VF e34",
  "vehicleVariantName": "Eco",
  "rating": 5,
  "title": "Excellent electric vehicle!",
  "reviewText": "Very satisfied with the performance and range...",
  "performanceRating": 5,
  "comfortRating": 4,
  "designRating": 5,
  "valueRating": 4
}
```

### Get Reviews by Model
```http
GET /customers/api/reviews/model/{modelId}
```
**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "reviewId": 1,
      "customerName": "John Doe",
      "rating": 5,
      "title": "Excellent!",
      "reviewText": "Great car...",
      "status": "APPROVED",
      "helpfulCount": 10,
      "isVerifiedPurchase": true,
      "createdAt": "2026-01-10T10:00:00"
    }
  ]
}
```

### Get Rating Summary
```http
GET /customers/api/reviews/model/{modelId}/summary
```
**Response:**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalReviews": 25,
    "ratingDistribution": {
      "5": 15,
      "4": 8,
      "3": 2,
      "2": 0,
      "1": 0
    },
    "ratingPercentages": {
      "5": 60.0,
      "4": 32.0,
      "3": 8.0,
      "2": 0.0,
      "1": 0.0
    }
  }
}
```

### Get Customer's Reviews
```http
GET /customers/api/reviews/customer/{customerId}
Authorization: Bearer {token}
```

### Mark Review as Helpful
```http
POST /customers/api/reviews/{reviewId}/helpful
```

### Approve Review (Staff/Admin only)
```http
PUT /customers/api/reviews/{reviewId}/approve
Authorization: Bearer {token} (STAFF/ADMIN role)
```

---

## 🔄 Vehicle Comparison

### Compare Vehicles (Public)
```http
POST /vehicles/vehicle-catalog/public/compare
Content-Type: application/json

[1, 2, 3]
```
**Note:** Array of variant IDs (max 3)

**Response:**
```json
{
  "success": true,
  "message": "Fetched comparison data successfully",
  "data": [
    {
      "details": {
        "variantId": 1,
        "versionName": "VF e34 Eco",
        "modelName": "VF e34",
        "price": 690000000,
        "batteryCapacity": 42,
        "range": 318,
        "motorPower": 110,
        "chargingTime": "7.5",
        "topSpeed": 150,
        "acceleration": "9.5",
        "seatingCapacity": 5,
        "driveType": "FWD",
        "length": 4300,
        "width": 1768,
        "height": 1613,
        "weight": 1590,
        "color": "White Pearl"
      },
      "inventory": {
        "available": true,
        "quantity": 10
      }
    }
  ]
}
```

---

## 🔌 Charging Stations

### Get All Active Stations
```http
GET /customers/api/charging-stations
```

### Get Station by ID
```http
GET /customers/api/charging-stations/{stationId}
```

### Find Nearby Stations
```http
GET /customers/api/charging-stations/nearby?latitude=21.0285&longitude=105.8542&radius=50
```
**Parameters:**
- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate
- `radius` (optional): Search radius in km (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Found 5 stations nearby",
  "data": [
    {
      "stationId": 1,
      "stationName": "Trạm sạc VinFast Times City",
      "address": "458 Minh Khai, Hai Bà Trưng, Hà Nội",
      "city": "Hà Nội",
      "province": "Hà Nội",
      "latitude": 20.9983,
      "longitude": 105.8644,
      "totalChargers": 8,
      "availableChargers": 6,
      "chargerTypes": "CCS, Type 2",
      "maxPowerKw": 150,
      "pricingInfo": "Miễn phí cho khách hàng VinFast trong 3 năm đầu",
      "status": "ACTIVE",
      "operatingHours": "24/7",
      "phoneNumber": "1900 23 23 89",
      "description": "Trạm sạc nhanh tại trung tâm thương mại Times City",
      "amenities": "WiFi, Nhà hàng, Khu vui chơi trẻ em",
      "isPublic": true,
      "distanceKm": 2.5
    }
  ]
}
```

### Search Stations by Keyword
```http
GET /customers/api/charging-stations/search?keyword=VinFast
```

### Get Stations by City
```http
GET /customers/api/charging-stations/city/Hà Nội
```

### Get Stations by Province
```http
GET /customers/api/charging-stations/province/Hà Nội
```

### Create Station (Admin only)
```http
POST /customers/api/charging-stations
Authorization: Bearer {token} (ADMIN/STAFF role)
Content-Type: application/json

{
  "stationName": "New Station",
  "address": "123 Street, City",
  "city": "Hà Nội",
  "province": "Hà Nội",
  "latitude": 21.0285,
  "longitude": 105.8542,
  "totalChargers": 6,
  "availableChargers": 6,
  "chargerTypes": "CCS, Type 2",
  "maxPowerKw": 150,
  "pricingInfo": "5000 VNĐ/kWh",
  "status": "ACTIVE",
  "operatingHours": "24/7",
  "phoneNumber": "1900000000",
  "description": "New charging station",
  "amenities": "WiFi, Restroom",
  "isPublic": true
}
```

### Update Station (Admin only)
```http
PUT /customers/api/charging-stations/{stationId}
Authorization: Bearer {token} (ADMIN/STAFF role)
Content-Type: application/json
```

### Delete Station (Admin only)
```http
DELETE /customers/api/charging-stations/{stationId}
Authorization: Bearer {token} (ADMIN role)
```

---

## 🔐 Authentication Headers

All authenticated endpoints require:
```http
Authorization: Bearer {jwt_token}
```

Additional headers set by gateway:
- `X-User-Id`: User ID from JWT
- `X-User-Email`: User email
- `X-User-Role`: User role
- `X-User-ProfileId`: Customer/Dealer profile ID

---

## 📝 Common Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "timestamp": "2026-01-10T10:00:00"
}
```

---

## 🚨 Error Codes

- `DATA_NOT_FOUND`: Resource not found
- `DATA_ALREADY_EXISTS`: Duplicate data
- `CUSTOMER_NOT_FOUND`: Customer doesn't exist
- `INVALID_REQUEST`: Invalid request data
- `UNAUTHORIZED`: Not authorized
- `FORBIDDEN`: Insufficient permissions

---

## 📊 HTTP Status Codes

- `200 OK`: Successful GET/PUT/DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## 🧪 Testing with curl

### Test Drive Booking
```bash
curl -X POST http://localhost:8082/customers/api/test-drives \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid",
    "variantId": 1,
    "dealerId": "uuid",
    "appointmentDate": "2026-01-15",
    "appointmentTime": "14:00",
    "notes": "Test drive request"
  }'
```

### Get Nearby Stations
```bash
curl "http://localhost:8082/customers/api/charging-stations/nearby?latitude=21.0285&longitude=105.8542&radius=50"
```

### Compare Vehicles
```bash
curl -X POST http://localhost:8081/vehicles/vehicle-catalog/public/compare \
  -H "Content-Type: application/json" \
  -d '[1, 2, 3]'
```

---

## 📱 Frontend Integration Examples

### Test Drive Service (JavaScript)
```javascript
import api from "./api";

export const bookTestDrive = (data) =>
  api.post("/customers/api/test-drives", data).then((res) => res.data);

export const getCustomerAppointments = (customerId) =>
  api.get(`/customers/api/test-drives/customer/${customerId}`).then((res) => res.data);
```

### Charging Station Service
```javascript
export const findNearbyStations = (latitude, longitude, radius = 50) =>
  api.get("/customers/api/charging-stations/nearby", {
    params: { latitude, longitude, radius }
  }).then((res) => res.data);
```

### Review Service
```javascript
export const createReview = (reviewData) =>
  api.post("/customers/api/reviews", reviewData).then((res) => res.data);

export const getReviewsByModel = (modelId) =>
  api.get(`/customers/api/reviews/model/${modelId}`).then((res) => res.data);
```

---

*Last Updated: January 10, 2026*
*Version: 1.0*
