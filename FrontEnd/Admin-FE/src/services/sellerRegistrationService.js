import api from './api';

/**
 * Dịch vụ quản lý đơn đăng ký bán hàng
 */
const sellerRegistrationService = {
  // Lấy tất cả đơn đăng ký bán hàng
  async getAllRegistrations() {
    try {
      console.log('Gọi API getAllRegistrations với token:', localStorage.getItem('token'));
      // Đảm bảo token đã được gắn trong interceptor của api
      const response = await api.get('/seller-registrations');
      console.log('Kết quả API getAllRegistrations:', response.data);
      
      // Log chi tiết từng bản ghi để kiểm tra ngày
      if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('Chi tiết từng đơn đăng ký:');
        response.data.data.forEach((reg, index) => {
          console.log(`Đơn #${index + 1} - ID: ${reg.id}, createdAt: ${reg.createdAt}, Loại: ${typeof reg.createdAt}`);
        });
        
        // Fix missing dates if needed
        const registrations = response.data.data.map(reg => {
          if (!reg.createdAt) {
            // Thêm ngày hiện tại nếu không có
            console.log(`Đơn ID: ${reg.id} không có ngày tạo, thêm ngày hiện tại`);
            return {
              ...reg,
              createdAt: new Date().toISOString()
            };
          }
          return reg;
        });
        
        return registrations;
      }
      
      // Thông báo nếu không có dữ liệu
      console.log('Không có dữ liệu đơn đăng ký bán hàng hoặc dữ liệu rỗng');
      return [];
    } catch (error) {
      console.error('Lỗi chi tiết khi lấy danh sách đơn đăng ký bán hàng:', error);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      if (error.response && error.response.status === 403) {
        console.error('Lỗi quyền truy cập: Bạn không có quyền Admin để xem danh sách đơn đăng ký bán hàng');
        return [];
      }
      console.error('Lỗi khi lấy danh sách đơn đăng ký bán hàng:', error);
      throw error;
    }
  },

  // Lấy đơn đăng ký bán hàng theo trạng thái
  async getRegistrationsByStatus(status) {
    try {
      const response = await api.get(`/seller-registrations/status/${status}`);
      console.log(`Kết quả API getRegistrationsByStatus(${status}):`, response.data);
      
      // Log chi tiết và fix ngày nếu cần
      if (response.data?.data && Array.isArray(response.data.data)) {
        console.log(`Chi tiết đơn đăng ký theo trạng thái ${status}:`);
        
        // Fix missing dates if needed
        const registrations = response.data.data.map(reg => {
          console.log(`ID: ${reg.id}, createdAt: ${reg.createdAt}, Loại: ${typeof reg.createdAt}`);
          if (!reg.createdAt) {
            return {
              ...reg,
              createdAt: new Date().toISOString()
            };
          }
          return reg;
        });
        
        return registrations;
      }
      
      // Trả về dữ liệu theo cấu trúc của Backend
      return response.data?.data || [];
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error(`Lỗi quyền truy cập: Bạn không có quyền Admin để xem đơn đăng ký bán hàng theo trạng thái ${status}`);
        return [];
      }
      console.error(`Lỗi khi lấy đơn đăng ký bán hàng theo trạng thái ${status}:`, error);
      throw error;
    }
  },

  // Phê duyệt đơn đăng ký bán hàng
  async approveRegistration(id, notes = null) {
    try {
      // Đảm bảo ID là số nguyên bằng cách lấy chỉ phần số từ đầu chuỗi
      const cleanId = parseInt(String(id).replace(/[^0-9]/g, ""), 10);
      
      if (isNaN(cleanId)) {
        console.error(`ID không hợp lệ: ${id}`);
        throw new Error("ID không hợp lệ");
      }
      
      console.log(`Gửi request phê duyệt với ID đã xử lý: ${cleanId}`);
      
      // Tạo URL trực tiếp không có tham số truy vấn
      const url = `/seller-registrations/approve/${cleanId}`;
      
      // Gọi API với URL chuẩn
      const response = await api({
        method: 'put',
        url: url,
        data: { notes },
        params: {} // Ghi đè params để không thêm _t
      });
      
      return response.data?.data || {};
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error(`Lỗi quyền truy cập: Bạn không có quyền Admin để phê duyệt đơn đăng ký bán hàng`);
        throw new Error('Bạn không có quyền Admin để thực hiện thao tác này');
      }
      if (error.response && error.response.status === 404) {
        console.error(`Không tìm thấy đơn đăng ký với ID ${id}`);
        throw new Error('Không tìm thấy đơn đăng ký. Vui lòng làm mới trang và thử lại.');
      }
      console.error(`Lỗi khi phê duyệt đơn đăng ký bán hàng ID ${id}:`, error);
      throw error;
    }
  },

  // Từ chối đơn đăng ký bán hàng
  async rejectRegistration(id, notes) {
    if (!notes) {
      throw new Error('Vui lòng cung cấp lý do từ chối');
    }
    
    try {
      // Đảm bảo ID là số nguyên bằng cách lấy chỉ phần số từ đầu chuỗi
      const cleanId = parseInt(String(id).replace(/[^0-9]/g, ""), 10);
      
      if (isNaN(cleanId)) {
        console.error(`ID không hợp lệ: ${id}`);
        throw new Error("ID không hợp lệ");
      }
      
      console.log(`Gửi request từ chối với ID đã xử lý: ${cleanId}`);
      
      // Tạo URL trực tiếp không có tham số truy vấn
      const url = `/seller-registrations/reject/${cleanId}`;
      
      // Gọi API với URL chuẩn
      const response = await api({
        method: 'put',
        url: url,
        data: { notes },
        params: {} // Ghi đè params để không thêm _t
      });
      
      return response.data?.data || {};
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error(`Lỗi quyền truy cập: Bạn không có quyền Admin để từ chối đơn đăng ký bán hàng`);
        throw new Error('Bạn không có quyền Admin để thực hiện thao tác này');
      }
      if (error.response && error.response.status === 404) {
        console.error(`Không tìm thấy đơn đăng ký với ID ${id}`);
        throw new Error('Không tìm thấy đơn đăng ký. Vui lòng làm mới trang và thử lại.');
      }
      console.error(`Lỗi khi từ chối đơn đăng ký bán hàng ID ${id}:`, error);
      throw error;
    }
  }
};

export default sellerRegistrationService; 