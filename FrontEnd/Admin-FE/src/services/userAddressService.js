import api from './api';

const userAddressService = {
  /**
   * Lấy tất cả địa chỉ (phân trang)
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa dữ liệu phân trang
   */
  getAllAddresses: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/user-addresses?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all addresses:', error);
      throw error;
    }
  },

  /**
   * Lấy địa chỉ của người dùng cụ thể
   * @param {number} userId - ID của người dùng
   * @returns {Promise} - Promise chứa danh sách địa chỉ
   */
  getUserAddresses: async (userId) => {
    try {
      const response = await api.get(`/user-addresses/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching addresses for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin địa chỉ theo ID
   * @param {number} id - ID của địa chỉ
   * @returns {Promise} - Promise chứa thông tin địa chỉ
   */
  getAddressById: async (id) => {
    try {
      const response = await api.get(`/user-addresses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching address #${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo địa chỉ mới
   * @param {Object} addressData - Dữ liệu của địa chỉ mới
   * @returns {Promise} - Promise chứa thông tin địa chỉ được tạo
   */
  createAddress: async (addressData) => {
    try {
      const response = await api.post('/user-addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  },

  /**
   * Cập nhật địa chỉ
   * @param {number} id - ID của địa chỉ
   * @param {Object} addressData - Dữ liệu cập nhật
   * @returns {Promise} - Promise chứa thông tin địa chỉ sau khi cập nhật
   */
  updateAddress: async (id, addressData) => {
    try {
      const response = await api.put(`/user-addresses/${id}`, addressData);
      return response.data;
    } catch (error) {
      console.error(`Error updating address #${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa địa chỉ
   * @param {number} id - ID của địa chỉ cần xóa
   * @returns {Promise} - Promise chứa kết quả xóa
   */
  deleteAddress: async (id) => {
    try {
      const response = await api.delete(`/user-addresses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting address #${id}:`, error);
      throw error;
    }
  }
};

export default userAddressService; 