import api from './api';

/**
 * Dịch vụ quản lý thời tiết cho Admin
 */
const weatherService = {
  // Lấy danh sách tất cả các địa điểm đang được theo dõi
  async getAllMonitoredLocations() {
    try {
      const response = await api.get('/weather/locations');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách địa điểm theo dõi:', error);
      throw error;
    }
  },

  // Lấy danh sách các địa điểm đang hoạt động
  async getActiveLocations() {
    try {
      const response = await api.get('/weather/locations/active');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách địa điểm đang hoạt động:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách các địa điểm đã theo dõi
   * @returns {Promise} - Promise chứa danh sách các địa điểm
   */
  async getFollowedLocations() {
    try {
      console.log('Đang gọi API lấy danh sách địa điểm');
      const response = await api.get('/weather/locations');
      
      console.log('Response từ API locations:', response);
      
      // Controller trả về List<WeatherMonitoredLocationDTO> trực tiếp
      if (response && response.data) {
        // Wrap dữ liệu trong cấu trúc chuẩn để tương thích với frontend
        return {
          success: true,
          message: "Lấy danh sách địa điểm thành công",
          data: response.data
        };
      } else {
        console.error('API không trả về dữ liệu hợp lệ');
        throw new Error('Không thể lấy danh sách địa điểm từ server');
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách địa điểm theo dõi:', error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết của một địa điểm theo ID
  async getLocationById(locationId) {
    try {
      const response = await api.get(`/weather/locations/${locationId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin địa điểm ID ${locationId}:`, error);
      throw error;
    }
  },

  // Thêm mới một địa điểm theo dõi
  async createLocation(locationData) {
    try {
      const response = await api.post('/weather/locations', locationData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo địa điểm mới:', error);
      throw error;
    }
  },

  // Cập nhật thông tin địa điểm theo dõi
  async updateLocation(locationId, locationData) {
    try {
      // Không có endpoint cho cập nhật, dùng POST để tạo mới (cần đảm bảo ID được bảo tồn trong locationData)
      const response = await api.post('/weather/locations', locationData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật địa điểm ID ${locationId}:`, error);
      throw error;
    }
  },

  // Cập nhật trạng thái kích hoạt của địa điểm
  async updateLocationStatus(locationId, isActive) {
    try {
      // Sử dụng PATCH để cập nhật trạng thái như đã định nghĩa trong controller
      const response = await api.patch(`/weather/locations/${locationId}/status?isActive=${isActive}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật trạng thái địa điểm ID ${locationId}:`, error);
      throw error;
    }
  },

  // Xóa một địa điểm theo dõi
  async deleteLocation(locationId) {
    try {
      const response = await api.delete(`/weather/locations/${locationId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa địa điểm ID ${locationId}:`, error);
      throw error;
    }
  },

  // Lấy dữ liệu thời tiết hiện tại cho một thành phố
  async getCurrentWeather(city, country) {
    try {
      console.log(`Đang gọi API getCurrentWeather với city=${city}, country=${country}`);
      
      const response = await api.get('/weather/current', {
        params: { city, country }
      });
      
      console.log('Response từ API getCurrentWeather:', response);
      
      // Kiểm tra cấu trúc dữ liệu
      if (!response || !response.data) {
        throw new Error('Không nhận được dữ liệu từ API');
      }
      
      // Controller trả về WeatherDataDTO trực tiếp
      return response.data;
    } catch (error) {
      console.error(`Lỗi chi tiết khi lấy dữ liệu thời tiết cho ${city}, ${country}:`, error);
      
      if (error.response) {
        // Lỗi từ phía server
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        throw new Error(`Lỗi từ server: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        console.error('Không nhận được phản hồi từ server:', error.request);
        throw new Error('Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.');
      } else {
        // Lỗi khác
        console.error('Lỗi không xác định:', error.message);
        throw error;
      }
    }
  },

  // Lấy dữ liệu thời tiết theo tọa độ
  async getWeatherByCoordinates(latitude, longitude) {
    try {
      const response = await api.get('/weather/coordinates', {
        params: { latitude, longitude }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy dữ liệu thời tiết cho tọa độ (${latitude}, ${longitude}):`, error);
      throw error;
    }
  },

  // Lấy lịch sử dữ liệu thời tiết
  async getWeatherHistory(city, country, days = 7) {
    try {
      console.log(`Đang gọi API getWeatherHistory với city=${city}, country=${country}, days=${days}`);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const formattedDate = startDate.toISOString().split('T')[0];
      
      console.log('Tham số startDate:', formattedDate);

      const response = await api.get('/weather/history', {
        params: {
          city,
          country,
          startDate: formattedDate
        }
      });
      
      console.log('Response từ API getWeatherHistory:', response);
      
      // Kiểm tra cấu trúc dữ liệu
      const data = response.data;
      if (!data || !Array.isArray(data)) {
        console.error('Dữ liệu lịch sử thời tiết không đúng định dạng (phải là mảng):', data);
        throw new Error('Dữ liệu lịch sử thời tiết không đúng định dạng');
      }
      
      return data;
    } catch (error) {
      console.error(`Lỗi chi tiết khi lấy lịch sử thời tiết cho ${city}, ${country}:`, error);
      
      if (error.response) {
        // Lỗi từ phía server
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        throw new Error(`Lỗi từ server: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        console.error('Không nhận được phản hồi từ server:', error.request);
        throw new Error('Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.');
      } else {
        // Lỗi khác
        console.error('Lỗi không xác định:', error.message);
        throw error;
      }
    }
  },

  // Lấy lời khuyên nông nghiệp mới nhất cho một thành phố
  async getLatestAgriculturalAdvice(city, country) {
    try {
      const response = await api.get('/weather/agricultural-advice/latest', {
        params: { city, country }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy lời khuyên nông nghiệp cho ${city}, ${country}:`, error);
      throw error;
    }
  },

  // Lấy lịch sử lời khuyên nông nghiệp
  async getAgriculturalAdviceHistory(city, country) {
    try {
      const response = await api.get('/weather/agricultural-advice/history', {
        params: { city, country }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy lịch sử lời khuyên nông nghiệp cho ${city}, ${country}:`, error);
      throw error;
    }
  },

  // Lấy các lời khuyên phù hợp cho việc trồng trọt
  async getPlantingAdvice() {
    try {
      const response = await api.get('/weather/agricultural-advice/planting');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy lời khuyên trồng trọt:', error);
      throw error;
    }
  },

  // Lấy các lời khuyên phù hợp cho việc thu hoạch
  async getHarvestingAdvice() {
    try {
      const response = await api.get('/weather/agricultural-advice/harvesting');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy lời khuyên thu hoạch:', error);
      throw error;
    }
  },

  // Tạo một lời khuyên nông nghiệp mới
  async createAgriculturalAdvice(adviceData) {
    try {
      const response = await api.post('/weather/agricultural-advice', adviceData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo lời khuyên nông nghiệp mới:', error);
      throw error;
    }
  },

  // Cập nhật lời khuyên nông nghiệp
  async updateAgriculturalAdvice(adviceId, adviceData) {
    try {
      const response = await api.post(`/weather/agricultural-advice/${adviceId}/update`, adviceData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật lời khuyên nông nghiệp ID ${adviceId}:`, error);
      throw error;
    }
  },

  // Xóa lời khuyên nông nghiệp
  async deleteAgriculturalAdvice(adviceId) {
    try {
      const response = await api.delete(`/weather/agricultural-advice/${adviceId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa lời khuyên nông nghiệp ID ${adviceId}:`, error);
      throw error;
    }
  },

  // Lấy dự báo thời tiết cho một khoảng thời gian
  async getWeatherForecast(city, country, days = 7) {
    try {
      const response = await api.get('/weather/forecast', {
        params: { city, country, days }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy dự báo thời tiết cho ${city}, ${country}:`, error);
      throw error;
    }
  },
  
  // Dự đoán các hiện tượng thời tiết khắc nghiệt sắp xảy ra
  async predictExtremeWeather(city, country, forecastDays = 7) {
    try {
      const response = await api.get('/weather/extreme-weather', {
        params: { city, country, forecastDays }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi dự đoán thời tiết khắc nghiệt cho ${city}, ${country}:`, error);
      throw error;
    }
  },

  /**
   * Thêm một địa điểm để theo dõi thời tiết
   * @param {string} city - Tên thành phố
   * @param {string} country - Mã quốc gia (2 ký tự)
   * @param {string} notes - Ghi chú (tuỳ chọn)
   * @returns {Promise} - Promise chứa kết quả thêm địa điểm
   */
  addLocation: async (city, country, notes = '') => {
    try {
      const response = await api.post('/weather/locations', { city, country, notes });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi thêm địa điểm ${city}, ${country}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin thời tiết theo mùa vụ nông nghiệp
   * @param {string} city - Tên thành phố
   * @param {string} country - Mã quốc gia (2 ký tự)
   * @returns {Promise} - Promise chứa thông tin theo mùa vụ
   */
  getSeasonalWeather: async (city, country) => {
    try {
      const response = await api.get('/weather/seasonal', {
        params: { city, country }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin thời tiết theo mùa vụ cho ${city}, ${country}:`, error);
      throw error;
    }
  }
};

export default weatherService; 