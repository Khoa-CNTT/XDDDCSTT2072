/**
 * Service để gọi API quản lý danh sách yêu thích
 */

// Lấy tất cả danh sách yêu thích của người dùng hiện tại
export const getUserWishlists = async (axiosPrivate) => {
  try {
    const response = await axiosPrivate.get('/wishlists');
    const wishlists = response.data;

    if (Array.isArray(wishlists) && wishlists.length > 0) {
      const wishlistsWithItems = await Promise.all(
        wishlists.map(async (wishlist) => {
          try {
            const detailResponse = await axiosPrivate.get(`/wishlists/${wishlist.id}`);
            return detailResponse.data;
          } catch (error) {
            console.error(`Lỗi khi lấy chi tiết wishlist ID ${wishlist.id}:`, error);
            return wishlist;
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
    const payload = {
      name: wishlistData.name,
    };

    if (wishlistData.isDefault !== undefined) {
      payload.isDefault = wishlistData.isDefault;
    }

    const response = await axiosPrivate.post('/wishlists', payload);
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
export const moveItemBetweenWishlists = async (
  axiosPrivate,
  sourceWishlistId,
  targetWishlistId,
  itemId
) => {
  try {
    const response = await axiosPrivate.post(
      `/wishlists/${sourceWishlistId}/items/${itemId}/move/${targetWishlistId}`
    );
    return response.data;
  } catch (error) {
    console.error('Lỗi khi di chuyển sản phẩm giữa danh sách yêu thích:', error);
    throw error;
  }
};

// Thêm sản phẩm vào danh sách yêu thích mặc định
export const addToDefaultWishlist = async (axiosPrivate, productData) => {
  try {
    const wishlists = await getUserWishlists(axiosPrivate);
    let defaultWishlist = wishlists.find(wishlist => wishlist.isDefault === true);

    if (!defaultWishlist) {
      defaultWishlist = await createDefaultWishlist(axiosPrivate);
    }

    return await addItemToWishlist(axiosPrivate, defaultWishlist.id, productData);
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm vào danh sách yêu thích mặc định:', error);
    throw error;
  }
};

// Hàm lấy danh sách yêu thích của người dùng
export const getWishlist = async (axiosPrivate, userId) => {
  try {
    const response = await axiosPrivate.get(`/wishlists/user/${userId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể tải danh sách yêu thích',
    };
  }
};

// Hàm thêm sản phẩm vào danh sách yêu thích
export const addToWishlist = async (axiosPrivate, productId) => {
  try {
    const response = await axiosPrivate.post('/wishlists/add', {
      productId: productId,
    });
    return {
      success: true,
      data: response.data,
      message: 'Đã thêm vào danh sách yêu thích',
    };
  } catch (error) {
    console.error('Lỗi khi thêm vào danh sách yêu thích:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể thêm vào danh sách yêu thích',
    };
  }
};
