import React from "react";
import { Routes, Route } from "react-router-dom";
import QuotationList from "./QuotationList";
import QuotationForm from "./QuotationForm";
import QuotationDetail from "./QuotationDetail";

const QuotationManagement = () => {
  return (
    <Routes>
      {/* Trang danh sách (mặc định) */}
      <Route index element={<QuotationList />} />

      {/* Trang tạo mới */}
      <Route path="new" element={<QuotationForm />} />

      {/* Trang chỉnh sửa */}
      <Route path=":id/edit" element={<QuotationForm />} />

      {/* Trang chi tiết (nếu cần) */}
      <Route path=":id" element={<QuotationDetail />} />
    </Routes>
  );
};

export default QuotationManagement;
