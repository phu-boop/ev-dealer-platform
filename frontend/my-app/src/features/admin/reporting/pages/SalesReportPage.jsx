// File: SalesReportPage.jsx (Nâng cấp BƯỚC 4.10: Sửa lỗi typo totalUnitsSold)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSalesSummary } from "../services/reportingService";
import SalesReportTable from "../components/SalesReportTable";

// --- Import Ant Design (Layout) ---
import { Card, Row, Col, Typography, Space, Select } from "antd";

// === Import THƯ VIỆN CHART.JS MỚI ===
import { Doughnut, Bar } from 'react-chartjs-2'; 
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title as ChartTitle,
  CategoryScale, 
  LinearScale,   
  BarElement,    
} from 'chart.js';

const { Title } = Typography;
const { Option } = Select;

// === Đăng ký các thành phần Chart.js ===
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  ChartTitle,
  CategoryScale, 
  LinearScale,   
  BarElement     
);

// === STYLE NỘI TUYẾN (CŨ, VẪN DÙNG) ===
const errorBoxStyle = { /* ... (Giữ nguyên code style của bạn) ... */ };
const retryButtonStyle = { /* ... (Giữ nguyên) ... */ };
// === KẾT THÚC STYLE ===

// === COMPONENT SKELETON (VẪN GIỮ NGUYÊN) ===
const TableSkeleton = () => { /* ... (Giữ nguyên code Skeleton của bạn) ... */ };
// === KẾT THÚC SKELETON ===

// --- CẤU HÌNH (OPTIONS) MẶC ĐỊNH CHO BIỂU ĐỒ ---
const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

const baseBarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};


// --- COMPONENT CHÍNH ---
const SalesReportPage = () => {
  // --- STATE CŨ (Giữ nguyên) ---
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    region: "",
    modelId: "",
  });

  // --- LOGIC CŨ (Giữ nguyên) ---
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSalesSummary(filters);
      // Giả sử getSalesSummary trả về { data: [...] }
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

  const handleRegionChange = (value) => { /* ... (Giữ nguyên code cũ) ... */ };
  const handleModelChange = (value) => { /* ... (Giữ nguyên code cũ) ... */ };

  // === LOGIC MỚI 1: Biểu đồ Doanh thu theo Khu vực (Đã SỬA) ===
  const chartDataByRegion = useMemo(() => {
    if (reportData.length === 0) return { labels: [], datasets: [] };

    const summary = reportData.reduce((acc, item) => {
      const region = item.region || 'Chưa xác định';
      // SỬA Ở ĐÂY: Dùng Number() để ép kiểu
      const revenue = Number(item.totalRevenue) || 0;

      if (!acc[region]) {
        acc[region] = 0;
      }
      acc[region] += revenue;
      return acc;
    }, {});

    const labels = Object.keys(summary);
    const data = Object.values(summary);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Doanh thu',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [reportData]);

  // === LOGIC MỚI 2: Biểu đồ Số lượng theo Mẫu xe (ĐÃ SỬA) ===
  const chartDataByModel = useMemo(() => {
    if (reportData.length === 0) return { labels: [], datasets: [] };

    const summary = reportData.reduce((acc, item) => {
      const model = item.modelName || 'Chưa xác định';
      
      // === SỬA LỖI TẠI ĐÂY ===
      // Thêm chữ 's' vào 'totalUnitsSold'
      const quantity = Number(item.totalUnitsSold) || 0;
      // === KẾT THÚC SỬA LỖI ===

      if (!acc[model]) {
        acc[model] = 0;
      }
      acc[model] += quantity;
      return acc;
    }, {});

    const labels = Object.keys(summary);
    const data = Object.values(summary);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Số lượng bán',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [reportData]);


  // === CẤU HÌNH OPTIONS (Giữ nguyên như Bước 4.6) ===
  const dynamicBarChartOptions = useMemo(() => {
    const barDataValues = chartDataByModel.datasets[0]?.data || [];
    const maxQuantity = barDataValues.length > 0 ? Math.max(...barDataValues) : 0;

    return {
      ...baseBarChartOptions, 
      scales: {
        y: {
          beginAtZero: true,
          max: maxQuantity > 0 ? maxQuantity + 2 : 10,
          ticks: {
            stepSize: maxQuantity > 10 ? 2 : 1
          }
        }
      }
    };
  }, [chartDataByModel]);
  // === KẾT THÚC CẬP NHẬT ===


  // --- RENDER ---
  // (Phần JSX giữ nguyên, không cần thay đổi)
  return (
    <Card style={{ margin: "24px", backgroundColor: "#f9fbfd" }}>
      
      {/* 1. KHU VỰC TIÊU ĐỀ VÀ BỘ LỌC (Giữ nguyên) */}
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
        <Col>
          <Space>
            {/* ... Bộ lọc ... */}
          </Space>
        </Col>
      </Row>

      {/* 2. KHU VỰC MỚI: TỔNG QUAN BIỂU ĐỒ */}
      <Title level={5} style={{ marginTop: '16px' }}>Tổng quan</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        
        {/* Biểu đồ 1: Doanh thu theo Khu vực */}
        <Col xs={24} md={12}>
          <Card>
            <Title level={5}>Doanh thu theo Khu vực</Title>
            {loading && <p>Đang tải dữ liệu...</p>}
            {error && <p>Lỗi tải biểu đồ.</p>}
            <div style={{ height: '250px' }}> 
              {!loading && !error && chartDataByRegion.labels.length > 0 && (
                <Doughnut data={chartDataByRegion} options={doughnutChartOptions} />
              )}
            </div>
          </Card>
        </Col>

        {/* Biểu đồ 2: Số lượng bán theo Mẫu xe */}
        <Col xs={24} md={12}>
          <Card>
            <Title level={5}>Số lượng bán theo Mẫu xe</Title>
            {loading && <p>Đang tải dữ liệu...</p>}
            {error && <p>Lỗi tải biểu đồ.</p>}
            <div style={{ height: '250px' }}>
              {!loading && !error && chartDataByModel.labels.length > 0 && (
                <Bar data={chartDataByModel} options={dynamicBarChartOptions} />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 3. KHU VỰC CŨ: BÁO CÁO CHI TIẾT (BẢNG) */}
      <Title level={5}>Báo cáo Chi tiết</Title>
      <div className="report-content">
        {/* Logic render cũ (Giữ nguyên) */}
        {loading && <TableSkeleton />}
        {error && (
          <div style={errorBoxStyle}>
            {/* ... (Code báo lỗi cũ) ... */}
          </div>
        )}
        {!loading && !error && reportData.length === 0 && (
          <p>Không có dữ liệu nào khớp với bộ lọc.</p>
        )}
        {!loading && !error && reportData.length > 0 && (
          <SalesReportTable data={reportData} />
        )}
      </div>

    </Card>
  );
};

export default SalesReportPage;