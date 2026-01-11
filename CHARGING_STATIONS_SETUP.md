# Phase 3D: Charging Station Map - Setup Guide

## Google Maps API Setup

To use the charging station map feature, you need to set up a Google Maps API key.

### Steps:

1. **Get Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Geocoding API (optional, for address search)
   - Go to "Credentials" and create an API key
   - Restrict the API key to your domain for security

2. **Update the API Key:**
   - Open `frontend/customer-app/src/pages/ChargingStationsPage.jsx`
   - Replace the placeholder API key on line 15:
   ```javascript
   const GOOGLE_MAPS_API_KEY = "YOUR-ACTUAL-GOOGLE-MAPS-API-KEY";
   ```

3. **Install Dependencies:**
   ```bash
   cd frontend/customer-app
   npm install
   ```

4. **Populate Sample Data:**
   - Run the SQL script to add sample charging stations:
   ```bash
   mysql -u root -p vms_commerce < services/customer-service/sample-charging-stations.sql
   ```
   - Or copy the contents of `sample-charging-stations.sql` and execute in your database

5. **Start the Services:**
   ```bash
   # Start customer-service
   cd services/customer-service
   mvn spring-boot:run

   # Start frontend
   cd frontend/customer-app
   npm run dev
   ```

6. **Access the Map:**
   - Navigate to `http://localhost:5174/charging-stations`
   - Allow location access when prompted for "Find stations near me" feature

## Features Implemented

### Backend (customer-service):
- **ChargingStation Entity** - Complete entity with location, chargers, pricing info
- **ChargingStationRepository** - Queries including nearby search using Haversine formula
- **ChargingStationService** - Business logic for CRUD and location-based search
- **ChargingStationController** - REST API endpoints:
  - `GET /customers/api/charging-stations` - Get all active stations
  - `GET /customers/api/charging-stations/{id}` - Get station by ID
  - `GET /customers/api/charging-stations/nearby` - Find stations near location
  - `GET /customers/api/charging-stations/search` - Search by keyword
  - `GET /customers/api/charging-stations/city/{city}` - Get stations by city
  - `GET /customers/api/charging-stations/province/{province}` - Get by province
  - `POST /customers/api/charging-stations` - Create station (Admin)
  - `PUT /customers/api/charging-stations/{id}` - Update station (Admin)
  - `DELETE /customers/api/charging-stations/{id}` - Delete station (Admin)

### Frontend (customer-app):
- **chargingStationService.js** - API integration
- **ChargingStationsPage.jsx** - Full map interface with:
  - Google Maps integration with markers
  - User location detection
  - Station list sidebar with details
  - Search radius control (10-100km)
  - "Find stations near me" feature
  - Click-to-navigate directions
  - Info windows with station details
  - Responsive design

### Navigation:
- Added "Trạm sạc" link in header
- Route: `/charging-stations`

## Sample Data

The SQL script includes 10 sample charging stations across major Vietnamese cities:
- Hà Nội (4 stations)
- Hồ Chí Minh (2 stations)
- Đà Nẵng (1 station)
- Hải Phòng (1 station)
- Cần Thơ (1 station)
- Nha Trang (1 station)

Each station includes:
- Name, address, city, province
- GPS coordinates (latitude/longitude)
- Charger information (type, quantity, power)
- Operating hours
- Amenities
- Pricing information

## Notes

- **Google Maps API Costs:** Monitor your usage to avoid unexpected charges
- **API Key Security:** Restrict your API key to your domain
- **Location Permission:** Users must grant location access for the "near me" feature
- **Fallback Location:** Default map center is Hanoi if geolocation fails
- **Distance Calculation:** Uses Haversine formula for accurate distance
- **Real-time Updates:** Available chargers can be updated via admin endpoints

## Future Enhancements

Consider adding:
- Real-time charger availability updates
- Reservation system for charging slots
- Charging history and statistics
- Payment integration for public chargers
- Route planning with charging stops
- Charging cost calculator
