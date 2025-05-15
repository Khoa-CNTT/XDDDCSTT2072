import api from './api';
import weatherProductPerformanceData from '../data/weatherProductPerformanceData';

/**
 * Dịch vụ quản lý gợi ý sản phẩm theo thời tiết
 */
const productWeatherRecommendationService = {
  /**
   * Lấy sản phẩm phù hợp với điều kiện thời tiết hiện tại ở một địa điểm
   * @param {string} city - Tên thành phố
   * @param {string} country - Mã quốc gia
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa danh sách sản phẩm
   */
  getProductsByWeather: async (city, country, page = 0, size = 10) => {
    console.log(`Gọi API getProductsByWeather với city=${city}, country=${country}, page=${page}, size=${size}`);
    try {
      const response = await api.get('/weather-recommendations/by-weather', {
        params: { city, country, page, size }
      });
      
      console.log("Dữ liệu thô từ API:", response);
      
      if (!response || !response.data) {
        console.error("API không trả về dữ liệu");
        throw new Error('API không trả về dữ liệu');
      }
      
      console.log("Dữ liệu trả về từ API:", response.data);
      
      // Xử lý theo cấu trúc 1: {code: 200, message: string, data: {...}}
      if (response.data.code === 200 && response.data.data) {
        console.log("API trả về cấu trúc code-message-data");
        return {
          success: true,
          message: response.data.message || "Lấy dữ liệu thành công",
          data: response.data.data
        };
      }
      
      // Xử lý theo cấu trúc 2: {success: true, message: string, data: {...}}
      if ('success' in response.data && 'data' in response.data) {
        console.log("API trả về cấu trúc success-message-data");
        return response.data;
      }
      
      // Xử lý theo cấu trúc 3: {weatherData: {...}, seasonalProducts: {...}}
      if ('weatherData' in response.data && 'seasonalProducts' in response.data) {
        console.log("API trả về cấu trúc weatherData-seasonalProducts");
        return {
          success: true,
          message: "Lấy dữ liệu thành công",
          data: response.data
        };
      }
      
      // Fallback: trả về dữ liệu nguyên mẫu nếu không khớp với bất kỳ cấu trúc nào đã biết
      console.log("API trả về cấu trúc không xác định, trả về nguyên dạng được wrap");
      return {
        success: true,
        message: "Lấy dữ liệu thành công",
        data: response.data
      };
    } catch (error) {
      console.error(`Lỗi chi tiết khi lấy sản phẩm theo thời tiết cho ${city}, ${country}:`, error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return {
        success: false,
        message: error.message || "Không thể kết nối đến server",
        data: {
          weatherData: null,
          seasonalProducts: []
        }
      };
    }
  },

  /**
   * Lấy sản phẩm phù hợp cho mùa mưa
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa danh sách sản phẩm
   */
  getRainySeasonProducts: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/weather-recommendations/rainy-season', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm mùa mưa:', error);
      throw error;
    }
  },

  /**
   * Lấy sản phẩm phù hợp cho mùa khô
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa danh sách sản phẩm
   */
  getDrySeasonProducts: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/weather-recommendations/dry-season', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm mùa khô:', error);
      throw error;
    }
  },

  /**
   * Lấy sản phẩm sắp vào mùa vụ
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa danh sách sản phẩm
   */
  getUpcomingSeasonProducts: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/weather-recommendations/upcoming-season', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm sắp vào mùa vụ:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin tổng hợp để hiển thị trang chủ
   * @param {string} city - Tên thành phố
   * @param {string} country - Mã quốc gia
   * @returns {Promise} - Promise chứa thông tin tổng hợp
   */
  getHomeDashboard: async (city, country) => {
    try {
      const response = await api.get('/weather-recommendations/home-dashboard', {
        params: { city, country }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin dashboard cho ${city}, ${country}:`, error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết các gợi ý sản phẩm
   * @param {string} city - Tên thành phố
   * @param {string} country - Mã quốc gia
   * @returns {Promise} - Promise chứa danh sách gợi ý
   */
  getDetailedRecommendations: async (city, country) => {
    try {
      const response = await api.get('/weather-recommendations/detailed-recommendations', {
        params: { city, country }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy gợi ý chi tiết cho ${city}, ${country}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin khuyến mãi theo mùa vụ
   * @param {string} city - Tên thành phố
   * @param {string} country - Mã quốc gia
   * @returns {Promise} - Promise chứa thông tin khuyến mãi
   */
  getSeasonalPromotions: async (city, country) => {
    try {
      const response = await api.get('/weather-recommendations/seasonal-promotions', {
        params: { city, country }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy khuyến mãi theo mùa vụ cho ${city}, ${country}:`, error);
      throw error;
    }
  },

  /**
   * Lấy sản phẩm phù hợp với cây trồng cụ thể dựa trên thời tiết
   * @param {string} city - Tên thành phố
   * @param {string} country - Mã quốc gia
   * @param {string} cropType - Loại cây trồng
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa danh sách sản phẩm
   */
  getProductsByCropAndWeather: async (city, country, cropType, page = 0, size = 10) => {
    console.log(`Gọi API getProductsByCropAndWeather với city=${city}, country=${country}, cropType=${cropType}`);
    try {
      const response = await api.get('/weather-recommendations/by-crop', {
        params: { city, country, cropType, page, size }
      });
      
      console.log("Dữ liệu thô từ API (by-crop):", response);
      
      if (!response || !response.data) {
        console.error("API không trả về dữ liệu");
        return {
          success: false,
          message: "API không trả về dữ liệu",
          data: {
            weatherData: null,
            cropProducts: [],
            careAdvice: `Chăm sóc ${cropType} cần lưu ý theo dõi thời tiết và điều chỉnh tưới tiêu phù hợp.`
          }
        };
      }
      
      // Nếu API trả về cấu trúc với ApiResponse (có success, message, data)
      if (Object.prototype.hasOwnProperty.call(response.data, 'success')) {
        console.log("API trả về dạng ApiResponse:", response.data);
        
        // Log chi tiết về cropProducts trong response.data.data để debug
        if (response.data.data && response.data.data.cropProducts) {
          console.log("Chi tiết cropProducts:", {
            type: typeof response.data.data.cropProducts,
            isArray: Array.isArray(response.data.data.cropProducts),
            hasContent: response.data.data.cropProducts.content !== undefined,
            contentType: response.data.data.cropProducts.content ? typeof response.data.data.cropProducts.content : "N/A",
            length: Array.isArray(response.data.data.cropProducts.content) 
              ? response.data.data.cropProducts.content.length 
              : (Array.isArray(response.data.data.cropProducts) 
                ? response.data.data.cropProducts.length 
                : "N/A")
          });
        } else {
          console.warn("Không tìm thấy cropProducts trong response.data.data");
        }
        
        return response.data;
      }
      
      // Nếu API trả về dữ liệu trực tiếp (không có success, message)
      console.log("API trả về dữ liệu trực tiếp:", response.data);
      
      // Log chi tiết về cropProducts trong response.data để debug
      if (response.data && response.data.cropProducts) {
        console.log("Chi tiết cropProducts (direct):", {
          type: typeof response.data.cropProducts,
          isArray: Array.isArray(response.data.cropProducts),
          hasContent: response.data.cropProducts.content !== undefined,
          contentType: response.data.cropProducts.content ? typeof response.data.cropProducts.content : "N/A",
          length: Array.isArray(response.data.cropProducts.content) 
            ? response.data.cropProducts.content.length 
            : (Array.isArray(response.data.cropProducts) 
              ? response.data.cropProducts.length 
              : "N/A")
        });
      } else {
        console.warn("Không tìm thấy cropProducts trong response.data");
      }
      
      // Wrap dữ liệu để phù hợp với cấu trúc mong đợi {success: true, data: {...}}
      return {
        success: true,
        message: "Lấy dữ liệu thành công",
        data: response.data
      };
    } catch (error) {
      console.error(`Lỗi chi tiết khi lấy sản phẩm cho cây ${cropType} ở ${city}, ${country}:`, error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      // Trả về đối tượng thông báo lỗi thay vì throw để tránh crash trang
      return {
        success: false,
        message: `Lỗi: ${error.message}`,
        data: {
          weatherData: null,
          cropProducts: [],
          careAdvice: `Chăm sóc ${cropType} cần lưu ý theo dõi thời tiết và điều chỉnh tưới tiêu phù hợp.`
        }
      };
    }
  },

  /**
   * Lấy gợi ý sản phẩm để chuẩn bị cho thời tiết khắc nghiệt
   * @param {string} city - Tên thành phố
   * @param {string} country - Mã quốc gia
   * @param {number} forecastDays - Số ngày dự báo
   * @returns {Promise} - Promise chứa thông tin gợi ý
   */
  getExtremeWeatherPreparation: async (city, country, forecastDays = 7) => {
    try {
      const response = await api.get('/weather-recommendations/extreme-weather-preparation', {
        params: { city, country, forecastDays }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy gợi ý chuẩn bị thời tiết khắc nghiệt cho ${city}, ${country}:`, error);
      throw error;
    }
  },

  /**
   * Lấy báo cáo hiệu suất sản phẩm theo thời tiết
   * @param {number} productId - ID sản phẩm cần phân tích
   * @param {string} region - Khu vực phân tích
   * @param {number} period - Khoảng thời gian phân tích (tháng)
   * @returns {Promise} - Promise chứa dữ liệu phân tích
   */
  getWeatherProductPerformance: async (productId = null, region = null, period = 6) => {
    console.log(`Gọi hàm getWeatherProductPerformance với productId=${productId}, region=${region}, period=${period}`);
    
    try {
      // Nếu không gọi API mà sử dụng dữ liệu mẫu
      // Kiểm tra nếu có dữ liệu cho sản phẩm, khu vực và khoảng thời gian đã chọn
      if (productId && region && period) {
        if (weatherProductPerformanceData[productId] && 
            weatherProductPerformanceData[productId][region] && 
            weatherProductPerformanceData[productId][region][period]) {
              
          console.log("Tìm thấy dữ liệu phân tích cho sản phẩm, khu vực và khoảng thời gian đã chọn");
          return {
            success: true,
            message: "Lấy dữ liệu thành công",
            data: weatherProductPerformanceData[productId][region][period]
          };
        } else {
          console.log("Không tìm thấy dữ liệu phù hợp với lựa chọn, trả về dữ liệu mẫu mặc định");
          // Trả về dữ liệu mẫu mặc định nếu không tìm thấy cho lựa chọn cụ thể
          return {
            success: true,
            message: "Không có dữ liệu chính xác cho lựa chọn, trả về dữ liệu mẫu",
            data: weatherProductPerformanceData[1]["north"][6] // Dữ liệu mẫu mặc định
          };
        }
      }
      
      // Nếu không có đủ thông tin lựa chọn, trả về dữ liệu mẫu mặc định
      console.log("Không đủ thông tin lựa chọn, trả về dữ liệu mẫu mặc định");
      return {
        success: true,
        message: "Lấy dữ liệu thành công (dữ liệu mẫu)",
        data: weatherProductPerformanceData[1]["north"][6] // Dữ liệu mẫu mặc định
      };
      
      // Đoạn code gọi API thực tế (đã bị comment out)
      /*
      const params = { period };
      if (productId) params.productId = productId;
      if (region) params.region = region;

      console.log("Gửi request với params:", params);

      const response = await api.get('/weather-recommendations/weather-product-performance', {
        params
      });

      if (!response || !response.data) {
        console.error('Không nhận được dữ liệu từ API');
        return { success: false, message: 'Không nhận được dữ liệu từ API', data: null };
      }

      return {
        success: true,
        message: 'Lấy dữ liệu thành công',
        data: response.data
      };
      */
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo hiệu suất sản phẩm theo thời tiết:', error);
      // Trong trường hợp lỗi, vẫn trả về dữ liệu mẫu để UI không bị trống
      return {
        success: true,
        message: "Có lỗi xảy ra nhưng vẫn trả về dữ liệu mẫu",
        data: weatherProductPerformanceData[1]["north"][6] // Dữ liệu mẫu mặc định
      };
    }
  },

  /**
   * Lấy tất cả sản phẩm từ database không phân biệt thời tiết hoặc cây trồng
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa danh sách sản phẩm
   */
  getAllProducts: async (page = 0, size = 100) => {
    console.log(`Gọi API getAllProducts với page=${page}, size=${size}`);
    try {
      const response = await api.get('/marketplace/products', {
        params: { page, size }
      });
      
      console.log("Dữ liệu từ API getAllProducts:", response);
      
      if (!response || !response.data) {
        console.error("API getAllProducts không trả về dữ liệu");
        return {
          success: false,
          message: "API không trả về dữ liệu",
          data: []
        };
      }
      
      return {
        success: true,
        message: "Lấy dữ liệu thành công",
        data: response.data
      };
    } catch (error) {
      console.error("Lỗi khi lấy tất cả sản phẩm:", error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return {
        success: false,
        message: `Lỗi: ${error.message}`,
        data: []
      };
    }
  },

  /**
   * Lấy sản phẩm theo danh mục
   * @param {number} categoryId - ID danh mục sản phẩm
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Kích thước trang
   * @returns {Promise} - Promise chứa danh sách sản phẩm
   */
  getProductsByCategory: async (categoryId, page = 0, size = 50) => {
    console.log(`Gọi API getProductsByCategory với categoryId=${categoryId}`);
    try {
      const response = await api.get(`/marketplace/category/${categoryId}`, {
        params: { page, size }
      });
      
      console.log("Dữ liệu từ API getProductsByCategory:", response);
      
      if (!response || !response.data) {
        console.error("API getProductsByCategory không trả về dữ liệu");
        return {
          success: false,
          message: "API không trả về dữ liệu",
          data: []
        };
      }
      
      return {
        success: true,
        message: "Lấy dữ liệu thành công",
        data: response.data
      };
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm theo danh mục ${categoryId}:`, error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return {
        success: false,
        message: `Lỗi: ${error.message}`,
        data: []
      };
    }
  },

  /**
   * Lấy sản phẩm được gợi ý theo thời tiết
   * @param {number} limit - Giới hạn số lượng sản phẩm trả về
   * @returns {Promise} - Promise chứa danh sách sản phẩm gợi ý
   */
  getWeatherRecommendations: async (limit = 10) => {
    try {
      const response = await api.get('/weather-recommendations/by-weather', {
        params: { limit }
      });

      if (!response || !response.data) {
        console.error('Không nhận được dữ liệu từ API');
        return { success: false, message: 'Không nhận được dữ liệu từ API', data: [] };
      }

      return {
        success: true,
        message: 'Lấy dữ liệu thành công',
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi lấy gợi ý sản phẩm theo thời tiết:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi lấy dữ liệu',
        data: []
      };
    }
  },

  /**
   * Lấy báo cáo sản phẩm bán chạy theo thời tiết
   * @param {number} limit - Giới hạn số lượng sản phẩm
   * @returns {Promise} - Promise chứa báo cáo
   */
  getTopSellingByWeather: async (limit = 5) => {
    try {
      const response = await api.get('/weather-recommendations/top-selling', {
        params: { limit }
      });

      return {
        success: true,
        message: 'Lấy dữ liệu thành công',
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm bán chạy theo thời tiết:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi lấy dữ liệu',
        data: null
      };
    }
  }
};

export default productWeatherRecommendationService; 