import React, { useState } from "react";
import {
  exportInventoryReport,
  updateCentralReorderLevel,
} from "../services/inventoryService";
import { saveAs } from "file-saver";

const InventoryReportsTab = () => {
  const [reportParams, setReportParams] = useState({
    startDate: "",
    endDate: "",
    format: "xlsx",
  });
  const [reorderParams, setReorderParams] = useState({
    variantId: "",
    reorderLevel: "",
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!reportParams.startDate || !reportParams.endDate) {
      alert("Vui lòng chọn ngày bắt đầu và kết thúc.");
      return;
    }
    setIsExporting(true);
    try {
      const response = await exportInventoryReport(reportParams);
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      saveAs(
        blob,
        `inventory_report_${reportParams.startDate}_to_${reportParams.endDate}.${reportParams.format}`
      );
    } catch (error) {
      console.error("Failed to export report", error);
      alert("Xuất báo cáo thất bại.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateReorder = async (e) => {
    e.preventDefault();
    try {
      await updateCentralReorderLevel(reorderParams);
      alert("Cập nhật ngưỡng tồn kho thành công!");
      setReorderParams({ variantId: "", reorderLevel: "" });
    } catch (error) {
      alert(
        "Cập nhật thất bại: " +
          (error.response?.data?.message || "Lỗi không xác định")
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Xuất Báo Cáo */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Xuất Báo Cáo Tồn Kho</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            value={reportParams.startDate}
            onChange={(e) =>
              setReportParams({ ...reportParams, startDate: e.target.value })
            }
            className="p-2 border rounded-lg"
          />
          <input
            type="date"
            value={reportParams.endDate}
            onChange={(e) =>
              setReportParams({ ...reportParams, endDate: e.target.value })
            }
            className="p-2 border rounded-lg"
          />
          <select
            value={reportParams.format}
            onChange={(e) =>
              setReportParams({ ...reportParams, format: e.target.value })
            }
            className="p-2 border rounded-lg"
          >
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="pdf">PDF (.pdf)</option>
          </select>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {isExporting ? "Đang xuất..." : "Xuất File"}
        </button>
      </div>
      {/* Form Cập nhật ngưỡng tồn kho */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">
          Cài Đặt Ngưỡng Tồn Kho Trung Tâm
        </h3>
        <form onSubmit={handleUpdateReorder} className="flex items-end gap-4">
          <input
            type="number"
            value={reorderParams.variantId}
            onChange={(e) =>
              setReorderParams({ ...reorderParams, variantId: e.target.value })
            }
            placeholder="ID Phiên bản (Variant ID)"
            required
            className="p-2 border rounded-lg flex-grow"
          />
          <input
            type="number"
            value={reorderParams.reorderLevel}
            onChange={(e) =>
              setReorderParams({
                ...reorderParams,
                reorderLevel: e.target.value,
              })
            }
            placeholder="Ngưỡng đặt lại"
            required
            className="p-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Cập Nhật
          </button>
        </form>
      </div>
    </div>
  );
};

export default InventoryReportsTab;
