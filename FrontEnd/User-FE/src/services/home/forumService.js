/* eslint-disable no-useless-catch */
// createPost
export const createPostWithImages = async (axiostPrivate, formData) => {
  try {
    const response = await axiostPrivate.post(
      "/api/posts/with-images",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// getPosts
export const getPosts = async (axiosPrivate, page) => {
  try {
    const response = await axiosPrivate.get(`/posts?page=${page}&size=10`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// getUserByPostID
export const getUserById = async (axiosPrivate, userId) => {
  try {
    const response = await axiosPrivate.get(`/users/${userId}`);
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error
  }
};


