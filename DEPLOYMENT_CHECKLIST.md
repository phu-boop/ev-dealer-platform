# 🚀 VMS-Commerce - Deployment Checklist

## ✅ Pre-Deployment Checklist

### Backend Configuration

#### 1. Customer Service
- [ ] Rebuild customer-service with new code
  ```bash
  cd services/customer-service
  mvn clean install
  ```
- [ ] Verify all entities are created in database
- [ ] Import sample charging station data
  ```bash
  mysql -u root -p vms_commerce < sample-charging-stations.sql
  ```
- [ ] Test all API endpoints
- [ ] Check logs for errors

#### 2. Vehicle Service
- [ ] Restart vehicle-service to load public comparison endpoint
  ```bash
  cd services/vehicle-service
  mvn spring-boot:run
  ```
- [ ] Test comparison endpoint: `/vehicle-catalog/public/compare`

#### 3. Database
- [ ] Run database migrations if needed
- [ ] Verify new tables exist:
  - `test_drive_appointments`
  - `vehicle_reviews`
  - `charging_stations`
- [ ] Check indexes and foreign keys
- [ ] Backup database before deployment

### Frontend Configuration

#### 1. Install Dependencies
```bash
cd frontend/customer-app
npm install
```

#### 2. Google Maps API Setup
- [ ] Obtain Google Maps API key from Google Cloud Console
- [ ] Enable required APIs:
  - Maps JavaScript API
  - Geocoding API (optional)
- [ ] Update API key in `ChargingStationsPage.jsx`:
  ```javascript
  const GOOGLE_MAPS_API_KEY = "YOUR-ACTUAL-API-KEY";
  ```
- [ ] Restrict API key to your domain
- [ ] Set up billing (required for Google Maps)

#### 3. Environment Variables
- [ ] Check `.env` files for all services
- [ ] Update API base URLs if needed
- [ ] Configure CORS settings

#### 4. Build Frontend
```bash
npm run build
```

### Testing

#### Manual Testing Checklist

##### Phase 3A: Test Drive
- [ ] Navigate to `/test-drive/book`
- [ ] Fill out booking form
- [ ] Submit appointment
- [ ] Navigate to `/my-test-drives`
- [ ] View appointment list
- [ ] Cancel an appointment
- [ ] Verify status changes

##### Phase 3B: Reviews
- [ ] Navigate to vehicle detail page
- [ ] Submit a review (requires login)
- [ ] View reviews list
- [ ] Check rating summary chart
- [ ] Navigate to `/my-reviews`
- [ ] View personal reviews with status badges
- [ ] Click "Mark as helpful" on a review

##### Phase 3C: Comparison
- [ ] Click comparison button on vehicle card
- [ ] Add 2-3 vehicles to comparison
- [ ] Check comparison badge count in header
- [ ] Navigate to `/compare`
- [ ] View comparison table
- [ ] Remove vehicles from comparison
- [ ] Clear all comparisons

##### Phase 3D: Charging Stations
- [ ] Navigate to `/charging-stations`
- [ ] View map with station markers
- [ ] Click "Find stations near me"
- [ ] Grant location permission
- [ ] See nearby stations loaded
- [ ] Click a station marker
- [ ] View station info window
- [ ] Click "Get directions"
- [ ] Search stations by keyword
- [ ] Select station from sidebar list

##### Integration Testing
- [ ] Test complete user flow:
  1. Browse vehicles
  2. Compare vehicles
  3. View vehicle details
  4. Read reviews
  5. Book test drive
  6. Add to cart
  7. Checkout
  8. Make payment
  9. View order
  10. Find charging station

##### Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

##### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Performance

- [ ] Check page load times
- [ ] Optimize images (if needed)
- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Minimize bundle size
- [ ] Test with slow 3G network

### Security

- [ ] All API endpoints have proper authentication
- [ ] Role-based access control working
- [ ] Input validation on frontend and backend
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection enabled
- [ ] CORS configured correctly
- [ ] HTTPS enabled in production
- [ ] Sensitive data encrypted
- [ ] API keys not exposed in client code

### Documentation

- [x] API documentation updated
- [x] Setup guides created
- [x] README files updated
- [x] Code comments added
- [ ] User manual created (if needed)
- [ ] Admin guide created (if needed)

---

## 🐛 Known Issues & Limitations

