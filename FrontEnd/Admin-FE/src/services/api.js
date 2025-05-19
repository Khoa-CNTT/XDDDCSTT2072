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
  timeout: 15000, // Tăng timeout để tránh lỗi timeout
  withCredentials: true // Cho phép gửi cookie để xác thực session nếu backend sử dụng
});

// Tạo instance axiosPrivate để sử dụng cho các endpoints yêu cầu xác thực
export const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  timeout: 15000,
  withCredentials: true
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
    
    // Thêm token vào header Authorization
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

// Cũng cấu hình interceptor cho axiosPrivate
axiosPrivate.interceptors.request.use(
  (config) => {
    // Thêm timestamp vào params để tránh cache
    if (!config.params) {
      config.params = {};
    }
    config.params._t = new Date().getTime();
    
    // Thêm token vào header Authorization
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
        
        // Sử dụng axios trực tiếp thay vì api instance để tránh vòng lặp interceptor
        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}/auth/refresh-token`, {
          refreshToken,
        });
        
        if (response.data && response.data.token) {
          // Cập nhật token mới
          const { token, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('token', token);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          // Cập nhật token trong header của request gốc
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          // Thử lại request ban đầu
          return api(originalRequest);
        } else {
          console.error('Refresh token failed: Invalid response format');
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Refresh token error:', err);
        // Đăng xuất nếu không thể refresh token
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Redirect đến trang login sau 1 giây để cho phép hiển thị thông báo
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        
        return Promise.reject(err);
      }
    }
    
    // Không cần xử lý 403 tại đây, để trang cụ thể xử lý
    
    return Promise.reject(error);
  }
);

// Cấu hình interceptor response cho axiosPrivate tương tự như api
axiosPrivate.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Không thể kết nối đến server.'));
    }
    
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}/auth/refresh-token`, {
          refreshToken,
        });
        
        if (response.data && response.data.token) {
          const { token, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('token', token);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          return axiosPrivate(originalRequest);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 