// Lấy tất cả đánh giá của sản phẩm
export const getProductFeedbacks = async (axiosPrivate, productId, page = 0, size = 10) => {
  try {
    console.log(`Calling API: GET /feedbacks/product/${productId}?page=${page}&size=${size}`);
    const response = await axiosPrivate.get(`/feedbacks/product/${productId}`, {
      params: {
        page,
        size
      }
    });
    console.log("Full response from getProductFeedbacks:", response);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá sản phẩm:", error);
    throw error;
  }
};

// Lấy thống kê đánh giá của sản phẩm
export const getProductFeedbackStats = async (axiosPrivate, productId) => {
  try {
    console.log(`Calling API: GET /feedbacks/stats/product/${productId}`);
    const response = await axiosPrivate.get(`/feedbacks/stats/product/${productId}`);
    console.log("Full response from getProductFeedbackStats:", response);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thống kê đánh giá:", error);
    throw error;
  }
};

// Tạo đánh giá cho sản phẩm
export const createFeedback = async (axiosPrivate, feedbackData, images = []) => {
  try {
    // Kiểm tra xem người dùng có thể đánh giá sản phẩm không
    const checkResult = await checkCanReviewProduct(axiosPrivate, feedbackData.productId);
    
    // Nếu không thể đánh giá, ném lỗi
    if (!checkResult.data?.canReview) {
      if (!checkResult.data?.hasPurchased) {
        throw new Error("Bạn chưa mua sản phẩm này nên không thể đánh giá");
      } else if (checkResult.data?.hasReviewed) {
        throw new Error("Bạn đã đánh giá sản phẩm này rồi");
      } else {
        throw new Error("Bạn không thể đánh giá sản phẩm này lúc này. Đơn hàng của bạn có thể chưa được xử lý.");
      }
    }
    
    // Tạo form data để gửi dữ liệu
    const formData = new FormData();
    
    // Thêm các trường riêng lẻ vào form data thay vì JSON
    formData.append("productId", feedbackData.productId);
    formData.append("rating", feedbackData.rating);
    if (feedbackData.comment) {
      formData.append("comment", feedbackData.comment);
    }
    
    // Thêm từng ảnh vào form data
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }
    }
    
    const response = await axiosPrivate.post("/feedbacks", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo đánh giá:", error);
    throw error;
  }
};

// Cập nhật đánh giá
export const updateFeedback = async (axiosPrivate, feedbackId, feedbackData, images = []) => {
  try {
    const formData = new FormData();
    
    // Thêm các trường riêng lẻ vào form data thay vì JSON
    formData.append("productId", feedbackData.productId);
    formData.append("rating", feedbackData.rating);
    if (feedbackData.comment) {
      formData.append("comment", feedbackData.comment);
    }
    
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }
    }
    
    const response = await axiosPrivate.put(`/feedbacks/${feedbackId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật đánh giá:", error);
    throw error;
  }
};

// Xóa đánh giá
export const deleteFeedback = async (axiosPrivate, feedbackId) => {
  try {
    const response = await axiosPrivate.delete(`/feedbacks/${feedbackId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa đánh giá:", error);
    throw error;
  }
};

// Kiểm tra xem người dùng đã đánh giá sản phẩm hay chưa
export const checkUserFeedback = async (axiosPrivate, productId) => {
  try {
    const response = await axiosPrivate.get(`/feedbacks/check/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi kiểm tra đánh giá người dùng:", error);
    throw error;
  }
};

// Kiểm tra xem người dùng có thể đánh giá sản phẩm này không (đã mua và chưa đánh giá)
export const checkCanReviewProduct = async (axiosPrivate, productId) => {
  try {
    const response = await axiosPrivate.get(`/feedbacks/can-review/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi kiểm tra quyền đánh giá sản phẩm:", error);
    throw error;
  }
};

// Lấy danh sách sản phẩm đã mua nhưng chưa đánh giá
export const getUnreviewedProducts = async (axiosPrivate) => {
  try {
    const response = await axiosPrivate.get("/feedbacks/unreviewed-products");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm chưa đánh giá:", error);
    throw error;
  }
}; 