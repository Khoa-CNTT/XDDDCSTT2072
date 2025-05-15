import api from './api';

const couponService = {
  /**
   * Lấy danh sách mã giảm giá (có phân trang)
   */
  getAllCoupons: async (page = 0, size = 10, status = null, sortBy = 'id', direction = 'desc') => {
    try {
      const params = {
        page,
        size,
        sortBy,
        direction,
      };
      
      if (status) {
        params.status = status;
      }
      
      console.log("Gọi API coupons với tham số:", params);
      const response = await api.get('coupons', { params });
      console.log("Kết quả API coupons:", response.status, response.data);
      
      // Nếu backend trả về dữ liệu nhưng không có phân biệt trạng thái 
      // thì thực hiện lọc ở phía frontend
      let responseData = { ...response.data };
      
      if (status && responseData.success && responseData.data && responseData.data.content) {
        console.log(`Kiểm tra phản hồi với trạng thái ${status}`);
        
        // Đếm số lượng mã giảm giá theo trạng thái thực tế
        const statusCounts = {
          active: 0,
          expired: 0,
          disabled: 0
        };
        
        responseData.data.content.forEach(coupon => {
          if (coupon.status) {
            statusCounts[coupon.status] = (statusCounts[coupon.status] || 0) + 1;
          }
        });
        
        console.log("Số lượng mã giảm giá theo trạng thái:", statusCounts);
        
        // Nếu tất cả mã đều là active, thì thực hiện lọc tự động dựa trên ngày hết hạn
        if (statusCounts.active > 0 && statusCounts.expired === 0 && status === 'expired') {
          console.log("Thực hiện lọc ở client cho trạng thái 'expired'");
          
          const now = new Date();
          const filteredContent = responseData.data.content.filter(coupon => {
            const endDate = new Date(coupon.endDate);
            return endDate < now; // Mã đã hết hạn
          });
          
          console.log(`Đã lọc được ${filteredContent.length} mã giảm giá đã hết hạn`);
          
          // Cập nhật kết quả trả về
          responseData.data.content = filteredContent;
          responseData.data.totalElements = filteredContent.length;
        }
        
        // Nếu người dùng chọn trạng thái "disabled" nhưng không có mã nào có trạng thái này
        if (statusCounts.active > 0 && statusCounts.disabled === 0 && status === 'disabled') {
          console.log("Thực hiện lọc ở client cho trạng thái 'disabled'");
          
          // Lọc các mã đã sử dụng hết lượt
          const filteredContent = responseData.data.content.filter(coupon => {
            // Kiểm tra nếu mã đã sử dụng hết lượt
            if (coupon.usageLimit !== null && coupon.usageCount !== null) {
              return coupon.usageCount >= coupon.usageLimit;
            }
            return false;
          });
          
          console.log(`Đã lọc được ${filteredContent.length} mã giảm giá đã vô hiệu`);
          
          // Cập nhật kết quả trả về
          responseData.data.content = filteredContent;
          responseData.data.totalElements = filteredContent.length;
        }
      }
      
      return responseData;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin mã giảm giá theo ID
   */
  getCouponById: async (id) => {
    try {
      const response = await api.get(`coupons/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching coupon with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin mã giảm giá theo mã code
   */
  getCouponByCode: async (code) => {
    try {
      const response = await api.get(`coupons/code/${code}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching coupon with code ${code}:`, error);
      throw error;
    }
  },

  /**
   * Tạo mã giảm giá mới
   */
  createCoupon: async (couponData) => {
    try {
      const response = await api.post('coupons', couponData);
      return response.data;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  },

  /**
   * Cập nhật mã giảm giá
   */
  updateCoupon: async (id, couponData) => {
    try {
      const response = await api.put(`coupons/${id}`, couponData);
      return response.data;
    } catch (error) {
      console.error(`Error updating coupon with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa mã giảm giá
   */
  deleteCoupon: async (id) => {
    try {
      const response = await api.delete(`coupons/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting coupon with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách mã giảm giá đang hoạt động
   */
  getActiveCoupons: async () => {
    try {
      const response = await api.get('coupons/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active coupons:', error);
      throw error;
    }
  },

  /**
   * Tính toán số tiền giảm giá khi áp dụng coupon
   */
  calculateDiscount: async (couponCode, orderAmount) => {
    try {
      const response = await api.get('coupons/calculate', {
        params: { couponCode, orderAmount }
      });
      return response.data;
    } catch (error) {
      console.error(`Error calculating discount for coupon ${couponCode}:`, error);
      throw error;
    }
  },
  
  /**
   * Đồng bộ số lần sử dụng của một mã giảm giá
   */
  syncCouponUsage: async (id) => {
    try {
      const response = await api.post(`coupons/${id}/sync-usage`);
      return response.data;
    } catch (error) {
      console.error(`Error syncing usage count for coupon ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Đồng bộ số lần sử dụng của tất cả mã giảm giá
   */
  syncAllCouponsUsage: async () => {
    try {
      const response = await api.post('coupons/sync-all-usage');
      return response.data;
    } catch (error) {
      console.error('Error syncing usage count for all coupons:', error);
      throw error;
    }
  }
};

export default couponService; 