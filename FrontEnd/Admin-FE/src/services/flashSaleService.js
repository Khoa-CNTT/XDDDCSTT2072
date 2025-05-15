import api from './api';

/**
 * Service xử lý các yêu cầu liên quan đến Flash Sale
 */
const flashSaleService = {
  /**
   * Lấy danh sách tất cả Flash Sale
   * Backend không có endpoint lấy tất cả, nên sẽ lấy theo các trạng thái và gộp lại
   */
  getAllFlashSales: async () => {
    try {
      console.log("Bắt đầu lấy danh sách flash sale");
      
      // Thực hiện các request riêng lẻ để tránh lỗi cấu trúc
      try {
        // Lấy flash sale đang hoạt động
        const activeResponse = await api.get('flash-sales/status/ACTIVE');
        console.log("ACTIVE Response:", activeResponse.data);
        
        // Lấy flash sale sắp diễn ra
        const upcomingResponse = await api.get('flash-sales/status/UPCOMING');
        console.log("UPCOMING Response:", upcomingResponse.data);
        
        // Lấy flash sale đã kết thúc
        const endedResponse = await api.get('flash-sales/status/ENDED');
        console.log("ENDED Response:", endedResponse.data);
        
        // Kiểm tra và gộp kết quả
        const allFlashSales = [];
        
        // Xử lý flash sale đang hoạt động - dữ liệu có cấu trúc { code: 200, message: "...", data: [...] }
        if (activeResponse.data && activeResponse.data.code === 200 && activeResponse.data.data) {
          console.log("ACTIVE data:", activeResponse.data.data);
          if (Array.isArray(activeResponse.data.data)) {
            allFlashSales.push(...activeResponse.data.data);
          }
        }
        
        // Xử lý flash sale sắp diễn ra
        if (upcomingResponse.data && upcomingResponse.data.code === 200 && upcomingResponse.data.data) {
          console.log("UPCOMING data:", upcomingResponse.data.data);
          if (Array.isArray(upcomingResponse.data.data)) {
            allFlashSales.push(...upcomingResponse.data.data);
          }
        }
        
        // Xử lý flash sale đã kết thúc
        if (endedResponse.data && endedResponse.data.code === 200 && endedResponse.data.data) {
          console.log("ENDED data:", endedResponse.data.data);
          if (Array.isArray(endedResponse.data.data)) {
            allFlashSales.push(...endedResponse.data.data);
          }
        }
        
        console.log("Tất cả Flash Sales sau khi gộp:", allFlashSales);
        
        return {
          success: true,
          message: "Lấy danh sách flash sale thành công",
          data: allFlashSales
        };
      } catch (innerError) {
        console.error("Lỗi khi gọi API riêng lẻ:", innerError);
        throw innerError;
      }
    } catch (error) {
      console.error('Error fetching flash sales:', error);
      return {
        success: false,
        message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối hoặc thử lại sau.",
        data: []
      };
    }
  },

  /**
   * Lấy danh sách Flash Sale theo trạng thái
   */
  getFlashSalesByStatus: async (status) => {
    try {
      const response = await api.get(`flash-sales/status/${status}`);
      console.log(`Dữ liệu flash sale với trạng thái ${status}:`, response.data);
      
      // Xử lý cấu trúc dữ liệu thực tế từ API (có code, message, data)
      if (response.data && response.data.code === 200 && response.data.data) {
        return {
          success: true,
          message: response.data.message || `Lấy danh sách flash sale ${status} thành công`,
          data: response.data.data
        };
      } else {
        console.warn(`Dữ liệu flash sale trạng thái ${status} không hợp lệ:`, response.data);
        return {
          success: false,
          message: `Không thể lấy danh sách flash sale trạng thái ${status}`,
          data: []
        };
      }
    } catch (error) {
      console.error(`Error fetching flash sales by status ${status}:`, error);
      return {
        success: false,
        message: `Lỗi khi lấy danh sách flash sale trạng thái ${status}: ${error.message}`,
        data: []
      };
    }
  },

  /**
   * Lấy danh sách Flash Sale đang hoạt động
   */
  getActiveFlashSales: async () => {
    try {
      const response = await api.get('flash-sales/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active flash sales:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách Flash Sale sắp diễn ra
   */
  getUpcomingFlashSales: async () => {
    try {
      const response = await api.get('flash-sales/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming flash sales:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết Flash Sale theo ID
   */
  getFlashSaleById: async (id) => {
    try {
      console.log(`[flashSaleService] Đang lấy chi tiết Flash Sale ID=${id}...`);
      const response = await api.get(`flash-sales/${id}`);
      
      console.log(`[flashSaleService] Kết quả chi tiết Flash Sale ID=${id}:`, response.data);
      
      // Nếu response có cấu trúc đúng
      if (response.data && response.data.code === 200) {
        return {
          success: true,
          message: response.data.message || "Lấy chi tiết Flash Sale thành công",
          data: response.data.data || {}
        };
      }
      
      // Nếu response đã có cấu trúc success-message-data
      if (response.data && 'success' in response.data) {
        return response.data;
      }
      
      // Fallback nếu response không có cấu trúc đúng
      return {
        success: true,
        message: "Lấy chi tiết Flash Sale thành công",
        data: response.data || {}
      };
    } catch (error) {
      console.error(`[flashSaleService] Lỗi khi lấy chi tiết Flash Sale ID=${id}:`, error);
      return {
        success: false,
        message: error.message || "Không thể lấy chi tiết Flash Sale",
        data: { items: [] }
      };
    }
  },

  /**
   * Tạo Flash Sale mới
   */
  createFlashSale: async (flashSaleData) => {
    try {
      const response = await api.post('flash-sales', flashSaleData);
      
      console.log("Kết quả tạo Flash Sale:", response.data);
      
      // Xử lý cấu trúc dữ liệu API thực tế từ server
      if (response.data && response.data.code === 200) {
        return {
          success: true,
          message: response.data.message || "Tạo Flash Sale thành công",
          data: response.data.data
        };
      }
      
      // Xử lý cấu trúc success-message-data
      if (response.data && 'success' in response.data) {
        return response.data;
      }
      
      // Fallback cho các cấu trúc khác
      return {
        success: true,
        message: "Tạo Flash Sale thành công",
        data: response.data
      };
    } catch (error) {
      console.error('Error creating flash sale:', error);
      return {
        success: false,
        message: error.message || "Không thể tạo Flash Sale",
        data: null
      };
    }
  },

  /**
   * Cập nhật thông tin Flash Sale
   */
  updateFlashSale: async (id, flashSaleData) => {
    try {
      const response = await api.put(`flash-sales/${id}`, flashSaleData);
      
      console.log(`Kết quả cập nhật Flash Sale ${id}:`, response.data);
      
      // Xử lý cấu trúc dữ liệu API thực tế từ server
      if (response.data && response.data.code === 200) {
        return {
          success: true,
          message: response.data.message || "Cập nhật Flash Sale thành công",
          data: response.data.data
        };
      }
      
      // Xử lý cấu trúc success-message-data
      if (response.data && 'success' in response.data) {
        return response.data;
      }
      
      // Fallback cho các cấu trúc khác
      return {
        success: true,
        message: "Cập nhật Flash Sale thành công",
        data: response.data
      };
    } catch (error) {
      console.error(`Error updating flash sale with ID ${id}:`, error);
      return {
        success: false,
        message: error.message || "Không thể cập nhật Flash Sale",
        data: null
      };
    }
  },

  /**
   * Xóa Flash Sale
   */
  deleteFlashSale: async (id) => {
    try {
      const response = await api.delete(`flash-sales/${id}`);
      
      console.log(`Kết quả xóa Flash Sale ${id}:`, response.data);
      
      // Xử lý cấu trúc dữ liệu API thực tế từ server
      if (response.data && response.data.code === 200) {
        return {
          success: true,
          message: response.data.message || "Xóa Flash Sale thành công",
          data: response.data.data
        };
      }
      
      // Xử lý cấu trúc success-message-data
      if (response.data && 'success' in response.data) {
        return response.data;
      }
      
      // Fallback cho các cấu trúc khác
      return {
        success: true,
        message: "Xóa Flash Sale thành công",
        data: response.data
      };
    } catch (error) {
      console.error(`Error deleting flash sale with ID ${id}:`, error);
      return {
        success: false,
        message: error.message || "Không thể xóa Flash Sale",
        data: null
      };
    }
  },

  /**
   * Cập nhật trạng thái Flash Sale
   */
  updateFlashSaleStatus: async (id, status) => {
    try {
      // Truyền status như một query parameter thay vì trong body
      const response = await api.patch(`flash-sales/${id}/status?status=${status}`);
      
      console.log(`Kết quả cập nhật trạng thái Flash Sale ${id}:`, response.data);
      
      // Xử lý cấu trúc dữ liệu API thực tế từ server
      if (response.data && response.data.code === 200) {
        return {
          success: true,
          message: response.data.message || "Cập nhật trạng thái Flash Sale thành công",
          data: response.data.data
        };
      }
      
      // Xử lý cấu trúc success-message-data
      if (response.data && 'success' in response.data) {
        return response.data;
      }
      
      // Fallback cho các cấu trúc khác
      return {
        success: true,
        message: "Cập nhật trạng thái Flash Sale thành công",
        data: response.data
      };
    } catch (error) {
      console.error(`Error updating status for flash sale ID ${id}:`, error);
      return {
        success: false,
        message: error.message || "Không thể cập nhật trạng thái Flash Sale",
        data: null
      };
    }
  },

  /**
   * Thêm sản phẩm vào Flash Sale
   */
  addProductToFlashSale: async (flashSaleId, productData) => {
    try {
      console.log(`[flashSaleService] Đang thêm sản phẩm vào Flash Sale ID=${flashSaleId}:`, productData);
      const response = await api.post(`flash-sales/${flashSaleId}/products`, productData);
      
      console.log(`[flashSaleService] Kết quả thêm sản phẩm:`, response.data);
      
      // Nếu response có cấu trúc code-message-data
      if (response.data && response.data.code === 200) {
        return {
          success: true,
          message: response.data.message || "Thêm sản phẩm vào Flash Sale thành công",
          data: response.data.data
        };
      }
      
      // Nếu response đã có cấu trúc success-message-data
      if (response.data && 'success' in response.data) {
        return response.data;
      }
      
      // Fallback nếu response không có cấu trúc chuẩn
      return {
        success: true,
        message: "Thêm sản phẩm vào Flash Sale thành công",
        data: response.data
      };
    } catch (error) {
      console.error(`[flashSaleService] Lỗi khi thêm sản phẩm vào Flash Sale ID=${flashSaleId}:`, error);
      
      // Log chi tiết lỗi
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                "Không thể thêm sản phẩm vào Flash Sale",
        data: null
      };
    }
  },

  /**
   * Xóa sản phẩm khỏi Flash Sale
   */
  removeProductFromFlashSale: async (flashSaleId, productId) => {
    try {
      console.log(`[flashSaleService] Đang xóa sản phẩm ID=${productId} khỏi Flash Sale ID=${flashSaleId}`);
      const response = await api.delete(`flash-sales/${flashSaleId}/products/${productId}`);
      
      console.log(`[flashSaleService] Kết quả xóa sản phẩm:`, response.data);
      
      // Nếu response có cấu trúc code-message-data
      if (response.data && response.data.code === 200) {
        return {
          success: true,
          message: response.data.message || "Xóa sản phẩm khỏi Flash Sale thành công",
          data: response.data.data
        };
      }
      
      // Nếu response đã có cấu trúc success-message-data
      if (response.data && 'success' in response.data) {
        return response.data;
      }
      
      // Fallback nếu response không có cấu trúc chuẩn
      return {
        success: true,
        message: "Xóa sản phẩm khỏi Flash Sale thành công",
        data: response.data
      };
    } catch (error) {
      console.error(`[flashSaleService] Lỗi khi xóa sản phẩm khỏi Flash Sale ID=${flashSaleId}:`, error);
      
      // Log chi tiết lỗi
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 
                error.message || 
                "Không thể xóa sản phẩm khỏi Flash Sale",
        data: null
      };
    }
  }
};

export default flashSaleService;