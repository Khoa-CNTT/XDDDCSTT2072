import axios from "axios";
import { toast } from "react-toastify";

// Kiểm tra môi trường và sử dụng URL phù hợp
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Các URL API có thể dùng (để thử kết nối)
const API_URLS = {
  dev: [
    "http://localhost:8080/api/v1",
    "http://127.0.0.1:8080/api/v1"
  ],
  prod: [
    "http://localhost:8080/api/v1"
  ]
};

// Lấy danh sách URLs sẽ thử
const apiUrlsToTry = isDevelopment ? API_URLS.dev : API_URLS.prod;

// URL mặc định ban đầu
let currentApiUrlIndex = 0;
let API_URL = apiUrlsToTry[currentApiUrlIndex];
const API_TIMEOUT = 20000; // Tăng timeout lên 20 giây

console.log(`Initial API URL: ${API_URL}`);

// Hàm thử URL kết nối tiếp theo
const tryNextApiUrl = () => {
  currentApiUrlIndex = (currentApiUrlIndex + 1) % apiUrlsToTry.length;
  API_URL = apiUrlsToTry[currentApiUrlIndex];
  console.log(`Switching to next API URL: ${API_URL}`);
  // Cập nhật URL cho cả 2 instance
  axiosInstance.defaults.baseURL = API_URL;
  axiosPrivate.defaults.baseURL = API_URL;
  return API_URL;
};

// Cấu hình Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// Thêm interceptor request để log request
axiosInstance.interceptors.request.use(
  (config) => {
    // Cập nhật baseURL mới nhất cho mỗi request
    config.baseURL = API_URL;
    
    // Chỉ log các API call quan trọng và không gây nhiễu
    if (!config.url.includes('/posts') && !config.url.includes('/users') && !config.url.includes('/hashtags')) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
      
      // Kiểm tra token cho debug
      if (config.headers['Authorization']) {
        console.log(`Request has token: ${config.headers['Authorization'].substring(0, 20)}...`);
      }
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Thêm interceptor response để xử lý lỗi
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xem xét lỗi kết nối và thử URL khác nếu cần
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.warn("Lỗi kết nối:", error.message);
      
      // Thử URL tiếp theo
      const newUrl = tryNextApiUrl();
      console.log(`Đang thử kết nối đến URL tiếp theo: ${newUrl}`);
      
      // Hiển thị thông báo lỗi chỉ một lần thay vì cho mỗi request
      if (!window.hasShownConnectionError) {
        window.hasShownConnectionError = true;
        toast.error(
          "Đang thử kết nối lại đến máy chủ khác. Vui lòng đợi trong giây lát...",
          { autoClose: 5000 } // Hiển thị trong 5 giây
        );
        
        // Reset flag sau 5 giây để cho phép hiển thị lại thông báo nếu vẫn lỗi
        setTimeout(() => {
          window.hasShownConnectionError = false;
        }, 5000);
      }
    } else if (error.response) {
      // Có phản hồi từ server nhưng status code không phải 2xx
      // Chỉ log lỗi 500 và các lỗi nghiêm trọng khác, bỏ qua lỗi 401/404 thông thường
      if (error.response.status >= 500) {
        console.error(`Lỗi server ${error.response.status}:`, error.response.data);
        
        // Hiển thị toast chỉ cho lỗi server
        if (!window.hasShownServerError) {
          window.hasShownServerError = true;
          toast.error("Lỗi máy chủ, vui lòng thử lại sau.", { autoClose: 5000 });
          
          // Reset flag sau 5 giây
          setTimeout(() => {
            window.hasShownServerError = false;
          }, 5000);
        }
      }
      
      // Xử lý các lỗi phổ biến
      if (error.response.status === 401) {
        console.warn("Lỗi xác thực, cần đăng nhập lại");
        // Có thể thêm xử lý chuyển hướng đến trang đăng nhập
        // window.location.href = '/account/login';
      } else if (error.response.status === 403) {
        toast.error("Bạn không có quyền thực hiện thao tác này.");
      }
      
      // Thêm xử lý đặc biệt cho lỗi liên quan đến người dùng - NOT_FOUND/BAD_REQUEST
      if (error.response.data && 
          (error.response.data.errorCode === "NOT_FOUND" || error.response.data.errorCode === "BAD_REQUEST") &&
          error.response.data.errorMessage?.includes("không tìm thấy người dùng")) {
        console.error("Lỗi không tìm thấy thông tin người dùng:", error.response.data);
        
        // Thông báo cho người dùng biết
        toast.error("Có lỗi với thông tin người dùng. Vui lòng đăng nhập lại để tiếp tục.", { 
          autoClose: false // Hiển thị cho đến khi người dùng đóng
        });
        
        // Có thể chuyển hướng về trang đăng nhập sau 3 giây
        // setTimeout(() => {
        //   window.location.href = '/account/login';
        // }, 3000);
      }
    }
    return Promise.reject(error);
  }
);

