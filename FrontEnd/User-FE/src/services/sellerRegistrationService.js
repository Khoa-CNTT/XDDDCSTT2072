import { axiosPrivate } from './api/axios';
import config from '@/config/env';
// Đảm bảo không có dấu / ở đầu API_URL
const API_URL = (config.API_URL || 'api/v1').replace(/^\//, '');

/**
 * Service để xử lý các API liên quan đến đăng ký bán hàng
 */
const sellerRegistrationService = {
  /**
   * Tạo đơn đăng ký bán hàng mới
   */
  registerAsSeller: async (formData) => {
    try {
      // Log để debug
      console.log(`Gọi API: ${API_URL}/seller-registrations`);
      const response = await axiosPrivate.post(`${API_URL}/seller-registrations`, formData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đăng ký bán hàng:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin đăng ký bán hàng mới nhất của người dùng hiện tại
   */
  getCurrentRegistration: async () => {
    try {
      // Log để debug
      console.log(`Gọi API: ${API_URL}/seller-registrations/status`);
      const response = await axiosPrivate.get(`${API_URL}/seller-registrations/status`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin đăng ký bán hàng:', error);
      if (error.response && error.response.status === 404) {
        return { message: "Bạn chưa đăng ký bán hàng", data: null };
      }
      throw error;
    }
  },

  /**
   * Lấy lịch sử đăng ký bán hàng của người dùng hiện tại
   */
  getCurrentUserRegistrations: async () => {
    try {
      // Log để debug
      console.log(`Gọi API: ${API_URL}/seller-registrations/history`);
      const response = await axiosPrivate.get(`${API_URL}/seller-registrations/history`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử đăng ký bán hàng:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra người dùng hiện tại có đơn đăng ký đang chờ duyệt không
   */
  hasPendingRegistration: async () => {
    try {
      console.log(`Gọi API: ${API_URL}/seller-registrations/has-pending`);
      const response = await axiosPrivate.get(`${API_URL}/seller-registrations/has-pending`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi kiểm tra đơn đăng ký đang chờ duyệt:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra người dùng hiện tại đã được phê duyệt bán hàng chưa
   */
  isApproved: async () => {
    try {
      console.log(`Gọi API: ${API_URL}/seller-registrations/is-approved`);
      const response = await axiosPrivate.get(`${API_URL}/seller-registrations/is-approved`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái phê duyệt bán hàng:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra một người dùng cụ thể đã được phê duyệt bán hàng chưa
   */
  isUserApproved: async (userId) => {
    try {
      console.log(`Gọi API: ${API_URL}/seller-registrations/user/${userId}/is-approved`);
      const response = await axiosPrivate.get(`${API_URL}/seller-registrations/user/${userId}/is-approved`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái phê duyệt bán hàng của người dùng:', error);
      throw error;
    }
  }
};

export default sellerRegistrationService; 