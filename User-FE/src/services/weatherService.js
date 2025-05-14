import axios from 'axios';

// Cấu hình base URL cho API
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Hình ảnh mẫu cho sản phẩm (thay thế placeholder)
const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1585726931686-79edc493ceab?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1599762896790-d6c25c791c7a?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574943320219-361c4371cf28?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=600&auto=format&fit=crop"
];

// Service xử lý các API liên quan đến thời tiết
const weatherService = {
  // Lấy thông tin thời tiết hiện tại
  async getCurrentWeather(city, country) {
    try {
      const encodedCity = encodeURIComponent(city);
      const encodedCountry = encodeURIComponent(country);
      const url = `${API_BASE_URL}/weather/current?city=${encodedCity}&country=${encodedCountry}`;
      
      console.log("Gọi API thời tiết hiện tại:", url);
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        responseType: 'json'
      });
      
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin thời tiết hiện tại:", error);
      throw error;
    }
  },
  
  // Lấy dự báo thời tiết
  async getWeatherForecast(city, country) {
    try {
      const encodedCity = encodeURIComponent(city);
      const encodedCountry = encodeURIComponent(country);
      const url = `${API_BASE_URL}/weather/forecast?city=${encodedCity}&country=${encodedCountry}`;
      
      console.log("Gọi API dự báo thời tiết:", url);
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        responseType: 'json'
      });
      
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy dự báo thời tiết:", error);
      throw error;
    }
  },
  
  // Lấy lời khuyên nông nghiệp mới nhất
  async getLatestAgriculturalAdvice(city, country) {
    try {
      const encodedCity = encodeURIComponent(city);
      const encodedCountry = encodeURIComponent(country);
      const url = `${API_BASE_URL}/weather/agricultural-advice?city=${encodedCity}&country=${encodedCountry}`;
      
      console.log("Gọi API lời khuyên nông nghiệp:", url);
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        responseType: 'json'
      });
      
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy lời khuyên nông nghiệp:", error);
      throw error;
    }
  },
  
  // Tạo dữ liệu giả lời khuyên nông nghiệp (khi API không hoạt động)
  createMockAdvice(city, country, weatherData) {
    // Phân tích điều kiện thời tiết
    const weatherDesc = weatherData?.weatherDescription?.toLowerCase() || 'có mây';
    const isRainy = weatherDesc.includes('mưa');
    const isHot = weatherData?.temperature > 30;
    const isCold = weatherData?.temperature < 20;
    
    // Xác định mùa vụ dựa trên thời tiết
    let season = "Mùa chuyển giao";
    if (isRainy) {
      season = "Mùa mưa";
    } else if (isHot && !isRainy) {
      season = "Mùa khô";
    }
    
    return {
      city: city,
      country: country,
      weatherSummary: `${city} hiện đang có thời tiết ${weatherData?.weatherDescription?.toLowerCase() || 'có mây'}, nhiệt độ ${weatherData?.temperature || 30}°C.`,
      currentSeason: season,
      soilCondition: isRainy ? "Đất đang ẩm ướt, cần chú ý thoát nước tốt" : (isHot ? "Đất dễ bị khô, cần đảm bảo đủ độ ẩm" : "Đất có độ ẩm trung bình, phù hợp cho nhiều loại cây trồng"),
      wateringRecommendation: isRainy ? "Hạn chế tưới nước khi trời mưa, chú ý thoát nước khu vực úng ngập" : (isHot ? "Tăng cường tưới nước vào sáng sớm và chiều tối, tránh tưới lúc trời nắng gắt" : "Duy trì tưới nước đều đặn, không để đất quá khô hoặc quá ẩm"),
      cropAdvice: isRainy ? "Ưu tiên trồng các loại cây chịu ẩm tốt như: khoai môn, rau muống, bạc hà..." : (isHot ? "Trồng các loại cây chịu nhiệt như: đậu bắp, ớt, cà chua, dưa hấu..." : "Thích hợp trồng nhiều loại rau ăn lá như: cải xanh, cải ngọt, xà lách..."),
      farmingAdvice: isRainy ? "Tạo mương thoát nước, sử dụng luống cao, che phủ để hạn chế rửa trôi đất" : (isHot ? "Sử dụng kỹ thuật che phủ gốc, tủ rơm rạ để giữ ẩm và làm mát đất" : "Theo dõi sâu bệnh thường xuyên và cung cấp đủ dinh dưỡng cho cây trồng"),
      warnings: isRainy ? "Cảnh báo nguy cơ úng ngập và bệnh nấm, cần phòng trừ kịp thời" : (isHot ? "Cảnh báo nguy cơ thiếu nước và cháy nắng, cần che phủ và cung cấp đủ nước" : "Không có cảnh báo đặc biệt"),
      isSuitableForPlanting: !isRainy || (isRainy && !isCold),
      isSuitableForHarvesting: !isRainy,
      isRainySeason: isRainy,
      isDrySeason: isHot && !isRainy,
      lastUpdated: new Date().toISOString()
    };
  },
  
  // Tạo dữ liệu giả cho sản phẩm gợi ý theo thời tiết
  createMockWeatherProducts(weatherData) {
    // Phân loại dựa theo thời tiết
    const weatherDesc = weatherData?.weatherDescription?.toLowerCase() || 'có mây';
    const isRainy = weatherDesc.includes('mưa');
    const isHot = (weatherData?.temperature || 30) > 30;
    const isCold = (weatherData?.temperature || 30) < 20;
    
    const products = [
      {
        id: 1,
        name: "Hạt giống rau cải xanh chịu nhiệt",
        description: "Giống rau cao cấp, chịu nhiệt tốt, thích hợp trồng quanh năm, đặc biệt phù hợp với mùa nắng nóng.",
        price: 25000,
        imageUrl: PRODUCT_IMAGES[0],
        category: "Hạt giống",
        rating: 4.8,
        ratingCount: 156,
        location: "Đồng Nai",
        weatherSuitability: isHot ? "Rất phù hợp" : "Phù hợp",
        stockStatus: "Còn hàng"
      },
      {
        id: 2,
        name: "Phân bón chậm tan NPK 16-16-8",
        description: "Phân bón cân đối dinh dưỡng, giải phóng chậm, giúp cây trồng phát triển đồng đều, tăng sức đề kháng.",
        price: 120000,
        imageUrl: PRODUCT_IMAGES[1],
        category: "Phân bón",
        rating: 4.5,
        ratingCount: 89,
        location: "Cần Thơ",
        weatherSuitability: "Đa mùa vụ",
        stockStatus: "Còn hàng"
      },
      {
        id: 3,
        name: isRainy ? "Thuốc phòng trừ nấm bệnh Kasumin" : "Thuốc phòng trừ sâu Koruda",
        description: isRainy ? "Thuốc phòng trừ nấm bệnh hiệu quả trong điều kiện mưa ẩm, bảo vệ cây trồng khỏi các bệnh nấm, thối rễ." : "Thuốc phòng trừ sâu an toàn, hiệu quả, phòng trừ nhiều loại sâu hại trên rau màu.",
        price: 85000,
        imageUrl: PRODUCT_IMAGES[2],
        category: "Thuốc BVTV",
        rating: 4.3,
        ratingCount: 67,
        location: "Long An",
        weatherSuitability: isRainy ? "Rất phù hợp mùa mưa" : "Phù hợp quanh năm",
        stockStatus: "Còn hàng"
      },
      {
        id: 4,
        name: isHot ? "Hệ thống tưới nhỏ giọt tiết kiệm nước" : "Bộ dụng cụ làm vườn đa năng",
        description: isHot ? "Hệ thống tưới nhỏ giọt tự động, tiết kiệm nước, phù hợp cho vườn rau gia đình hoặc trang trại quy mô nhỏ." : "Bộ dụng cụ làm vườn chất lượng cao, bao gồm xẻng, cuốc, kéo cắt và găng tay làm vườn.",
        price: 250000,
        imageUrl: PRODUCT_IMAGES[3],
        category: isHot ? "Tưới tiêu" : "Dụng cụ",
        rating: 4.7,
        ratingCount: 124,
        location: "TP.HCM",
        weatherSuitability: isHot ? "Thiết yếu cho mùa nắng" : "Sử dụng quanh năm",
        stockStatus: "Còn hàng"
      },
      {
        id: 5,
        name: isRainy ? "Vải địa kỹ thuật chống xói mòn" : (isHot ? "Lưới che nắng 70%" : "Màng phủ nông nghiệp đa năng"),
        description: isRainy ? "Vải địa kỹ thuật chống xói mòn, thoát nước tốt, bảo vệ đất khỏi rửa trôi trong mùa mưa." : (isHot ? "Lưới che nắng chất lượng cao, cản 70% ánh nắng, giúp cây trồng tránh cháy nắng." : "Màng phủ nông nghiệp đa năng, giữ ẩm, chống cỏ dại, tăng năng suất cây trồng."),
        price: 180000,
        imageUrl: PRODUCT_IMAGES[4],
        category: "Vật tư",
        rating: 4.2,
        ratingCount: 75,
        location: "Lâm Đồng",
        weatherSuitability: isRainy ? "Thiết yếu mùa mưa" : (isHot ? "Thiết yếu mùa nắng" : "Phù hợp quanh năm"),
        stockStatus: "Còn hàng"
      },
      {
        id: 6,
        name: isCold ? "Chế phẩm vi sinh ủ phân nhanh" : "Kích thích tăng trưởng hữu cơ sinh học",
        description: isCold ? "Chế phẩm vi sinh giúp ủ phân nhanh, cải tạo đất hiệu quả, bổ sung vi sinh vật có lợi cho đất." : "Chất kích thích tăng trưởng sinh học, tăng cường sức đề kháng, giúp cây chống chịu điều kiện bất lợi.",
        price: 95000,
        imageUrl: PRODUCT_IMAGES[5],
        category: "Chế phẩm sinh học",
        rating: 4.9,
        ratingCount: 92,
        location: "Hà Nội",
        weatherSuitability: "Sử dụng quanh năm",
        stockStatus: "Còn hàng"
      }
    ];
    
    return products;
  }
};

export default weatherService; 