// cartCreate
export const createCart = async (axiosPrivate, productId, quantity) => {
  try {
    const reponse = await axiosPrivate.post(`/cart/items`, null, {
      params: {
        productId,
        quantity,
      },
    });
    return reponse;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// getCart
export const getCart = async (axiosPrivate) => {
  try {
    const response = await axiosPrivate.get("/cart");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// deleteCartItems
export const deleteCartItems = async (axiosPrivate, itemId) => {
  try {
    const response = await axiosPrivate.delete(`/cart/items/${itemId}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// updateCartItem
export const updateCartItem = async (axiosPrivate, itemId, quantity) => {
  try {
    const response = await axiosPrivate.put(`/cart/items/${itemId}`, null, {
      params: {
        quantity,
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