export const axiosPrivate = axios.create({
  baseURL: API_URL,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true,
  timeout: API_TIMEOUT,
});

// Thêm interceptor mặc định cho debug
axiosPrivate.interceptors.request.use(
  (config) => {
    console.log(`[Request] ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
    
    // Log header cho debug
    if (config.headers) {
      const headersToShow = {...config.headers};
      if (headersToShow.Authorization) {
        headersToShow.Authorization = headersToShow.Authorization.substring(0, 15) + '...';
      }
      console.log('Request headers:', headersToShow);
    }
    
    return config;
  },
  (error) => {
    console.error("[Request Error]", error);
    return Promise.reject(error);
  }
);

axiosPrivate.interceptors.response.use(
  (response) => {
    console.log(`[Response] ${response.config.method?.toUpperCase() || 'GET'} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Xử lý lỗi mạng
    if (!error.response) {
      console.error("[Network Error]", error.message);
      return Promise.reject(new Error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối hoặc thử lại sau."));
    }
    
    // Lỗi từ server
    console.error(`[Response Error] ${error.response.status}:`, error.response.data);
    
    // Xử lý đặc biệt cho lỗi "Không tìm thấy người dùng" - rất phổ biến hiện tại
    if (error.response.data?.errorCode === "NOT_FOUND" || 
        error.response.data?.errorCode === "BAD_REQUEST") {
      console.error("Backend error:", error.response.data);
      
      // Kiểm tra URL hiện tại
      const currentUrl = window.location.pathname;
      
      // Nếu đang ở trang đăng ký bán hàng hoặc liên quan đến seller, không hiện thông báo lỗi
      if (currentUrl.includes('/seller-registration') || currentUrl.includes('/seller/')) {
        console.log("Đang ở trang seller, bỏ qua thông báo lỗi xác thực");
        return Promise.reject(error);
      }
      
      // Kiểm tra xem đang chuyển sang dashboard từ trang tạo sản phẩm không
      const isRedirectingFromProduct = currentUrl.includes('/add-product') || 
                                      currentUrl.includes('/edit-product') || 
                                      localStorage.getItem('productSubmitSuccess');
      
      // Nếu đang tạo sản phẩm hoặc đã chuyển từ trang tạo sản phẩm, không hiện thông báo lỗi
      if (isRedirectingFromProduct) {
        console.log("Đang chuyển hướng từ trang sản phẩm, bỏ qua thông báo lỗi xác thực");
        
        // Đặt flag để biết đã lưu sản phẩm thành công, sẽ xóa sau 10 giây
        localStorage.setItem('productSubmitSuccess', 'true');
        setTimeout(() => {
          localStorage.removeItem('productSubmitSuccess');
        }, 10000);
        
        // Vẫn reject promise nhưng không hiện thông báo
        return Promise.reject(error);
      }
      
      // Lỗi không tìm thấy người dùng từ MarketPlaceServiceImpl
      if (error.response.data.errorMessage?.includes("tìm") && 
          error.response.data.errorMessage?.includes("người dùng")) {
        console.error("Lỗi xác thực người dùng - có thể là vấn đề với token hoặc ID người dùng");
        
        // Bỏ hoàn toàn phần hiển thị thông báo toast
        // Lỗi vẫn được log nhưng không hiển thị cho người dùng
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;