import api from './api';
import { jwtDecode } from 'jwt-decode';

const authService = {
  async login(email, password) {
    try {
      // Thử gọi API đăng nhập thực tế
      const response = await api.post('/users/login', { email, password });
      
      // Log toàn bộ dữ liệu trả về để debug
      console.log('=== DỮ LIỆU ĐĂNG NHẬP ===');
      console.log('response.data:', response.data);
      console.log('user:', response.data.user);
      console.log('roleName:', response.data.user?.roleName);
      console.log('==========================');
      
      // Kiểm tra role của người dùng      
      const userRole = response.data.user?.role;
      const userRoleName = response.data.user?.roleName;
      const userRoleInResponse = response.data.role;
      
      // Log các giá trị role có thể có
      console.log('User role in user object:', userRole);
      console.log('User roleName in user object:', userRoleName);
      console.log('User role in response root:', userRoleInResponse);
      
      // Kiểm tra role linh hoạt hơn: chấp nhận cả roleName
      const isAdmin = 
        userRole === 1 || 
        userRole === '1' || 
        userRole === 'Admin' || 
        userRole === 'ADMIN' ||
        userRoleName === 'Admin' || 
        userRoleName === 'ADMIN' ||
        userRoleInResponse === 1 || 
        userRoleInResponse === '1' || 
        userRoleInResponse === 'Admin' || 
        userRoleInResponse === 'ADMIN';
      
      if (response.data.user && !isAdmin) {
        console.log('Từ chối đăng nhập: Không phải Admin');
        throw new Error('Bạn không có quyền truy cập vào trang Admin');
      }
      
      const { token, refreshToken } = response.data;
      
      // Lưu token vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Lưu role vào userRole để đồng bộ với auth.js
      if (response.data.role || response.data.user?.role || response.data.user?.roleName) {
        localStorage.setItem('userRole', response.data.role || response.data.user?.role || response.data.user?.roleName);
      }
      
      // Lưu user object vào localStorage 
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
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
          role: 1, // Đảm bảo role là số 1 chứ không phải chuỗi 'Admin'
          roleId: 1
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
            role: 1, // Đảm bảo role là số 1 chứ không phải chuỗi 'Admin'
            roleId: 1
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
    console.log('hasAdminRole - Current user data:', user);
    
    if (!user) return false;
    
    // Kiểm tra trường roles (mảng)
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.includes('Admin') || user.roles.includes('ADMIN') || 
             user.roles.includes(1) || user.roles.includes('1');
    }
    
    // Kiểm tra trường role và roleName
    const role = user.role;
    const roleName = user.roleName;
    
    if (role !== undefined) {
      console.log('hasAdminRole - Role type:', typeof role, 'value:', role);
      if (role === 'Admin' || role === 'ADMIN' || role === 1 || role === '1') {
        return true;
      }
    }
    
    if (roleName !== undefined) {
      console.log('hasAdminRole - RoleName type:', typeof roleName, 'value:', roleName);
      if (roleName === 'Admin' || roleName === 'ADMIN') {
        return true;
      }
    }
    
    // Kiểm tra authorities
    if (user.authorities && Array.isArray(user.authorities)) {
      return user.authorities.some(auth => {
        if (typeof auth === 'string') {
          return auth === 'Admin' || auth === 'ADMIN' || auth === '1';
        }
        return auth.authority === 'Admin' || auth.authority === 'ADMIN' || 
               auth.role === 'Admin' || auth.role === 'ADMIN' ||
               auth.roleName === 'Admin' || auth.roleName === 'ADMIN' ||
               auth.authority === 1 || auth.authority === '1' ||
               auth.role === 1 || auth.role === '1';
      });
    }
    
    return false;
  },
  
  // Thêm phương thức isAdmin để đồng bộ với auth.js
  isAdmin() {
    const role = localStorage.getItem('userRole');
    const hasAdmin = this.hasAdminRole();
    
    console.log('isAdmin - userRole from storage:', role);
    console.log('isAdmin - hasAdmin from role check:', hasAdmin);
    
    // Kiểm tra linh hoạt hơn
    const roleIsAdmin = 
      role === 'Admin' || 
      role === 'ADMIN' || 
      role === '1' || 
      role === 1;
    
    console.log('isAdmin - final result:', roleIsAdmin || hasAdmin);
    return roleIsAdmin || hasAdmin;
  },
  
  hasUserRole() {
    const user = this.getCurrentUser();
    return user && user.roles && user.roles.includes('User');
  }
};

export default authService; 