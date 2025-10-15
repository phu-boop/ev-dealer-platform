// pages/PromotionCreatePage.js
import React from "react";
import PromotionForm from "../components/PromotionForm";
import { promotionService } from "../services/promotionService";

export default function PromotionCreatePage({ onBack }) {
  const handleSubmit = async (data) => {
    try {
      await promotionService.create(data);
      alert("Tạo chương trình khuyến mãi thành công!");
      onBack();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo chương trình!");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Tạo chương trình khuyến mãi mới</h1>
      </div>
      <PromotionForm onSubmit={handleSubmit} onCancel={onBack} />
    </div>
  );
}