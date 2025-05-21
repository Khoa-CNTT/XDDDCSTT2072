import api from './api';

// Dữ liệu mẫu để sử dụng khi API thật chưa có dữ liệu
const sampleNews = [
  {
    id: 1,
    title: "Hướng dẫn kỹ thuật trồng lúa mùa mưa",
    summary: "Bài viết chia sẻ các kỹ thuật trồng lúa hiệu quả trong mùa mưa tại Việt Nam",
    content: "<p>Nội dung chi tiết về kỹ thuật trồng lúa...</p>",
    imageUrl: "https://example.com/images/rice-farming.jpg",
    publishedDate: "2024-06-01T09:30:00",
    category: "Kỹ thuật trồng trọt",
    sourceName: "Nông nghiệp Việt Nam",
    active: true
  },
  {
    id: 2,
    title: "Giá phân bón tăng mạnh, nông dân gặp khó khăn",
    summary: "Giá phân bón tăng 30% so với cùng kỳ năm trước gây áp lực lớn cho nông dân",
    content: "<p>Chi tiết về tình hình giá phân bón...</p>",
    imageUrl: "https://example.com/images/fertilizer.jpg",
    publishedDate: "2024-06-02T15:45:00",
    category: "Thị trường",
    sourceName: "Báo Nông nghiệp",
    active: true
  },
  {
    id: 3,
    title: "Xu hướng nông nghiệp sạch đang phát triển mạnh",
    summary: "Người tiêu dùng ngày càng quan tâm đến sản phẩm nông nghiệp sạch và hữu cơ",
    content: "<p>Chi tiết về xu hướng nông nghiệp sạch...</p>",
    imageUrl: "https://example.com/images/organic-farming.jpg",
    publishedDate: "2024-06-03T11:20:00",
    category: "Xu hướng",
    sourceName: "Nông nghiệp Xanh",
    active: true
  },
  {
    id: 4,
    title: "Cách phòng trừ sâu bệnh trên cây ăn quả",
    summary: "Hướng dẫn các biện pháp phòng và trị sâu bệnh hiệu quả cho cây ăn quả",
    content: "<p>Nội dung chi tiết về phòng trừ sâu bệnh...</p>",
    imageUrl: "https://example.com/images/pest-control.jpg",
    publishedDate: "2024-06-04T14:15:00",
    category: "Bảo vệ thực vật",
    sourceName: "Khoa học Nông nghiệp",
    active: false
  },
  {
    id: 5,
    title: "Dự báo thời tiết nông vụ tháng 6/2024",
    summary: "Thông tin dự báo thời tiết và tác động đến canh tác nông nghiệp trong tháng 6",
    content: "<p>Chi tiết dự báo thời tiết nông vụ...</p>",
    imageUrl: "https://example.com/images/weather-forecast.jpg",
    publishedDate: "2024-06-05T08:45:00",
    category: "Dự báo thời tiết",
    sourceName: "Trung tâm Khí tượng",
    active: true
  }
];

// News Service
export const fetchAllNews = async (page = 0, size = 10, sortBy = 'publishedDate', sortDir = 'desc') => {
  try {
    const response = await api.get(`/news?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    return response;
  } catch (error) {
    console.log("Sử dụng dữ liệu mẫu do API lỗi:", error);
    // Trả về dữ liệu mẫu khi API lỗi
    return {
      data: {
        content: sampleNews,
        totalElements: sampleNews.length,
        totalPages: 1,
        size: size,
        number: page
      }
    };
  }
};

export const fetchNewsByCategory = async (category, page = 0, size = 10, sortBy = 'publishedDate', sortDir = 'desc') => {
  try {
    const response = await api.get(`/news/category/${category}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    return response;
  } catch (error) {
    console.log("Sử dụng dữ liệu mẫu cho category:", error);
    // Lọc dữ liệu mẫu theo category
    const filteredNews = sampleNews.filter(news => news.category === category);
    return {
      data: {
        content: filteredNews,
        totalElements: filteredNews.length,
        totalPages: 1,
        size: size,
        number: page
      }
    };
  }
};

export const fetchNewsById = async (id) => {
  try {
    const response = await api.get(`/news/${id}`);
    return response;
  } catch (error) {
    console.log("Sử dụng dữ liệu mẫu cho news ID:", error);
    const newsItem = sampleNews.find(news => news.id === id);
    return {
      data: newsItem || {}
    };
  }
};

export const fetchLatestNews = async () => {
  return api.get('/news/latest');
};

export const searchNews = async (keyword, page = 0, size = 10) => {
  try {
    const response = await api.get(`/news/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
    return response;
  } catch (error) {
    console.log("Sử dụng dữ liệu mẫu cho search:", error);
    // Tìm kiếm trong dữ liệu mẫu
    const filteredNews = sampleNews.filter(news => 
      news.title.toLowerCase().includes(keyword.toLowerCase()) || 
      news.summary.toLowerCase().includes(keyword.toLowerCase())
    );
    return {
      data: {
        content: filteredNews,
        totalElements: filteredNews.length,
        totalPages: 1,
        size: size,
        number: page
      }
    };
  }
};

export const createNews = async (newsData) => {
  return api.post('/news', newsData);
};

export const updateNews = async (id, newsData) => {
  return api.put(`/news/${id}`, newsData);
};

export const deleteNews = async (id) => {
  return api.delete(`/news/${id}`);
};

export const fetchNewsFromSources = async () => {
  return api.post('/news/fetch');
};

export const fetchNewsFromSource = async (sourceId) => {
  return api.post(`/news/fetch/${sourceId}`);
};

// News Source Service
export const fetchAllNewsSources = async () => {
  return api.get('/news-sources');
};

export const fetchActiveNewsSources = async () => {
  return api.get('/news-sources/active');
};

export const fetchNewsSourcesByCategory = async (category) => {
  return api.get(`/news-sources/category/${category}`);
};

export const fetchNewsSourceById = async (id) => {
  return api.get(`/news-sources/${id}`);
};

export const createNewsSource = async (sourceData) => {
  return api.post('/news-sources', sourceData);
};

export const updateNewsSource = async (id, sourceData) => {
  return api.put(`/news-sources/${id}`, sourceData);
};

export const deleteNewsSource = async (id) => {
  return api.delete(`/news-sources/${id}`);
};

export const activateNewsSource = async (id) => {
  return api.put(`/news-sources/${id}/activate`);
};

export const deactivateNewsSource = async (id) => {
  return api.put(`/news-sources/${id}/deactivate`);
}; 