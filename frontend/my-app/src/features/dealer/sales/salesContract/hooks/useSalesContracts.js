import { useState, useEffect } from 'react';
import { salesContractService } from '../services/salesContractService';
import { showSuccess, showError } from '../../../../../utils/notification';

export const useSalesContracts = (orderId) => {
  const [contracts, setContracts] = useState([]);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch contract by ID
  const fetchContractById = async (contractId) => {
    if (!contractId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await salesContractService.getById(contractId);
      setContract(response.data || response);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tải hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contract by order ID
  const fetchContractByOrderId = async (orderId) => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await salesContractService.getByOrderId(orderId);
      setContract(response.data || response);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tải hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contracts by status
  const fetchContractsByStatus = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await salesContractService.getByStatus(status));
      setContracts(response.data || []);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all contracts
  const fetchAllContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await salesContractService.getAll()).data;
      setContracts(response.data || []);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tải tất cả hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  // Fetch expiring contracts
  const fetchExpiringContracts = async (days = 7) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesContractService.getExpiring(days);
      setContracts(response.data || []);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tải danh sách hợp đồng sắp hết hạn');
    } finally {
      setLoading(false);
    }
  };

  // Search contracts
  const searchContracts = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesContractService.search(params);
      setContracts(response.data || []);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tìm kiếm hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  // Create contract
  const createContract = async (contractData) => {
    try {
      const response = await salesContractService.create(contractData);
      showSuccess('Tạo hợp đồng thành công');
      return response.data;
    } catch (err) {
      showError('Lỗi khi tạo hợp đồng');
      throw err;
    }
  };

  // Update contract
  const updateContract = async (contractId, contractData) => {
    try {
      const response = await salesContractService.update(contractId, contractData);
      showSuccess('Cập nhật hợp đồng thành công');
      return response.data;
    } catch (err) {
      showError('Lỗi khi cập nhật hợp đồng');
      throw err;
    }
  };

  // Sign contract
  const signContract = async (contractId, digitalSignature) => {
    try {
      const response = await salesContractService.sign(contractId, digitalSignature);
      showSuccess('Ký hợp đồng thành công');
      return response.data;
    } catch (err) {
      showError('Lỗi khi ký hợp đồng');
      throw err;
    }
  };

  // Update contract status
  const updateContractStatus = async (contractId, status) => {
    try {
      const response = (await salesContractService.updateStatus(contractId, status)).data;
      showSuccess('Cập nhật trạng thái hợp đồng thành công');
      return response.data;
    } catch (err) {
      showError('Lỗi khi cập nhật trạng thái hợp đồng');
      throw err;
    }
  };

  // Generate from template
  const generateFromTemplate = async (orderId) => {
    try {
      const response = await salesContractService.generateFromTemplate(orderId);
      showSuccess('Tạo hợp đồng từ mẫu thành công');
      return response.data;
    } catch (err) {
      showError('Lỗi khi tạo hợp đồng từ mẫu');
      throw err;
    }
  };

  // Validate contract
  const validateContract = async (contractId) => {
    try {
      const response = await salesContractService.validate(contractId);
      showSuccess('Hợp đồng hợp lệ');
      return response.data;
    } catch (err) {
      showError('Hợp đồng không hợp lệ');
      throw err;
    }
  };

  // Delete contract
  const deleteContract = async (contractId) => {
    try {
      const response = await salesContractService.delete(contractId);
      showSuccess('Xóa hợp đồng thành công');
      return response.data;
    } catch (err) {
      showError('Lỗi khi xóa hợp đồng');
      throw err;
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchContractByOrderId(orderId);
    }
  }, [orderId]);

  return {
    // State
    contract,
    contracts,
    loading,
    error,
    
    // Methods - Fetch
    fetchContractById,
    fetchContractByOrderId,
    fetchContractsByStatus,
    fetchAllContracts,
    fetchExpiringContracts,
    searchContracts,
    
    // Methods - CRUD
    createContract,
    updateContract,
    signContract,
    updateContractStatus,
    generateFromTemplate,
    validateContract,
    deleteContract,
  };
};