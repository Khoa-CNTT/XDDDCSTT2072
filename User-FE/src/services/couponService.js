// Lấy tất cả mã giảm giá đang hoạt động
export const getActiveCoupons = async (axiosPrivate) => {
  try {
    const response = await axiosPrivate.get("/coupons/active");
    console.log("Response đầy đủ từ API getActiveCoupons:", response);
    
    // API trả về {success, message, data} trong response.data
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy mã giảm giá:", error);
    throw error;
  }
};

// Lấy mã giảm giá cho người dùng
export const getCouponsForUser = async (axiosPrivate, userId) => {
  try {
    const response = await axiosPrivate.get(`/coupons/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy mã giảm giá cho người dùng:", error);
    throw error;
  }
};

// Lấy mã giảm giá cho sản phẩm
export const getCouponsForProduct = async (axiosPrivate, productId) => {
  try {
    const response = await axiosPrivate.get(`/coupons/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy mã giảm giá cho sản phẩm:", error);
    throw error;
  }
};

// Kiểm tra tính hợp lệ của mã giảm giá
export const validateCoupon = async (axiosPrivate, code, userId, orderAmount) => {
  try {
    console.log(`Đang kiểm tra mã giảm giá: ${code}, userId: ${userId}, orderAmount: ${orderAmount}`);
    
    const response = await axiosPrivate.post(`/coupons/validate`, null, {
      params: {
        code: code,
        userId: userId,
        orderAmount: orderAmount
      }
    });
    
    // Log full response để debug
    console.log("Response đầy đủ từ API validateCoupon:", response);
    
    // Kiểm tra và xử lý dữ liệu trả về
    if (response.data) {
      // Nếu response.data chứa các trường cần thiết
      console.log("Dữ liệu mã giảm giá:", response.data);
      
      // Đảm bảo các trường số là số
      if (response.data.discountValue) {
        response.data.discountValue = Number(response.data.discountValue);
      }
      
      if (response.data.maxDiscountAmount) {
        response.data.maxDiscountAmount = Number(response.data.maxDiscountAmount);
      }
      
      return response.data;
    }
    
    // Trường hợp response không có dữ liệu
    return {
      valid: false,
      message: "Không thể xác thực mã giảm giá"
    };
  } catch (error) {
    console.error("Lỗi khi kiểm tra mã giảm giá:", error);
    
    // Trả về thông tin lỗi chi tiết từ API nếu có
    if (error.response?.data) {
      return {
        valid: false,
        message: typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || "Mã giảm giá không hợp lệ"
      };
    }
    
    throw error;
  }
};

// Kiểm tra tính hợp lệ của mã giảm giá cho sản phẩm cụ thể
export const validateCouponForProduct = async (axiosPrivate, code, productId, quantity, price) => {
  try {
    const response = await axiosPrivate.post(`/coupons/validate/product`, null, {
      params: {
        code: code,
        productId: productId,
        quantity: quantity,
        price: price
      }
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi kiểm tra mã giảm giá cho sản phẩm:", error);
    throw error;
  }
};

// Tính toán số tiền giảm giá
export const calculateDiscount = async (axiosPrivate, couponCode, orderAmount) => {
  try {
    const response = await axiosPrivate.get(`/coupons/calculate`, {
      params: {
        couponCode: couponCode,
        orderAmount: orderAmount
      }
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tính toán số tiền giảm giá:", error);
    throw error;
  }
}; 