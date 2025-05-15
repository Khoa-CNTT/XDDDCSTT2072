import api from './api';

/**
 * Dịch vụ quản lý đăng ký thời tiết cho Admin
 */
const weatherSubscriptionService = {
  // Lấy tất cả đăng ký thời tiết của một người dùng cụ thể
  async getUserSubscriptions(userId) {
    try {
      const response = await api.get(`/weather-subscriptions/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách đăng ký của người dùng ID ${userId}:`, error);
      throw error;
    }
  },

  // Lấy thông tin đăng ký cụ thể của một người dùng
  async getUserSubscription(userId, locationId) {
    try {
      const response = await api.get(`/weather-subscriptions/users/${userId}/locations/${locationId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin đăng ký của người dùng ID ${userId} cho địa điểm ID ${locationId}:`, error);
      throw error;
    }
  },

  // Cập nhật trạng thái thông báo cho một người dùng cụ thể
  async updateUserNotificationStatus(userId, locationId, enableNotifications) {
    try {
      const response = await api.patch(`/weather-subscriptions/users/${userId}/locations/${locationId}/notifications?enableNotifications=${enableNotifications}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật trạng thái thông báo của người dùng ID ${userId} cho địa điểm ID ${locationId}:`, error);
      throw error;
    }
  },

  // Hủy đăng ký theo dõi địa điểm cho một người dùng cụ thể
  async unsubscribeUserFromLocation(userId, locationId) {
    try {
      const response = await api.delete(`/weather-subscriptions/users/${userId}/locations/${locationId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi hủy đăng ký của người dùng ID ${userId} cho địa điểm ID ${locationId}:`, error);
      throw error;
    }
  },

  // Lấy tất cả các đăng ký có bật thông báo
  async getActiveNotificationSubscriptions() {
    try {
      const response = await api.get('/weather-subscriptions/active-notifications');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đăng ký có bật thông báo:', error);
      throw error;
    }
  }
};

export default weatherSubscriptionService; 