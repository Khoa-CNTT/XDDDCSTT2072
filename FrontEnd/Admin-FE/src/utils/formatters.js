/**
 * Định dạng số tiền sang dạng tiền tệ Việt Nam
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi đã định dạng
 */
export const formatCurrency = (amount) => {
  if (amount == null) return '';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
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
 * Định dạng ngày sang dạng dd/MM/yyyy
 * @param {string|Date} date - Ngày cần định dạng
 * @returns {string} Chuỗi đã định dạng
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Định dạng số lượng (thêm dấu phẩy ngăn cách hàng nghìn)
 * @param {number} value - Số cần định dạng
 * @returns {string} Chuỗi đã định dạng
 */
export const formatNumber = (value) => {
  if (value == null) return '';
  
  return new Intl.NumberFormat('vi-VN').format(value);
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
 * Hàm rút gọn văn bản
 * @param {string} text - Văn bản cần rút gọn
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} - Văn bản đã rút gọn
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

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