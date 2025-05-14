/**
 * API services cho người dùng
 */

// Lấy danh sách người dùng
export const getAllUsers = async (axiosPrivate) => {
  try {
    const response = await axiosPrivate.get('/users');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    throw error;
  }
};

// Lấy chi tiết người dùng
export const getUserById = async (axiosPrivate, userId) => {
  try {
    if (!userId) {
      console.error("getUserById: userId không hợp lệ:", userId);
      return { 
        success: false, 
        message: "ID người dùng không hợp lệ", 
        data: null 
      };
    }
    
    console.log(`Đang gọi API lấy thông tin người dùng ID ${userId}`);
    const response = await axiosPrivate.get(`/users/${userId}`);
    console.log("Dữ liệu trả về từ API:", response.data);
    
    // Kiểm tra cấu trúc dữ liệu trả về
    if (response.data && response.data.success === true && response.data.data) {
      return response.data;
    } else if (response.data && response.data.id) {
      // Trường hợp API trả về trực tiếp đối tượng user mà không có wrapper
      return {
        success: true,
        message: "Lấy thông tin người dùng thành công",
        data: response.data
      };
    } else {
      // Nếu không có dữ liệu hoặc sai định dạng, ném lỗi
      console.error("Dữ liệu API không đúng định dạng:", response.data);
      throw new Error("Dữ liệu người dùng không hợp lệ");
    }
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin người dùng ID ${userId}:`, error);
    
    // Trả về đối tượng lỗi để component xử lý hiển thị thông báo lỗi
    return { 
      success: false, 
      message: error.response?.data?.message || "Không tìm thấy người dùng", 
      data: null 
    };
  }
};

// Tìm kiếm người dùng theo tên
export const searchUsersByName = async (axiosPrivate, name) => {
  try {
    const response = await axiosPrivate.get('/users/findByName', {
      params: { name }
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi tìm kiếm người dùng với tên "${name}":`, error);
    throw error;
  }
};

// Lấy danh sách gợi ý kết nối (dựa trên vai trò, lĩnh vực quan tâm)
export const getSuggestedConnections = async (axiosPrivate, limit = 5) => {
  try {
    // Gọi API lấy tất cả người dùng (trong thực tế cần API riêng cho gợi ý)
    const response = await axiosPrivate.get('/users', {
      params: { limit }
    });
    
    // Nếu API trả về cấu trúc dạng { data: [...] }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Lỗi khi lấy gợi ý kết nối:', error);
    return [];
  }
};

// Các chức năng kết nối người dùng

// Gửi yêu cầu kết nối đến người dùng
export const sendConnectionRequest = async (axiosPrivate, targetUserId) => {
  try {
    const response = await axiosPrivate.post(`/connections/request/${targetUserId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi gửi yêu cầu kết nối đến người dùng ID ${targetUserId}:`, error);
    throw error;
  }
};

// Chấp nhận yêu cầu kết nối
export const acceptConnectionRequest = async (axiosPrivate, requesterId) => {
  try {
    const response = await axiosPrivate.put(`/connections/accept/${requesterId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi chấp nhận yêu cầu kết nối từ người dùng ID ${requesterId}:`, error);
    throw error;
  }
};

// Từ chối yêu cầu kết nối
export const rejectConnectionRequest = async (axiosPrivate, requesterId) => {
  try {
    const response = await axiosPrivate.put(`/connections/reject/${requesterId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi từ chối yêu cầu kết nối từ người dùng ID ${requesterId}:`, error);
    throw error;
  }
};

// Xóa kết nối với người dùng
export const removeConnection = async (axiosPrivate, connectedUserId) => {
  try {
    const response = await axiosPrivate.delete(`/connections/${connectedUserId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa kết nối với người dùng ID ${connectedUserId}:`, error);
    throw error;
  }
};

// Chặn người dùng
export const blockUser = async (axiosPrivate, targetUserId) => {
  try {
    const response = await axiosPrivate.post(`/connections/block/${targetUserId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi chặn người dùng ID ${targetUserId}:`, error);
    throw error;
  }
};

// Bỏ chặn người dùng
export const unblockUser = async (axiosPrivate, targetUserId) => {
  try {
    const response = await axiosPrivate.delete(`/connections/unblock/${targetUserId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi bỏ chặn người dùng ID ${targetUserId}:`, error);
    throw error;
  }
};

