import api from './api';
import { jwtDecode } from 'jwt-decode';

const authService = {
  async login(email, password) {
    try {
      // Thử gọi API đăng nhập thực tế
      const response = await api.post('/users/login', { email, password });
      const { token, refreshToken } = response.data;
      
      // Lưu token vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Lưu role vào userRole để đồng bộ với auth.js
      if (response.data.role || response.data.user?.role) {
        localStorage.setItem('userRole', response.data.role || response.data.user?.role);
      }
      
      return response.data;
    } catch (apiError) {
      console.warn("Không thể kết nối đến API đăng nhập, sử dụng đăng nhập giả lập:", apiError);
      
      // Kiểm tra thông tin đăng nhập giả lập
      if (email === 'admin@example.com' && password === 'admin123') {
        // Tạo token giả
        const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE2NzcwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const fakeRefreshToken = 'fake-refresh-token';
        
        // Lưu token giả
        localStorage.setItem('token', fakeToken);
        localStorage.setItem('refreshToken', fakeRefreshToken);
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'Admin'
        }));
        
        // Thêm lưu userRole để đồng bộ với auth.js
        localStorage.setItem('userRole', 'Admin');
        
        // Trả về dữ liệu giả
        return {
          token: fakeToken,
          refreshToken: fakeRefreshToken,
          user: {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'Admin'
          }
        };
      }
      
      // Nếu thông tin đăng nhập không đúng, báo lỗi
      throw new Error('Email hoặc mật khẩu không đúng');
    }
  },
  
  logout() {
    // Xóa token khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  
  getCurrentUser() {
    // Thử đọc từ localStorage.user trước
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        // Nếu không parse được JSON, thử phương pháp decode token
      }
    }
    
    // Phương pháp decode token
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // Decode JWT để lấy thông tin user
      const decodedToken = jwtDecode(token);
      return decodedToken;
    } catch {
      this.logout();
      return null;
    }
  },
  
  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Kiểm tra token còn hạn hay không
      return decodedToken.exp > currentTime;
    } catch {
      return false;
    }
  },
  
  hasAdminRole() {
    const user = this.getCurrentUser();
    console.log('Current user data:', user);
    
    // Kiểm tra nhiều trường hợp có thể xảy ra
    if (user && user.roles && Array.isArray(user.roles)) {
      return user.roles.includes('Admin');
    }
    
    if (user && user.role) {
      return user.role === 'Admin';
    }
    
    if (user && user.authorities && Array.isArray(user.authorities)) {
      return user.authorities.some(auth => 
        auth.authority === 'Admin' || 
        auth === 'Admin' ||
        auth.role === 'Admin'
      );
    }
    
    return false;
  },
  
  // Thêm phương thức isAdmin để đồng bộ với auth.js
  isAdmin() {
    const role = localStorage.getItem('userRole');
    const hasAdmin = this.hasAdminRole();
    console.log('DEBUG isAdmin():', { 
      directRoleCheck: role === 'Admin', 
      userRoleFromStorage: role,
      hasAdminRoleCheck: hasAdmin 
    });
    return role === 'Admin' || hasAdmin;
  },
  
  hasUserRole() {
    const user = this.getCurrentUser();
    return user && user.roles && user.roles.includes('User');
  }
};

export default authService; 