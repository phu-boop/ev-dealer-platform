// Trong SalesOrderDetailPage.jsx
import React, { useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Tabs, Button, Space, Alert } from 'antd';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSalesOrders } from '../hooks/useSalesOrders';
import { useSalesContracts } from '../../salesContract/hooks/useSalesContracts';
import { useOrderItems } from '../../orderItem/hooks/useOrderItems';
import { useOrderTracking } from '../../orderTracking/hooks/useOrderTracking';
import OrderSummary from '../components/OrderSummary';
import OrderItemList from '../../orderItem/components/OrderItemList';
import TrackingTimeline from '../../orderTracking/components/TrackingTimeline';
import ContractDetails from '../../salesContract/components/ContractDetails';
import ContractSignModal from '../../salesContract/components/ContractSignModal';

const { TabPane } = Tabs;

const SalesOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Hooks
  const { orders, loading: ordersLoading, recalcOrderItems } = useSalesOrders();
  const { items, loading: itemsLoading } = useOrderItems(orderId);
  const { trackings, currentStatus, loading: trackingLoading } = useOrderTracking(orderId);
  const { contract, loading: contractLoading, signContract, generateFromTemplate } = useSalesContracts(orderId);

  const [signModalVisible, setSignModalVisible] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);

  // Tìm đơn hàng theo ID
  const order = orders.find(o => o.orderId == orderId);

  // Loading & Not Found
  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
          <p className="text-gray-500 mb-4">Đơn hàng với ID {orderId} không tồn tại.</p>
          <Link
            to="/sales-orders"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // Xử lý hợp đồng
  const handleGenerateContract = async () => {
    try {
      await generateFromTemplate(orderId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSign = async (contractId, digitalSignature) => {
    try {
      await signContract(contractId, digitalSignature);
      setSignModalVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  // 🟢 Xử lý tính toán lại order items
  const handleRecalcOrderItems = async () => {
    try {
      setRecalcLoading(true);
      await recalcOrderItems(orderId);
    } catch (error) {
      console.error("Recalculate order items error:", error);
    } finally {
      setRecalcLoading(false);
    }
  };

  return (
    <PageContainer
      header={{
        title: `Đơn hàng #${orderId}`,
        breadcrumb: {
          items: [
            { title: 'Bán hàng' },
            { title: 'Đơn hàng' },
            { title: `Đơn hàng #${orderId}` },
          ],
        },
      }}
      extra={[
        <Button key="tracking" onClick={() => navigate(`tracking`)}>
          Theo dõi đơn hàng
        </Button>,
        <Button key="contract" type="primary" onClick={() => navigate(`contract/create`)}>
          Tạo hợp đồng
        </Button>,
      ]}
    >
      {/* Thông tin đơn hàng */}
      <OrderSummary order={order} />

      <ProCard style={{ marginTop: 16 }}>
        <Tabs defaultActiveKey="items">
          {/* Tab sản phẩm */}
          <TabPane tab="Sản phẩm" key="items">
            <Space style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                onClick={handleRecalcOrderItems}
                loading={recalcLoading}
              >
                Tính toán lại
              </Button>
            </Space>
            <OrderItemList
              items={items}
              loading={itemsLoading || recalcLoading}
              orderId={orderId}
              readOnly={order.orderStatusB2C === 'CANCELLED' || order.orderStatusB2C === 'DELIVERED'}
            />
          </TabPane>

          {/* Tab theo dõi */}
          <TabPane tab="Theo dõi" key="tracking">
            <TrackingTimeline
              trackings={trackings}
              currentStatus={currentStatus}
              loading={trackingLoading}
              orderId={orderId}
            />
          </TabPane>

          {/* Tab hợp đồng */}
          <TabPane tab="Hợp đồng" key="contract">
            {contract ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {contract.contractStatus === 'PENDING_SIGNATURE' && (
                  <Alert
                    message="Hợp đồng đang chờ ký"
                    description="Vui lòng ký hợp đồng để hoàn tất quá trình."
                    type="warning"
                    showIcon
                    action={
                      <Button size="small" type="primary" onClick={() => setSignModalVisible(true)}>
                        Ký ngay
                      </Button>
                    }
                  />
                )}
                {contract.contractStatus === 'SIGNED' && (
                  <Alert
                    message="Hợp đồng đã được ký"
                    description="Hợp đồng đã có hiệu lực pháp lý."
                    type="success"
                    showIcon
                  />
                )}

                <ContractDetails
                  contract={contract}
                  onEdit={() => navigate(`/dealer/staff/contracts/${contract.contractId}`)}
                  onDownload={() => window.open(contract.contractFileUrl, '_blank')}
                  onSign={() => setSignModalVisible(true)}
                />
              </Space>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ fontSize: '16px', marginBottom: '16px' }}>
                  Chưa có hợp đồng cho đơn hàng này.
                </p>
                <Space>
                  <Button
                    type="primary"
                    onClick={() => navigate(`/dealer/staff/orders/${orderId}/contract/create`)}
                    size="large"
                  >
                    Tạo hợp đồng mới
                  </Button>
                  <Button
                    onClick={handleGenerateContract}
                    loading={contractLoading}
                    size="large"
                  >
                    Tạo từ mẫu
                  </Button>
                </Space>
              </div>
            )}
          </TabPane>
        </Tabs>
      </ProCard>

      {/* Modal ký hợp đồng */}
      {contract && (
        <ContractSignModal
          visible={signModalVisible}
          contract={contract}
          onSign={handleSign}
          onCancel={() => setSignModalVisible(false)}
          loading={contractLoading}
        />
      )}
      
    </PageContainer>
  );
};

export default SalesOrderDetailPage;
