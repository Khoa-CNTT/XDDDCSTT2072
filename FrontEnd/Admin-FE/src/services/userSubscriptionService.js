import api from './api';

/**
 * Dịch vụ quản lý đăng ký gói dịch vụ của người dùng
 */
const userSubscriptionService = {
  // Lấy tất cả gói đăng ký của một người dùng cụ thể
  async getUserSubscriptions(userId) {
    try {
      const response = await api.get(`/user-subscriptions/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy gói đăng ký của người dùng ID ${userId}:`, error);
      throw error;
    }
  },

  // Lấy gói đăng ký đang hoạt động mới nhất của một người dùng cụ thể
  async getUserActiveSubscription(userId) {
    try {
      const response = await api.get(`/user-subscriptions/users/${userId}/active`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy gói đăng ký đang hoạt động của người dùng ID ${userId}:`, error);
      throw error;
    }
  },

  // Đăng ký gói cho một người dùng cụ thể
  async subscribeUserToPlan(userId, planId, autoRenew = false) {
    try {
      const response = await api.post(`/user-subscriptions/users/${userId}/plans/${planId}?autoRenew=${autoRenew}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi đăng ký gói cho người dùng ID ${userId}:`, error);
      throw error;
    }
  },

  // Kiểm tra liệu người dùng có thể đăng ký thêm địa điểm
  async canUserSubscribeMoreLocations(userId) {
    try {
      const response = await api.get(`/user-subscriptions/users/${userId}/can-subscribe-more`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi kiểm tra khả năng đăng ký thêm địa điểm của người dùng ID ${userId}:`, error);
      throw error;
    }
  },

  // Lấy số lượng địa điểm còn lại có thể đăng ký của một người dùng cụ thể
  async getUserRemainingLocations(userId) {
    try {
      const response = await api.get(`/user-subscriptions/users/${userId}/remaining-locations`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy số lượng địa điểm còn lại của người dùng ID ${userId}:`, error);
      throw error;
    }
  },

  // Lấy tất cả gói đăng ký của người dùng đăng nhập hiện tại
  async getCurrentUserSubscriptions() {
    try {
      const response = await api.get('/user-subscriptions');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy gói đăng ký của người dùng hiện tại:', error);
      throw error;
    }
  },

  // Lấy gói đăng ký đang hoạt động mới nhất của người dùng đăng nhập hiện tại
  async getCurrentUserActiveSubscription() {
    try {
      const response = await api.get('/user-subscriptions/active');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy gói đăng ký đang hoạt động của người dùng hiện tại:', error);
      throw error;
    }
  },

  // Đăng ký gói cho người dùng đăng nhập hiện tại
  async subscribeCurrentUserToPlan(planId, autoRenew = false) {
    try {
      const response = await api.post(`/user-subscriptions/${planId}?autoRenew=${autoRenew}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đăng ký gói cho người dùng hiện tại:', error);
      throw error;
    }
  },

  // Hủy đăng ký gói cho người dùng đăng nhập hiện tại
  async cancelSubscription(subscriptionId) {
    try {
      await api.delete(`/user-subscriptions/${subscriptionId}`);
    } catch (error) {
      console.error(`Lỗi khi hủy đăng ký ID ${subscriptionId}:`, error);
      throw error;
    }
  },

  // Kiểm tra liệu người dùng hiện tại có thể đăng ký thêm địa điểm
  async canSubscribeMoreLocations() {
    try {
      const response = await api.get('/user-subscriptions/can-subscribe-more');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi kiểm tra khả năng đăng ký thêm địa điểm:', error);
      throw error;
    }
  },

  // Lấy số lượng địa điểm còn lại có thể đăng ký
  async getRemainingLocations() {
    try {
      const response = await api.get('/user-subscriptions/remaining-locations');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy số lượng địa điểm còn lại:', error);
      throw error;
    }
  },
  
  // Lấy tất cả đăng ký trong hệ thống
  async getAllSubscriptions() {
    try {
      const response = await api.get('/user-subscriptions/all');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy tất cả đăng ký:', error);
      throw error;
    }
  }
};

export default userSubscriptionService; 