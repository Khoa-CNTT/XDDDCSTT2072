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
