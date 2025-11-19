// File: InventoryReportPage.jsx (COMMIT ĐỢT 4: Thêm nút Xuất Excel - Hoàn tất)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getInventoryVelocity } from "../services/reportingService";
import InventoryReportTable from "../components/InventoryReportTable";

// --- Import Ant Design ---
import { Card, Row, Col, Typography, Space, Select, Button } from "antd"; // Đã thêm Button

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

// --- Import Excel ---
import * as XLSX from 'xlsx'; // Đã thêm thư viện Excel

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
const barOptions = {
  ...commonOptions,
  scales: { y: { beginAtZero: true } }
};
const horizontalBarOptions = {
  ...commonOptions,
  indexAxis: 'y', 
  scales: { x: { beginAtZero: true } },
  plugins: {
    legend: { display: false }, 
    title: { display: true, text: 'Các mẫu xe còn dưới 10 chiếc' }
  }
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
  const [apiFilters, setApiFilters] = useState({ region: "", modelId: "" });
  const [selectedModel, setSelectedModel] = useState(null);

  // --- CALL API ---
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInventoryVelocity(apiFilters);
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

  // --- LOCAL FILTER ---
  const handleRegionChange = (val) => setApiFilters(prev => ({ ...prev, region: val }));
  const handleModelFilterLocal = (val) => setSelectedModel(val);

  const uniqueModels = useMemo(() => {
    if (!reportData) return [];
    const models = reportData.map(item => item.modelName).filter(Boolean);
    return [...new Set(models)];
  }, [reportData]);

  const displayData = useMemo(() => {
    if (!selectedModel) return reportData;
    return reportData.filter(item => item.modelName === selectedModel);
  }, [reportData, selectedModel]);


  // ==========================================================================
  // LOGIC BIỂU ĐỒ
  // ==========================================================================

  // 1. Khu vực
  const chartStockByRegion = useMemo(() => {
    const summary = displayData.reduce((acc, item) => {
      const region = item.region || 'Khác';
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

  // 2. Mẫu xe
  const chartStockByModel = useMemo(() => {
    const summary = displayData.reduce((acc, item) => {
      const model = item.modelName || 'Khác';
      acc[model] = (acc[model] || 0) + (Number(item.currentStock) || 0);
      return acc;
    }, {});
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
      options: { ...barOptions, scales: { y: { beginAtZero: true, max: niceMax } } }
    };
  }, [displayData]);

  // 3. Bán (30 ngày)
  const chartSales30Days = useMemo(() => {
    const summary = displayData.reduce((acc, item) => {
      const model = item.modelName || 'Khác';
      acc[model] = (acc[model] || 0) + (Number(item.salesLast30Days) || 0);
      return acc;
    }, {});
    const values = Object.values(summary);
    const maxVal = values.length > 0 ? Math.max(...values) : 0;
    const niceMax = maxVal > 0 ? (Math.ceil(maxVal / 5) * 5) + 5 : 10;

    return {
      data: {
        labels: Object.keys(summary),
        datasets: [{
          label: 'Đã bán (30 ngày)',
          data: values,
          backgroundColor: '#4BC0C0',
        }]
      },
      options: { ...barOptions, scales: { y: { beginAtZero: true, max: niceMax } } }
    };
  }, [displayData]);

  // 4. TB Bán/Ngày
  const chartAvgDailySales = useMemo(() => {
    const summary = displayData.reduce((acc, item) => {
      const model = item.modelName || 'Khác';
      acc[model] = (acc[model] || 0) + (Number(item.averageDailySales) || 0);
      return acc;
    }, {});
    const values = Object.values(summary).map(v => Number(v.toFixed(2)));
    const maxVal = values.length > 0 ? Math.max(...values) : 0;
    const niceMax = maxVal > 0 ? Math.ceil(maxVal) + 1 : 2; 

    return {
      data: {
        labels: Object.keys(summary),
        datasets: [{
          label: 'TB Bán/Ngày',
          data: values,
          backgroundColor: '#FF9F40',
        }]
      },
      options: { ...barOptions, scales: { y: { beginAtZero: true, max: niceMax } } }
    };
  }, [displayData]);

  // 5. Ngày hàng còn lại
  const chartDaysOfSupply = useMemo(() => {
     const modelStats = displayData.reduce((acc, item) => {
        const model = item.modelName || 'Khác';
        if (!acc[model]) acc[model] = { stock: 0, daily: 0 };
        acc[model].stock += (Number(item.currentStock) || 0);
        acc[model].daily += (Number(item.averageDailySales) || 0);
        return acc;
     }, {});
     const labels = Object.keys(modelStats);
     const data = labels.map(model => {
        const { stock, daily } = modelStats[model];
        if (daily === 0) return 0;
        return Number((stock / daily).toFixed(1));
     });
     const maxVal = data.length > 0 ? Math.max(...data) : 0;
     const niceMax = maxVal > 0 ? (Math.ceil(maxVal / 10) * 10) + 10 : 100; 

     return {
        data: {
          labels,
          datasets: [{
            label: 'Ngày hàng còn lại (Dự kiến)',
            data: data,
            backgroundColor: '#9966FF',
          }]
        },
        options: { ...barOptions, scales: { y: { beginAtZero: true, max: niceMax } } }
     };
  }, [displayData]);

  // 6. Cảnh báo Tồn kho thấp
  const chartLowStock = useMemo(() => {
    const lowStockThreshold = 10;
    const summary = displayData.reduce((acc, item) => {
      const model = item.modelName || 'Khác';
      acc[model] = (acc[model] || 0) + (Number(item.currentStock) || 0);
      return acc;
    }, {});
    const lowStockModels = Object.keys(summary).filter(key => summary[key] < lowStockThreshold);
    const lowStockValues = lowStockModels.map(key => summary[key]);
    return {
      data: {
        labels: lowStockModels,
        datasets: [{
          label: 'Số lượng tồn (Thấp)',
          data: lowStockValues,
          backgroundColor: '#FF6384',
        }]
      },
      options: horizontalBarOptions
    };
  }, [displayData]);


  // === LOGIC MỚI: XUẤT EXCEL ===
  const handleExportExcel = () => {
    if (displayData.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    // 1. Chuẩn bị dữ liệu
    const exportData = displayData.map(item => ({
      'Khu vực': item.region,
      'Mẫu xe': item.modelName,
      'Phiên bản': item.variantName,
      'Tồn kho (Hiện tại)': Number(item.currentStock),
      'Bán (30 ngày)': Number(item.salesLast30Days),
      'TB Bán/Ngày': Number(item.averageDailySales).toFixed(2),
      'Ngày hàng còn lại': item.daysOfSupply === 'Infinity' || !item.daysOfSupply 
                           ? 'Vô hạn' 
                           : Number(item.daysOfSupply).toFixed(1)
    }));

    // 2. Tạo Sheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 3. Chỉnh độ rộng cột
    ws['!cols'] = [
      { wch: 15 }, // Khu vực
      { wch: 15 }, // Mẫu xe
      { wch: 15 }, // Phiên bản
      { wch: 15 }, // Tồn kho
      { wch: 15 }, // Bán 30 ngày
      { wch: 15 }, // TB Bán/Ngày
      { wch: 20 }  // Ngày còn lại
    ];

    // 4. Tạo Workbook và Tải về
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BaoCaoTonKho');
    XLSX.writeFile(wb, 'BaoCaoTonKho.xlsx');
  };


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
             
             {/* NÚT XUẤT EXCEL (ĐÃ THÊM) */}
             <Button 
               type="primary" 
               onClick={handleExportExcel} 
               disabled={loading || displayData.length === 0}
             >
               Xuất Excel
             </Button>
          </Space>
        </Col>
      </Row>

      {/* HÀNG 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={8}>
          <Card title="Tỷ lệ Tồn kho (Khu vực)">
             <div style={{ height: 250 }}><Doughnut data={chartStockByRegion} options={commonOptions} /></div>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="Số lượng Tồn kho (Theo Mẫu xe)">
             <div style={{ height: 250 }}><Bar data={chartStockByModel.data} options={chartStockByModel.options} /></div>
          </Card>
        </Col>
      </Row>

      {/* HÀNG 2 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={12}>
          <Card title="Đã bán trong 30 ngày qua">
             <div style={{ height: 250 }}><Bar data={chartSales30Days.data} options={chartSales30Days.options} /></div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Tốc độ bán trung bình (Xe/Ngày)">
             <div style={{ height: 250 }}><Bar data={chartAvgDailySales.data} options={chartAvgDailySales.options} /></div>
          </Card>
        </Col>
      </Row>

       {/* HÀNG 3 */}
       <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={12}>
          <Card title="📉 Dự báo ngày hàng còn lại (Days of Supply)">
             <div style={{ height: 250 }}><Bar data={chartDaysOfSupply.data} options={chartDaysOfSupply.options} /></div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="⚠️ Cảnh báo sắp hết hàng (Dưới 10 xe)">
             <div style={{ height: 250 }}>
               {chartLowStock.data.labels.length > 0 ? 
                 <Bar data={chartLowStock.data} options={chartLowStock.options} /> :
                 <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%', color:'green'}}>
                    Không có xe nào dưới mức cảnh báo!
                 </div>
               }
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