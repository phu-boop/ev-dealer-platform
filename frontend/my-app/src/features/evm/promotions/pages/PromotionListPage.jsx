import React, { useEffect, useState } from "react";
import { promotionService } from "../services/promotionService";

export default function PromotionListPage() {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    promotionService.getAll().then((res) => setPromotions(res.data));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Danh sách chương trình khuyến mãi</h1>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Tên</th>
            <th className="p-2 border">Tỷ lệ (%)</th>
            <th className="p-2 border">Bắt đầu</th>
            <th className="p-2 border">Kết thúc</th>
            <th className="p-2 border">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((p) => (
            <tr key={p.promotionId}>
              <td className="p-2 border">{p.promotionName}</td>
              <td className="p-2 border text-center">{p.discountRate}</td>
              <td className="p-2 border">{p.startDate}</td>
              <td className="p-2 border">{p.endDate}</td>
              <td className="p-2 border">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
