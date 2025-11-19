// File: src/features/dealer/reporting/pages/DealerDebtReportPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Card, Row, Col, Typography, Spin, Button, Table, Tag, Tabs, Statistic } from "antd";
import { FileExcelOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { getB2BDebtReport, getB2CDebtReport } from "../services/dealerReportingService";

// --- Import Chart.js ---
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import * as XLSX from 'xlsx';

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

  const formatCurrency = (val) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // --- CONFIG BIỂU ĐỒ ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }, // Để chú thích bên phải cho gọn
    cutout: '70%',
  };

  const b2bChartData = useMemo(() => {
    const paid = b2bData?.summary?.totalPaid || 0;
    const remaining = b2bData?.summary?.totalRemaining || 0;
    if (!paid && !remaining) return { labels: [], datasets: [{ data: [1], backgroundColor: ['#f0f0f0'] }] };
    return {
      labels: ['Đã thanh toán', 'Còn nợ'],
      datasets: [{ data: [paid, remaining], backgroundColor: ['#52c41a', '#ff4d4f'], borderWidth: 0 }],
    };
  }, [b2bData]);

  const b2cChartData = useMemo(() => {
    const collected = b2cData?.summary?.totalCollected || 0;
    const outstanding = b2cData?.summary?.totalOutstanding || 0;
    if (!collected && !outstanding) return { labels: [], datasets: [{ data: [1], backgroundColor: ['#f0f0f0'] }] };
    return {
      labels: ['Đã thu', 'Khách nợ'],
      datasets: [{ data: [collected, outstanding], backgroundColor: ['#1890ff', '#faad14'], borderWidth: 0 }],
    };
  }, [b2cData]);

  // --- CỘT BẢNG ---
  const b2bColumns = [
    { title: 'Mã Hóa Đơn', dataIndex: 'dealerInvoiceId', key: 'id', width: 120, render: (text) => <Text strong>{text?.substring(0, 8)}...</Text> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'date', width: 120, render: (text) => text ? new Date(text).toLocaleDateString('vi-VN') : '-' },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'total', align: 'right', render: (val) => formatCurrency(val) },
    { title: 'Đã trả', dataIndex: 'amountPaid', key: 'paid', align: 'right', render: (val) => <Text type="success">{formatCurrency(val)}</Text> },
    { title: 'Còn nợ', dataIndex: 'remainingAmount', key: 'remain', align: 'right', render: (val) => <Text type="danger" strong>{formatCurrency(val)}</Text> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center', width: 150,
      render: (status) => {
        let color = 'default'; let text = status;
        if (status === 'PAID') { color = 'success'; text = 'Đã thanh toán'; }
        else if (status === 'PARTIAL') { color = 'warning'; text = 'Thanh toán 1 phần'; }
        else if (status === 'UNPAID' || status === 'PENDING') { color = 'error'; text = 'Chưa thanh toán'; }
        return <Tag color={color}>{text}</Tag>;
      } 
    },
  ];

  const b2cColumns = [
    { title: 'Mã Đơn', dataIndex: 'orderId', key: 'id', width: 120, render: (text) => <Text strong>{text?.substring(0, 8)}...</Text> },
    { title: 'Khách hàng', dataIndex: 'customerId', key: 'customer', render: (text) => `KH-${text?.substring(0,6)}` },
    { title: 'Ngày đặt', dataIndex: 'orderDate', key: 'date', width: 120, render: (text) => text ? new Date(text).toLocaleDateString('vi-VN') : '-' },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'total', align: 'right', render: (val) => formatCurrency(val) },
    { title: 'Đã thu', dataIndex: 'downPayment', key: 'paid', align: 'right', render: (val) => <Text type="success">{formatCurrency(val)}</Text> },
     { title: 'Còn lại', key: 'remain', align: 'right', 
      render: (_, record) => {
        const remain = (record.totalAmount || 0) - (record.downPayment || 0);
        return <Text type={remain > 0 ? "warning" : "secondary"}>{formatCurrency(remain > 0 ? remain : 0)}</Text>
      }
    },
  ];

  // --- CẤU HÌNH TABS ---
  const tabItems = [
    {
      key: '1',
      label: 'Hóa đơn nhập hàng (B2B)',
      children: <Table dataSource={b2bData?.details || []} columns={b2bColumns} rowKey="dealerInvoiceId" pagination={{ pageSize: 10 }} />
    },
    {
      key: '2',
      label: 'Đơn hàng bán ra (B2C)',
      children: <Table dataSource={b2cData?.details || []} columns={b2cColumns} rowKey="orderId" pagination={{ pageSize: 10 }} />
    },
  ];

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const b2bExport = (b2bData?.details || []).map(item => ({ 'Mã HĐ': item.dealerInvoiceId, 'Tổng': item.totalAmount, 'Còn nợ': item.remainingAmount }));
    const ws1 = XLSX.utils.json_to_sheet(b2bExport);
    XLSX.utils.book_append_sheet(wb, ws1, "B2B");
    const b2cExport = (b2cData?.details || []).map(item => ({ 'Mã Đơn': item.orderId, 'Tổng': item.totalAmount, 'Đã thu': item.downPayment }));
    const ws2 = XLSX.utils.json_to_sheet(b2cExport);
    XLSX.utils.book_append_sheet(wb, ws2, "B2C");
    XLSX.writeFile(wb, "BaoCaoCongNo.xlsx");
  };

  if (loading) return <div style={{textAlign: 'center', padding: 50}}><Spin size="large" /></div>;

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={3} style={{ margin: 0 }}>📊 Báo Cáo Tài Chính & Công Nợ</Title></Col>
        <Col><Button type="primary" icon={<FileExcelOutlined />} onClick={handleExportExcel}>Xuất Excel</Button></Col>
      </Row>

      {/* PHẦN 1: BIỂU ĐỒ TỔNG QUAN */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* B2B Summary */}
        <Col xs={24} md={12}>
          <Card title="🏢 Tình hình công nợ với Hãng (B2B)" bordered={false}>
            <Row align="middle">
                <Col span={12} style={{height: 180}}>
                    <Doughnut data={b2bChartData} options={chartOptions} />
                </Col>
                <Col span={12}>
                    <Statistic title="Tổng nợ phải trả" value={b2bData?.summary.totalRemaining} precision={0} valueStyle={{ color: '#ff4d4f' }} prefix={<ArrowDownOutlined />} suffix="₫" />
                    <div style={{marginTop: 10}}></div>
                    <Statistic title="Đã thanh toán" value={b2bData?.summary.totalPaid} precision={0} valueStyle={{ color: '#52c41a', fontSize: 16 }} suffix="₫" />
                </Col>
            </Row>
          </Card>
        </Col>
        {/* B2C Summary */}
        <Col xs={24} md={12}>
          <Card title="👥 Tình hình công nợ Khách hàng (B2C)" bordered={false}>
             <Row align="middle">
                <Col span={12} style={{height: 180}}>
                    <Doughnut data={b2cChartData} options={chartOptions} />
                </Col>
                <Col span={12}>
                    <Statistic title="Khách còn nợ" value={b2cData?.summary.totalOutstanding} precision={0} valueStyle={{ color: '#faad14' }} prefix={<ArrowUpOutlined />} suffix="₫" />
                    <div style={{marginTop: 10}}></div>
                    <Statistic title="Đã thu tiền" value={b2cData?.summary.totalCollected} precision={0} valueStyle={{ color: '#1890ff', fontSize: 16 }} suffix="₫" />
                </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* PHẦN 2: BẢNG CHI TIẾT (Dạng Tabs) */}
      <Card bordered={false}>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Card>

    </div>
  );
};

export default DealerDebtReportPage;