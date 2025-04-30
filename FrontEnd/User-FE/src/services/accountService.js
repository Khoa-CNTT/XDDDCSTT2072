import axiosInstance from "./api/axios";

// forgot-password
export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post(`/auth/forgot-password`, null, {
      params: {
        email: email,
      },
    });
    console.log(response);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// reset - password
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axiosInstance.post(`auth/reset-password`, {
      token: token,
      newPassword: newPassword,
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
