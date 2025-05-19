import api from './api';

/**
 * Dịch vụ quản lý gói đăng ký
 */
const subscriptionPlanService = {
  // Lấy tất cả các gói đăng ký
  async getAllPlans() {
    try {
      const response = await api.get('/subscription-plans');
      return response.data?.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách gói đăng ký:', error);
      throw error;
    }
  },

  // Lấy tất cả các gói đăng ký đang hoạt động
  async getActivePlans() {
    try {
      const response = await api.get('/subscription-plans/active');
      return response.data?.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách gói đăng ký đang hoạt động:', error);
      throw error;
    }
  },

  // Lấy thông tin gói đăng ký theo ID
  async getPlanById(id) {
    try {
      const response = await api.get(`/subscription-plans/${id}`);
      return response.data?.data || {};
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin gói đăng ký ID ${id}:`, error);
      throw error;
    }
  },

  // Lấy gói miễn phí
  async getFreePlan() {
    try {
      const response = await api.get('/subscription-plans/free');
      return response.data?.data || {};
    } catch (error) {
      console.error('Lỗi khi lấy gói miễn phí:', error);
      throw error;
    }
  },

  // Tạo gói đăng ký mới
  async createPlan(planData) {
    try {
      const response = await api.post('/subscription-plans', planData);
      return response.data?.data || {};
    } catch (error) {
      console.error('Lỗi khi tạo gói đăng ký mới:', error);
      throw error;
    }
  },

  // Cập nhật thông tin gói đăng ký
  async updatePlan(id, planData) {
    try {
      const response = await api.put(`/subscription-plans/${id}`, planData);
      return response.data?.data || {};
    } catch (error) {
      console.error(`Lỗi khi cập nhật gói đăng ký ID ${id}:`, error);
      throw error;
    }
  },

  // Kích hoạt/vô hiệu hóa gói đăng ký
  async togglePlanStatus(id, active) {
    try {
      const response = await api.patch(`/subscription-plans/${id}/status?active=${active}`);
      return response.data?.data || {};
    } catch (error) {
      console.error(`Lỗi khi thay đổi trạng thái gói đăng ký ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa gói đăng ký
  async deletePlan(id) {
    try {
      await api.delete(`/subscription-plans/${id}`);
    } catch (error) {
      console.error(`Lỗi khi xóa gói đăng ký ID ${id}:`, error);
      throw error;
    }
  }
};

export default subscriptionPlanService; 