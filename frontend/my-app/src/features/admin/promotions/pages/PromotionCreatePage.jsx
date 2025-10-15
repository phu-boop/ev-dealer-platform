// features/admin/promotions/pages/PromotionCreatePage.js
import React from 'react';
import PromotionForm from '../components/PromotionForm';
import { usePromotions } from '../hooks/usePromotions';

const PromotionCreatePage = ({ onBack }) => {
  const { createPromotion } = usePromotions();

  const handleSubmit = async (data) => {
    const result = await createPromotion(data);
    if (result.success) {
      alert('Tạo khuyến mãi thành công!');
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
            <h1 className="text-2xl font-bold text-gray-900">Tạo Khuyến mãi Mới</h1>
            <p className="text-sm text-gray-600 mt-1">Thiết lập chương trình khuyến mãi mới</p>
          </div>
        </div>

        <PromotionForm 
          onSubmit={handleSubmit} 
          onCancel={onBack}
        />
      </div>
    </div>
  );
};

export default PromotionCreatePage;
