import axios from 'axios';

// Tạo instance của axios với cấu hình cơ bản
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  timeout: 10000, // Thêm timeout 10 giây để tránh treo khi API không phản hồi
  withCredentials: false // Cho phép gửi cookie theo yêu cầu khi CORS
});

// Thêm interceptor để in ra log request cho việc debug
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config);
    
    // Thêm timestamp vào params để tránh cache
    if (!config.params) {
      config.params = {};
    }
    config.params._t = new Date().getTime();
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi từ response
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    console.error('[API Response Error]', error);
    
    // Nếu không có response từ server (network error)
    if (!error.response) {
      console.error('Network Error: Không thể kết nối đến server');
      return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối hoặc server đã khởi động chưa.'));
    }
    
    const originalRequest = error.config;
    
    // Xử lý token hết hạn
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/refresh-token`, {
          refreshToken,
        });
        
        const { token, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Cập nhật token trong header của request gốc
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        
        // Thử lại request ban đầu
        return api(originalRequest);
      } catch (err) {
        // Đăng xuất nếu không thể refresh token
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 