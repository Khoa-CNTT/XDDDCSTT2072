import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import useAiChat from "@/hooks/useAiChat";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  BotIcon,
  SendIcon,
  RotateCwIcon,
  HistoryIcon,
  ClockIcon,
  MenuIcon,
  PlusIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Variants cho animation
const chatContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
  hover: {
    scale: 1.01,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 },
  },
};

const productCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    scale: 1.05,
    rotateY: 5,
    boxShadow: "0 10px 25px rgba(16, 185, 129, 0.2)",
    transition: { duration: 0.3 },
  },
};

// Hiệu ứng cho tooltip
const tooltipVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
};

// Hiệu ứng cho các suggestion boxes
const suggestionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.5,
    },
  }),
  hover: {
    scale: 1.03,
    backgroundColor: "#f0fdf4",
    boxShadow: "0 4px 20px rgba(16, 185, 129, 0.1)",
    transition: { duration: 0.2 },
  },
};

function ChatAI() {
  const [message, setMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messageContainerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { auth } = useAuth();

  const {
    messages,
    loading,
    error,
    sessionId,
    sessions,
    loadingSessions,
    sendMessage,
    clearChatHistory,
    fetchChatSessions,
    selectChatSession,
  } = useAiChat();

  // Kiểm tra kích thước màn hình để xác định thiết bị di động
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!auth?.accessToken) {
      toast.info("Vui lòng đăng nhập để sử dụng AgroSphere AI");
      navigate("/account/login", { state: { from: { pathname: "/chat-ai" } } });
    } else {
      fetchChatSessions();
    }
  }, [auth, navigate, fetchChatSessions]);

  // Cuộn xuống cuối cùng khi có tin nhắn mới
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus vào input khi trang được tải
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Xử lý gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage(message);
    setMessage("");
  };

  // Format thời gian
  const formatTime = (timestamp) => {
    try {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return format(date, "HH:mm", { locale: vi });
    } catch {
      return "";
    }
  };

  // Format ngày tháng
  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "";
    }
  };

  // Xử lý khi chọn một phiên chat từ lịch sử
  const handleSelectSession = (sessionId) => {
    selectChatSession(sessionId);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  // Xử lý khi chọn một gợi ý
  const handleSelectSuggestion = (text) => {
    setMessage(text);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Hiển thị các tin nhắn
  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <motion.div
          className="flex flex-col items-center justify-center h-full py-10 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8 max-w-2xl">
            <motion.div
              className="inline-block bg-gradient-to-r from-emerald-100 to-teal-100 p-4 rounded-full mb-6"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3,
              }}
            >
              <BotIcon size={48} className="text-emerald-500" />
            </motion.div>
            <motion.h3
              className="text-2xl font-medium text-emerald-900 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              AgroSphere AI
            </motion.h3>
            <motion.p
              className="text-center text-gray-600 mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Chào mừng bạn đến với AgroSphere AI. Hãy đặt câu hỏi về nông
              nghiệp, kỹ thuật canh tác, hoặc bất kỳ vấn đề gì liên quan đến
              nông nghiệp.
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full"
            variants={chatContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="bg-emerald-50 hover:bg-emerald-100 p-4 rounded-lg border border-emerald-200 cursor-pointer transition-colors"
              variants={suggestionVariants}
              custom={0}
              whileHover="hover"
              onClick={() =>
                handleSelectSuggestion("Kỹ thuật trồng lúa hiệu quả?")
              }
            >
              <h4 className="font-medium text-emerald-800 mb-1">
                🌱 Kỹ thuật trồng trọt
              </h4>
              <p className="text-sm text-emerald-600">
                Hướng dẫn về cách trồng và chăm sóc cây trồng
              </p>
            </motion.div>
            <motion.div
              className="bg-emerald-50 hover:bg-emerald-100 p-4 rounded-lg border border-emerald-200 cursor-pointer transition-colors"
              variants={suggestionVariants}
              custom={1}
              whileHover="hover"
              onClick={() =>
                handleSelectSuggestion("Cách chăn nuôi bò sữa hiệu quả?")
              }
            >
              <h4 className="font-medium text-emerald-800 mb-1">
                🐄 Chăn nuôi
              </h4>
              <p className="text-sm text-emerald-600">
                Thông tin về chăn nuôi và phòng bệnh cho vật nuôi
              </p>
            </motion.div>
            <motion.div
              className="bg-emerald-50 hover:bg-emerald-100 p-4 rounded-lg border border-emerald-200 cursor-pointer transition-colors"
              variants={suggestionVariants}
              custom={2}
              whileHover="hover"
              onClick={() =>
                handleSelectSuggestion("Ảnh hưởng của thời tiết đến vụ mùa?")
              }
            >
              <h4 className="font-medium text-emerald-800 mb-1">
                ⛅ Thời tiết và mùa vụ
              </h4>
              <p className="text-sm text-emerald-600">
                Hướng dẫn về thời vụ và ảnh hưởng của thời tiết
              </p>
            </motion.div>
            <motion.div
              className="bg-emerald-50 hover:bg-emerald-100 p-4 rounded-lg border border-emerald-200 cursor-pointer transition-colors"
              variants={suggestionVariants}
              custom={3}
              whileHover="hover"
              onClick={() =>
                handleSelectSuggestion("Tôi cần mua thuốc trừ sâu cho cây lúa")
              }
            >
              <h4 className="font-medium text-emerald-800 mb-1">
                🦠 Phòng trừ sâu bệnh
              </h4>
              <p className="text-sm text-emerald-600">
                Cách nhận biết và đối phó với sâu bệnh hại
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="w-full max-w-4xl mx-auto"
        variants={chatContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`py-6 px-4 ${
                index < messages.length - 1 ? "border-b border-emerald-200" : ""
              }`}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              layout
            >
              <div className="flex items-start max-w-3xl mx-auto">
                {msg.role === "user" ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Avatar className="h-10 w-10 mr-4 mt-1 flex-shrink-0 border-2 border-emerald-100 p-0.5">
                      <AvatarImage
                        src={auth?.user?.imageUrl || "/placeholder-avatar.png"}
                        alt={auth?.user?.userName || "User"}
                        className="rounded-full"
                      />
                      <AvatarFallback className="bg-emerald-100 text-emerald-800">
                        {auth?.user?.userName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Avatar className="h-10 w-10 mr-4 mt-1 flex-shrink-0 border-2 border-teal-100 p-0.5">
                      <AvatarImage
                        src="/agrosphere-ai-avatar.svg"
                        alt="AgroSphere AI"
                        className="rounded-full"
                      />
                      <AvatarFallback className="bg-teal-100 text-teal-800">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center">
                    <span
                      className={`font-medium ${
                        msg.role === "assistant"
                          ? "text-emerald-700"
                          : "text-teal-700"
                      }`}
                    >
                      {msg.role === "assistant"
                        ? "AgroSphere AI"
                        : auth?.user?.userName || "Bạn"}
                    </span>
                    <span className="text-xs text-emerald-400 ml-2">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  <motion.div
                    className={`prose prose-sm max-w-none ${
                      msg.role === "assistant"
                        ? "text-gray-800"
                        : "text-gray-700"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <motion.div
                      className={`whitespace-pre-wrap rounded-lg p-4 shadow-sm border ${
                        msg.role === "assistant"
                          ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                          : "bg-gradient-to-r from-teal-50 to-green-50 border-teal-200"
                      }`}
                      style={{
                        perspective: "1000px",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {msg.content}
                    </motion.div>
                  </motion.div>

                  {msg.source && (
                    <motion.div
                      className="mt-2 text-xs text-emerald-600 italic"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="font-semibold">Nguồn:</span> {msg.source}
                    </motion.div>
                  )}

                  {/* Hiển thị sản phẩm liên quan nếu có */}
                  {msg.role === "assistant" &&
                    msg.products &&
                    msg.products.length > 0 && (
                      <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <h4 className="text-sm font-semibold text-emerald-700 mb-2">
                          Sản phẩm liên quan:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {msg.products.map((product) => (
                            <motion.div
                              key={product.id}
                              className="border border-emerald-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-white"
                              onClick={() =>
                                navigate(`/farmhub2/product/${product.id}`)
                              }
                              variants={productCardVariants}
                              whileHover="hover"
                              style={{
                                perspective: "1000px",
                                transformStyle: "preserve-3d",
                              }}
                            >
                              <motion.div className="w-full h-32 bg-emerald-50 rounded-md mb-2 overflow-hidden">
                                <motion.img
                                  src={
                                    product.imageUrl ||
                                    "/placeholder-product.png"
                                  }
                                  alt={product.productName}
                                  className="w-full h-full object-cover"
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ duration: 0.5 }}
                                />
                              </motion.div>
                              <h5 className="font-medium text-sm text-emerald-800 line-clamp-2 mb-1">
                                {product.productName}
                              </h5>
                              <div className="flex items-center">
                                <span className="text-emerald-600 font-medium">
                                  {product.salePrice ? (
                                    <>
                                      {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      }).format(product.salePrice)}
                                      <span className="text-xs text-gray-500 line-through ml-1">
                                        {new Intl.NumberFormat("vi-VN", {
                                          style: "currency",
                                          currency: "VND",
                                        }).format(product.price)}
                                      </span>
                                    </>
                                  ) : (
                                    new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(product.price)
                                  )}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-b from-emerald-50 to-teal-50">
      <Header />
      <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-emerald-800 text-white flex flex-col h-full">
            <div className="p-4 flex justify-between items-center border-b border-emerald-700">
              <h2 className="font-semibold text-lg">Lịch sử trò chuyện</h2>
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onHoverStart={() => setShowTooltip(true)}
                  onHoverEnd={() => setShowTooltip(false)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChatHistory}
                    className="text-emerald-300 hover:text-white hover:bg-emerald-700 p-1 h-8 w-8 rounded-full relative"
                    title="Cuộc trò chuyện mới"
                  >
                    <PlusIcon size={16} />
                    <AnimatePresence>
                      {showTooltip && (
                        <motion.div
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-emerald-700 text-white text-xs rounded whitespace-nowrap"
                          variants={tooltipVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          Tạo cuộc trò chuyện mới
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </div>
            </div>

            <div className="overflow-auto flex-1 px-2 py-3">
              {loadingSessions ? (
                <div className="flex justify-center items-center py-8">
                  <motion.div
                    className="rounded-full h-6 w-6 border-b-2 border-emerald-300"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  ></motion.div>
                </div>
              ) : sessions.length === 0 ? (
                <motion.div
                  className="text-center py-6 px-4 text-emerald-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-2">
                    <HistoryIcon className="inline-block h-10 w-10 opacity-50 mb-2" />
                  </div>
                  <p>Không có lịch sử trò chuyện</p>
                  <p className="text-xs mt-2">
                    Trò chuyện mới sẽ xuất hiện ở đây
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {sessions.map((session, index) => (
                      <motion.div
                        key={session.sessionId}
                        className={`px-3 py-3 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors ${
                          session.sessionId === sessionId
                            ? "bg-emerald-700 border-l-4 border-emerald-400"
                            : ""
                        }`}
                        onClick={() => handleSelectSession(session.sessionId)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center">
                          <HistoryIcon
                            size={14}
                            className="text-emerald-300 mr-2 flex-shrink-0"
                          />
                          <span className="text-sm truncate font-medium">
                            {session.title || "Cuộc trò chuyện mới"}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-300 mt-1 pl-6 flex items-center">
                          <ClockIcon size={12} className="mr-1" />
                          {formatDate(session.createdAt)}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col h-full relative bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100">
          {/* Mobile menu button */}
          <motion.div
            className="md:hidden absolute top-4 left-4 z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="bg-emerald-100 border shadow-sm rounded-full p-2 h-10 w-10"
            >
              <MenuIcon size={20} className="text-emerald-600" />
            </Button>
          </motion.div>

          {/* Messages container */}
          <div
            ref={messageContainerRef}
            className="flex-1 overflow-y-auto py-4 px-2"
            style={{ height: "calc(100% - 84px)" }}
          >
            {renderMessages()}

            {loading && (
              <motion.div
                className="flex justify-center items-center py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="rounded-full h-8 w-8 border-b-2 border-emerald-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
              </motion.div>
            )}

            {error && !loading && (
              <motion.div
                className="max-w-3xl mx-auto px-6 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input container */}
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-4 shadow-md w-full h-[84px]">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSendMessage}>
                <div className="relative">
                  <Textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hỏi về nông nghiệp, kỹ thuật trồng trọt, chăn nuôi..."
                    className="min-h-[60px] pr-16 py-3 px-4 resize-none border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm bg-white"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading || !message.trim()}
                      className="absolute right-2 bottom-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-10 w-10 rounded-lg p-0 flex items-center justify-center shadow-sm transition-colors"
                    >
                      {loading ? (
                        <RotateCwIcon size={18} className="animate-spin" />
                      ) : (
                        <SendIcon size={18} />
                      )}
                    </Button>
                  </motion.div>
                </div>
                <p className="text-xs text-emerald-700 mt-2 text-center">
                  Nhấn Enter để gửi, Shift+Enter để xuống dòng
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatAI;
