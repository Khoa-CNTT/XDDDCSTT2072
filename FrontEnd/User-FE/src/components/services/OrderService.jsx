// Tạo đơn hàng mới
export const createOrder = async (axiosPrivate, orderData) => {
  try {
    console.log("Gửi request tạo đơn hàng:", orderData);
    const response = await axiosPrivate.post("/orders", orderData);
    console.log("Tạo đơn hàng thành công, phản hồi:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);

    // Xử lý các loại lỗi cụ thể
    if (error.response) {
      // Lỗi từ server
      const statusCode = error.response.status;
      const errorData = error.response.data;

      console.error(`Server trả về lỗi ${statusCode}:`, errorData);

      if (statusCode === 401) {
        throw new Error("Bạn cần đăng nhập để tạo đơn hàng");
      } else if (statusCode === 400) {
        throw new Error(errorData.message || "Dữ liệu đơn hàng không hợp lệ");
      } else {
        throw new Error(errorData.message || "Lỗi khi tạo đơn hàng");
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

// Lấy lịch sử đơn hàng
export const getOrderHistory = async (axiosPrivate, page = 1, size = 10) => {
  try {
    const response = await axiosPrivate.get("/orders", {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching order history:", error);
    throw error;
  }
};

// Lấy chi tiết đơn hàng
export const getOrderDetail = async (axiosPrivate, orderId) => {
  try {
    const response = await axiosPrivate.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order detail:", error);
    throw error;
  }
};

// Hủy đơn hàng
export const cancelOrder = async (axiosPrivate, orderId, reason) => {
  try {
    const response = await axiosPrivate.put(`/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};
