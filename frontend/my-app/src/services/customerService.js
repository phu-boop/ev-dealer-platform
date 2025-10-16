import apiConstUserService from "./apiConstUserService";

class CustomerService {
  async getAllCustomers(search = "") {
    try {
      const response = await apiConstUserService.get(`/customers?search=${encodeURIComponent(search)}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  }

  async getCustomerById(id) {
    try {
      const response = await apiConstUserService.get(`/customers/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }
  }

  async createCustomer(customerData) {
    try {
      const response = await apiConstUserService.post("/customers", customerData);
      return response.data.data;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }

  async updateCustomer(id, customerData) {
    try {
      const modifiedBy = sessionStorage.getItem('email') || sessionStorage.getItem('name') || 'web-ui';
      const response = await apiConstUserService.put(`/customers/${id}`, customerData, { headers: { 'X-Modified-By': modifiedBy } });
      return response.data.data;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }

  async deleteCustomer(id) {
    try {
      const response = await apiConstUserService.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }
}

export default new CustomerService();