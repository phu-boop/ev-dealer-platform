import React, { useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { useParams } from 'react-router-dom';
import { Button, Space, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useOrderTracking } from '../hooks/useOrderTracking';
import TrackingTimeline from '../components/TrackingTimeline';
import StatusBadge from '../components/StatusBadge';
import TrackingModal from '../components/TrackingModal';
import NoteForm from '../components/NoteForm';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const { trackings, currentStatus, loading, addTracking, addNote } = useOrderTracking(orderId);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddTracking = async (values) => {
    await addTracking({
      ...values,
      orderId,
      updatedBy: sessionStorage.getItem('profileId')
    });
    setModalVisible(false);
  };

  const handleAddNote = async (notes) => {
    await addNote(notes);
  };

  return (
    <PageContainer
      header={{
        title: `Theo dõi đơn hàng #${orderId}`,
        breadcrumb: {
          items: [
            { title: 'Bán hàng' },
            { title: 'Đơn hàng', path: '/sales/orders' },
            { title: `Theo dõi #${orderId}` },
          ],
        },
      }}
      extra={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Thêm trạng thái
        </Button>,
      ]}
      loading={loading}
    >
      <Row gutter={16}>
        <Col span={18}>
          <TrackingTimeline 
            trackings={trackings} 
            currentStatus={currentStatus} 
          />
        </Col>
        
        <Col span={6}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {currentStatus && (
              <ProCard title="Trạng thái hiện tại">
                <StatusBadge status={currentStatus.status} />
                <div style={{ marginTop: 8, fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}>
                  Cập nhật: {new Date(currentStatus.createdAt).toLocaleString('vi-VN')}
                </div>
              </ProCard>
            )}
            
            <NoteForm onSubmit={handleAddNote} />
          </Space>
        </Col>
      </Row>

      <TrackingModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleAddTracking}
      />
    </PageContainer>
  );
};

export default OrderTrackingPage;