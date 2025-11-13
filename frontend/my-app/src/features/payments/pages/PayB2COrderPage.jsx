// Pay B2C Order Page (Dealer Staff)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salesOrderB2CApi } from '../../dealer/sales/salesOrder/services/salesOrderService';
import paymentService from '../services/paymentService';
import PaymentForm from '../components/PaymentForm';
import PaymentHistory from '../components/PaymentHistory';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const PayB2COrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
      loadPaymentMethods();
      loadPaymentHistory();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await salesOrderB2CApi.getById(orderId);
      const data = response.data?.data || response.data;
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Không thể tải thông tin đơn hàng');
      navigate('/dealer/staff/payments/b2c-orders');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await paymentService.getActivePaymentMethods();
      setPaymentMethods(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Không thể tải danh sách phương thức thanh toán');
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const response = await paymentService.getPaymentHistory(orderId);
      setPaymentHistory(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const handlePayment = async (paymentData) => {
    try {
      setSubmitting(true);
      const response = await paymentService.initiatePayment(orderId, paymentData);
      const data = response.data.data || response.data;

      // Check payment method type to show appropriate message
      const selectedMethod = paymentMethods.find(m => m.methodId === paymentData.paymentMethodId);
      const isCash = selectedMethod?.methodType === 'MANUAL';

      // Nếu là VNPAY gateway, redirect đến payment URL
      if (data.status === 'PENDING_GATEWAY' && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (isCash) {
        // Nếu là thanh toán tiền mặt, hiển thị thông báo chờ duyệt
        toast.success('Yêu cầu thanh toán đã được gửi. Vui lòng chờ Dealer Manager duyệt.');
        setShowPaymentForm(false);
        loadPaymentHistory();
        loadOrder(); // Reload order to update payment status
        // Navigate back to orders list after a delay
        setTimeout(() => {
          navigate('/dealer/staff/payments/b2c-orders');
        }, 2000);
      } else {
        toast.success(data.message || 'Thanh toán đã được khởi tạo thành công');
        loadPaymentHistory();
        setShowPaymentForm(false);
        loadOrder(); // Reload order to update payment status
        // Navigate back to orders list after a delay to see updated status
        setTimeout(() => {
          navigate('/dealer/staff/payments/b2c-orders');
        }, 2000);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error(error.response?.data?.message || 'Không thể khởi tạo thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading && !order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  // Calculate payment status from history
  const totalPaid = paymentHistory
    .filter(t => t.status === 'SUCCESS' || t.status === 'CONFIRMED')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const remainingAmount = (parseFloat(order.totalAmount) || 0) - totalPaid;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/dealer/staff/payments/b2c-orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Quay lại
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thanh Toán Đơn Hàng B2C</h1>
        <p className="text-gray-600 mt-2">Mã đơn hàng: {order.orderId}</p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tổng tiền</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Đã thanh toán</p>
            <p className="text-lg font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Còn lại</p>
            <p className="text-lg font-semibold text-orange-600">{formatCurrency(remainingAmount)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        {showPaymentForm && remainingAmount > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông Tin Thanh Toán</h2>
            <PaymentForm
              paymentMethods={paymentMethods}
              onSubmit={handlePayment}
              loading={submitting}
            />
            {paymentMethods.some(m => m.methodType === 'MANUAL') && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Nếu chọn thanh toán tiền mặt, yêu cầu thanh toán sẽ được gửi đến Dealer Manager để duyệt. 
                  Công nợ và lịch sử thanh toán sẽ được cập nhật sau khi được duyệt.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch Sử Thanh Toán</h2>
          <PaymentHistory history={paymentHistory} />
        </div>
      </div>
    </div>
  );
};

export default PayB2COrderPage;

