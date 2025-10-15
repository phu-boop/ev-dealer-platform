import React from "react";
import PromotionForm from "../components/PromotionForm";
import { promotionService } from "../services/promotionService";

export default function PromotionCreatePage() {
  const handleSubmit = async (data) => {
    try {
      await promotionService.create(data);
      alert("Tạo chương trình khuyến mãi thành công!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo chương trình!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <h1 className="text-2xl font-semibold mb-4">Tạo chương trình khuyến mãi</h1>
      <PromotionForm onSubmit={handleSubmit} />
    </div>
  );
}
