import React, { useState, useEffect, useCallback } from "react";
import { getInventoryVelocity } from "../services/reportingService";
import InventoryReportTable from "../components/InventoryReportTable";

// === STYLE NỘI TUYẾN ===
// (Giữ style ở đây cho gọn gàng)

const pageStyle = {
  fontFamily: "Arial, sans-serif",
  padding: "24px",
  backgroundColor: "#f9fbfd",
  minHeight: "100vh",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
  flexWrap: "wrap", // Để responsive
};

const titleStyle = {
  color: "#333",
  margin: "0",
};

const filterContainerStyle = {
  display: "flex",
  gap: "12px", // Khoảng cách giữa các bộ lọc
};

const selectStyle = {
  padding: "8px 12px",
  fontSize: "14px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const errorBoxStyle = {
  padding: "20px",
  border: "1px solid #ffb8b8",
  backgroundColor: "#fff0f0",
  borderRadius: "8px",
  textAlign: "center",
  color: "#d8000c",
};

const retryButtonStyle = {
  padding: "8px 16px",
  fontSize: "14px",
  color: "#fff",
  backgroundColor: "#d8000c",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "12px",
};
// === KẾT THÚC STYLE ===

// === COMPONENT SKELETON (CHO SINH ĐỘNG) ===
// Một component nội bộ để làm hiệu ứng "đang tải"
const TableSkeleton = () => {
  // Style cho hiệu ứng nhấp nháy
  const skeletonBase = {
    backgroundColor: "#e0e0e0",
    borderRadius: "4px",
    height: "20px",
    animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  // Thêm keyframes vào document
  // (Đây là cách "hack" để dùng keyframes mà không cần file CSS)
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const Row = () => (
    <tr style={{ borderBottom: "1px solid #eee" }}>
      <td style={{ padding: "12px 16px" }}>
        <div style={skeletonBase}></div>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={skeletonBase}></div>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={skeletonBase}></div>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={skeletonBase}></div>
      </td>
    </tr>
  );

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #ddd" }}>
          <th style={{ padding: "12px 16px" }}>
            <div style={{ ...skeletonBase, height: "24px" }}></div>
          </th>
          <th style={{ padding: "12px 16px" }}>
            <div style={{ ...skeletonBase, height: "24px" }}></div>
          </th>
          <th style={{ padding: "12px 16px" }}>
            <div style={{ ...skeletonBase, height: "24px" }}></div>
          </th>
          <th style={{ padding: "12px 16px" }}>
            <div style={{ ...skeletonBase, height: "24px" }}></div>
          </th>
        </tr>
      </thead>
      <tbody>
        <Row />
        <Row />
        <Row />
      </tbody>
    </table>
  );
};
// === KẾT THÚC SKELETON ===

const InventoryReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true); // Bật loading lúc đầu
  const [error, setError] = useState(null);

  // Quản lý state cho filters (đã bỏ TODO)
  const [filters, setFilters] = useState({
    region: "", // "" = Tất cả
    modelId: "", // "" = Tất cả
  });

  // Tách hàm fetch ra, dùng useCallback để tối ưu
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Giờ chúng ta truyền 'filters' vào API
      // (Giả sử getInventoryVelocity(filters) sẽ gửi GET /reports/inventory-velocity?region=...&modelId=...)
      const response = await getInventoryVelocity(filters);
      setReportData(response.data);
    } catch (err) {
      setError("Không thể tải báo cáo. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]); // Hàm fetchReport sẽ được tạo lại nếu 'filters' thay đổi

  // useEffect sẽ chạy lần đầu
  // và chạy lại BẤT CỨ KHI NÀO hàm 'fetchReport' (tức là 'filters') thay đổi
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Hàm xử lý khi người dùng thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Hàm render nội dung chính
  const renderContent = () => {
    if (loading) {
      return <TableSkeleton />;
    }

    if (error) {
      return (
        <div style={errorBoxStyle}>
          <p>{error}</p>
          <button style={retryButtonStyle} onClick={fetchReport}>
            🔄 Thử lại
          </button>
        </div>
      );
    }

    if (reportData.length === 0) {
      return <p>Không có dữ liệu nào khớp với bộ lọc.</p>;
    }

    return <InventoryReportTable data={reportData} />;
  };

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h2 style={titleStyle}>📊 Báo cáo Tồn kho & Tốc độ tiêu thụ</h2>

        {/* Các ô input/select để cập nhật state 'filters' */}
        <div style={filterContainerStyle}>
          <select
            name="region"
            value={filters.region}
            onChange={handleFilterChange}
            style={selectStyle}
          >
            <option value="">Tất cả Khu vực</option>
            {/* TODO: Nên load danh sách này từ API */}
            <option value="Southeast">Southeast</option>
            <option value="North">Miền Bắc</option>
            <option value="Central">Miền Trung</option>
            <option value="South">Miền Nam</option>
          </select>

          <select
            name="modelId"
            value={filters.modelId}
            onChange={handleFilterChange}
            style={selectStyle}
          >
            <option value="">Tất cả Mẫu xe</option>
            {/* TODO: Nên load danh sách này từ API */}
            <option value="1">VF 3</option>
            <option value="2">VF 5</option>
            <option value="3">VF e34</option>
          </select>
        </div>
      </header>

      <div className="report-content">{renderContent()}</div>
    </div>
  );
};

export default InventoryReportPage;
