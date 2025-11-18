// File: InventoryReportPage.jsx (COMMIT ĐỢT 1: Setup + 2 Biểu đồ Tồn kho)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getInventoryVelocity } from "../services/reportingService";
import InventoryReportTable from "../components/InventoryReportTable";

// --- Import Ant Design ---
import { Card, Row, Col, Typography, Space, Select } from "antd";

// --- Import Chart.js ---
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
} from 'chart.js';

const { Title } = Typography;
const { Option } = Select;

// Đăng ký Chart.js
ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle
);

// --- CONFIG BIỂU ĐỒ ---
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' } },
};
// Config cho biểu đồ cột (có trục Y)
const barOptions = {
  ...commonOptions,
  scales: { y: { beginAtZero: true } }
};

// --- SKELETON & STYLES ---
const TableSkeleton = () => (
  <div style={{ padding: "20px", background: "#fff" }}>
    <div style={{ height: "40px", background: "#f0f0f0", marginBottom: "10px" }} />
    <div style={{ height: "40px", background: "#f0f0f0", marginBottom: "10px" }} />
  </div>
);
const errorBoxStyle = { padding: "20px", border: "1px solid #ffb8b8", backgroundColor: "#fff0f0", color: "#d8000c", textAlign: "center", borderRadius: "8px" };

const InventoryReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter API (Chỉ dùng Region để gọi API nếu cần)
  const [apiFilters, setApiFilters] = useState({ region: "", modelId: "" });
  
  // Filter Local (Mẫu xe - để lọc hiển thị)
  const [selectedModel, setSelectedModel] = useState(null);

  // --- CALL API ---
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInventoryVelocity(apiFilters);
      // Kiểm tra cấu trúc trả về (response.data hay response trực tiếp)
      const data = Array.isArray(response) ? response : (response.data || []);
      setReportData(data);
    } catch (err) {
      setError("Không thể tải báo cáo tồn kho.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiFilters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // --- LOCAL FILTER & DYNAMIC OPTIONS ---
  const handleRegionChange = (val) => setApiFilters(prev => ({ ...prev, region: val }));
  const handleModelFilterLocal = (val) => setSelectedModel(val);

  // Lấy danh sách mẫu xe duy nhất từ data (Dynamic Filter)
  const uniqueModels = useMemo(() => {
    if (!reportData) return [];
    const models = reportData.map(item => item.modelName).filter(Boolean);
    return [...new Set(models)];
  }, [reportData]);

  // Dữ liệu hiển thị (đã lọc theo mẫu xe chọn)
  const displayData = useMemo(() => {
    if (!selectedModel) return reportData;
    return reportData.filter(item => item.modelName === selectedModel);
  }, [reportData, selectedModel]);


  // ==========================================================================
  // LOGIC BIỂU ĐỒ (ĐỢT 1: 2 BIỂU ĐỒ ĐẦU TIÊN)
  // ==========================================================================

  // 1. Khu vực (Tỷ lệ tồn kho theo vùng) - Doughnut
  const chartStockByRegion = useMemo(() => {
    const summary = displayData.reduce((acc, item) => {
      const region = item.region || 'Khác';
      // Cộng dồn số lượng tồn kho (currentStock)
      acc[region] = (acc[region] || 0) + (Number(item.currentStock) || 0);
      return acc;
    }, {});
    return {
      labels: Object.keys(summary),
      datasets: [{
        label: 'Tồn kho',
        data: Object.values(summary),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      }]
    };
  }, [displayData]);

  // 2. Mẫu xe (Số lượng tồn theo mẫu) - Bar
  const chartStockByModel = useMemo(() => {
    const summary = displayData.reduce((acc, item) => {
      const model = item.modelName || 'Khác';
      // Cộng dồn số lượng tồn kho (currentStock)
      acc[model] = (acc[model] || 0) + (Number(item.currentStock) || 0);
      return acc;
    }, {});
    
    // Tính toán max để làm đẹp thang đo
    const values = Object.values(summary);
    const maxVal = values.length > 0 ? Math.max(...values) : 0;
    const niceMax = maxVal > 0 ? (Math.ceil(maxVal / 5) * 5) + 5 : 10;

    return {
      data: {
        labels: Object.keys(summary),
        datasets: [{
          label: 'Tồn kho hiện tại',
          data: values,
          backgroundColor: '#36A2EB',
        }]
      },
      options: {
        ...barOptions,
        scales: { y: { beginAtZero: true, max: niceMax } }
      }
    };
  }, [displayData]);


  // --- RENDER ---
  return (
    <div style={{ padding: "24px", background: "#f9fbfd", minHeight: "100vh" }}>
      
      {/* HEADER & FILTERS */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col><Title level={4} style={{ margin: 0 }}>📊 Báo cáo Tồn kho & Tốc độ tiêu thụ</Title></Col>
        <Col>
          <Space>
             <Select placeholder="Chọn khu vực" style={{ width: 150 }} onChange={handleRegionChange} allowClear>
                <Option value="Miền Bắc">Miền Bắc</Option>
                <Option value="Miền Trung">Miền Trung</Option>
                <Option value="Miền Nam">Miền Nam</Option>
             </Select>
             <Select placeholder="Chọn mẫu xe" style={{ width: 150 }} onChange={handleModelFilterLocal} allowClear value={selectedModel}>
                {uniqueModels.map(m => <Option key={m} value={m}>{m}</Option>)}
             </Select>
          </Space>
        </Col>
      </Row>

      {/* DASHBOARD CHART AREA (ĐỢT 1) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Biểu đồ 1: Tồn kho theo Khu vực */}
        <Col xs={24} md={8}>
          <Card title="Tỷ lệ Tồn kho (Khu vực)">
             <div style={{ height: 250 }}>
               <Doughnut data={chartStockByRegion} options={commonOptions} />
             </div>
          </Card>
        </Col>

        {/* Biểu đồ 2: Tồn kho theo Mẫu xe */}
        <Col xs={24} md={16}>
          <Card title="Số lượng Tồn kho (Theo Mẫu xe)">
             <div style={{ height: 250 }}>
               <Bar data={chartStockByModel.data} options={chartStockByModel.options} />
             </div>
          </Card>
        </Col>
      </Row>

      {/* TABLE DETAIL */}
      <Title level={5}>Chi tiết Tồn kho</Title>
      <div style={{ background: "#fff", borderRadius: 8, padding: 1 }}>
        {loading ? <TableSkeleton /> : 
         error ? <div style={errorBoxStyle}>{error}</div> :
         displayData.length === 0 ? <p style={{padding: 20}}>Không có dữ liệu.</p> :
         <InventoryReportTable data={displayData} />
        }
      </div>
    </div>
  );
};

export default InventoryReportPage;