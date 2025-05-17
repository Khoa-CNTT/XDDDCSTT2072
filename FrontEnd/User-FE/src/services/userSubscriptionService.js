import { axiosPrivate } from './api/axios';
import config from '@/config/env';
// Đảm bảo không có dấu / ở đầu API_URL
const API_URL = (config.API_URL || 'api/v1').replace(/^\//, '');

/**
 * Service để xử lý các API liên quan đến đăng ký gói dịch vụ
 */
const userSubscriptionService = {
  /**
   * Lấy thông tin gói đăng ký hiện tại của người dùng
   */
  getCurrentSubscription: async () => {
    try {
      // Log để debug
      console.log(`Gọi API: ${API_URL}/user-subscriptions/active`);
      const response = await axiosPrivate.get(`${API_URL}/user-subscriptions/active`);
      console.log('Kết quả API getCurrentSubscription:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin gói đăng ký hiện tại:', error);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      return null;
    }
  },

  /**
   * Lấy danh sách gói đăng ký của người dùng
   */
  getUserSubscriptions: async () => {
    try {
      // Log để debug
      console.log(`Gọi API: ${API_URL}/user-subscriptions`);
      const response = await axiosPrivate.get(`${API_URL}/user-subscriptions`);
      console.log('Kết quả API getUserSubscriptions:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách gói đăng ký:', error);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      return [];
    }
  },

  /**
   * Đăng ký gói dịch vụ mới
   */
  subscribeToPlan: async (planId, autoRenew = false) => {
    try {
      // Log để debug
      console.log(`Gọi API: ${API_URL}/user-subscriptions/${planId}?autoRenew=${autoRenew}`);
      const response = await axiosPrivate.post(`${API_URL}/user-subscriptions/${planId}?autoRenew=${autoRenew}`);
      console.log('Kết quả API subscribeToPlan:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đăng ký gói dịch vụ:', error);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },

  /**
   * Hủy đăng ký gói dịch vụ
   */
  cancelSubscription: async (subscriptionId) => {
    try {
      // Log để debug
      console.log(`Gọi API: ${API_URL}/user-subscriptions/${subscriptionId}`);
      const response = await axiosPrivate.delete(`${API_URL}/user-subscriptions/${subscriptionId}`);
      console.log('Kết quả API cancelSubscription:', response.status);
      
      return true;
    } catch (error) {
      console.error('Lỗi khi hủy đăng ký gói dịch vụ:', error);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },

  /**
   * Kiểm tra số lượng địa điểm còn lại có thể đăng ký
   */
  getRemainingLocations: async () => {
    try {
      // Log để debug
      console.log(`Gọi API: ${API_URL}/user-subscriptions/remaining-locations`);
      const response = await axiosPrivate.get(`${API_URL}/user-subscriptions/remaining-locations`);
      console.log('Kết quả API getRemainingLocations:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy số lượng địa điểm còn lại:', error);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      return 0;
    }
  },

  /**
   * Kiểm tra xem người dùng có quyền bán hàng hay không
   * (dựa vào gói đăng ký hiện tại)
   */
  checkSellerPermission: async () => {
    // Tạm thời trả về true để test - sẽ triển khai API thực sau
    return true;
  }
};

export default userSubscriptionService; 