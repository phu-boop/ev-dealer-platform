import React, { useMemo, useState } from "react";

// Trang UI chỉ hiển thị dữ liệu mock. Sẽ nối backend sau.
const InventoryReportPage = () => {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");

  const mockRows = useMemo(
    () => [
      {
        id: 1,
        last_updated_at: "2025-11-04 18:30:00",
        model_id: "MDL-001",
        model_name: "VinFast VF 8",
        region: "Miền Bắc",
        total_stock: 42,
        variant_id: "VR-8-STD",
        variant_name: "VF 8 Standard",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    return mockRows.filter((r) => {
      const matchesRegion = region ? r.region === region : true;
      const kw = search.trim().toLowerCase();
      const matchesKw = kw
        ? `${r.model_name} ${r.variant_name} ${r.model_id} ${r.variant_id}`
            .toLowerCase()
            .includes(kw)
        : true;
      return matchesRegion && matchesKw;
    });
  }, [mockRows, region, search]);

  return (
    <div className="animate-in fade-in-0 duration-500">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Báo cáo tồn kho theo khu vực</h1>

      {/* Bộ lọc đơn giản */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo model, variant, mã..."
          className="w-full md:w-1/2 border rounded px-3 py-2"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Tất cả khu vực</option>
          <option value="Miền Bắc">Miền Bắc</option>
          <option value="Miền Trung">Miền Trung</option>
          <option value="Miền Nam">Miền Nam</option>
        </select>
      </div>

      <div className="overflow-auto rounded border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Lần cập nhật cuối</th>
              <th className="px-3 py-2">Mã mẫu xe</th>
              <th className="px-3 py-2">Tên mẫu xe</th>
              <th className="px-3 py-2">Khu vực</th>
              <th className="px-3 py-2">Tổng tồn</th>
              <th className="px-3 py-2">Mã phiên bản</th>
              <th className="px-3 py-2">Tên phiên bản</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={8}>
                  Không có dữ liệu (chờ backend)
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={`${r.id}-${r.variant_id}`} className="border-t">
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{r.last_updated_at}</td>
                  <td className="px-3 py-2">{r.model_id}</td>
                  <td className="px-3 py-2">{r.model_name}</td>
                  <td className="px-3 py-2">{r.region}</td>
                  <td className="px-3 py-2">{r.total_stock}</td>
                  <td className="px-3 py-2">{r.variant_id}</td>
                  <td className="px-3 py-2">{r.variant_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Ghi chú: Trang này chỉ hiển thị dữ liệu mẫu; sẽ kết nối API sau khi backend hoàn tất.
      </div>
    </div>
  );
};

export default InventoryReportPage;


