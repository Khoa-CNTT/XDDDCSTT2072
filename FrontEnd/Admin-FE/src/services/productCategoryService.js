import api from './api';

const productCategoryService = {
  /**
   * Lấy tất cả danh mục sản phẩm
   * @returns {Promise} - Promise chứa danh sách danh mục
   */
  getAllCategories: async () => {
    try {
      const response = await api.get('/product-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Lấy danh mục sản phẩm (phân trang)
   * @param {number} page - Số trang
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa dữ liệu phân trang
   */
  getAllCategoriesPaged: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/product-categories/paged', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories (paged):', error);
      throw error;
    }
  },

  /**
   * Lấy danh mục theo ID
   * @param {number} id - ID của danh mục
   * @returns {Promise} - Promise chứa thông tin danh mục
   */
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/product-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category #${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo danh mục mới
   * @param {FormData} formData - FormData chứa thông tin danh mục
   * @returns {Promise} - Promise chứa thông tin danh mục được tạo
   */
  createCategory: async (formData) => {
    try {
      const response = await api.post('/product-categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  /**
   * Cập nhật danh mục
   * @param {number} id - ID của danh mục
   * @param {FormData} formData - FormData chứa thông tin danh mục
   * @returns {Promise} - Promise chứa thông tin danh mục sau khi cập nhật
   */
  updateCategory: async (id, formData) => {
    try {
      const response = await api.put(`/product-categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating category #${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa danh mục
   * @param {number} id - ID của danh mục cần xóa
   * @returns {Promise} - Promise kết quả xóa
   */
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/product-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting category #${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh mục gốc (không có danh mục cha)
   * @returns {Promise} - Promise chứa danh sách danh mục gốc
   */
  getRootCategories: async () => {
    try {
      const response = await api.get('/product-categories/root');
      return response.data;
    } catch (error) {
      console.error('Error fetching root categories:', error);
      throw error;
    }
  },

  /**
   * Lấy danh mục con của một danh mục
   * @param {number} parentId - ID của danh mục cha
   * @returns {Promise} - Promise chứa danh sách danh mục con
   */
  getSubcategories: async (parentId) => {
    try {
      const response = await api.get(`/product-categories/subcategories/${parentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subcategories for parent #${parentId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách danh mục dạng cây
   * @returns {Promise} - Promise chứa danh sách danh mục dạng cây
   */
  getCategoryTree: async () => {
    try {
      const response = await api.get('/product-categories/tree');
      return response.data;
    } catch (error) {
      console.error('Error fetching category tree:', error);
      throw error;
    }
  },

  /**
   * Tìm kiếm danh mục
   * @param {string} keyword - Từ khóa tìm kiếm
   * @param {number} page - Số trang
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa kết quả tìm kiếm
   */
  searchCategories: async (keyword, page = 0, size = 10) => {
    try {
      const response = await api.get('/product-categories/search', {
        params: { keyword, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching categories:', error);
      throw error;
    }
  },

  /**
   * Lấy danh mục đang hoạt động
   * @returns {Promise} - Promise chứa danh sách danh mục đang hoạt động
   */
  getActiveCategories: async () => {
    try {
      const response = await api.get('/product-categories/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active categories:', error);
      throw error;
    }
  },

  /**
   * Đếm số sản phẩm trong danh mục
   * @param {number} id - ID của danh mục
   * @returns {Promise} - Promise chứa số lượng sản phẩm
   */
  countProductsInCategory: async (id) => {
    try {
      const response = await api.get(`/product-categories/${id}/count-products`);
      return response.data;
    } catch (error) {
      console.error(`Error counting products in category #${id}:`, error);
      throw error;
    }
  }
};

export default productCategoryService; 