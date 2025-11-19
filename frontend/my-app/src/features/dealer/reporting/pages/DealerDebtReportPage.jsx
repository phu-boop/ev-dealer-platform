// File: src/features/dealer/reporting/pages/DealerDebtReportPage.jsx

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Statistic, Spin, Divider } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined } from "@ant-design/icons";

// Import Service chúng ta vừa viết
import { getB2BDebtReport, getB2CDebtReport } from "../services/dealerReportingService";

const { Title } = Typography;

const DealerDebtReportPage = () => {
  // State lưu dữ liệu
  const [b2bData, setB2bData] = useState(null);
  const [b2cData, setB2cData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gọi API khi vào trang
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi song song cả 2 API để tiết kiệm thời gian
        const [b2bRes, b2cRes] = await Promise.all([
          getB2BDebtReport(),
          getB2CDebtReport()
        ]);
        
        setB2bData(b2bRes);
        setB2cData(b2cRes);
      } catch (error) {
        console.error("Lỗi tải dữ liệu báo cáo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hàm render loading
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="Đang tổng hợp công nợ..." />
      </div>
    );
  }

  // Hàm format tiền tệ (VND)
  const formatCurrency = (value) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      
      <Title level={3} style={{ marginBottom: 24 }}>📊 Báo Cáo Công Nợ Đại Lý</Title>

      {/* ========================== */}
      {/* PHẦN 1: CÔNG NỢ VỚI HÃNG (B2B) */}
      {/* ========================== */}
      <Card title="🏢 Công Nợ Với Hãng Xe (B2B)" bordered={false} style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {/* Thẻ 1: Tổng nợ phát sinh */}
          <Col xs={24} sm={8}>
            <Card bordered>
              <Statistic
                title="Tổng giá trị nhập hàng"
                value={b2bData?.summary.totalDebt}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<DollarOutlined />}
                formatter={formatCurrency}
              />
            </Card>
          </Col>

          {/* Thẻ 2: Đã thanh toán */}
          <Col xs={24} sm={8}>
            <Card bordered>
              <Statistic
                title="Đã thanh toán cho Hãng"
                value={b2bData?.summary.totalPaid}
                precision={0}
                valueStyle={{ color: '#3f8600' }} // Màu xanh lá
                prefix={<ArrowUpOutlined />}
                formatter={formatCurrency}
              />
            </Card>
          </Col>

          {/* Thẻ 3: Còn nợ (Quan trọng nhất) */}
          <Col xs={24} sm={8}>
            <Card bordered style={{ backgroundColor: '#fff1f0' }}> {/* Nền đỏ nhạt cảnh báo */}
              <Statistic
                title="Dư nợ hiện tại (Phải trả)"
                value={b2bData?.summary.totalRemaining}
                precision={0}
                valueStyle={{ color: '#cf1322', fontWeight: 'bold' }} // Màu đỏ đậm
                prefix={<ArrowDownOutlined />}
                formatter={formatCurrency}
              />
            </Card>
          </Col>
        </Row>
      </Card>


      {/* ========================== */}
      {/* PHẦN 2: CÔNG NỢ KHÁCH HÀNG (B2C) */}
      {/* ========================== */}
      <Card title="👥 Công Nợ Khách Hàng (B2C)" bordered={false}>
        <Row gutter={[16, 16]}>
           {/* Thẻ 1: Tổng phải thu */}
           <Col xs={24} sm={8}>
            <Card bordered>
              <Statistic
                title="Tổng doanh số bán xe"
                value={b2cData?.summary.totalReceivable}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                formatter={formatCurrency}
              />
            </Card>
          </Col>

           {/* Thẻ 2: Đã thu */}
           <Col xs={24} sm={8}>
            <Card bordered>
              <Statistic
                title="Tiền mặt thực thu"
                value={b2cData?.summary.totalCollected}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowUpOutlined />}
                formatter={formatCurrency}
              />
            </Card>
          </Col>

           {/* Thẻ 3: Khách còn nợ */}
           <Col xs={24} sm={8}>
            <Card bordered style={{ backgroundColor: '#fffbe6' }}> {/* Nền vàng nhạt */}
              <Statistic
                title="Khách hàng còn nợ"
                value={b2cData?.summary.totalOutstanding}
                precision={0}
                valueStyle={{ color: '#d48806', fontWeight: 'bold' }} // Màu vàng đậm
                prefix={<DollarOutlined />}
                formatter={formatCurrency}
              />
            </Card>
          </Col>
        </Row>
      </Card>

    </div>
  );
};

export default DealerDebtReportPage;