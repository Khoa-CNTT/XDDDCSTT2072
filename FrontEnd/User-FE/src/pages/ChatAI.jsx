import { useState, useRef, useEffect } from "react";
import Header from "../layout/Header";
import useAiChat from "@/hooks/useAiChat";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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

function ChatAI() {
  const [message, setMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const messageContainerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { auth } = useAuth();

  const {
    messages,
    loading,
    error,
    sendMessage,
    clearChatHistory,
    sessions,
    loadingSessions,
    fetchChatSessions,
    selectChatSession,
    sessionId,
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
      toast.info("Vui lòng đăng nhập để sử dụng trợ lý AI");
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

  // Hiển thị các tin nhắn
  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-10 px-4">
          <div className="text-center mb-8 max-w-2xl">
            <div className="inline-block bg-green-100 p-4 rounded-full mb-6">
              <BotIcon size={48} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-medium text-gray-800 mb-3">
              Trợ lý AI Nông nghiệp
            </h3>
            <p className="text-center text-gray-600 mx-auto mb-8">
              Chào mừng bạn đến với trợ lý AI của chúng tôi. Hãy đặt câu hỏi về
              nông nghiệp, kỹ thuật canh tác, hoặc bất kỳ vấn đề gì liên quan
              đến nông nghiệp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
            <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 cursor-pointer transition-colors">
              <h4 className="font-medium text-gray-800 mb-1">
                🌱 Kỹ thuật trồng trọt
              </h4>
              <p className="text-sm text-gray-600">
                Hướng dẫn về cách trồng và chăm sóc cây trồng
              </p>
            </div>
            <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 cursor-pointer transition-colors">
              <h4 className="font-medium text-gray-800 mb-1">🐄 Chăn nuôi</h4>
              <p className="text-sm text-gray-600">
                Thông tin về chăn nuôi và phòng bệnh cho vật nuôi
              </p>
            </div>
            <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 cursor-pointer transition-colors">
              <h4 className="font-medium text-gray-800 mb-1">
                ⛅ Thời tiết và mùa vụ
              </h4>
              <p className="text-sm text-gray-600">
                Hướng dẫn về thời vụ và ảnh hưởng của thời tiết
              </p>
            </div>
            <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 cursor-pointer transition-colors">
              <h4 className="font-medium text-gray-800 mb-1">
                🦠 Phòng trừ sâu bệnh
              </h4>
              <p className="text-sm text-gray-600">
                Cách nhận biết và đối phó với sâu bệnh hại
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-4xl mx-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`py-6 px-4 ${
              index < messages.length - 1 ? "border-b border-gray-200" : ""
            }`}
          >
            <div className="flex items-start max-w-3xl mx-auto">
              {msg.role === "assistant" ? (
                <Avatar className="h-10 w-10 mr-4 mt-1 flex-shrink-0 border-2 border-green-100 p-0.5">
                  <AvatarImage
                    src="/robot-avatar.png"
                    alt="AI"
                    className="rounded-full"
                  />
                  <AvatarFallback className="bg-green-100 text-green-800">
                    AI
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-10 w-10 mr-4 mt-1 flex-shrink-0 border-2 border-blue-100 p-0.5">
                  <AvatarImage
                    src={auth?.user?.imageUrl || "/placeholder-avatar.png"}
                    alt={auth?.user?.userName || "User"}
                    className="rounded-full"
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    {auth?.user?.userName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center">
                  <span
                    className={`font-medium ${
                      msg.role === "assistant"
                        ? "text-green-700"
                        : "text-blue-700"
                    }`}
                  >
                    {msg.role === "assistant"
                      ? "Trợ lý AI"
                      : auth?.user?.userName || "Bạn"}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                <div
                  className={`prose prose-sm max-w-none ${
                    msg.role === "assistant" ? "text-gray-800" : "text-gray-700"
                  }`}
                >
                  <div className="whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100 shadow-sm">
                    {msg.content}
                  </div>
                </div>

                {msg.source && (
                  <div className="mt-2 text-xs text-gray-500 italic">
                    <span className="font-semibold">Nguồn:</span> {msg.source}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Hiển thị thanh bên lịch sử chat
  const renderSidebar = () => (
    <div
      className={`bg-gray-900 text-white h-[calc(100vh-64px)] w-80 flex flex-col ${
        showSidebar ? "block" : "hidden"
      } md:block transition-all duration-300 ease-in-out`}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-800">
        <h2 className="font-semibold text-lg">Lịch sử trò chuyện</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChatHistory}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-1 h-8 w-8 rounded-full"
            title="Cuộc trò chuyện mới"
          >
            <PlusIcon size={16} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-2 py-3">
        {loadingSessions ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-6 px-4 text-gray-400">
            <div className="mb-2">
              <HistoryIcon className="inline-block h-10 w-10 opacity-50 mb-2" />
            </div>
            <p>Không có lịch sử trò chuyện</p>
            <p className="text-xs mt-2">Trò chuyện mới sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className={`px-3 py-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors ${
                  session.sessionId === sessionId
                    ? "bg-gray-800 border-l-4 border-green-500"
                    : ""
                }`}
                onClick={() => handleSelectSession(session.sessionId)}
              >
                <div className="flex items-center">
                  <HistoryIcon
                    size={14}
                    className="text-gray-400 mr-2 flex-shrink-0"
                  />
                  <span className="text-sm truncate font-medium">
                    {session.title || "Cuộc trò chuyện mới"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 pl-6 flex items-center">
                  <ClockIcon size={12} className="mr-1" />
                  {formatDate(session.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        {/* Sidebar */}
        {renderSidebar()}

        {/* Main content */}
        <div className="flex-1 flex flex-col h-full relative">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden absolute top-4 left-4 z-10 bg-white border shadow-sm rounded-full p-2 h-10 w-10"
          >
            <MenuIcon size={20} />
          </Button>

          {/* Messages container */}
          <div
            ref={messageContainerRef}
            className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {renderMessages()}

            {loading && (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            )}

            {error && !loading && (
              <div className="max-w-3xl mx-auto px-6 mt-4">
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
              </div>
            )}
          </div>

          {/* Input container */}
          <div className="bg-white border-t border-gray-200 p-4 shadow-md">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSendMessage}>
                <div className="relative">
                  <Textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hỏi về nông nghiệp, kỹ thuật trồng trọt, chăn nuôi..."
                    className="min-h-[60px] pr-16 py-3 px-4 resize-none border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
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
                    className="absolute right-2 bottom-2 bg-green-500 hover:bg-green-600 text-white h-10 w-10 rounded-lg p-0 flex items-center justify-center shadow-sm transition-colors"
                  >
                    {loading ? (
                      <RotateCwIcon size={18} className="animate-spin" />
                    ) : (
                      <SendIcon size={18} />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
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
