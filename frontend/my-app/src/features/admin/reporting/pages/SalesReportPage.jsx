// File: SalesReportPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { getSalesSummary } from "../services/reportingService";
import SalesReportTable from "../components/SalesReportTable";

// --- IMPORT ANT DESIGN (ĐÃ THÊM SELECT VÀ OPTION) ---
import { Card, Row, Col, Typography, Space, Select } from "antd";
const { Title } = Typography;
const { Option } = Select; // Import Option cho Select

// === STYLE NỘI TUYẾN (CŨ, VẪN DÙNG TẠM) ===
// --- ĐÃ XÓA selectStyle ---

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
       {/* ... (phần code skeleton của bạn) ... */}
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

  // --- HÀM CŨ BỊ XÓA ---
  // const handleFilterChange = (e) => { ... };

  // --- HÀM MỚI CHO AntD Select ---
  const handleRegionChange = (value) => {
    // 'value' sẽ là undefined nếu người dùng bấm 'x' (allowClear)
    setFilters((prevFilters) => ({
      ...prevFilters,
      region: value || "", // Gán về chuỗi rỗng
    }));
  };

  const handleModelChange = (value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      modelId: value || "", // Gán về chuỗi rỗng
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
    <Card style={{ margin: "24px", backgroundColor: "#f9fbfd" }}>
      
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

        {/* --- KHU VỰC BỘ LỌC ĐÃ ĐƯỢC NÂNG CẤP --- */}
        <Col>
          <Space>
            <Select
              placeholder="Chọn khu vực"
              value={filters.region || null} // Dùng null để placeholder hiển thị
              style={{ width: 200 }}
              onChange={handleRegionChange}
              allowClear // Thêm nút 'x' để xóa
            >
              <Option value="Miền Bắc">Miền Bắc</Option>
              <Option value="Miền Trung">Miền Trung</Option>
              <Option value="Miền Nam">Miền Nam</Option>
              {/* TODO: Load từ API */}
            </Select>

            <Select
              placeholder="Chọn mẫu xe"
              value={filters.modelId || null} // Dùng null để placeholder hiển thị
              style={{ width: 200 }}
              onChange={handleModelChange}
              allowClear // Thêm nút 'x' để xóa
            >
              <Option value="1">VF 3</Option>
              <Option value="2">VF 5</Option>
              <Option value="3">VF e34</Option>
              {/* TODO: Load từ API */}
            </Select>
          </Space>
        </Col>
      </Row>

      <div className="report-content">{renderContent()}</div>

    </Card>
  );
};

export default SalesReportPage;