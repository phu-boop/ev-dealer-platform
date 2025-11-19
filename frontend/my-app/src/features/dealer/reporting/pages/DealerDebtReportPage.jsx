// File: src/features/dealer/reporting/pages/DealerDebtReportPage.jsx


import React, { useState, useEffect, useMemo } from "react";
import { Card, Row, Col, Typography, Spin, Button, Table, Tag, Space } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import { getB2BDebtReport, getB2CDebtReport } from "../services/dealerReportingService";

// --- Import Chart.js ---
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// --- Import Excel ---
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

  // --- FORMAT TIỀN TỆ ---
  const formatCurrency = (val) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // --- LOGIC BIỂU ĐỒ ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    cutout: '60%',
  };

  const b2bChartData = useMemo(() => {
    const paid = b2bData?.summary.totalPaid || 0;
    const remaining = b2bData?.summary.totalRemaining || 0;
    if (paid === 0 && remaining === 0) return { labels: [], datasets: [{ data: [1], backgroundColor: ['#f0f0f0'] }] };
    return {
      labels: ['Đã thanh toán', 'Còn nợ'],
      datasets: [{ data: [paid, remaining], backgroundColor: ['#52c41a', '#ff4d4f'], borderWidth: 0 }],
    };
  }, [b2bData]);

  const b2cChartData = useMemo(() => {
    const collected = b2cData?.summary.totalCollected || 0;
    const outstanding = b2cData?.summary.totalOutstanding || 0;
    if (collected === 0 && outstanding === 0) return { labels: [], datasets: [{ data: [1], backgroundColor: ['#f0f0f0'] }] };
    return {
      labels: ['Đã thu', 'Khách nợ'],
      datasets: [{ data: [collected, outstanding], backgroundColor: ['#1890ff', '#faad14'], borderWidth: 0 }],
    };
  }, [b2cData]);


  // --- CẤU HÌNH CỘT CHO BẢNG (TABLE COLUMNS) ---
  
  // 1. Cột bảng B2B (Hóa đơn)
  const b2bColumns = [
    { title: 'Mã Hóa Đơn', dataIndex: 'dealerInvoiceId', key: 'id', render: (text) => <Text strong>{text?.substring(0, 8)}...</Text> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'date', render: (text) => new Date(text).toLocaleDateString('vi-VN') },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'total', align: 'right', render: (val) => formatCurrency(val) },
    { title: 'Đã trả', dataIndex: 'amountPaid', key: 'paid', align: 'right', render: (val) => <Text type="success">{formatCurrency(val)}</Text> },
    { title: 'Còn nợ', dataIndex: 'remainingAmount', key: 'remain', align: 'right', render: (val) => <Text type="danger" strong>{formatCurrency(val)}</Text> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center', 
      render: (status) => (
        <Tag color={status === 'PAID' ? 'green' : status === 'PARTIAL' ? 'orange' : 'red'}>
          {status === 'PAID' ? 'Đã xong' : status === 'PARTIAL' ? 'Trả 1 phần' : 'Chưa trả'}
        </Tag>
      ) 
    },
  ];

  // 2. Cột bảng B2C (Đơn hàng)
  const b2cColumns = [
    { title: 'Mã Đơn', dataIndex: 'orderId', key: 'id', render: (text) => <Text strong>{text?.substring(0, 8)}...</Text> },
    { title: 'Khách hàng', dataIndex: 'customerId', key: 'customer', render: (text) => `KH-${text?.substring(0,6)}` }, // Tạm dùng ID
    { title: 'Ngày đặt', dataIndex: 'orderDate', key: 'date', render: (text) => new Date(text).toLocaleDateString('vi-VN') },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'total', align: 'right', render: (val) => formatCurrency(val) },
    { title: 'Đã cọc/trả', dataIndex: 'downPayment', key: 'paid', align: 'right', render: (val) => <Text type="success">{formatCurrency(val)}</Text> },
    { title: 'Còn lại', key: 'remain', align: 'right', 
      render: (_, record) => {
        const remain = (record.totalAmount || 0) - (record.downPayment || 0);
        return <Text type={remain > 0 ? "warning" : "secondary"}>{formatCurrency(remain > 0 ? remain : 0)}</Text>
      }
    },
  ];


  // --- XUẤT EXCEL ---
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: B2B
    const b2bExport = (b2bData?.details || []).map(item => ({
        'Mã HĐ': item.dealerInvoiceId,
        'Ngày tạo': new Date(item.createdAt).toLocaleDateString('vi-VN'),
        'Tổng tiền': item.totalAmount,
        'Đã trả': item.amountPaid,
        'Còn nợ': item.remainingAmount,
        'Trạng thái': item.status
    }));
    const ws1 = XLSX.utils.json_to_sheet(b2bExport);
    XLSX.utils.book_append_sheet(wb, ws1, "No_Voi_Hang_B2B");

    // Sheet 2: B2C
    const b2cExport = (b2cData?.details || []).map(item => ({
        'Mã Đơn': item.orderId,
        'Ngày đặt': new Date(item.orderDate).toLocaleDateString('vi-VN'),
        'Tổng tiền': item.totalAmount,
        'Đã thu': item.downPayment,
        'Còn lại': (item.totalAmount || 0) - (item.downPayment || 0)
    }));
    const ws2 = XLSX.utils.json_to_sheet(b2cExport);
    XLSX.utils.book_append_sheet(wb, ws2, "Khach_No_B2C");

    XLSX.writeFile(wb, "BaoCaoCongNo_DaiLy.xlsx");
  };


  if (loading) return <div style={{textAlign: 'center', padding: 50}}><Spin size="large" /></div>;

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={3} style={{ margin: 0 }}>📊 Báo Cáo Tài Chính & Công Nợ</Title></Col>
        <Col>
            <Button type="primary" icon={<FileExcelOutlined />} onClick={handleExportExcel} size="large">
                Xuất Báo Cáo Excel
            </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* --- CỘT 1: B2B --- */}
        <Col xs={24} xl={12}>
          <Card title="🏢 Công Nợ Với Hãng (B2B)" bordered={false} style={{height: '100%'}}>
            <Row justify="center" style={{marginBottom: 24}}>
                <div style={{ height: 200, width: 200 }}>
                    <Doughnut data={b2bChartData} options={chartOptions} />
                </div>
            </Row>
            <Title level={5}>Chi tiết hóa đơn nhập hàng:</Title>
            <Table 
                dataSource={b2bData?.details || []} 
                columns={b2bColumns} 
                rowKey="dealerInvoiceId"
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ x: 600 }}
            />
          </Card>
        </Col>

        {/* --- CỘT 2: B2C --- */}
        <Col xs={24} xl={12}>
          <Card title="👥 Công Nợ Khách Hàng (B2C)" bordered={false} style={{height: '100%'}}>
             <Row justify="center" style={{marginBottom: 24}}>
                <div style={{ height: 200, width: 200 }}>
                    <Doughnut data={b2cChartData} options={chartOptions} />
                </div>
            </Row>
            <Title level={5}>Chi tiết đơn hàng bán ra:</Title>
            <Table 
                dataSource={b2cData?.details || []} 
                columns={b2cColumns} 
                rowKey="orderId"
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ x: 600 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DealerDebtReportPage;