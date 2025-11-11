// Dealer Payment Page (B2B Payment Flow - Dealer Manager)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import paymentService from '../services/paymentService';
import DealerInvoiceDetail from '../components/DealerInvoiceDetail';
import PayInvoiceForm from '../components/PayInvoiceForm';
import { toast } from 'react-toastify';

const DealerPaymentPage = () => {
  const { invoiceId } = useParams();
  const { dealerId } = useAuthContext(); // Lấy dealerId từ AuthContext
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      // Sử dụng endpoint không cần dealerId trong path
      // Backend sẽ tự động lấy dealerId từ JWT token
      const response = await paymentService.getDealerInvoiceByIdAlternative(invoiceId);
      const data = response.data.data || response.data;
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error(error.response?.data?.message || 'Không thể tải thông tin hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (paymentData) => {
    try {
      setLoading(true);
      await paymentService.payDealerInvoice(invoiceId, paymentData);
      toast.success('Thanh toán đã được gửi. Chờ xác nhận từ EVM Staff.');
      setShowPaymentForm(false);
      loadInvoice();
    } catch (error) {
      console.error('Error paying invoice:', error);
      toast.error(error.response?.data?.message || 'Không thể thanh toán hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invoice) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">Không tìm thấy hóa đơn</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Chi Tiết Hóa Đơn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealerInvoiceDetail invoice={invoice} />

        {showPaymentForm ? (
          <PayInvoiceForm
            invoice={invoice}
            onSubmit={handlePayInvoice}
            onCancel={() => setShowPaymentForm(false)}
            loading={loading}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thanh Toán Hóa Đơn</h2>
            <p className="text-gray-600 mb-4">
              Số tiền còn lại: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.remainingAmount)}
            </p>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Thanh Toán
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerPaymentPage;

