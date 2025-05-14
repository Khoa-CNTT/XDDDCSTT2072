// Tạo thanh toán mới
export const createPayment = async (axiosPrivate, paymentData) => {
  try {
    console.log("Gửi request tạo thanh toán:", paymentData);
    const response = await axiosPrivate.post("/payments/create", paymentData);
    console.log("Tạo thanh toán thành công, phản hồi:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi tạo thanh toán:", error);

    // Xử lý các loại lỗi cụ thể
    if (error.response) {
      // Lỗi từ server
      const statusCode = error.response.status;
      const errorData = error.response.data;

      console.error(`Server trả về lỗi ${statusCode}:`, errorData);

      if (statusCode === 401) {
        throw new Error("Bạn cần đăng nhập để tạo thanh toán");
      } else if (statusCode === 400) {
        throw new Error(errorData.message || "Dữ liệu thanh toán không hợp lệ");
      } else if (statusCode === 404) {
        throw new Error(
          errorData.message || "Không tìm thấy đơn hàng để thanh toán"
        );
      } else {
        throw new Error(errorData.message || "Lỗi khi tạo thanh toán");
      }
    } else if (error.request) {
      // Lỗi không nhận được phản hồi từ server
      console.error("Không nhận được phản hồi từ server:", error.request);
      throw new Error("Không thể kết nối đến máy chủ, vui lòng thử lại sau");
    } else {
      // Lỗi khác
      throw error;
    }
  }
};

// Tạo mã QR thanh toán
export const createPaymentQR = async (axiosPrivate, paymentData) => {
  try {
    const response = await axiosPrivate.post(
      "/payments/create-qr",
      paymentData
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating payment QR:", error);
    throw error;
  }
};

// Kiểm tra trạng thái thanh toán
export const checkPaymentStatus = async (axiosPrivate, transactionId) => {
  try {
    const response = await axiosPrivate.get(`/payments/check/${transactionId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw error;
  }
};

// Lấy lịch sử thanh toán của đơn hàng
export const getPaymentHistory = async (axiosPrivate, orderId) => {
  try {
    const response = await axiosPrivate.get(`/payments/history/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw error;
  }
};
