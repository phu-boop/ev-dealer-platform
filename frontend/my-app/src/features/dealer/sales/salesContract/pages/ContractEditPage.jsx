import React, { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalesContracts } from '../hooks/useSalesContracts';
import ContractForm from '../components/ContractForm';

const ContractEditPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { contract, loading, fetchContractById, updateContract } = useSalesContracts();

  useEffect(() => {
    if (contractId) {
      fetchContractById(contractId);
    }
  }, [contractId]);

  const handleSubmit = async (values) => {
    try {
      await updateContract(contractId, values);
      navigate(`/dealer/staff/contracts/${contractId}`);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (loading && !contract) {
    return <div>Loading...</div>;
  }

  if (!contract) {
    return <div>Không tìm thấy hợp đồng</div>;
  }

  return (
    <PageContainer
      header={{
        title: `Chỉnh sửa hợp đồng #${contract.contractNumber}`,
        breadcrumb: {
          items: [
            { title: 'Bán hàng' },
            { title: 'Hợp đồng', path: '/dealer/staff/contracts' },
            { title: `Hợp đồng #${contract.contractNumber}`, path: `/dealer/staff/contracts/${contractId}` },
            { title: 'Chỉnh sửa' },
          ],
        },
      }}
      content={
        <div>
          <p style={{ margin: 0, color: '#666' }}>
            Chỉnh sửa thông tin hợp đồng bán hàng. Các thay đổi sẽ được cập nhật ngay lập tức.
          </p>
        </div>
      }
    >
      <ContractForm 
        initialValues={{
          ...contract,
          contractDate: contract.contractDate ? dayjs(contract.contractDate) : null,
          signingDate: contract.signingDate ? dayjs(contract.signingDate) : null,
        }}
        onSubmit={handleSubmit}
        loading={loading}
        isEdit={true}
      />
    </PageContainer>
  );
};

export default ContractEditPage;