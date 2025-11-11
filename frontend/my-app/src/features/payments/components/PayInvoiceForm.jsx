// Pay Invoice Form Component (Dealer Manager)
import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import paymentService from '../services/paymentService';

const PayInvoiceForm = ({ invoice, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethodId: '',
    transactionCode: '',
    paidDate: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadPaymentMethods();
    // Set default amount to remaining amount
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        amount: invoice.remainingAmount.toString()
      }));
    }
  }, [invoice]);

  const loadPaymentMethods = async () => {
    try {
      // Load B2B payment methods
      const response = await paymentService.getAllPaymentMethods();
      const methods = response.data.data || response.data || [];
      // Filter B2B methods (scope = B2B or ALL)
      const b2bMethods = methods.filter(m => m.scope === 'B2B' || m.scope === 'ALL');
      setPaymentMethods(b2bMethods);
      
      if (b2bMethods.length > 0) {
        setFormData(prev => ({
          ...prev,
          paymentMethodId: b2bMethods[0].methodId
        }));
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    } else if (parseFloat(formData.amount) > invoice.remainingAmount) {
      newErrors.amount = `Số tiền không được vượt quá ${invoice.remainingAmount.toLocaleString('vi-VN')} VND`;
    }

    if (!formData.paymentMethodId) {
      newErrors.paymentMethodId = 'Vui lòng chọn phương thức thanh toán';
    }

    if (!formData.transactionCode) {
      newErrors.transactionCode = 'Vui lòng nhập mã giao dịch ngân hàng';
    }

    if (!formData.paidDate) {
      newErrors.paidDate = 'Vui lòng chọn ngày thanh toán';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        amount: parseFloat(formData.amount),
        paymentMethodId: formData.paymentMethodId,
        transactionCode: formData.transactionCode,
        paidDate: formData.paidDate,
        notes: formData.notes || null
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Thanh Toán Hóa Đơn</h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-2">Số tiền còn lại</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(invoice.remainingAmount)}
          </p>
        </div>

        <div>
          <Input
            label="Số Tiền Thanh Toán (VND) *"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            error={errors.amount}
            placeholder="Nhập số tiền thanh toán"
            min="1"
            max={invoice.remainingAmount}
            step="1000"
            required
          />
          {formData.amount && (
            <p className="mt-1 text-sm text-gray-600">
              {formatCurrency(parseFloat(formData.amount) || 0)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phương Thức Thanh Toán *
          </label>
          <select
            name="paymentMethodId"
            value={formData.paymentMethodId}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.paymentMethodId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">-- Chọn phương thức thanh toán --</option>
            {paymentMethods.map((method) => (
              <option key={method.methodId} value={method.methodId}>
                {method.methodName}
              </option>
            ))}
          </select>
          {errors.paymentMethodId && (
            <p className="mt-1 text-sm text-red-500">{errors.paymentMethodId}</p>
          )}
        </div>

        <div>
          <Input
            label="Mã Giao Dịch Ngân Hàng *"
            type="text"
            name="transactionCode"
            value={formData.transactionCode}
            onChange={handleChange}
            error={errors.transactionCode}
            placeholder="Ví dụ: VCB_123456789"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Mã giao dịch từ ngân hàng để đối soát
          </p>
        </div>

        <div>
          <Input
            label="Ngày Thanh Toán *"
            type="datetime-local"
            name="paidDate"
            value={formData.paidDate}
            onChange={handleChange}
            error={errors.paidDate}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi Chú (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập ghi chú (nếu có)"
          />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Gửi Thanh Toán'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PayInvoiceForm;


