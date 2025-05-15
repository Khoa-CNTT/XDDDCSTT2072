import api from './api';

const orderService = {
  async getAllOrders(page = 0, size = 10, status = null) {
    try {
      const params = { page, size };
      if (status) params.status = status;
      
      // Thử các endpoint khác nhau
      try {
        // Sử dụng endpoint /orders/seller thay vì /orders vì không có GET mapping cho /orders
        const response = await api.get(`/orders/seller`, { params });
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 403) {
          // Thử endpoint thay thế với role rõ ràng
          console.log('Thử endpoint thay thế do lỗi 403');
          const alternativeResponse = await api.get(`/orders/buyer`, { params });
          return alternativeResponse.data;
        }
        throw error;
      }
    } catch (error) {
      console.error('getAllOrders error:', error);
      throw error;
    }
  },
  
  async getOrderById(id) {
    try {
      try {
        // Sử dụng endpoint orders/{id}
        const response = await api.get(`/orders/${id}`);
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 403) {
          throw error;
        }
        throw error;
      }
    } catch (error) {
      console.error('getOrderById error:', error);
      throw error;
    }
  },
  
  async updateOrderStatus(id, status) {
    try {
      try {
        // Ánh xạ trạng thái từ giao diện sang giá trị enum OrderStatus
        const mappedStatus = mapToOrderStatus(status);
        
        // Sử dụng endpoint orders/{id}/status với giá trị enum
        const response = await api.put(`/orders/${id}/status`, null, {
          params: { status: mappedStatus }
        });
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 403) {
          throw error;
        }
        throw error;
      }
    } catch (error) {
      console.error('updateOrderStatus error:', error);
      throw error;
    }
  },
  
  async getOrderAnalytics(startDate, endDate) {
    try {
      try {
        // Sử dụng endpoint lịch sử đơn hàng thay thế
        const response = await api.get('/orders/history/seller', {
          params: { startDate, endDate }
        });
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 403) {
          throw error;
        }
        throw error;
      }
    } catch (error) {
      console.error('getOrderAnalytics error:', error);
      throw error;
    }
  },
  
  async getRecentOrders(limit = 5) {
    try {
      try {
        // Sử dụng endpoint đơn hàng seller với giới hạn
        const response = await api.get('/orders/seller', {
          params: { page: 0, size: limit }
        });
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 403) {
          throw error;
        }
        throw error;
      }
    } catch (error) {
      console.error('getRecentOrders error:', error);
      throw error;
    }
  },
  
  async cancelOrder(id) {
    try {
      try {
        // API hủy đơn hàng - sử dụng PUT để cập nhật trạng thái thành CANCELLED
        const response = await api.put(`/orders/${id}/status`, null, {
          params: { status: 'CANCELLED' }
        });
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 403) {
          throw error;
        }
        throw error;
      }
    } catch (error) {
      console.error('cancelOrder error:', error);
      throw error;
    }
  }
};

// Hàm để ánh xạ trạng thái từ giao diện sang enum OrderStatus
function mapToOrderStatus(status) {
  const statusMap = {
    'PENDING': 'PENDING',
    'PROCESSING': 'PROCESSING',
    'SHIPPING': 'SHIPPED', // Đổi SHIPPING thành SHIPPED vì backend không có SHIPPING
    'DELIVERED': 'DELIVERED',
    'CANCELLED': 'CANCELLED',
    'REFUNDED': 'REFUNDED',
    'CONFIRMED': 'CONFIRMED',
    'COMPLETED': 'COMPLETED',
    'RETURNED': 'RETURNED'
  };
  
  return statusMap[status] || status;
}

export default orderService; 