
// Tạo thanh toán mới
export const createPayment = async (axiosPrivate, paymentData) => {
    try {
      const response = await axiosPrivate.post('/payments/create', paymentData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  };
  
  // Tạo mã QR thanh toán
  export const createPaymentQR = async (axiosPrivate, paymentData) => {
    try {
      const response = await axiosPrivate.post('/payments/create-qr', paymentData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating payment QR:', error);
      throw error;
    }
  };
  
  // Kiểm tra trạng thái thanh toán
  export const checkPaymentStatus = async (axiosPrivate, transactionId) => {
    try {
      const response = await axiosPrivate.get(`/payments/check/${transactionId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  };
  
  // Lấy lịch sử thanh toán của đơn hàng
  export const getPaymentHistory = async (axiosPrivate, orderId) => {
    try {
      const response = await axiosPrivate.get(`/payments/history/${orderId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  };