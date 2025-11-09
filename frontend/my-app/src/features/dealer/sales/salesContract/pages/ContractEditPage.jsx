import React, { useEffect, useState } from 'react';
import { PageContainer, Alert, Spin } from '@ant-design/pro-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSalesContracts } from '../hooks/useSalesContracts';
import ContractForm from '../components/ContractForm';
import dayjs from 'dayjs';

const ContractEditPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { contract, loading, error, fetchContractById, updateContract } = useSalesContracts();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contractId) {
      fetchContractById(contractId);
    }
  }, [contractId, fetchContractById]); 
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await updateContract(contractId, values);
      navigate(`/dealer/staff/contracts/${contractId}`);
    } catch (error) {
      // Error handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading && !contract) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải thông tin hợp đồng...</div>
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error && !contract) {
    return (
      <PageContainer>
        <Alert
          message="Lỗi tải hợp đồng"
          description={error}
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          action={
            <Button size="small" onClick={() => fetchContractById(contractId)}>
              Thử lại
            </Button>
          }
        />
      </PageContainer>
    );
  }

  // No contract found
  if (!contract) {
    return (
      <PageContainer>
        <Alert
          message="Không tìm thấy hợp đồng"
          description={`Không thể tìm thấy hợp đồng với ID: ${contractId}`}
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => navigate('/dealer/staff/contracts')}>
              Quay lại danh sách
            </Button>
          }
        />
      </PageContainer>
    );
  }

  // Check if contract can be edited
  const canEdit = contract.contractStatus === 'DRAFT' || contract.contractStatus === 'PENDING_REVISION';

  return (
    <PageContainer
      header={{
        title: `Chỉnh sửa hợp đồng #${contract.contractNumber || contract.contractId}`,
        breadcrumb: {
          items: [
            { title: 'Bán hàng' },
            { title: 'Hợp đồng', path: '/dealer/staff/contracts' },
            { title: `Hợp đồng #${contract.contractNumber || contract.contractId}`, path: `/dealer/staff/contracts/${contractId}` },
            { title: 'Chỉnh sửa' },
          ],
        },
      }}
      extra={[
        <Button 
          key="back" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(`/dealer/staff/contracts/${contractId}`)}
        >
          Quay lại
        </Button>,
      ]}
      content={
        <div>
          <p style={{ margin: 0, color: '#666' }}>
            Chỉnh sửa thông tin hợp đồng bán hàng. Các thay đổi sẽ được cập nhật ngay lập tức.
          </p>
          {!canEdit && (
            <Alert
              message="Hợp đồng không thể chỉnh sửa"
              description="Chỉ có thể chỉnh sửa hợp đồng ở trạng thái DRAFT hoặc PENDING_REVISION."
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </div>
      }
    >
      {canEdit ? (
        <ContractForm 
          initialValues={{
            ...contract,
            contractDate: contract.contractDate ? dayjs(contract.contractDate) : null,
            signingDate: contract.signingDate ? dayjs(contract.signingDate) : null,
            effectiveDate: contract.effectiveDate ? dayjs(contract.effectiveDate) : null,
            expiryDate: contract.expiryDate ? dayjs(contract.expiryDate) : null,
          }}
          onSubmit={handleSubmit}
          loading={loading || submitting}
          isEdit={true}
        />
      ) : (
        <Alert
          message="Không thể chỉnh sửa"
          description="Hợp đồng này đã được ký hoặc đang trong trạng thái không cho phép chỉnh sửa."
          type="error"
          showIcon
        />
      )}
    </PageContainer>
  );
};

export default ContractEditPage;