import api from './api';

const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/signin', { email, password });
      if (response.data && response.data.token) {
        const { token, refreshToken, role } = response.data;
        
        // Lưu thông tin vào localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken || '');
        localStorage.setItem('userRole', role || '');
        
        return response.data;
      }
      throw new Error('Đăng nhập không thành công: Không nhận được token');
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  },
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    // Chuyển về trang đăng nhập
    window.location.href = '/login';
  },
  
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },
  
  isAdmin() {
    const role = localStorage.getItem('userRole');
    return role === 'Admin';
  },
  
  getToken() {
    return localStorage.getItem('token');
  },
  
  getUserRole() {
    return localStorage.getItem('userRole');
  }
};

export default authService; 