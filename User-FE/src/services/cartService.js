// cartCreate
export const createCart = async (axiosPrivate, productId, quantity, couponCode = null, isFlashSale = false, flashSalePrice = null) => {
  try {
    // Log thông tin
    console.log(`Đang thêm sản phẩm vào giỏ hàng: productId=${productId}, quantity=${quantity}`);
    
    // Tạo params với các tham số bắt buộc
    const params = {
      productId,
      quantity
    };

    // Thêm coupon nếu có
    if (couponCode) {
      params.couponCode = couponCode;
    }

    // Thêm thông tin flash sale nếu có
    if (isFlashSale && flashSalePrice) {
      params.isFlashSale = true;
      params.flashSalePrice = flashSalePrice;
    }

    // Sử dụng params thay vì body
    const response = await axiosPrivate.post("/cart/items", null, {
      params: params
    });
    
    console.log("Thêm vào giỏ hàng thành công:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    // Kiểm tra lỗi cụ thể
    if (error.response) {
      // Server trả về lỗi với status code
      console.error("Server trả về lỗi:", error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        throw new Error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
      } else if (error.response.status === 400) {
        throw new Error(error.response.data.message || "Dữ liệu gửi lên không hợp lệ");
      } else {
        throw new Error(error.response.data.message || "Không thể thêm sản phẩm vào giỏ hàng");
      }
    } else if (error.request) {
      // Không nhận được phản hồi từ server
      console.error("Không nhận được phản hồi từ server:", error.request);
      throw new Error("Không thể kết nối đến máy chủ, vui lòng thử lại sau");
    } else {
      // Lỗi khác
      throw error;
    }
  }
};

// getCart
export const getCart = async (axiosPrivate) => {
  try {
    console.log("Đang lấy thông tin giỏ hàng...");
    const response = await axiosPrivate.get("/cart");
    console.log("Lấy giỏ hàng thành công:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin giỏ hàng:", error);
    // Kiểm tra lỗi cụ thể
    if (error.response) {
      // Server trả về lỗi với status code
      console.error("Server trả về lỗi:", error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // Lỗi xác thực - trả về giỏ hàng rỗng để tránh lỗi UI
        console.warn("Người dùng chưa đăng nhập, trả về giỏ hàng rỗng");
        return { cartItems: [], totalItems: 0, subtotal: 0 };
      }
    }
    
    // Trả về giỏ hàng rỗng để tránh lỗi UI
    return { cartItems: [], totalItems: 0, subtotal: 0 };
  }
};

// deleteCartItems
export const deleteCartItems = async (axiosPrivate, itemId) => {
  try {
    const response = await axiosPrivate.delete(`/cart/items/${itemId}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// updateCartItem
export const updateCartItem = async (axiosPrivate, itemId, quantity) => {
  try {
    const response = await axiosPrivate.put(`/cart/items/${itemId}`, null, {
      params: {
        quantity,
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// updateCartItemQty
export const updateCartItemQty = async (
  axiosPrivate,
  cartItemId,
  quantity
) => {
  try {
    const response = await axiosPrivate.put(`/cart/items/${cartItemId}`, {
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng sản phẩm:", error);
    throw error;
  }
};

// deleteCartItem
export const deleteCartItem = async (axiosPrivate, cartItemId) => {
  try {
    const response = await axiosPrivate.delete(`/cart/items/${cartItemId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    throw error;
  }
};
