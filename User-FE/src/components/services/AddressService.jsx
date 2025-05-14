

// Lấy danh sách địa chỉ của người dùng
export const getAddresses = async (axiosPrivate) => {
    try {
      const response = await axiosPrivate.get('/user-addresses');
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  };
  
  // Tạo địa chỉ mới
  export const createAddress = async (axiosPrivate, addressData) => {
    try {
      const response = await axiosPrivate.post('/user-addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  };
  
  // Cập nhật địa chỉ
  export const updateAddress = async (axiosPrivate, id, addressData) => {
    try {
      const response = await axiosPrivate.put(`/user-addresses/${id}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  };
  
  // Xóa địa chỉ
  export const deleteAddress = async (axiosPrivate, id) => {
    try {
      const response = await axiosPrivate.delete(`/user-addresses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  };
  
  // Đặt địa chỉ làm mặc định
  export const setDefaultAddress = async (axiosPrivate, id) => {
    try {
      const response = await axiosPrivate.put(`/user-addresses/${id}/default`);
      return response.data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  };