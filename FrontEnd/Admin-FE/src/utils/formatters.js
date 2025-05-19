/**
 * Định dạng số tiền sang dạng tiền tệ Việt Nam
 * @param {number} amount - Số tiền cần định dạng
 * @param {string} currency - The currency code (default: VND)
 * @returns {string} Chuỗi đã định dạng
 */
export const formatCurrency = (amount, currency = "VND") => {
  if (amount === undefined || amount === null) return "N/A";
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Định dạng ngày giờ sang dạng dd/MM/yyyy HH:mm
 * @param {string|Date} dateTime - Ngày giờ cần định dạng
 * @returns {string} Chuỗi đã định dạng
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) {
    console.warn("formatDateTime nhận giá trị trống:", dateTime);
    return 'N/A';
  }
  
  try {
    // Xử lý dateTime dạng ISO string từ backend (2025-05-06T08:11:24)
    // hoặc dạng Date object từ frontend
    const date = new Date(dateTime);
    
    if (isNaN(date.getTime())) {
      console.warn("formatDateTime không thể parse ngày tháng:", dateTime);
      return 'N/A';
    }
    
    // Định dạng dd/MM/yyyy HH:mm
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Lỗi khi định dạng ngày giờ:", dateTime, error);
    return 'N/A';
  }
};

/**
 * Format a date string to the user's locale
 * @param {string|Date} dateString - The date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "N/A";
  
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return "N/A";
  
  // Default options
  const defaultOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  
  return new Intl.DateTimeFormat("vi-VN", { ...defaultOptions, ...options }).format(date);
};

/**
 * Format date with custom fallback for invalid dates
 * @param {string} dateString - The date string to format
 * @param {string} fallback - The fallback string to return if date is invalid
 * @returns {string} Formatted date string or fallback
 */
export const formatDateWithFallback = (dateString, fallback = "N/A") => {
  if (!dateString) return fallback;
  
  // Try to create a date object
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return fallback;
  }

  try {
    // Format the date
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return fallback;
  }
};

/**
 * Định dạng số lượng (thêm dấu phẩy ngăn cách hàng nghìn)
 * @param {number} value - Số cần định dạng
 * @returns {string} Chuỗi đã định dạng
 */
export const formatNumber = (value) => {
  if (value === undefined || value === null) return "N/A";
  
  return new Intl.NumberFormat("vi-VN").format(value);
};

/**
 * Hàm định dạng kích thước file
 * @param {number} bytes - Kích thước file tính bằng byte
 * @returns {string} - Chuỗi đã định dạng (ví dụ: 1.2 MB)
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - The original price
 * @param {number} salePrice - The sale price
 * @returns {number} The discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || originalPrice <= 0) return 0;
  
  const discount = ((originalPrice - salePrice) / originalPrice) * 100;
  return Math.round(discount);
};

/**
 * Hàm định dạng phần trăm
 * @param {number} number - Số cần định dạng
 * @param {number} decimalPlaces - Số chữ số thập phân
 * @returns {string} - Chuỗi đã định dạng (ví dụ: 12,34%)
 */
export const formatPercent = (number, decimalPlaces = 0) => {
  if (number === null || number === undefined) return '0%';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(number / 100); // Chia cho 100 vì đầu vào đã là phần trăm
};

/**
 * Truncate a string to a maximum length and add ellipsis
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated string
 */
export const truncateString = (str, maxLength = 100) => {
  if (!str) return "";
  
  if (str.length <= maxLength) return str;
  
  return str.slice(0, maxLength) + "...";
};

/**
 * Alias of truncateString for backward compatibility
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = truncateString;

/**
 * Hàm chuyển đổi chuỗi thành slug
 * @param {string} text - Chuỗi cần chuyển đổi
 * @returns {string} - Slug đã chuyển đổi
 */
export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD') // tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '') // loại bỏ dấu
    .replace(/[đĐ]/g, 'd') // đổi đ thành d
    .replace(/[^a-z0-9\s-]/g, '') // loại bỏ ký tự đặc biệt
    .replace(/[\s-]+/g, '-') // thay khoảng trắng và nhiều dấu gạch thành một dấu gạch
    .replace(/^-+|-+$/g, ''); // cắt dấu gạch ở đầu và cuối
}; 