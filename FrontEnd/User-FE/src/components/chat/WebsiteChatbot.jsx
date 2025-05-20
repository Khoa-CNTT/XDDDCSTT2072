import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SendIcon,
  XIcon,
  RotateCwIcon,
  HomeIcon,
  ShoppingCart,
  User,
  CloudIcon,
  ArrowRight,
  Newspaper,
  PenTool,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";

const WebsiteChatbot = () => {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messageContainerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { auth } = useAuth();

  // Initialize session
  useEffect(() => {
    const savedSessionId = localStorage.getItem("website_chatbot_session_id");
    if (savedSessionId) {
      // Load chat history if needed
      const savedHistory = localStorage.getItem("website_chatbot_history");
      if (savedHistory) {
        try {
          setChatHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to parse chat history:", e);
        }
      }
    } else {
      const newSessionId = uuidv4();
      localStorage.setItem("website_chatbot_session_id", newSessionId);
    }

    // Add welcome message
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Xin chào! Tôi là trợ lý hỗ trợ tìm kiếm và điều hướng trang web AgroSphere. Tôi có thể giúp bạn tìm thông tin về sản phẩm, hướng dẫn canh tác, tin tức nông nghiệp, hoặc điều hướng đến các phần khác nhau của trang web. Bạn cần hỗ trợ gì?",
          timestamp: new Date().toISOString(),
          suggestions: [
            { text: "Tìm sản phẩm", icon: <ShoppingCart size={16} /> },
            { text: "Tin tức nông nghiệp", icon: <Newspaper size={16} /> },
            { text: "Dự báo thời tiết", icon: <CloudIcon size={16} /> },
            { text: "Trang cá nhân", icon: <User size={16} /> },
          ],
        },
      ]);
    }
  }, [messages.length]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messageContainerRef.current && isOpen) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpenChat = () => {
    setIsOpen(true);
  };

  const updateChatHistory = (newMessages) => {
    const updatedHistory = [...chatHistory, ...newMessages];
    setChatHistory(updatedHistory);
    localStorage.setItem(
      "website_chatbot_history",
      JSON.stringify(updatedHistory.slice(-50))
    );
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() && !e?.suggestionText) return;

    const userMessage = {
      role: "user",
      content: e?.suggestionText || message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      // Process the message to determine intent
      const userQuery = e?.suggestionText || message;
      const response = await processUserQuery(userQuery);

      setMessages((prev) => [...prev, response]);
      updateChatHistory([userMessage, response]);
    } catch (error) {
      console.error("Error processing message:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    handleSendMessage({ suggestionText });
  };

  const navigateTo = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const processUserQuery = async (query) => {
    // This is where you'd normally call the backend API
    // For now, we'll simulate responses based on simple keyword matching

    const lowerQuery = query.toLowerCase();

    // Product search
    if (
      lowerQuery.includes("sản phẩm") ||
      lowerQuery.includes("mua") ||
      lowerQuery.includes("hàng") ||
      lowerQuery.includes("tìm")
    ) {
      let productType = "";

      if (lowerQuery.includes("phân bón")) productType = "phân bón";
      else if (lowerQuery.includes("hạt giống")) productType = "hạt giống";
      else if (lowerQuery.includes("thuốc"))
        productType = "thuốc bảo vệ thực vật";
      else if (lowerQuery.includes("công cụ") || lowerQuery.includes("dụng cụ"))
        productType = "công cụ nông nghiệp";

      if (productType) {
        return {
          role: "assistant",
          content: `Tôi có thể giúp bạn tìm sản phẩm ${productType}. Bạn có thể xem các sản phẩm tại trang FarmHub của chúng tôi.`,
          timestamp: new Date().toISOString(),
          links: [
            {
              text: `Xem sản phẩm ${productType}`,
              url: `/farmhub2?search=${encodeURIComponent(productType)}`,
            },
          ],
        };
      } else {
        return {
          role: "assistant",
          content:
            "Bạn có thể tìm tất cả các sản phẩm nông nghiệp tại FarmHub, bao gồm phân bón, thuốc bảo vệ thực vật, hạt giống và nhiều loại khác.",
          timestamp: new Date().toISOString(),
          links: [{ text: "Đi đến FarmHub", url: "/farmhub2" }],
          suggestions: [
            { text: "Tìm phân bón", icon: <PenTool size={16} /> },
            { text: "Tìm hạt giống", icon: <PenTool size={16} /> },
            { text: "Tìm thuốc BVTV", icon: <PenTool size={16} /> },
          ],
        };
      }
    }

    // Weather
    if (lowerQuery.includes("thời tiết") || lowerQuery.includes("dự báo")) {
      return {
        role: "assistant",
        content:
          "Bạn có thể xem dự báo thời tiết chi tiết theo khu vực tại trang Thời tiết của chúng tôi.",
        timestamp: new Date().toISOString(),
        links: [{ text: "Xem dự báo thời tiết", url: "/weather" }],
      };
    }

    // News
    if (
      lowerQuery.includes("tin tức") ||
      lowerQuery.includes("tin") ||
      lowerQuery.includes("bài viết") ||
      lowerQuery.includes("báo")
    ) {
      return {
        role: "assistant",
        content:
          "Chúng tôi cập nhật tin tức nông nghiệp thường xuyên. Bạn có thể xem các tin tức mới nhất tại trang Tin tức.",
        timestamp: new Date().toISOString(),
        links: [{ text: "Đọc tin tức nông nghiệp", url: "/news" }],
      };
    }

    // Account
    if (
      lowerQuery.includes("tài khoản") ||
      lowerQuery.includes("đăng nhập") ||
      lowerQuery.includes("đăng ký") ||
      lowerQuery.includes("cá nhân")
    ) {
      if (!auth?.accessToken) {
        return {
          role: "assistant",
          content:
            "Bạn chưa đăng nhập. Vui lòng đăng nhập hoặc đăng ký tài khoản để truy cập đầy đủ tính năng của trang web.",
          timestamp: new Date().toISOString(),
          links: [
            { text: "Đăng nhập", url: "/account/login" },
            { text: "Đăng ký", url: "/account/register" },
          ],
        };
      } else {
        return {
          role: "assistant",
          content:
            "Bạn đã đăng nhập. Bạn có thể truy cập trang cá nhân để xem thông tin tài khoản, lịch sử đơn hàng và các cài đặt khác.",
          timestamp: new Date().toISOString(),
          links: [
            { text: "Trang cá nhân", url: `/profile/${auth?.user?.id}` },
            { text: "Lịch sử đơn hàng", url: "/order-history" },
          ],
        };
      }
    }

    // AI Chat
    if (
      lowerQuery.includes("chat") ||
      lowerQuery.includes("ai") ||
      lowerQuery.includes("trí tuệ") ||
      lowerQuery.includes("hỏi đáp nông nghiệp")
    ) {
      return {
        role: "assistant",
        content:
          "Chúng tôi có dịch vụ trợ lý AI chuyên sâu về nông nghiệp có thể trả lời chi tiết các câu hỏi chuyên môn về kỹ thuật trồng trọt, chăn nuôi.",
        timestamp: new Date().toISOString(),
        links: [{ text: "Trò chuyện với AI nông nghiệp", url: "/chat-ai" }],
      };
    }

    // General help
    return {
      role: "assistant",
      content:
        "Tôi có thể giúp bạn tìm kiếm thông tin và điều hướng đến các phần khác nhau của trang web. Bạn có thể hỏi về sản phẩm, thời tiết, tin tức hoặc tài khoản.",
      timestamp: new Date().toISOString(),
      links: [
        { text: "Trang chủ", url: "/home" },
        { text: "FarmHub", url: "/farmhub2" },
        { text: "Thời tiết", url: "/weather" },
        { text: "Tin tức", url: "/news" },
      ],
    };
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } catch {
      return "";
    }
  };

  const renderMessages = () => {
    return messages.map((msg, index) => (
      <motion.div
        key={index}
        className={`mb-4 ${
          msg.role === "user" ? "flex justify-end" : "flex justify-start"
        }`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
      >
        {msg.role === "assistant" && (
          <motion.div
            className="h-9 w-9 mr-2 mt-1 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-emerald-100 shadow-sm"
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring" }}
          >
            <svg
              viewBox="0 0 64 64"
              width="30"
              height="30"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="32" cy="32" r="30" fill="#ffffff" />
              <rect
                x="14"
                y="16"
                width="36"
                height="25"
                rx="8"
                fill="#10b981"
              />
              <circle cx="22" cy="26" r="5" fill="#ffcc00" />
              <circle cx="42" cy="26" r="5" fill="#ffcc00" />
              <path
                d="M26 36 Q32 40 38 36"
                stroke="#ffffff"
                strokeWidth="2"
                fill="none"
              />
              <rect x="26" y="41" width="12" height="5" rx="2" fill="#10b981" />
              <rect x="28" y="46" width="8" height="6" rx="2" fill="#10b981" />
              <path
                d="M18 52 Q16 44 10 44 Q5 44 5 36 Q5 32 8 30"
                stroke="#ff4444"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M46 52 Q48 44 54 44 Q59 44 59 36 Q59 32 56 30"
                stroke="#ff4444"
                strokeWidth="3"
                fill="none"
              />
              <rect x="28" y="10" width="8" height="6" rx="2" fill="#662d91" />
              <circle cx="32" cy="5" r="2" fill="#662d91" />
            </svg>
          </motion.div>
        )}

        <div className="flex flex-col max-w-[80%]">
          <div
            className={`rounded-2xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md"
                : msg.isError
                ? "bg-red-50 text-red-800 border border-red-200 shadow-sm"
                : "bg-white text-gray-800 border border-emerald-100 shadow-sm"
            }`}
          >
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </div>
            <div className="text-xs opacity-70 mt-1 text-right">
              {formatTime(msg.timestamp)}
            </div>
          </div>

          {msg.links && msg.links.length > 0 && (
            <motion.div
              className="mt-2 flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {msg.links.map((link, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  className="bg-white text-emerald-600 hover:bg-emerald-50 border-emerald-200 shadow-sm flex items-center gap-1 text-xs rounded-full px-3 transition-all duration-300 hover:shadow-md"
                  onClick={() => navigateTo(link.url)}
                >
                  {link.text}
                  <ArrowRight size={12} />
                </Button>
              ))}
            </motion.div>
          )}

          {msg.suggestions && msg.suggestions.length > 0 && (
            <motion.div
              className="mt-2 flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {msg.suggestions.map((suggestion, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  className="bg-white text-emerald-600 hover:bg-emerald-50 border-emerald-200 shadow-sm flex items-center gap-1 text-xs rounded-full px-3 transition-all duration-300 hover:shadow-md"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  {suggestion.icon}
                  {suggestion.text}
                </Button>
              ))}
            </motion.div>
          )}
        </div>

        {msg.role === "user" && (
          <Avatar className="h-9 w-9 ml-2 mt-1 border-2 border-emerald-100 shadow-sm">
            <AvatarImage
              src={auth?.user?.imageUrl || "/placeholder-avatar.png"}
              alt={auth?.user?.userName || "User"}
            />
            <AvatarFallback className="bg-emerald-100 text-emerald-800">
              {auth?.user?.userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        )}
      </motion.div>
    ));
  };

  return (
    <>
      {/* Chat button */}
      <motion.button
        onClick={handleOpenChat}
        className="fixed bottom-5 right-5 bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-50 overflow-hidden border-4 border-white"
        whileHover={{
          scale: 1.08,
          boxShadow: "0 8px 25px rgba(16, 185, 129, 0.35)",
        }}
        whileTap={{ scale: 0.92 }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <svg
          viewBox="0 0 64 64"
          width="38"
          height="38"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="32" cy="32" r="30" fill="#ffffff" />
          <rect x="14" y="16" width="36" height="25" rx="8" fill="#10b981" />
          <circle cx="22" cy="26" r="5" fill="#ffcc00" />
          <circle cx="42" cy="26" r="5" fill="#ffcc00" />
          <path
            d="M26 36 Q32 40 38 36"
            stroke="#ffffff"
            strokeWidth="2"
            fill="none"
          />
          <rect x="26" y="41" width="12" height="5" rx="2" fill="#10b981" />
          <rect x="28" y="46" width="8" height="6" rx="2" fill="#10b981" />
          <path
            d="M18 52 Q16 44 10 44 Q5 44 5 36 Q5 32 8 30"
            stroke="#ff4444"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M46 52 Q48 44 54 44 Q59 44 59 36 Q59 32 56 30"
            stroke="#ff4444"
            strokeWidth="3"
            fill="none"
          />
          <rect x="28" y="10" width="8" height="6" rx="2" fill="#662d91" />
          <circle cx="32" cy="5" r="2" fill="#662d91" />
        </svg>
      </motion.button>

      {/* Chat dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg h-[600px] flex flex-col p-0 gap-0 rounded-xl shadow-2xl border-0">
          <DialogHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="h-12 w-12 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-md border-2 border-emerald-100"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg
                    viewBox="0 0 64 64"
                    width="40"
                    height="40"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="32" cy="32" r="30" fill="#ffffff" />
                    <rect
                      x="14"
                      y="16"
                      width="36"
                      height="25"
                      rx="8"
                      fill="#10b981"
                    />
                    <circle cx="22" cy="26" r="5" fill="#ffcc00" />
                    <circle cx="42" cy="26" r="5" fill="#ffcc00" />
                    <path
                      d="M26 36 Q32 40 38 36"
                      stroke="#ffffff"
                      strokeWidth="2"
                      fill="none"
                    />
                    <rect
                      x="26"
                      y="41"
                      width="12"
                      height="5"
                      rx="2"
                      fill="#10b981"
                    />
                    <rect
                      x="28"
                      y="46"
                      width="8"
                      height="6"
                      rx="2"
                      fill="#10b981"
                    />
                    <path
                      d="M18 52 Q16 44 10 44 Q5 44 5 36 Q5 32 8 30"
                      stroke="#ff4444"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      d="M46 52 Q48 44 54 44 Q59 44 59 36 Q59 32 56 30"
                      stroke="#ff4444"
                      strokeWidth="3"
                      fill="none"
                    />
                    <rect
                      x="28"
                      y="10"
                      width="8"
                      height="6"
                      rx="2"
                      fill="#662d91"
                    />
                    <circle cx="32" cy="5" r="2" fill="#662d91" />
                  </svg>
                </motion.div>
                <div>
                  <DialogTitle className="text-white text-xl font-bold">
                    Trợ lý AgroSphere
                  </DialogTitle>
                  <p className="text-emerald-100 text-xs">
                    Hỗ trợ tìm kiếm & điều hướng
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full text-white hover:bg-white/20 hover:text-white"
              >
                <XIcon size={18} />
              </Button>
            </div>
          </DialogHeader>

          {/* Message area */}
          <div
            ref={messageContainerRef}
            className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-emerald-50 via-white to-teal-50"
          >
            {renderMessages()}

            {loading && (
              <div className="flex justify-center items-center py-4">
                <motion.div className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-emerald-50 shadow-sm border border-emerald-100">
                  <div className="animate-bounce rounded-full h-2 w-2 bg-emerald-500 delay-100"></div>
                  <div className="animate-bounce rounded-full h-2 w-2 bg-emerald-500 delay-300"></div>
                  <div className="animate-bounce rounded-full h-2 w-2 bg-emerald-500 delay-500"></div>
                </motion.div>
              </div>
            )}
          </div>

          {/* Input area */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-emerald-100 bg-white rounded-b-xl"
          >
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hỏi điều gì đó hoặc tìm kiếm..."
                className="min-h-[60px] resize-none flex-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={loading || !message.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white self-end h-12 w-12 rounded-full p-0 shadow-md transition-all duration-300"
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                }}
                whileTap={{ scale: 0.9 }}
              >
                {loading ? (
                  <RotateCwIcon size={18} className="animate-spin" />
                ) : (
                  <SendIcon size={18} />
                )}
              </Button>
            </div>
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Nhấn Enter để gửi
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-emerald-600 hover:bg-emerald-50 border-emerald-200 rounded-full px-3"
                  onClick={() => navigateTo("/")}
                >
                  <HomeIcon size={14} className="mr-1" />
                  Trang chủ
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WebsiteChatbot;
