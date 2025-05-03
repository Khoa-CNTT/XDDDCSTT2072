// getUserById
export const getUserById = async (axiosPrivate, id) => {
  try {
    const resposne = await axiosPrivate.get(`/users/${id}`);
    return resposne.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
