import axios from "axios";

const apiConstCustomerService = axios.create({
  baseURL: "http://localhost:8080/customers",
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

apiConstCustomerService.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiConstCustomerService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const res = await axios.post("http://localhost:8080/auth/refresh", {}, { withCredentials: true });
        const newToken = res.data.data.accessToken;
        sessionStorage.setItem("token", newToken);
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiConstCustomerService(error.config);
      } catch (refreshError) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// Customer Service Methods
// ============================================

class CustomerService {
  /**
   * Get all customers with optional search
   * @param {string} search - Search query
   * @returns {Promise<Array>} List of customers
   */
  async getAllCustomers(search = "") {
    try {
      const params = search ? { search: encodeURIComponent(search) } : {};
      const response = await apiConstCustomerService.get("", { params });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   * @param {number} id - Customer ID
   * @returns {Promise<Object>} Customer data
   */
  async getCustomerById(id) {
    try {
      const response = await apiConstCustomerService.get(`/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }
  }

  /**
   * Create new customer
   * @param {Object} customerData - Customer information
   * @returns {Promise<Object>} Created customer data
   */
  async createCustomer(customerData) {
    try {
      const response = await apiConstCustomerService.post("", customerData);
      return response.data.data;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }

  /**
   * Update existing customer
   * @param {number} id - Customer ID
   * @param {Object} customerData - Updated customer information
   * @returns {Promise<Object>} Updated customer data
   */
  async updateCustomer(id, customerData) {
    try {
      const modifiedBy = sessionStorage.getItem('email') || sessionStorage.getItem('name') || 'web-ui';
      const response = await apiConstCustomerService.put(`/${id}`, customerData, {
        headers: { 'X-Modified-By': modifiedBy }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }

  /**
   * Delete customer
   * @param {number} id - Customer ID
   * @returns {Promise<Object>} Delete confirmation
   */
  async deleteCustomer(id) {
    try {
      const response = await apiConstCustomerService.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }

  /**
   * Get customer audit history
   * @param {number} id - Customer ID
   * @returns {Promise<Array>} List of audit records
   */
  async getCustomerAuditHistory(id) {
    try {
      const response = await apiConstCustomerService.get(`/${id}/audit-history`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching customer audit history:", error);
      throw error;
    }
  }

  /**
   * Get available customer statuses
   * @returns {Promise<Array>} List of status enums
   */
  async getCustomerStatuses() {
    try {
      const response = await apiConstCustomerService.get("/enums/statuses");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching customer statuses:", error);
      throw error;
    }
  }

  /**
   * Get available customer types
   * @returns {Promise<Array>} List of customer type enums
   */
  async getCustomerTypes() {
    try {
      const response = await apiConstCustomerService.get("/enums/types");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching customer types:", error);
      throw error;
    }
  }
}

export default new CustomerService();

