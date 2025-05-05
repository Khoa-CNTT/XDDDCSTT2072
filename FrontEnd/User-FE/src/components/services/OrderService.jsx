// Tạo đơn hàng mới
export const createOrder = async (axiosPrivate, orderData) => {
    try {
      const response = await axiosPrivate.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };
  
  // Lấy lịch sử đơn hàng
  export const getOrderHistory = async (axiosPrivate, page = 1, size = 10) => {
    try {
      const response = await axiosPrivate.get('/orders', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  };
  
  // Lấy chi tiết đơn hàng
  export const getOrderDetail = async (axiosPrivate, orderId) => {
    try {
      const response = await axiosPrivate.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order detail:', error);
      throw error;
    }
  };
  
  // Hủy đơn hàng
  export const cancelOrder = async (axiosPrivate, orderId, reason) => {
    try {
      const response = await axiosPrivate.put(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  };