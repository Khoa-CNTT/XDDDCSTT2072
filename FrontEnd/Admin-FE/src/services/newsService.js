import api from './api';

// News Service
export const fetchAllNews = async (page = 0, size = 10, sortBy = 'publishedDate', sortDir = 'desc') => {
  return api.get(`/news?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
};

export const fetchNewsByCategory = async (category, page = 0, size = 10, sortBy = 'publishedDate', sortDir = 'desc') => {
  return api.get(`/news/category/${category}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
};

export const fetchNewsById = async (id) => {
  return api.get(`/news/${id}`);
};

export const fetchLatestNews = async () => {
  return api.get('/news/latest');
};

export const searchNews = async (keyword, page = 0, size = 10) => {
  return api.get(`/news/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
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