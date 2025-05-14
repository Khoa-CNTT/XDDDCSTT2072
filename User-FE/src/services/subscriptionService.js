// import axios from 'axios';
import config from '@/config/env';
const API_URL = config.API_URL;

/**
 * Service để gọi các API liên quan đến gói đăng ký
 */
const subscriptionService = {
  /**
   * Lấy tất cả các gói đăng ký đang hoạt động
   */
  getActivePlans: async (axiosPrivate) => {
    try {
      const response = await axiosPrivate.get(`${API_URL}/subscription-plans/active`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách gói đăng ký đang hoạt động:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin gói đăng ký theo ID
   */
  getPlanById: async (axiosPrivate, id) => {
    try {
      const response = await axiosPrivate.get(`${API_URL}/subscription-plans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin gói đăng ký ID=${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy gói miễn phí
   */
  getFreePlan: async (axiosPrivate) => {
    try {
      const response = await axiosPrivate.get(`${API_URL}/subscription-plans/free`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy gói miễn phí:', error);
      throw error;
    }
  },

  /**
   * [Admin] Lấy tất cả các gói đăng ký
   */
  getAllPlans: async (axiosPrivate) => {
    try {
      const response = await axiosPrivate.get(`${API_URL}/subscription-plans`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy tất cả các gói đăng ký:', error);
      throw error;
    }
  },

  /**
   * [Admin] Tạo gói đăng ký mới
   */
  createPlan: async (axiosPrivate, planData) => {
    try {
      const response = await axiosPrivate.post(`${API_URL}/subscription-plans`, planData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo gói đăng ký mới:', error);
      throw error;
    }
  },

  /**
   * [Admin] Cập nhật thông tin gói đăng ký
   */
  updatePlan: async (axiosPrivate, id, planData) => {
    try {
      const response = await axiosPrivate.put(`${API_URL}/subscription-plans/${id}`, planData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật gói đăng ký ID=${id}:`, error);
      throw error;
    }
  },

  /**
   * [Admin] Kích hoạt/vô hiệu hóa gói đăng ký
   */
  togglePlanStatus: async (axiosPrivate, id, active) => {
    try {
      const response = await axiosPrivate.patch(`${API_URL}/subscription-plans/${id}/status?active=${active}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi thay đổi trạng thái gói đăng ký ID=${id}:`, error);
      throw error;
    }
  },

  /**
   * [Admin] Xóa gói đăng ký
   */
  deletePlan: async (axiosPrivate, id) => {
    try {
      await axiosPrivate.delete(`${API_URL}/subscription-plans/${id}`);
      return true;
    } catch (error) {
      console.error(`Lỗi khi xóa gói đăng ký ID=${id}:`, error);
      throw error;
    }
  }
};

export default subscriptionService; 