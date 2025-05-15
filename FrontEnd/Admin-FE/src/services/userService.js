import api from './api';

/**
 * Hàm chuyển đổi dữ liệu từ API để phù hợp với cần hiển thị
 */
const mapApiResponse = (userData) => {
  try {
    // Nếu đã có cấu trúc field chuẩn thì giữ nguyên
    if (userData.fullName) {
      return userData;
    }
    
    // Trường hợp API trả về userName thay vì fullName
    return {
      ...userData,
      fullName: userData.userName || userData.fullName || userData.name || '',
      avatarUrl: userData.imageUrl || userData.avatarUrl || '',
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
      if (Array.isArray(response.data)) {
        return response.data.map(mapApiResponse);
      }
      
      return response.data; // Trả về dữ liệu nguyên bản nếu không phải mảng
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      throw error;
    }
  },
  
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return mapApiResponse(response.data);
    } catch (error) {
      throw error;
    }
  },
  
  async getUserByEmail(email) {
    try {
      const response = await api.get(`/users/email`, {
        params: { email }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async findUserByName(name) {
    try {
      const response = await api.get(`/users/findByName`, {
        params: { name }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async createUser(userData) {
    try {
      const response = await api.post('/users/register-with-image', userData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async updateUser(id, userData) {
    try {
      let response;
      const hasImage = userData.image instanceof File;
      
      // Nếu có hình ảnh mới, sử dụng API cập nhật cả thông tin và hình ảnh
      if (hasImage) {
        const formData = new FormData();
        
        // Thêm các trường thông tin người dùng
        Object.keys(userData).forEach(key => {
          if (key !== 'image' && key !== 'avatarUrl') {
            formData.append(key, userData[key]);
          }
        });
        
        // Thêm hình ảnh
        formData.append('image', userData.image);
        
        // Gọi API cập nhật có hình ảnh
        response = await api.put(`/users/${id}/update-with-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Không có hình ảnh mới, chỉ cập nhật thông tin người dùng
        const userDataToUpdate = {...userData};
        delete userDataToUpdate.image;
        delete userDataToUpdate.avatarUrl;
        
        // Xử lý dữ liệu trước khi gửi đến API
        // Không gửi password nếu trống
        if (!userDataToUpdate.password || userDataToUpdate.password.trim() === '') {
          delete userDataToUpdate.password;
        }
        
        // Thêm trường userName từ fullName nếu chưa có
        if (!userDataToUpdate.userName && userDataToUpdate.fullName) {
          userDataToUpdate.userName = userDataToUpdate.fullName;
        }
        
        console.log('Sending user data update:', userDataToUpdate);
        response = await api.put(`/users/${id}`, userDataToUpdate);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in updateUser:', error.response?.data || error);
      throw error;
    }
  },
  
  async uploadProfileImage(id, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post(`/users/${id}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async getUserStats() {
    try {
      const response = await api.get('/admin/user-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService; 