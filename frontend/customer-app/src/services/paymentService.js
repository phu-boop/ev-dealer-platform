import api from "./api.js";

/**
 * Payment Service
 * Provides API methods for payment operations
 */

// Initiate VNPay payment (B2C)
export const initiateVNPayPayment = (paymentData) =>
  api.post('/payments/api/v1/payments/gateway/initiate-b2c', paymentData).then((res) => res.data);

// Initiate VNPay payment for vehicle booking (deposit)
export const initiateVNPayBooking = (bookingData) =>
  api.post('/payments/api/v1/payments/gateway/initiate-b2c', {
    customerId: bookingData.customerId,
    totalAmount: bookingData.totalAmount,
    paymentAmount: bookingData.depositAmount,
    // Không gửi returnUrl, backend sẽ dùng configured URL từ .env
    orderInfo: `Dat coc xe ${bookingData.modelId} - ${bookingData.customerName}`,
    metadata: {
      variantId: bookingData.variantId,
      modelId: bookingData.modelId,
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      customerEmail: bookingData.customerEmail,
      customerIdCard: bookingData.customerIdCard,
      exteriorColor: bookingData.exteriorColor,
      interiorColor: bookingData.interiorColor,
      showroom: bookingData.showroom,
      showroomCity: bookingData.showroomCity,
      notes: bookingData.notes,
      promoCode: bookingData.promoCode,
      frontendReturnUrl: bookingData.returnUrl // Lưu để redirect sau khi callback
    }
  }).then((res) => res.data);

// Get payment transaction details
export const getPaymentTransaction = (transactionId) =>
  api.get(`/payments/transactions/${transactionId}`).then((res) => res.data);

// Get payment history for order
export const getOrderPaymentHistory = (orderId) =>
  api.get(`/payments/orders/${orderId}/history`).then((res) => res.data);

// Confirm payment transaction
export const confirmPaymentTransaction = (transactionId) =>
  api.post(`/payments/transactions/${transactionId}/confirm`).then((res) => res.data);

// Get customer debt
export const getCustomerDebt = (customerId) =>
  api.get(`/payments/${customerId}/debt`).then((res) => res.data);
