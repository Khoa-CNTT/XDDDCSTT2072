// getAllProducts
export const getAllProducts = async (axiosPrivate) => {
  const response = await axiosPrivate.get("/marketplace/products");
  return response;
};

// createProducts
export const createProduct = (
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
  return axiosPrivate.post(`/marketplace/create`, {
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
export const getProductsByCategory = (axiosPrivate, categoryId) => {
  return axiosPrivate.get(`/marketplace/category/${categoryId}`);
};

// serachProduct
export const searctProducts = (axiosPrivate, keyword) => {
  return axiosPrivate.get(`/marketplace/search`, {
    params: {
      keyword: keyword,
    },
  });
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
