
// Trong SalesOrderDetailPage.jsx
import React, { useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Tabs, Button, Space, Alert, message } from 'antd';
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
  const { items, loading: itemsLoading, createOrderItem, updateOrderItem, deleteOrderItem } = useOrderItems(orderId);
  const { trackings, currentStatus, loading: trackingLoading, createTracking, updateTracking, deleteTracking } = useOrderTracking(orderId);
  const { contract, loading: contractLoading, signContract, generateFromTemplate, createContract, updateContract, deleteContract } = useSalesContracts(orderId);

  const [signModalVisible, setSignModalVisible] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);

  // Tìm đơn hàng theo ID
  const order = orders.find(o => o.orderId == orderId);

  // Xác định quyền truy cập dựa trên trạng thái
  const getPermissions = () => {
    const status = order?.orderStatusB2C;
    
    switch (status) {
      case 'PENDING':
        return {
          canCRUDOrderItems: true,
          canCRUDContract: true,
          canCRUDTracking: false,
          canViewOnly: false
        };
      case 'EDITED':
      case 'APPROVED':
        return {
          canCRUDOrderItems: false,
          canCRUDContract: false,
          canCRUDTracking: false,
          canViewOnly: false
        };
      case 'CONFIRMED':
        return {
          canCRUDOrderItems: false,
          canCRUDContract: false,
          canCRUDTracking: true,
          canViewOnly: false
        };
      case 'DELIVERED':
      case 'CANCELLED':
        return {
          canCRUDOrderItems: false,
          canCRUDContract: false,
          canCRUDTracking: false,
          canViewOnly: true
        };
      default:
        return {
          canCRUDOrderItems: false,
          canCRUDContract: false,
          canCRUDTracking: false,
          canViewOnly: false
        };
    }
  };

  const permissions = getPermissions();

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
    if (!permissions.canCRUDContract) {
      message.warning('Không có quyền thao tác hợp đồng trong trạng thái hiện tại');
      return;
    }
    try {
      await generateFromTemplate(orderId);
      message.success('Tạo hợp đồng từ mẫu thành công');
    } catch (error) {
      console.error(error);
      message.error('Tạo hợp đồng thất bại');
    }
  };

  const handleCreateContract = () => {
    if (!permissions.canCRUDContract) {
      message.warning('Không có quyền tạo hợp đồng trong trạng thái hiện tại');
      return;
    }
    navigate(`/dealer/staff/orders/${orderId}/contract/create`);
  };

  const handleSign = async (contractId, digitalSignature) => {
    try {
      await signContract(contractId, digitalSignature);
      setSignModalVisible(false);
      message.success('Ký hợp đồng thành công');
    } catch (error) {
      console.error(error);
      message.error('Ký hợp đồng thất bại');
    }
  };

  // Xử lý tính toán lại order items
  const handleRecalcOrderItems = async () => {
    if (!permissions.canCRUDOrderItems) {
      message.warning('Không có quyền tính toán lại trong trạng thái hiện tại');
      return;
    }
    try {
      setRecalcLoading(true);
      await recalcOrderItems(orderId);
      message.success('Tính toán lại thành công');
    } catch (error) {
      console.error("Recalculate order items error:", error);
      message.error('Tính toán lại thất bại');
    } finally {
      setRecalcLoading(false);
    }
  };

  // Xử lý tracking
  const handleCreateTracking = () => {
    if (!permissions.canCRUDTracking) {
      message.warning('Không có quyền tạo tracking trong trạng thái hiện tại');
      return;
    }
    navigate(`/dealer/staff/orders/${orderId}/tracking/create`);
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
        <Button 
          key="tracking" 
          onClick={handleCreateTracking}
          disabled={!permissions.canCRUDTracking}
        >
          Theo dõi đơn hàng
        </Button>,
        <Button 
          key="contract" 
          type="primary" 
          onClick={handleCreateContract}
          disabled={!permissions.canCRUDContract}
        >
          Tạo hợp đồng
        </Button>,
      ]}
    >
      {/* Hiển thị trạng thái hiện tại */}
      <Alert
        message={`Trạng thái hiện tại: ${order.orderStatusB2C}`}
        description={getStatusDescription(order.orderStatusB2C)}
        type={getStatusType(order.orderStatusB2C)}
        showIcon
        style={{ marginBottom: 16 }}
      />

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
                disabled={!permissions.canCRUDOrderItems}
              >
                Tính toán lại
              </Button>
              {permissions.canCRUDOrderItems && (
                <Button
                  type="default"
                  onClick={() => navigate(`/dealer/staff/orders/${orderId}/items/create`)}
                >
                  Thêm sản phẩm
                </Button>
              )}
            </Space>
            <OrderItemList
              items={items}
              loading={itemsLoading || recalcLoading}
              orderId={orderId}
              readOnly={!permissions.canCRUDOrderItems || permissions.canViewOnly}
              onEdit={permissions.canCRUDOrderItems ? 
                (itemId) => navigate(`/dealer/staff/orders/${orderId}/items/${itemId}/edit`) : 
                undefined
              }
              onDelete={permissions.canCRUDOrderItems ? 
                (itemId) => deleteOrderItem(itemId) : 
                undefined
              }
            />
          </TabPane>

          {/* Tab hợp đồng */}
          <TabPane tab="Hợp đồng" key="contract">
            {contract ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {contract.contractStatus === 'PENDING_SIGNATURE' && permissions.canCRUDContract && (
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
                  onEdit={permissions.canCRUDContract ? 
                    () => navigate(`/dealer/staff/contracts/${contract.contractId}`) : 
                    undefined
                  }
                  onDownload={() => window.open(contract.contractFileUrl, '_blank')}
                  onSign={permissions.canCRUDContract ? 
                    () => setSignModalVisible(true) : 
                    undefined
                  }
                  onDelete={permissions.canCRUDContract ? 
                    () => deleteContract(contract.contractId) : 
                    undefined
                  }
                  readOnly={!permissions.canCRUDContract || permissions.canViewOnly}
                />
              </Space>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ fontSize: '16px', marginBottom: '16px' }}>
                  Chưa có hợp đồng cho đơn hàng này.
                </p>
                {permissions.canCRUDContract && (
                  <Space>
                    <Button
                      type="primary"
                      onClick={handleCreateContract}
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
                )}
                {!permissions.canCRUDContract && (
                  <Alert
                    message="Không có quyền tạo hợp đồng"
                    description="Trạng thái đơn hàng hiện tại không cho phép tạo hoặc chỉnh sửa hợp đồng."
                    type="info"
                    showIcon
                  />
                )}
              </div>
            )}
          </TabPane>

          {/* Tab theo dõi */}
          <TabPane tab="Theo dõi" key="tracking">
            <TrackingTimeline
              trackings={trackings}
              currentStatus={currentStatus}
              loading={trackingLoading}
              orderId={orderId}
              readOnly={!permissions.canCRUDTracking}
              onCreate={permissions.canCRUDTracking ? 
                () => navigate(`/dealer/staff/orders/${orderId}/tracking/create`) : 
                undefined
              }
              onEdit={permissions.canCRUDTracking ? 
                (trackId) => navigate(`/dealer/staff/orders/${orderId}/tracking/${trackId}/edit`) : 
                undefined
              }
              onDelete={permissions.canCRUDTracking ? 
                (trackId) => deleteTracking(trackId) : 
                undefined
              }
            />
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

