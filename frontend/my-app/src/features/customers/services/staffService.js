// Service để lấy thông tin nhân viên từ User Service
import apiConstUserService from "../../../services/apiConstUserService";

const staffService = {
  /**
   * Lấy danh sách nhân viên theo dealerId
   * @param {string} dealerId - UUID của dealer
   * @returns {Promise<Array>} Danh sách nhân viên
   */
  async getStaffByDealerId(dealerId) {
    try {
      const response = await apiConstUserService.get(`/users/profile/${dealerId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching staff list:', error);
      throw error;
    }
  },
};

export default staffService;
