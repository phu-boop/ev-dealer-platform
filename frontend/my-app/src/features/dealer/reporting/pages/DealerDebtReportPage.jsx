// File: src/features/dealer/reporting/pages/DealerDebtReportPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Card, Row, Col, Typography, Spin, Divider, Statistic } from "antd";
import { getB2BDebtReport, getB2CDebtReport } from "../services/dealerReportingService";

// --- Import Chart.js ---
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Đăng ký Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const { Title, Text } = Typography;

const DealerDebtReportPage = () => {
  const [b2bData, setB2bData] = useState(null);
  const [b2cData, setB2cData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [b2bRes, b2cRes] = await Promise.all([
          getB2BDebtReport(),
          getB2CDebtReport()
        ]);
        setB2bData(b2bRes);
        setB2cData(b2cRes);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- LOGIC BIỂU ĐỒ 1: B2B (Nợ Hãng) ---
  const b2bChartData = useMemo(() => {
    const paid = b2bData?.summary.totalPaid || 0;
    const remaining = b2bData?.summary.totalRemaining || 0;
    
    // Nếu chưa có dữ liệu thì hiển thị 1 vòng tròn xám
    if (paid === 0 && remaining === 0) {
        return {
            labels: ['Chưa có dữ liệu'],
            datasets: [{ data: [1], backgroundColor: ['#f0f0f0'] }]
        };
    }

    return {
      labels: ['Đã thanh toán', 'Còn nợ (Phải trả)'],
      datasets: [
        {
          data: [paid, remaining],
          backgroundColor: [
            '#52c41a', // Xanh lá (Đã trả - Tốt)
            '#ff4d4f', // Đỏ (Còn nợ - Cảnh báo)
          ],
          borderColor: ['#ffffff', '#ffffff'],
          borderWidth: 2,
        },
      ],
    };
  }, [b2bData]);

  // --- LOGIC BIỂU ĐỒ 2: B2C (Khách Nợ) ---
  const b2cChartData = useMemo(() => {
    const collected = b2cData?.summary.totalCollected || 0;
    const outstanding = b2cData?.summary.totalOutstanding || 0;

    if (collected === 0 && outstanding === 0) {
        return {
            labels: ['Chưa có dữ liệu'],
            datasets: [{ data: [1], backgroundColor: ['#f0f0f0'] }]
        };
    }

    return {
      labels: ['Đã thu tiền', 'Khách còn nợ'],
      datasets: [
        {
          data: [collected, outstanding],
          backgroundColor: [
            '#1890ff', // Xanh dương (Đã thu)
            '#faad14', // Vàng (Khách nợ - Cần đòi)
          ],
          borderColor: ['#ffffff', '#ffffff'],
          borderWidth: 2,
        },
      ],
    };
  }, [b2cData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
    cutout: '60%', // Làm rỗng ruột (Doughnut)
  };

  const formatCurrency = (val) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);


  if (loading) return <div style={{textAlign: 'center', padding: 50}}><Spin size="large" /></div>;

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Title level={3} style={{ marginBottom: 24 }}>📊 Báo Cáo Tài Chính & Công Nợ</Title>

      <Row gutter={[24, 24]}>
        
        {/* --- CỘT 1: B2B (Nợ Hãng) --- */}
        <Col xs={24} md={12}>
          <Card title="🏢 Công Nợ Với Hãng Xe (B2B)" bordered={false} style={{height: '100%'}}>
            <Row align="middle" justify="center">
                {/* Biểu đồ */}
                <Col span={24} style={{ height: 280, marginBottom: 20 }}>
                    <Doughnut data={b2bChartData} options={chartOptions} />
                </Col>
                
                {/* Số liệu chi tiết */}
                <Col span={24}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
                        <Text type="secondary">Tổng nhập hàng:</Text>
                        <Text strong>{formatCurrency(b2bData?.summary.totalDebt)}</Text>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
                        <Text style={{color: '#52c41a'}}>✔ Đã thanh toán:</Text>
                        <Text strong style={{color: '#52c41a'}}>{formatCurrency(b2bData?.summary.totalPaid)}</Text>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #f0f0f0'}}>
                        <Text style={{color: '#ff4d4f'}}>⚠ Dư nợ hiện tại:</Text>
                        <Text strong style={{color: '#ff4d4f', fontSize: 16}}>{formatCurrency(b2bData?.summary.totalRemaining)}</Text>
                    </div>
                </Col>
            </Row>
          </Card>
        </Col>

        {/* --- CỘT 2: B2C (Khách Nợ) --- */}
        <Col xs={24} md={12}>
          <Card title="👥 Công Nợ Khách Hàng (B2C)" bordered={false} style={{height: '100%'}}>
             <Row align="middle" justify="center">
                {/* Biểu đồ */}
                <Col span={24} style={{ height: 280, marginBottom: 20 }}>
                    <Doughnut data={b2cChartData} options={chartOptions} />
                </Col>

                {/* Số liệu chi tiết */}
                <Col span={24}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
                        <Text type="secondary">Tổng doanh số:</Text>
                        <Text strong>{formatCurrency(b2cData?.summary.totalReceivable)}</Text>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
                        <Text style={{color: '#1890ff'}}>✔ Thực thu:</Text>
                        <Text strong style={{color: '#1890ff'}}>{formatCurrency(b2cData?.summary.totalCollected)}</Text>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #f0f0f0'}}>
                        <Text style={{color: '#faad14'}}>⚠ Khách chưa trả:</Text>
                        <Text strong style={{color: '#faad14', fontSize: 16}}>{formatCurrency(b2cData?.summary.totalOutstanding)}</Text>
                    </div>
                </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DealerDebtReportPage;