// Lấy danh sách kết nối của người dùng hiện tại
export const getUserConnections = async (axiosPrivate, userId = null, page = 0, size = 20) => {
  try {
    // URL endpoint tùy thuộc vào việc có truyền userId hay không
    const url = userId ? `/users/${userId}/connections` : '/connections';
    
    // Gọi API từ UserConnectionController để lấy danh sách người đã kết nối
    const response = await axiosPrivate.get(url, {
      params: { 
        page, 
        size, 
        onlyConnected: true,
        status: 'ACCEPTED'
      }
    });
    
    console.log('Response từ API connections:', response.data);
    
    if (response.data && response.data.data && response.data.data.content) {
      // Trường hợp API trả về dạng Page<> từ Spring Boot
      return response.data.data.content;
    } else if (response.data && response.data.data) {
      // Trường hợp API trả về list bọc trong data
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      // Trường hợp API trả về array trực tiếp
      return response.data;
    } else {
      console.warn('API trả về cấu trúc dữ liệu không xác định:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách kết nối:', error);
    return [];
  }
};

// Lấy danh sách yêu cầu kết nối đang chờ
export const getPendingConnectionRequests = async (axiosPrivate) => {
  try {
    const response = await axiosPrivate.get('/connections/pending');
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách yêu cầu kết nối đang chờ:', error);
    throw error;
  }
};

// Kiểm tra trạng thái kết nối với người dùng khác
export const checkConnectionStatus = async (axiosPrivate, targetUserId) => {
  try {
    const response = await axiosPrivate.get(`/connections/check/${targetUserId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi kiểm tra trạng thái kết nối với người dùng ID ${targetUserId}:`, error);
    // Trả về trạng thái mặc định khi có lỗi
    return {
      status: "NONE",
      isConnected: false,
      isPendingSent: false,
      isPendingReceived: false,
      isBlocked: false
    };
  }
};

// Đếm số lượng kết nối của người dùng
export const countUserConnections = async (axiosPrivate) => {
  try {
    const response = await axiosPrivate.get('/connections/count');
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi đếm số lượng kết nối:', error);
    return 0;
  }
};

// Lấy ID của tất cả người dùng đã kết nối
export const getConnectedUserIds = async (axiosPrivate) => {
  try {
    const response = await axiosPrivate.get('/connections/connected-ids');
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi lấy ID của tất cả người dùng đã kết nối:', error);
    return [];
  }
};

// Tìm kiếm người dùng với bộ lọc nâng cao
export const searchUsers = async (axiosPrivate, params) => {
  try {
    const { keyword, role, location, specialty, page = 0, size = 10 } = params;
    
    // Xây dựng query params
    const queryParams = new URLSearchParams();
    if (keyword) queryParams.append('keyword', keyword);
    if (role) queryParams.append('role', role);
    if (location) queryParams.append('location', location);
    if (specialty) queryParams.append('specialty', specialty);
    queryParams.append('page', page);
    queryParams.append('size', size);
    
    const response = await axiosPrivate.get(`/users/search?${queryParams.toString()}`);
    
    return {
      content: response.data.data || [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
      page: response.data.page || 0,
      size: response.data.size || 10
    };
  } catch (error) {
    console.error('Lỗi khi tìm kiếm người dùng:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10
    };
  }
};

// Thêm hàm updateUserProfile để gọi API từ UserController
export const updateUserProfile = async (axios, userId, userData) => {
  try {
    // Chỉ gửi các trường mà entity User có hỗ trợ
    const updateData = {
      userName: userData.userName || "",
      phone: userData.phone || "",
      email: userData.email || "",
      keepExistingPassword: true // Luôn gửi keepExistingPassword=true để giữ mật khẩu cũ
    };

    // Chỉ gửi password nếu người dùng thực sự thay đổi mật khẩu
    if (userData.password && userData.password !== "********" && userData.password.length >= 6) {
      updateData.password = userData.password;
      updateData.keepExistingPassword = false; // Nếu có mật khẩu mới thì không giữ mật khẩu cũ
    }

    console.log('Dữ liệu cập nhật hồ sơ (chỉ gửi các trường hợp lệ):', {
      ...updateData,
      password: updateData.password ? '******' : undefined // Ẩn mật khẩu trong log
    });
    
    const response = await axios.put(`/users/${userId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    throw error;
  }
};

// Thêm hàm uploadProfileImage để upload ảnh đại diện
export const uploadProfileImage = async (axios, userId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await axios.post(`/users/${userId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi upload ảnh đại diện:', error);
    throw error;
  }
};

// Đổi mật khẩu
export const changePassword = async (axios, userId, passwordData) => {
  try {
    // Sửa endpoint thành /auth/change-password thay vì /users/{userId}/change-password
    const response = await axios.post(`/auth/change-password`, {
      userId: userId,
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    throw error;
  }
};

// Xác thực email khi thay đổi
export const requestEmailVerification = async (axios, userId, newEmail) => {
  try {
    const response = await axios.post(`/users/${userId}/request-email-verification`, { newEmail });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gửi yêu cầu xác thực email:', error);
    throw error;
  }
};

// Xác nhận mã xác thực email
export const verifyEmailChange = async (axios, userId, verificationCode) => {
  try {
    const response = await axios.post(`/users/${userId}/verify-email-change`, { verificationCode });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xác thực mã:', error);
    throw error;
  }
};

// Cắt ảnh đại diện (gửi lên phiên bản đã cắt)
export const uploadCroppedProfileImage = async (axios, userId, croppedImageBlob) => {
  try {
    const formData = new FormData();
    formData.append('image', croppedImageBlob);
    
    const response = await axios.post(`/users/${userId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi upload ảnh đại diện đã cắt:', error);
    throw error;
  }
};

// Xóa tài khoản người dùng
export const deleteUserAccount = async (axios, userId, confirmationData) => {
  try {
    const response = await axios.post(`/users/${userId}/deactivate`, confirmationData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa tài khoản:', error);
    throw error;
  }
};
