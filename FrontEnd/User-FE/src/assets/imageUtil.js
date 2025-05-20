/**
 * File tiện ích để xử lý hình ảnh và cung cấp các hình ảnh mặc định
 */

// Danh sách URL hình ảnh mặc định đến từ nguồn dữ liệu miễn phí để dùng khi ảnh gốc không tải được
export const placeholderImages = [
  "https://picsum.photos/seed/product1/300/300",
  "https://picsum.photos/seed/product2/300/300",
  "https://picsum.photos/seed/product3/300/300",
  "https://picsum.photos/seed/product4/300/300",
  "https://picsum.photos/seed/product5/300/300"
];

// Danh sách URL hình ảnh nông sản mặc định
export const agricultureImages = [
  "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=300",  // Rau
  "https://images.unsplash.com/photo-1577234286642-fc512a5f8f77?q=80&w=300",  // Trái cây
  "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=300",  // Gạo
  "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?q=80&w=300",  // Thực phẩm
  "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=300"      // Hoa
];

/**
 * Lấy hình ảnh mặc định dựa trên ID
 * @param {number|string} id - ID của sản phẩm hoặc đơn hàng
 * @param {boolean} useAgriculture - Sử dụng ảnh nông sản (true) hay ảnh ngẫu nhiên (false)
 * @returns {string} URL hình ảnh mặc định
 */
export const getDefaultImage = (id, useAgriculture = true) => {
  // Chuyển ID thành số
  const numId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) || 0 : (id || 0);
  
  // Chọn danh sách ảnh
  const imageList = useAgriculture ? agricultureImages : placeholderImages;
  
  // Lấy chỉ mục dựa trên ID
  const index = numId % imageList.length;
  
  return imageList[index];
};

/**
 * Kiểm tra và điều chỉnh URL ảnh dựa vào định dạng
 * @param {string} imageUrl - URL ảnh gốc cần kiểm tra
 * @param {object} options - Các tùy chọn
 * @returns {string} URL ảnh đã được điều chỉnh
 */
export const getAdjustedImageUrl = (imageUrl, options = {}) => {
  const { 
    baseApiUrl = 'http://localhost:8080', 
    fallbackId = null,
    useAgriculture = true 
  } = options;
  
  if (!imageUrl) {
    return fallbackId ? getDefaultImage(fallbackId, useAgriculture) : null;
  }
  
  // Nếu là URL đầy đủ, trả về nguyên bản
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Nếu là đường dẫn tương đối, thêm baseApiUrl
  return `${baseApiUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

/**
 * Xử lý lỗi tải ảnh và cung cấp các phương án thay thế
 * @param {Event} event - Sự kiện lỗi
 * @param {object} options - Các tùy chọn
 */
export const handleImageError = (event, options = {}) => {
  const { 
    id = 0, 
    imageUrl = '',
    useAgriculture = true,
    setErrorState = null,
    maxRetries = 3,
    apiBaseUrl = 'http://localhost:8080',
    apiImagePath = '/api/images'
  } = options;
  
  const e = event.target;
  const retriedCount = parseInt(e.dataset.retried || '0', 10);
  
  console.log(`Lỗi tải ảnh (lần ${retriedCount + 1}):`, imageUrl);
  
  if (retriedCount < maxRetries) {
    e.dataset.retried = (retriedCount + 1).toString();
    
    // Các phương án thay thế
    switch (retriedCount) {
      case 0:
        // Thử với baseURL khác nếu là đường dẫn tương đối
        if (!imageUrl.startsWith('http')) {
          e.src = `${apiBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        } else {
          // Thử với picsum nếu là URL đầy đủ
          e.src = `https://picsum.photos/seed/${id}/300/300`;
        }
        break;
        
      case 1:
        // Thử với API images path
        e.src = `${apiBaseUrl}${apiImagePath}/${id}`;
        break;
        
      default:
        // Sử dụng ảnh mặc định
        e.src = getDefaultImage(id, useAgriculture);
        break;
    }
  } else {
    // Đã hết số lần thử, gọi callback nếu có
    if (setErrorState && typeof setErrorState === 'function') {
      setErrorState(id);
    }
  }
}; 