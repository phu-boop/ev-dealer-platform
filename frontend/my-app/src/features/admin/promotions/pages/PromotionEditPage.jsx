// features/admin/promotions/pages/PromotionEditPage.js
import React from 'react';
import PromotionForm from '../components/PromotionForm';
import { usePromotions } from '../hooks/usePromotions';

export const PromotionEditPage = ({ promotion, onBack }) => {
  const { updatePromotion } = usePromotions();

  const handleSubmit = async (data) => {
    const result = await updatePromotion(promotion.promotionId, data);
    if (result.success) {
      alert('Cập nhật khuyến mãi thành công!');
      onBack();
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa Khuyến mãi</h1>
            <p className="text-sm text-gray-600 mt-1">Cập nhật thông tin khuyến mãi</p>
          </div>
        </div>
        <PromotionForm 
          onSubmit={handleSubmit} 
          onCancel={onBack}
          initialData={promotion}
          isEdit={true}
        />
      </div>
    </div>
  );
};

export default PromotionEditPage;