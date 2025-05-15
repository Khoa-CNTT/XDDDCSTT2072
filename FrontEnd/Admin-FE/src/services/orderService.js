import api from './api';

const orderService = {
  async getAllOrders(page = 0, size = 10, status = null) {
    try {
      const params = { page, size };
      if (status) params.status = status;
      
      const response = await api.get(`/admin/orders`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async getOrderById(id) {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async updateOrderStatus(id, status) {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async getOrderAnalytics(startDate, endDate) {
    try {
      const response = await api.get('/admin/order-analytics', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async getRecentOrders(limit = 5) {
    try {
      const response = await api.get('/admin/orders/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async cancelOrder(id, reason) {
    try {
      const response = await api.put(`/admin/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default orderService; 