### Current Limitations:
1. **Google Maps API Key:**
   - Placeholder key in code needs replacement
   - Requires Google Cloud billing account
   - Monitor usage to avoid unexpected costs

2. **Sample Data:**
   - Charging stations need to be imported manually
   - Only 10 sample stations provided
   - Coordinates are approximate

3. **Real-time Updates:**
   - Charger availability is static (no real-time updates)
   - Would require WebSocket or polling for live data

4. **Payment Integration:**
   - VNPay sandbox mode for testing
   - Switch to production credentials for live deployment

### Browser Compatibility:
- Geolocation API requires HTTPS in production
- Some older browsers may not support all features
- Polyfills may be needed for IE11 (if supported)

---

## 🔧 Troubleshooting Guide

### Issue: Google Maps not loading
**Solution:**
- Check API key is correct
- Verify Maps JavaScript API is enabled
- Check browser console for errors
- Ensure domain is whitelisted

### Issue: Location permission denied
**Solution:**
- User must grant location permission in browser
- HTTPS required in production for geolocation
- Show helpful message to user
- Fallback to default location (Hanoi)

### Issue: Charging stations not showing
**Solution:**
- Verify sample data is imported
- Check API endpoint: `/customers/api/charging-stations`
- Verify customer-service is running
- Check database connection

### Issue: Comparison not persisting
**Solution:**
- Check localStorage is enabled in browser
- Verify useComparison hook is working
- Check browser console for errors
- Clear localStorage and retry

### Issue: Reviews not appearing
**Solution:**
- Check review status (only APPROVED shown)
- Verify customer-service is running
- Check API endpoint: `/customers/api/reviews/model/{modelId}`
- Verify reviews exist in database

### Issue: Test drive booking fails
**Solution:**
- Check form validation errors
- Verify customer is logged in
- Check API endpoint connectivity
- Verify database constraints

---

## 📊 Monitoring & Metrics

### Key Metrics to Track:
- [ ] API response times
- [ ] Error rates
- [ ] User engagement (bookings, reviews, comparisons)
- [ ] Payment success rate
- [ ] Map usage statistics
- [ ] Most searched charging stations
- [ ] Most compared vehicles
- [ ] Review submission rate

### Logging:
- [ ] Enable application logging
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor API access logs
- [ ] Track payment transactions
- [ ] Log user actions (for analytics)

---

## 🚀 Deployment Steps

### Development Environment:
```bash
# 1. Start all backend services
cd services/customer-service && mvn spring-boot:run &
cd services/vehicle-service && mvn spring-boot:run &
cd services/payment-service && mvn spring-boot:run &

# 2. Start frontend
cd frontend/customer-app && npm run dev
```

### Production Environment:
```bash
# 1. Build frontend
cd frontend/customer-app
npm run build

# 2. Build backend JARs
cd services/customer-service && mvn clean package
cd services/vehicle-service && mvn clean package
cd services/payment-service && mvn clean package

# 3. Deploy to server (Docker, K8s, or traditional)
# 4. Configure reverse proxy (Nginx)
# 5. Set up SSL certificates
# 6. Configure environment variables
# 7. Run database migrations
# 8. Import initial data
# 9. Start services
# 10. Verify health checks
```

---

## ✅ Post-Deployment Verification

### Smoke Tests:
- [ ] Homepage loads
- [ ] User can login
- [ ] Vehicle catalog displays
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Payment processes successfully
- [ ] Test drive can be booked
- [ ] Reviews can be submitted
- [ ] Comparison works
- [ ] Map displays with stations

### User Acceptance Testing:
- [ ] Business stakeholders review
- [ ] End users test functionality
- [ ] Feedback collected
- [ ] Issues documented
- [ ] Fixes prioritized

---

## 📞 Support Contacts

- **Backend Issues:** [Backend Team Contact]
- **Frontend Issues:** [Frontend Team Contact]
- **Database Issues:** [DBA Contact]
- **Infrastructure:** [DevOps Contact]
- **Business Questions:** [Product Owner Contact]

---

## 📅 Maintenance Schedule

### Regular Tasks:
- **Daily:** Monitor logs and error rates
- **Weekly:** Review user feedback and analytics
- **Monthly:** Update dependencies and security patches
- **Quarterly:** Performance optimization review

---

**Checklist Completed:** [ ] Yes [ ] No
**Deployment Date:** _________________
**Deployed By:** _________________
**Sign-off:** _________________

---

*Last Updated: January 10, 2026*
