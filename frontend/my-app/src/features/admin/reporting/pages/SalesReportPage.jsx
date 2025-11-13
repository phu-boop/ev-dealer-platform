// File: SalesReportPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { getSalesSummary } from "../services/reportingService";
import SalesReportTable from "../components/SalesReportTable";

// --- IMPORT ANT DESIGN ---
import { Card, Row, Col, Typography, Space } from "antd";
const { Title } = Typography;

// === STYLE NỘI TUYẾN (CŨ, VẪN DÙNG TẠM) ===
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

// === COMPONENT SKELETON (VẪN GIỮ NGUYÊN) ===
const TableSkeleton = () => {
  // ... (Code của TableSkeleton của bạn, giữ nguyên không đổi) ...
  const skeletonBase = {
    backgroundColor: "#e0e0e0",
    borderRadius: "4px",
    height: "20px",
    animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };
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
      {/* ... (phần a) ... */}
    </table>
  );
};
// === KẾT THÚC SKELETON ===

const SalesReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    region: "",
    modelId: "",
  });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSalesSummary(filters);
      setReportData(response.data);
    } catch (err) {
      setError("Không thể tải báo cáo doanh số. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // --- LOGIC RENDER CŨ (VẪN GIỮ NGUYÊN) ---
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
    return <SalesReportTable data={reportData} />;
  };

  return (
    // --- KHUNG TRANG ĐÃ ĐƯỢC NÂNG CẤP BẰNG AntD ---
    <Card style={{ margin: "24px", backgroundColor: "#f9fbfd" }}>
      
      {/* 1. Header dùng Row/Col của AntD */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "20px" }}
      >
        <Col>
          <Title level={4} style={{ margin: 0, color: "#333" }}>
            💰 Báo cáo Doanh số theo Khu vực & Đại lý
          </Title>
        </Col>

        {/* 2. Bộ lọc VẪN DÙNG <select> THÔ (sẽ nâng cấp ở commit sau) */}
        <Col>
          <Space> {/* Space là component mới để tạo khoảng cách */}
            <select
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
              style={selectStyle}
            >
              <option value="">Tất cả Khu vực</option>
              <option value="Miền Bắc">Miền Bắc</option>
              <option value="Miền Trung">Miền Trung</option>
              <option value="Miền Nam">Miền Nam</option>
            </select>

            <select
              name="modelId"
              value={filters.modelId}
              onChange={handleFilterChange}
              style={selectStyle}
            >
              <option value="">Tất cả Mẫu xe</option>
              <option value="1">VF 3</option>
              <option value="2">VF 5</option>
              <option value="3">VF e34</option>
            </select>
          </Space>
        </Col>
      </Row>

      {/* 3. Nội dung render VẪN DÙNG LOGIC CŨ (sẽ nâng cấp ở commit sau) */}
      <div className="report-content">{renderContent()}</div>

    </Card>
    // --- KẾT THÚC KHUNG TRANG NÂNG CẤP ---
  );
};

export default SalesReportPage;