// Hàm helper để lấy mô tả trạng thái
const getStatusDescription = (status) => {
  const descriptions = {
    PENDING: 'Đơn hàng mới được tạo, chưa được duyệt (bạn có thể thêm sản phẩm)',
    EDITED: 'Đơn hàng đã được gửi đến quản lý (đợi quản lý duyệt và khách hàng xác nhận)',
    APPROVED: 'Đơn hàng đã được quản lý duyệt để (đang chờ khách hàng xác nhận)',
    CONFIRMED: 'Khách hàng đã xác nhận đơn hàng (hãy tiến hành tạo hợp đồng)',
    REJECTED: 'Khách hàng đã từ chối xác nhận đơn hàng',
    IN_PRODUCTION: 'Đơn hàng đang trong quá trình sản xuất / chuẩn bị hàng',
    DELIVERED: 'Đơn hàng đã được giao thành công đến khách hàng (đơn hàng đã hoàng tất)',
    CANCELLED: 'Đơn hàng đã bị hủy (do khách hàng hoặc hệ thống)'
  };
  return descriptions[status] || 'Trạng thái không xác định';
};

// Hàm helper để lấy loại alert cho trạng thái
const getStatusType = (status) => {
  const types = {
    PENDING: 'info',
    EDITED: 'warning',
    APPROVED: 'success',
    CONFIRMED: 'success',
    REJECTED: 'error',
    IN_PRODUCTION: 'warning',
    DELIVERED: 'success',
    CANCELLED: 'error'
  };
  return types[status] || 'info';
};

export default SalesOrderDetailPage;