import api from './api';

/**
 * Dịch vụ quản lý marketplace (sản phẩm)
 */
const marketPlaceService = {
  /**
   * Lấy danh sách tất cả sản phẩm
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa danh sách sản phẩm
   */
  getAllProducts: async (page = 0, size = 10) => {
    console.log(`Gọi API lấy tất cả sản phẩm với page=${page}, size=${size}`);
    try {
      const response = await api.get('/marketplace/products', {
        params: { page, size }
      });
      
      console.log("Dữ liệu trả về từ API getAllProducts:", response);
      
      if (!response || !response.data) {
        console.error("API getAllProducts không trả về dữ liệu");
        return {
          success: false,
          message: "API không trả về dữ liệu",
          data: {
            content: []
          }
        };
      }
      
      // Kiểm tra cấu trúc response để trả về đúng định dạng
      if (response.data.success !== undefined) {
        console.log("API trả về cấu trúc ApiResponse");
        return response.data;
      }
      
      // Nếu response là Page<MarketPlaceDTO> trực tiếp
      if (response.data.content !== undefined) {
        console.log("API trả về cấu trúc Page trực tiếp");
        console.log("Số lượng sản phẩm:", response.data.content ? response.data.content.length : 0);
        return {
          success: true,
          message: "Lấy dữ liệu thành công",
          data: response.data
        };
      }
      
      // Trường hợp còn lại, wrap dữ liệu
      console.log("API trả về cấu trúc khác, wrap lại");
      return {
        success: true,
        message: "Lấy dữ liệu thành công",
        data: {
          content: Array.isArray(response.data) ? response.data : [],
          totalElements: Array.isArray(response.data) ? response.data.length : 0,
          totalPages: 1,
          page: page,
          size: size
        }
      };
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      // Trả về object thay vì throw error để không làm crash UI
      return {
        success: false,
        message: `Lỗi: ${error.message}`,
        data: {
          content: []
        }
      };
    }
  },

  /**
   * Lấy thông tin chi tiết của một sản phẩm
   * @param {number} id - ID của sản phẩm
   * @returns {Promise} - Promise chứa thông tin sản phẩm
   */
  getProductById: async (id) => {
    try {
      const response = await api.get(`/marketplace/product/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin sản phẩm có ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tìm kiếm sản phẩm theo tên
   * @param {string} keyword - Từ khóa tìm kiếm
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa danh sách sản phẩm
   */
  searchProducts: async (keyword, page = 0, size = 10) => {
    try {
      const response = await api.get('/marketplace/search', {
        params: { keyword, page, size }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi tìm kiếm sản phẩm với từ khóa "${keyword}":`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách sản phẩm theo danh mục
   * @param {number} categoryId - ID của danh mục
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa danh sách sản phẩm
   */
  getProductsByCategory: async (categoryId, page = 0, size = 10) => {
    try {
      const response = await api.get(`/marketplace/category/${categoryId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm theo danh mục ${categoryId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách sản phẩm đang giảm giá
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa danh sách sản phẩm
   */
  getOnSaleProducts: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/marketplace/on-sale', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm đang giảm giá:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách sản phẩm phổ biến
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa danh sách sản phẩm
   */
  getPopularProducts: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/marketplace/popular', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm phổ biến:', error);
      throw error;
    }
  },

  /**
   * Thêm sản phẩm mới
   * @param {Object} productData - Dữ liệu sản phẩm mới
   * @returns {Promise} - Promise chứa kết quả thêm sản phẩm
   */
  createProduct: async (productData) => {
    try {
      const response = await api.post('/marketplace/add', productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm mới:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin sản phẩm
   * @param {number} id - ID của sản phẩm cần cập nhật
   * @param {Object} productData - Dữ liệu cập nhật
   * @returns {Promise} - Promise chứa kết quả cập nhật
   */
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/marketplace/update/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật sản phẩm có ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa sản phẩm
   * @param {number} id - ID của sản phẩm cần xóa
   * @returns {Promise} - Promise chứa kết quả xóa
   */
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/marketplace/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa sản phẩm có ID ${id}:`, error);
      throw error;
    }
  }
};

export default marketPlaceService; 