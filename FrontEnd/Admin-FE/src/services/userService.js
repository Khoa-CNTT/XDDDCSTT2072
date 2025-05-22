import api from './api';

/**
 * Hàm chuyển đổi dữ liệu từ API để phù hợp với cần hiển thị
 */
const mapApiResponse = (userData) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!userData) {
      console.warn("Empty user data provided to mapper");
      return {};
    }
    
    // Nếu đã có cấu trúc field chuẩn thì giữ nguyên
    if (userData.fullName) {
      return userData;
    }
    
    // Trường hợp API trả về userName thay vì fullName
    return {
      ...userData,
      fullName: userData.userName || userData.fullName || userData.name || '',
      avatarUrl: userData.imageUrl || userData.avatarUrl || '',
      role: userData.roleName || userData.role || 'User',
    };
  } catch (error) {
    console.error("Error mapping user data:", error);
    return userData; // Trả về dữ liệu gốc nếu có lỗi
  }
};

const userService = {
  async getAllUsers(page = 0, size = 10) {
    try {
      console.log(`Calling getAllUsers API with page=${page}, size=${size}`);
      const response = await api.get(`/users`, {
        params: { page, size }
      });
      
      console.log("Users API response:", response.data);
      
      // Xử lý dữ liệu trả về
      let userData = response.data;
      
      // Nếu response có cấu trúc {success, message, data}
      if (response.data && response.data.data) {
        userData = response.data.data;
      }
      
      if (Array.isArray(userData)) {
        return userData.map(mapApiResponse);
      }
      
      return userData; // Trả về dữ liệu nguyên bản nếu không phải mảng
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      throw error;
    }
  },
  
  async getUserById(id) {
    try {
      if (!id) {
        throw new Error("Invalid user ID provided");
      }
      
      console.log(`Đang gọi API lấy thông tin người dùng với ID: ${id}`);
      const response = await api.get(`/users/${id}`);
      console.log('Dữ liệu người dùng từ API:', response.data);
      
      // Kiểm tra dữ liệu trả về
      if (!response.data) {
        throw new Error("No data returned from API");
      }
      
      // Lấy dữ liệu người dùng từ trường data trong response
      const userData = response.data.data || response.data;
      console.log('Dữ liệu người dùng thực tế:', userData);
      
      const mappedData = mapApiResponse(userData);
      console.log('Dữ liệu người dùng sau khi map:', mappedData);
      
      // Đảm bảo ID được gán vào dữ liệu
      return {
        ...mappedData,
        id: id
      };
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      throw error;
    }
  },
  
  async getUserByEmail(email) {
      const response = await api.get(`/users/email`, {
        params: { email }
      });
    
    // Trả về data hoặc response.data.data nếu có
    return response.data.data || response.data;
  },

  async findUserByName(name) {
      const response = await api.get(`/users/findByName`, {
        params: { name }
      });
    
    // Trả về data hoặc response.data.data nếu có
    return response.data.data || response.data;
  },
  
  async createUser(userData) {
      const response = await api.post('/users/register-with-image', userData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    
    // Trả về data hoặc response.data.data nếu có
    return response.data.data || response.data;
  },
  
  async updateUser(id, userData) {
    try {
      // Kiểm tra xem id có hợp lệ không
      if (!id || id === 'undefined') {
        console.error('ID người dùng không hợp lệ:', id);
        throw new Error('ID người dùng không hợp lệ');
      }
      
      console.log('Đang cập nhật người dùng với ID:', id);
      let response;
      const hasImage = userData.image instanceof File;
      
      // Bước 1: Cập nhật thông tin người dùng trước
      const userDataToUpdate = {...userData};
      
      // Loại bỏ các trường không cần thiết
      delete userDataToUpdate.image;
      delete userDataToUpdate.avatarUrl;
      
      // Map các trường dữ liệu để phù hợp với UserDTO của backend
      
      // 1. Chuyển fullName thành userName
      if (userDataToUpdate.fullName) {
        userDataToUpdate.userName = userDataToUpdate.fullName;
        delete userDataToUpdate.fullName; // Xóa trường fullName
      }

      // 2. Chuyển role thành roleName
      if (userDataToUpdate.role) {
        userDataToUpdate.roleName = userDataToUpdate.role;
      }
      // Luôn xóa trường role vì backend không chấp nhận
      delete userDataToUpdate.role;
      
      // 3. Xóa trường status vì backend không chấp nhận
      delete userDataToUpdate.status;
      
      // 4. Xử lý password
      // Không gửi password nếu trống
      if (!userDataToUpdate.password || userDataToUpdate.password.trim() === '') {
        delete userDataToUpdate.password;
        // Báo cho backend biết giữ nguyên mật khẩu cũ
        userDataToUpdate.keepExistingPassword = true;
      }
      
      console.log('ID người dùng:', id);
      console.log('Dữ liệu cập nhật sau khi điều chỉnh:', userDataToUpdate);
      
      // Gọi API cập nhật thông tin người dùng
      response = await api.put(`/users/${id}`, userDataToUpdate);
      
      // Bước 2: Nếu có ảnh mới, tải lên ảnh sau khi cập nhật thông tin thành công
      if (hasImage) {
        console.log('Đang tải lên ảnh mới cho người dùng ID:', id);
        const formData = new FormData();
        formData.append('image', userData.image);
        
        // Gọi API tải lên ảnh
        const imageResponse = await api.post(`/users/${id}/upload-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Cập nhật response với dữ liệu mới nhất từ việc tải lên ảnh
        if (imageResponse.data) {
          response = imageResponse;
        }
        }
        
      // Trả về data hoặc response.data.data nếu có
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error in updateUser:', error.response?.data || error);
      throw error;
    }
  },
  
  async uploadProfileImage(id, imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post(`/users/${id}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    
    // Trả về data hoặc response.data.data nếu có
    return response.data.data || response.data;
  },
  
  async deleteUser(id) {
      const response = await api.delete(`/users/${id}`);
    
    // Trả về data hoặc response.data.data nếu có
    return response.data.data || response.data;
  },
  
  async getUserStats() {
      const response = await api.get('/admin/user-stats');
    
    // Trả về data hoặc response.data.data nếu có
    return response.data.data || response.data;
  }
};

export default userService; 