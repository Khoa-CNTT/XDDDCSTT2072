// getAllProducts
export const getAllProducts = async (axiosPrivate) => {
  const response = await axiosPrivate.get("/marketplace/products");
  return response;
};

// createProducts
export const createProduct = async (
  axiosPrivate,
  productName,
  description,
  quantity,
  price,
  salePrice,
  saleStartDate,
  saleEndDate,
  categoryId,
  image,
  weight
) => {
  return await axiosPrivate.post(`/marketplace/create`, {
    productName,
    description,
    quantity,
    price,
    salePrice,
    saleStartDate,
    saleEndDate,
    categoryId,
    image,
    weight,
  });
};

// getProductByCategory
export const getProductsByCategory = async (axiosPrivate, categoryId) => {
  try {
    const response = await axiosPrivate.get(
      `/marketplace/category/${categoryId}`
    );
    return response.data.content;
  } catch (error) {
    console.log(error);
  }
};

// serachProduct
export const searchProducts = async (axiosPrivate, keyword) => {
  try {
    const response = await axiosPrivate.get(`/marketplace/search`, {
      params: {
        keyword: keyword,
      },
    });
    return response.data.content;
  } catch (error) {
    console.log(error);
  }
};

// getAllCategory
export const getAllCategories = async (axiosPrivate) => {
  const response = await axiosPrivate.get(`/product-categories`);
  return response;
};

// getCategoryById
export const getCategoryById = async (axiosPrivate, id) => {
  const response = await axiosPrivate.get(`/product-categories/${id}`);
  return response;
};

// getProductById
export const getProductById = async (axiosPrivate, id) => {
  try {
    const response = await axiosPrivate.get(`/marketplace/product/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Lấy tất cả ảnh của sản phẩm
export const getProductImages = async (axiosPrivate, productId) => {
  try {
    const response = await axiosPrivate.get(`/product-images/product/${productId}`);
    return response.data;
  } catch (error) {
    console.log("Lỗi khi lấy ảnh sản phẩm:", error);
    throw error;
  }
};

// Lấy ảnh chính của sản phẩm
export const getPrimaryProductImage = async (axiosPrivate, productId) => {
  try {
    const response = await axiosPrivate.get(`/product-images/product/${productId}/primary`);
    return response.data;
  } catch (error) {
    console.log("Lỗi khi lấy ảnh chính của sản phẩm:", error);
    throw error;
  }
};

// Lấy thông tin flash sale đang hoạt động
export const getActiveFlashSales = async (axiosPrivate) => {
  try {
    const response = await axiosPrivate.get('/flash-sales/active');
    return response.data;
  } catch (error) {
    console.log("Lỗi khi lấy flash sale đang hoạt động:", error);
    throw error;
  }
};

// Kiểm tra sản phẩm có nằm trong flash sale không
export const checkProductInFlashSale = async (axiosPrivate, productId) => {
  try {
    const response = await axiosPrivate.get(`/flash-sales/check-product/${productId}`);
    return response.data;
  } catch (error) {
    console.log("Lỗi khi kiểm tra sản phẩm trong flash sale:", error);
    throw error;
  }
};

// Lấy thông tin flash sale cho sản phẩm cụ thể
export const getFlashSaleForProduct = async (axiosPrivate, productId) => {
  try {
    const response = await axiosPrivate.get(`/flash-sales/product/${productId}`);
    return response.data;
  } catch (error) {
    console.log("Lỗi khi lấy flash sale cho sản phẩm:", error);
    throw error;
  }
};
