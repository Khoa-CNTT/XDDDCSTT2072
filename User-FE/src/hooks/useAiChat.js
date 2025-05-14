import { useState, useEffect, useCallback } from "react";
import { sendChatMessage, getChatHistory, getChatSessions } from "@/services/aiChatService";
import useAxiosPrivate from "./useAxiosPrivate";
import useAuth from "./useAuth";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

/**
 * Hook quản lý trạng thái chat AI
 * @returns {Object} - Các hàm và trạng thái của chat
 */
const useAiChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  
  // Khởi tạo session ID khi component được mount
  useEffect(() => {
    // Kiểm tra xem có session ID trong localStorage hay không
    const savedSessionId = localStorage.getItem("ai_chat_session_id");
    if (savedSessionId) {
      setSessionId(savedSessionId);
      // Tải lịch sử chat nếu có session ID
      fetchChatHistory(savedSessionId);
    } else {
      // Tạo session ID mới nếu chưa có
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      localStorage.setItem("ai_chat_session_id", newSessionId);
    }
    
    // Tải danh sách phiên chat nếu đã đăng nhập
    if (auth?.user?.id) {
      fetchChatSessions();
    }
  }, [auth?.user?.id]);

  // Hàm lấy lịch sử chat
  const fetchChatHistory = useCallback(async (sid) => {
    if (!sid || !auth?.user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const chatHistory = await getChatHistory(axiosPrivate, auth.user.id, sid);
      
      if (chatHistory.success && Array.isArray(chatHistory.messages)) {
        // Định dạng lại tin nhắn từ dạng Map thành đối tượng message
        const formattedMessages = chatHistory.messages.map(msg => ({
          role: msg.role || "assistant",
          content: msg.content || "",
          timestamp: msg.timestamp || new Date().toISOString()
        }));
        
        setMessages(formattedMessages);
      } else {
        console.warn("Không thể lấy lịch sử chat hoặc lịch sử trống");
      }
    } catch (err) {
      console.error("Lỗi khi lấy lịch sử chat:", err);
      setError("Không thể tải lịch sử chat");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, auth]);

  // Hàm lấy danh sách phiên chat của người dùng
  const fetchChatSessions = useCallback(async () => {
    if (!auth?.user?.id) return;
    
    setLoadingSessions(true);
    
    try {
      const response = await getChatSessions(axiosPrivate, auth.user.id);
      
      if (response.success && Array.isArray(response.sessions)) {
        setSessions(response.sessions);
      } else {
        console.warn("Không thể lấy danh sách phiên chat:", response.error);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phiên chat:", err);
    } finally {
      setLoadingSessions(false);
    }
  }, [axiosPrivate, auth]);

  // Hàm chọn phiên chat
  const selectChatSession = useCallback((sid) => {
    if (!sid) return;
    
    setSessionId(sid);
    localStorage.setItem("ai_chat_session_id", sid);
    fetchChatHistory(sid);
  }, [fetchChatHistory]);

  // Hàm gửi tin nhắn
  const sendMessage = useCallback(async (message) => {
    if (!message || !sessionId) return;
    
    // Thêm tin nhắn của người dùng vào danh sách
    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    
    try {
      // Tạo context từ tin nhắn trước đó
      const context = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Gửi tin nhắn đến API
      const response = await sendChatMessage(
        axiosPrivate,
        message,
        auth?.user?.id || "guest",
        sessionId,
        context
      );
      
      if (response && response.success) {
        // Thêm phản hồi từ AI vào danh sách tin nhắn
        const aiMessage = {
          role: "assistant",
          content: response.message || "Xin lỗi, tôi không thể trả lời ngay bây giờ.",
          timestamp: new Date().toISOString(),
          source: response.source
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Làm mới danh sách phiên chat sau khi chat
        fetchChatSessions();
      } else {
        // Hiển thị lỗi từ API
        const errorMessage = response?.error || "Không thể kết nối đến AI Chatbot";
        toast.error(errorMessage);
        setError(errorMessage);
        
        // Thêm thông báo lỗi vào danh sách tin nhắn
        const aiErrorMessage = {
          role: "assistant",
          content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
          isError: true,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiErrorMessage]);
      }
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
      
      // Hiển thị thông báo lỗi
      toast.error("Không thể gửi tin nhắn: " + (err.message || "Lỗi không xác định"));
      setError(err.message || "Lỗi không xác định");
      
      // Thêm thông báo lỗi vào danh sách tin nhắn
      const aiErrorMessage = {
        role: "assistant",
        content: "Xin lỗi, tôi không thể trả lời ngay bây giờ. Vui lòng thử lại sau.",
        isError: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, auth, messages, sessionId, fetchChatSessions]);

  // Hàm xóa lịch sử chat
  const clearChatHistory = useCallback(() => {
    // Xóa tin nhắn trong state
    setMessages([]);
    
    // Tạo một session ID mới
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    localStorage.setItem("ai_chat_session_id", newSessionId);
    
    // Thêm tin nhắn chào mừng
    const welcomeMessage = {
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý AI về nông nghiệp. Bạn cần hỏi điều gì về nông nghiệp?",
      timestamp: new Date().toISOString()
    };
    
    setMessages([welcomeMessage]);
    
    // Làm mới danh sách phiên chat
    fetchChatSessions();
  }, [fetchChatSessions]);

  return {
    messages,
    loading,
    error,
    sessionId,
    sessions,
    loadingSessions,
    sendMessage,
    clearChatHistory,
    fetchChatSessions,
    selectChatSession
  };
};

export default useAiChat; 