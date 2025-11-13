import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalesContracts } from '../hooks/useSalesContracts';
import { useSalesOrders } from '../../salesOrder/hooks/useSalesOrders';
import { ContractForm } from '../components/ContractForm';

const ContractCreatePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { createContract, loading } = useSalesContracts();
  const { orders } = useSalesOrders();

  const order = orders.find(o => o.id === orderId);

  const handleSubmit = async (values) => {
    try {
      await createContract({
        ...values,
        orderId: orderId,
      });
      navigate(`/dealer/staff/orders/${orderId}`);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <PageContainer
      header={{
        title: 'Tạo hợp đồng bán hàng',
        breadcrumb: {
          items: [
            { title: 'Bán hàng' },
            { title: 'Đơn hàng', path: '/dealer/staff/orders' },
            { title: `Đơn hàng #${orderId}`, path: `/dealer/staff/orders/${orderId}` },
            { title: 'Tạo hợp đồng' },
          ],
        },
      }}
      content={
        <div>
          <p>Tạo hợp đồng bán hàng mới cho đơn hàng #{orderId}</p>
        </div>
      }
    >
      <ContractForm 
        onSubmit={handleSubmit} 
        loading={loading}
        orderInfo={order}
      />
    </PageContainer>
  );
};

export default ContractCreatePage;