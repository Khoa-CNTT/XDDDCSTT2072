/**
 * Service để gọi API quản lý danh sách yêu thích
 */

// Lấy tất cả danh sách yêu thích của người dùng hiện tại
export const getUserWishlists = async (axiosPrivate) => {
  try {
    const response = await axiosPrivate.get('/wishlists');
    const wishlists = response.data;
    
    // Nếu có dữ liệu và là mảng, lấy chi tiết cho mỗi wishlist
    if (Array.isArray(wishlists) && wishlists.length > 0) {
      const wishlistsWithItems = await Promise.all(
        wishlists.map(async (wishlist) => {
          try {
            // Lấy chi tiết từng wishlist
            const detailResponse = await axiosPrivate.get(`/wishlists/${wishlist.id}`);
            return detailResponse.data;
          } catch (error) {
            console.error(`Lỗi khi lấy chi tiết wishlist ID ${wishlist.id}:`, error);
            return wishlist; // Trả về wishlist gốc nếu có lỗi
          }
        })
      );
      return wishlistsWithItems;
    }
    
    return wishlists;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách yêu thích:', error);
    throw error;
  }
};

// Lấy chi tiết một danh sách yêu thích cụ thể
export const getWishlistById = async (axiosPrivate, wishlistId) => {
  try {
    const response = await axiosPrivate.get(`/wishlists/${wishlistId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết danh sách yêu thích ID ${wishlistId}:`, error);
    throw error;
  }
};

// Tạo danh sách yêu thích mới
export const createWishlist = async (axiosPrivate, wishlistData) => {
  try {
    const response = await axiosPrivate.post('/wishlists', wishlistData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo danh sách yêu thích:', error);
    throw error;
  }
};

// Cập nhật danh sách yêu thích
export const updateWishlist = async (axiosPrivate, wishlistId, wishlistData) => {
  try {
    const response = await axiosPrivate.put(`/wishlists/${wishlistId}`, wishlistData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật danh sách yêu thích ID ${wishlistId}:`, error);
    throw error;
  }
};

// Xóa danh sách yêu thích
export const deleteWishlist = async (axiosPrivate, wishlistId) => {
  try {
    const response = await axiosPrivate.delete(`/wishlists/${wishlistId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa danh sách yêu thích ID ${wishlistId}:`, error);
    throw error;
  }
};

// Tạo danh sách yêu thích mặc định nếu chưa có
export const createDefaultWishlist = async (axiosPrivate) => {
  try {
    const response = await axiosPrivate.post('/wishlists/default');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo danh sách yêu thích mặc định:', error);
    throw error;
  }
};

// Thêm sản phẩm vào danh sách yêu thích
export const addItemToWishlist = async (axiosPrivate, wishlistId, itemData) => {
  try {
    const response = await axiosPrivate.post(`/wishlists/${wishlistId}/items`, itemData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi thêm sản phẩm vào danh sách yêu thích ID ${wishlistId}:`, error);
    throw error;
  }
};

// Xóa sản phẩm khỏi danh sách yêu thích
export const removeItemFromWishlist = async (axiosPrivate, wishlistId, itemId) => {
  try {
    const response = await axiosPrivate.delete(`/wishlists/${wishlistId}/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa sản phẩm ID ${itemId} khỏi danh sách yêu thích ID ${wishlistId}:`, error);
    throw error;
  }
};

// Di chuyển sản phẩm giữa các danh sách yêu thích
export const moveItemBetweenWishlists = async (axiosPrivate, sourceWishlistId, targetWishlistId, itemId) => {
  try {
    const response = await axiosPrivate.post(
      `/wishlists/${sourceWishlistId}/items/${itemId}/move/${targetWishlistId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi di chuyển sản phẩm giữa danh sách yêu thích:`, error);
    throw error;
  }
};

// Thêm sản phẩm vào danh sách yêu thích mặc định
export const addToDefaultWishlist = async (axiosPrivate, productData) => {
  try {
    // Lấy danh sách yêu thích hiện có
    const wishlists = await getUserWishlists(axiosPrivate);
    
    // Tìm danh sách yêu thích mặc định
    let defaultWishlist = wishlists.find(wishlist => wishlist.isDefault === true);
    
    // Nếu không có danh sách mặc định, tạo mới
    if (!defaultWishlist) {
      defaultWishlist = await createDefaultWishlist(axiosPrivate);
    }
    
    // Thêm sản phẩm vào danh sách mặc định
    return await addItemToWishlist(axiosPrivate, defaultWishlist.id, productData);
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm vào danh sách yêu thích mặc định:', error);
    throw error;
  }
}; 