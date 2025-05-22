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
    console.log(`⚡ Đang lấy thông tin Flash Sale cho sản phẩm ID=${productId}`);
    
    // Gọi API để lấy thông tin flash sale cho sản phẩm
    const response = await axiosPrivate.get(`/flash-sales/product/${productId}`);
    
    console.log(`📦 Dữ liệu từ API Flash Sale:`, JSON.stringify(response.data));
    
    // Kiểm tra response trống
    if (!response.data) {
      console.log(`⚠️ API trả về dữ liệu trống`);
      return null;
    }
    
    // Trường hợp API trả về Object với items
    if (response.data && response.data.items && Array.isArray(response.data.items)) {
      console.log(`✅ Nhận được danh sách sản phẩm Flash Sale với ${response.data.items.length} sản phẩm`);
      
      // In chi tiết danh sách sản phẩm để debug
      response.data.items.forEach((item, index) => {
        console.log(`🔍 Sản phẩm #${index + 1}:`, {
          productId: item.productId,
          id: item.id,
          salePrice: item.salePrice,
          flashSalePrice: item.flashSalePrice
        });
      });
      
      // Tìm sản phẩm hiện tại trong danh sách
      const item = response.data.items.find(
        item => String(item.productId) === String(productId) || String(item.id) === String(productId)
      );
      
      if (item) {
        console.log(`✅ Tìm thấy sản phẩm trong Flash Sale:`, item);
        
        // Xây dựng đối tượng phản hồi
        const result = {
          flashSale: response.data,
          productId: productId,
          discountPercentage: response.data.discountPercentage || 0,
          active: response.data.active || response.data.status === "ACTIVE",
          type: "ITEM_LIST_RESPONSE"
        };
        
        // Nếu item có giá Flash Sale riêng
        if (item.salePrice !== undefined || item.flashSalePrice !== undefined) {
          result.salePrice = Number(item.salePrice || item.flashSalePrice);
        }
        
        console.log(`✅ Đã xử lý dữ liệu Flash Sale:`, result);
        return result;
      }
    }
    
    // Kiểm tra cấu trúc dữ liệu và chuyển đổi sang định dạng chuẩn
    // Trường hợp API trả về { code: 200, data: {...} }
    if (response.data && response.data.code === 200 && response.data.data) {
      console.log(`✅ Nhận dữ liệu Flash Sale dạng code/data`, response.data.data);
      
      // Trả về đối tượng với định dạng chuẩn của Flash Sale
      return {
        flashSale: response.data.data,
        productId: productId,
        discountPercentage: response.data.data.discountPercentage,
        active: response.data.data.active || response.data.data.status === "ACTIVE",
        type: "STANDARD_RESPONSE"
      };
    }
    
    // Trường hợp API trả về dữ liệu Flash Sale trực tiếp
    if (response.data && (response.data.active !== undefined || response.data.status === "ACTIVE")) {
      console.log(`✅ Nhận dữ liệu Flash Sale trực tiếp`, response.data);
      
      return {
        flashSale: response.data,
        productId: productId,
        discountPercentage: response.data.discountPercentage || 0,
        active: response.data.active || response.data.status === "ACTIVE",
        type: "DIRECT_RESPONSE"
      };
    }
    
    // Trường hợp không có Flash Sale hoặc không nhận diện được format
    console.log(`ℹ️ Không thể xử lý định dạng dữ liệu Flash Sale cho sản phẩm ID=${productId}`);
    console.log(`ℹ️ Dữ liệu thô:`, JSON.stringify(response.data));
    
    // Trả về dữ liệu gốc để debug
    return {
      rawData: response.data,
      productId: productId,
      type: "UNKNOWN_FORMAT" 
    };
    
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin Flash Sale:", error);
    if (error.response) {
      console.error("❌ Mã lỗi:", error.response.status);
      console.error("❌ Dữ liệu lỗi:", error.response.data);
    }
    return null;
  }
};
