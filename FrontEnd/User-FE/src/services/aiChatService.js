// aiChatService.js
// Service để giao tiếp với AI Chatbot API

/**
 * Gửi tin nhắn đến chatbot
 * @param {object} axiosPrivate - Axios instance đã cấu hình
 * @param {string} message - Nội dung tin nhắn
 * @param {string} userId - ID của người dùng
 * @param {string} sessionId - ID của phiên chat
 * @param {Array} context - Danh sách các tin nhắn trước đó
 * @returns {Promise} - Promise chứa kết quả từ API, bao gồm cả danh sách sản phẩm liên quan (nếu có)
 */
export const sendChatMessage = async (axiosPrivate, message, userId, sessionId, context = []) => {
  try {
    console.log("Đang gửi tin nhắn đến AI Chatbot:", message);
    
    const response = await axiosPrivate.post("/ai/chatbot", {
      message,
      userId,
      sessionId,
      context,
      domain: "agricultural" // Mặc định là lĩnh vực nông nghiệp
    });
    
    // API sẽ trả về dữ liệu bao gồm message, source, success và products (nếu có)
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn đến AI Chatbot:", error);
    
    if (error.response) {
      // Server trả về lỗi với status code
      console.error("Server trả về lỗi:", error.response.status, error.response.data);
      throw new Error(error.response.data.error || "Không thể kết nối đến AI Chatbot");
    } else if (error.request) {
      // Không nhận được phản hồi từ server
      console.error("Không nhận được phản hồi từ server:", error.request);
      throw new Error("Không thể kết nối đến máy chủ, vui lòng thử lại sau");
    } else {
      // Lỗi khác
      throw error;
    }
  }
};

/**
 * Lấy lịch sử tin nhắn của phiên chat
 * @param {object} axiosPrivate - Axios instance đã cấu hình
 * @param {string} userId - ID của người dùng
 * @param {string} sessionId - ID của phiên chat
 * @param {number} limit - Số lượng tin nhắn tối đa muốn lấy
 * @returns {Promise} - Promise chứa lịch sử tin nhắn
 */
export const getChatHistory = async (axiosPrivate, userId, sessionId, limit = 50) => {
  try {
    console.log("Đang lấy lịch sử chat:", sessionId);
    
    const response = await axiosPrivate.post("/ai/message-history", {
      userId,
      sessionId,
      limit
    });
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử chat:", error);
    
    if (error.response) {
      console.error("Server trả về lỗi:", error.response.status, error.response.data);
      return { messages: [], success: false, error: error.response.data.error || "Không thể lấy lịch sử chat" };
    } else {
      console.error("Lỗi kết nối:", error.message);
      return { messages: [], success: false, error: "Không thể kết nối đến máy chủ" };
    }
  }
};

/**
 * Lấy danh sách các phiên chat của người dùng
 * @param {object} axiosPrivate - Axios instance đã cấu hình
 * @param {string} userId - ID của người dùng
 * @returns {Promise} - Promise chứa danh sách phiên chat
 */
export const getChatSessions = async (axiosPrivate, userId) => {
  try {
    console.log("Đang lấy danh sách phiên chat cho người dùng:", userId);
    
    const response = await axiosPrivate.get(`/ai/sessions?userId=${userId}`);
    
    return {
      sessions: response.data || [],
      success: true
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phiên chat:", error);
    
    if (error.response) {
      console.error("Server trả về lỗi:", error.response.status, error.response.data);
      return { 
        sessions: [], 
        success: false, 
        error: error.response.data.error || "Không thể lấy danh sách phiên chat" 
      };
    } else {
      console.error("Lỗi kết nối:", error.message);
      return { 
        sessions: [], 
        success: false, 
        error: "Không thể kết nối đến máy chủ" 
      };
    }
  }
}; 