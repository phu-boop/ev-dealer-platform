// File: SalesReportPage.jsx (Nâng cấp BƯỚC 5.1: Sửa lỗi mất biểu đồ)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSalesSummary } from "../services/reportingService";
import SalesReportTable from "../components/SalesReportTable";

// --- Import Ant Design (Layout) ---
import { Card, Row, Col, Typography, Space, Select, Button } from "antd"; // Thêm Button

// === Import THƯ VIỆN CHART.JS ===
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

// === Import THƯ VIỆN EXCEL ===
import * as XLSX from 'xlsx';

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

// === STYLE, SKELETON, OPTIONS (Giữ nguyên) ===
const errorBoxStyle = {
  border: "1px solid #ffccc7",
  backgroundColor: "#fff2f0",
  padding: "16px",
  borderRadius: "8px",
  color: "#d4380d",
  textAlign: "center",
};
const retryButtonStyle = {
  marginLeft: "8px",
  padding: "5px 10px",
  border: "1px solid #d4380d",
  background: "transparent",
  color: "#d4380d",
  borderRadius: "4px",
  cursor: "pointer",
};
const TableSkeleton = () => (
  <div style={{ padding: "20px" }}>
    <div
      style={{
        height: "40px",
        backgroundColor: "#f0f0f0",
        marginBottom: "10px",
        borderRadius: "4px",
      }}
    ></div>
    <div
      style={{
        height: "40px",
        backgroundColor: "#f0f0f0",
        marginBottom: "10px",
        borderRadius: "4px",
      }}
    ></div>
    <div
      style={{
        height: "40px",
        backgroundColor: "#f0f0f0",
        borderRadius: "4px",
      }}
    ></div>
  </div>
);
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
// === KẾT THÚC ===


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

  // (Tôi giả định bạn vẫn còn 2 hàm này, nếu không hãy copy lại từ code cũ nhé)
  const handleRegionChange = (value) => {
    setFilters(prev => ({ ...prev, region: value }));
  };
  const handleModelChange = (value) => {
    setFilters(prev => ({ ...prev, modelId: value }));
  };

  // === LOGIC BIỂU ĐỒ (Giữ nguyên) ===
  const chartDataByRegion = useMemo(() => {
    if (reportData.length === 0) return { labels: [], datasets: [] };
    const summary = reportData.reduce((acc, item) => {
      const region = item.region || 'Chưa xác định';
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
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [reportData]);

  const chartDataByModel = useMemo(() => {
    if (reportData.length === 0) return { labels: [], datasets: [] };
    const summary = reportData.reduce((acc, item) => {
      const model = item.modelName || 'Chưa xác định';
      const quantity = Number(item.totalUnitsSold) || 0; // Đã sửa 's'
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

  const dynamicBarChartOptions = useMemo(() => {
    const barDataValues = chartDataByModel.datasets[0]?.data || [];
    const maxQuantity = barDataValues.length > 0 ? Math.max(...barDataValues) : 0;
    // Làm tròn thang đo lên 20, 25...
    const newMax = maxQuantity > 0 ? (Math.ceil(maxQuantity / 5) * 5) + 5 : 10;
    
    return {
      ...baseBarChartOptions, 
      scales: {
        y: {
          beginAtZero: true,
          max: newMax,
        }
      }
    };
  }, [chartDataByModel]);
  // === KẾT THÚC LOGIC BIỂU ĐỒ ===

  // === LOGIC MỚI: XUẤT EXCEL ===
  const handleExportExcel = () => {
    if (reportData.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }
    const dataForExport = reportData.map(item => ({
      'Khu vực': item.region,
      'Tên Đại lý': item.dealershipName,
      'Mẫu xe': item.modelName,
      'Phiên bản': item.variantName,
      'Số lượng bán': Number(item.totalUnitsSold),
      'Tổng doanh thu (VND)': Number(item.totalRevenue),
      'Ngày bán cuối': new Date(item.lastSaleAt)
    }));
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    ws['!cols'] = [
      { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 15 },
      { wch: 15 }, { wch: 20 }, { wch: 15 }
    ];
    dataForExport.forEach((row, index) => {
      const cellIndex = index + 2; 
      const revenueCell = `F${cellIndex}`;
      ws[revenueCell] = { ...ws[revenueCell], t: 'n', z: '#,##0 "₫"' }; 
      const dateCell = `G${cellIndex}`;
      ws[dateCell] = { ...ws[dateCell], t: 'd', z: 'dd/mm/yyyy' };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BaoCaoDoanhSo');
    XLSX.writeFile(wb, 'BaoCaoDoanhSo.xlsx');
  };
  // === KẾT THÚC LOGIC MỚI ===


  // --- RENDER ---
  return (
    <Card style={{ margin: "24px", backgroundColor: "#f9fbfd" }}>
      
      {/* 1. KHU VỰC TIÊU ĐỀ (ĐÃ THÊM NÚT XUẤT EXCEL) */}
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
            {/* --- ĐÃ KHÔI PHỤC BỘ LỌC --- */}
            <Select
              placeholder="Chọn khu vực"
              style={{ width: 200 }}
              onChange={handleRegionChange}
              allowClear
            >
              <Option value="Miền Bắc">Miền Bắc</Option>
              <Option value="Miền Trung">Miền Trung</Option>
              <Option value="Miền Nam">Miền Nam</Option>
            </Select>
            <Select
              placeholder="Chọn mẫu xe"
              style={{ width: 200 }}
              onChange={handleModelChange}
              allowClear
            >
              {/* (Bạn có thể load động cái này sau) */}
              <Option value="VF 3">VF 3</Option>
              <Option value="VF 8">VF 8</Option>
              <Option value="VF 9">VF 9</Option>
            </Select>
            
            {/* THÊM NÚT MỚI TẠI ĐÂY */}
            <Button 
              type="primary" 
              onClick={handleExportExcel}
              disabled={loading || reportData.length === 0}
            >
              Xuất Excel
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 2. KHU VỰC BIỂU ĐỒ (ĐÃ KHÔI PHỤC) */}
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

      {/* 3. KHU VỰC BÁO CÁO CHI TIẾT (BẢNG) (ĐÃ KHÔI PHỤC) */}
      <Title level={5}>Báo cáo Chi tiết</Title>
      <div className="report-content">
        {loading && <TableSkeleton />}
        {error && (
          <div style={errorBoxStyle}>
             <p>{error}</p>
             <button style={retryButtonStyle} onClick={fetchReport}>
               🔄 Thử lại
             </button>
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