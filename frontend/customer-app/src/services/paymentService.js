import api from "./api.js";

/**
 * Payment Service
 * Provides API methods for payment operations
 */

// Initiate VNPay payment (B2C)
export const initiateVNPayPayment = (paymentData) =>
  api.post('/payments/gateway/initiate-b2c', paymentData).then((res) => res.data);

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
