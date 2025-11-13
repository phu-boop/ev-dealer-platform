// Pay Invoice Page - Form thanh toán hóa đơn
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import paymentService from '../services/paymentService';
import { toast } from 'react-toastify';
import { ArrowLeftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const PayInvoicePage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { dealerId } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethodId: '',
    transactionCode: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInvoice();
    loadPaymentMethods();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getDealerInvoiceByIdAlternative(invoiceId);
      const invoiceData = response.data?.data || response.data;
      setInvoice(invoiceData);
      
      // Set max amount
      const remainingAmount = invoiceData.totalAmount - (invoiceData.amountPaid || 0);
      // Round to 2 decimal places to avoid precision issues
      const roundedRemaining = Math.floor(remainingAmount * 100) / 100;
      setFormData(prev => ({ ...prev, amount: roundedRemaining.toString() }));
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Không thể tải thông tin hóa đơn');
      navigate('/dealer/manager/payments/invoices');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await paymentService.getActiveB2BMethods();
      const methods = response.data?.data || response.data || [];
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Không thể tải danh sách phương thức thanh toán');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    } else if (invoice) {
      const remainingAmount = invoice.totalAmount - (invoice.amountPaid || 0);
      if (parseFloat(formData.amount) > remainingAmount) {
        newErrors.amount = `Số tiền không được vượt quá số tiền còn lại (${remainingAmount.toLocaleString('vi-VN')} ₫)`;
      }
    }

    if (!formData.paymentMethodId) {
      newErrors.paymentMethodId = 'Vui lòng chọn phương thức thanh toán';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        paymentMethodId: formData.paymentMethodId,
        transactionCode: formData.transactionCode || undefined,
        notes: formData.notes || undefined
      };

      const response = await paymentService.payDealerInvoice(invoiceId, payload);
      
      const selectedMethod = paymentMethods.find(m => m.methodId === formData.paymentMethodId);
      const isCash = selectedMethod?.methodType === 'MANUAL';
      
      if (isCash) {
        toast.success('Yêu cầu thanh toán đã được gửi. Vui lòng chờ EVM staff duyệt.');
      } else {
        toast.success('Thanh toán thành công!');
      }
      
      navigate('/dealer/manager/payments/invoices');
    } catch (error) {
      console.error('Error paying invoice:', error);
      const errorMessage = error.response?.data?.message || 'Không thể thực hiện thanh toán';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const remainingAmount = Math.floor((invoice.totalAmount - (invoice.amountPaid || 0)) * 100) / 100;
  const selectedMethod = paymentMethods.find(m => m.methodId === formData.paymentMethodId);
  const isCash = selectedMethod?.methodType === 'MANUAL';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <button
        onClick={() => navigate('/dealer/manager/payments/invoices')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Quay lại
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông Tin Hóa Đơn</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Mã hóa đơn</p>
            <p className="text-lg font-semibold">#{invoice.dealerInvoiceId.substring(0, 8)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tổng tiền</p>
            <p className="text-lg font-semibold">{invoice.totalAmount.toLocaleString('vi-VN')} ₫</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Đã thanh toán</p>
            <p className="text-lg font-semibold text-green-600">{(invoice.amountPaid || 0).toLocaleString('vi-VN')} ₫</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Còn lại</p>
            <p className="text-lg font-semibold text-orange-600">{remainingAmount.toLocaleString('vi-VN')} ₫</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Thanh Toán Hóa Đơn</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền thanh toán <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              max={remainingAmount}
              step="0.01"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập số tiền"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            <p className="mt-1 text-sm text-gray-500">
              Số tiền tối đa: {remainingAmount.toLocaleString('vi-VN')} ₫
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phương thức thanh toán <span className="text-red-500">*</span>
            </label>
            <select
              name="paymentMethodId"
              value={formData.paymentMethodId}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.paymentMethodId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Chọn phương thức thanh toán</option>
              {paymentMethods.map((method) => (
                <option key={method.methodId} value={method.methodId}>
                  {method.methodName} {method.methodType === 'GATEWAY' ? '(VNPAY)' : '(Tiền mặt)'}
                </option>
              ))}
            </select>
            {errors.paymentMethodId && <p className="mt-1 text-sm text-red-600">{errors.paymentMethodId}</p>}
            {isCash && (
              <p className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                ⚠️ Thanh toán bằng tiền mặt sẽ cần được EVM staff duyệt trước khi cập nhật công nợ.
              </p>
            )}
          </div>

          {selectedMethod?.methodType === 'GATEWAY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã giao dịch (nếu có)
              </label>
              <input
                type="text"
                name="transactionCode"
                value={formData.transactionCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập mã giao dịch từ VNPAY"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập ghi chú (nếu có)"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate('/dealer/manager/payments/invoices')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CurrencyDollarIcon className="h-5 w-5" />
            {submitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PayInvoicePage;

