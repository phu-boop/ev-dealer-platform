// src/pages/contract/ContractCreatePage.jsx
import React, { useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalesContracts } from '../hooks/useSalesContracts';
import { useSalesOrders } from '../../salesOrder/hooks/useSalesOrders';
<<<<<<< HEAD
<<<<<<< HEAD
import ContractForm from '../components/ContractForm';
import { Spin } from 'antd';
=======
import { ContractForm } from '../components/ContractForm';
>>>>>>> db1dc0643d99796268a2cbfe7d089bdd3a70ca4b
=======
import ContractForm from '../components/ContractForm';
import { Spin } from 'antd';
>>>>>>> b309f3896278852ef156955393c9233618568eda

const ContractCreatePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { createContract, loading: contractLoading } = useSalesContracts();
  const { orders, loading: ordersLoading } = useSalesOrders();

  // Tìm đơn hàng tương ứng
  const order = useMemo(() => {
    if (orderId && orders.length > 0) {
      return orders.find((o) => o.id === orderId);
    }
    return null;
  }, [orders, orderId]);

  const handleSubmit = async (values) => {
    try {
      await createContract({
        ...values,
        orderId,
      });
      navigate(-1); // quay lại trang trước
    } catch (error) {
      // Error handled trong hook
    }
  };

  if (ordersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <PageContainer
      header={{
        title: 'Tạo hợp đồng bán hàng',
        breadcrumb: {
          render: () => (
            <div className="flex items-center gap-2 text-sm">
              <span
                className="cursor-pointer text-blue-600 hover:underline"
                onClick={() => navigate('/dealer')}
              >
                Bán hàng
              </span>
              <span>/</span>
              <span
                className="cursor-pointer text-blue-600 hover:underline"
                onClick={() => navigate('/dealer/orders')}
              >
                Đơn hàng
              </span>
              <span>/</span>
              <span
                className="cursor-pointer text-blue-600 hover:underline"
                onClick={() => navigate(`/dealer/orders/${orderId}`)}
              >
                Đơn hàng #{orderId}
              </span>
              <span>/</span>
              <span className="text-gray-500">Tạo hợp đồng</span>
            </div>
          ),
          items: [], // để trống items khi custom render
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
        loading={contractLoading}
        orderInfo={order}
      />
    </PageContainer>
  );
};

export default ContractCreatePage;
