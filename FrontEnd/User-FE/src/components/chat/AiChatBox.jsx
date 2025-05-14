import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import useAiChat from "@/hooks/useAiChat";
import useAuth from "@/hooks/useAuth";
import {
  BotIcon,
  SendIcon,
  TrashIcon,
  XIcon,
  RotateCwIcon,
  HistoryIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const AiChatBox = () => {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);
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
  } = useAiChat();

  // Cuộn xuống cuối cùng khi có tin nhắn mới
  useEffect(() => {
    if (messageContainerRef.current && isOpen) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Focus vào input khi mở chat box
  useEffect(() => {
    if (isOpen && inputRef.current && !showSessionList) {
      inputRef.current.focus();
    }
  }, [isOpen, showSessionList]);

  // Kiểm tra đăng nhập trước khi mở chat box
  const handleOpenChat = () => {
    if (!auth?.accessToken) {
      toast.info("Vui lòng đăng nhập để sử dụng trợ lý AI");
      navigate("/account/login", { state: { from: { pathname: "/home" } } });
      return;
    }
    setIsOpen(true);
  };

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

  // Xử lý xóa lịch sử chat
  const handleClearChat = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử chat?")) {
      clearChatHistory();
    }
  };

  // Xử lý khi chọn một phiên chat từ lịch sử
  const handleSelectSession = (sessionId) => {
    selectChatSession(sessionId);
    setShowSessionList(false);
  };

  // Xử lý khi mở danh sách phiên chat
  const handleOpenSessionList = () => {
    fetchChatSessions();
    setShowSessionList(true);
  };

  // Hiển thị các tin nhắn
  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-10">
          <BotIcon size={40} className="text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-800">
            Trợ lý AI nông nghiệp
          </h3>
          <p className="text-sm text-gray-500 text-center mt-2 max-w-xs">
            Hỏi bất kỳ câu hỏi nào về nông nghiệp, kỹ thuật canh tác, hoặc các
            vấn đề liên quan.
          </p>
        </div>
      );
    }

    return messages.map((msg, index) => (
      <div
        key={index}
        className={`mb-4 flex ${
          msg.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        {msg.role === "assistant" && (
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="/robot-avatar.png" alt="AI" />
            <AvatarFallback className="bg-green-100 text-green-800">
              AI
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 ${
            msg.role === "user"
              ? "bg-green-500 text-white"
              : msg.isError
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

          {msg.source && (
            <div className="mt-2 text-xs opacity-70">
              <span className="font-semibold">Nguồn:</span> {msg.source}
            </div>
          )}

          <div className="text-xs opacity-60 mt-1 text-right">
            {formatTime(msg.timestamp)}
          </div>
        </div>

        {msg.role === "user" && (
          <Avatar className="h-8 w-8 ml-2">
            <AvatarImage
              src={auth?.user?.imageUrl || "/placeholder-avatar.png"}
              alt={auth?.user?.userName || "User"}
            />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {auth?.user?.userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    ));
  };

  // Hiển thị danh sách phiên chat
  const renderSessionList = () => {
    if (loadingSessions) {
      return (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (sessions.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          Không có phiên chat nào
        </div>
      );
    }

    return (
      <div className="space-y-2 p-2">
        {sessions.map((session) => (
          <div
            key={session.sessionId}
            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            onClick={() => handleSelectSession(session.sessionId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon size={16} className="text-gray-400 mr-2" />
                <span className="font-medium text-gray-700">
                  {session.title || "Cuộc trò chuyện không có tiêu đề"}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(session.createdAt)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Model: {session.model || "AI"}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Nút mở chat box */}
      <button
        onClick={handleOpenChat}
        className="fixed bottom-5 right-5 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50 transition-all duration-300 transform hover:scale-105"
      >
        <BotIcon size={24} />
      </button>

      {/* Dialog chat box */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0 gap-0">
          <DialogHeader className="bg-green-500 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showSessionList && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSessionList(false)}
                    className="h-8 w-8 rounded-full text-white hover:bg-green-600 hover:text-white mr-1"
                  >
                    <ArrowLeftIcon size={16} />
                  </Button>
                )}
                <Avatar className="h-8 w-8 bg-white">
                  <AvatarImage src="/robot-avatar.png" alt="AI" />
                  <AvatarFallback className="bg-green-100 text-green-800">
                    AI
                  </AvatarFallback>
                </Avatar>
                <DialogTitle className="text-white">
                  {showSessionList ? "Lịch sử chat" : "Trợ lý AI Nông nghiệp"}
                </DialogTitle>
              </div>

              <div className="flex items-center gap-1">
                {!showSessionList && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleOpenSessionList}
                      className="h-8 w-8 rounded-full text-white hover:bg-green-600 hover:text-white"
                    >
                      <HistoryIcon size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearChat}
                      className="h-8 w-8 rounded-full text-white hover:bg-green-600 hover:text-white"
                    >
                      <TrashIcon size={16} />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full text-white hover:bg-green-600 hover:text-white"
                >
                  <XIcon size={16} />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Vùng hiển thị nội dung (tin nhắn hoặc phiên chat) */}
          {showSessionList ? (
            <div className="flex-1 overflow-y-auto p-2">
              {renderSessionList()}
            </div>
          ) : (
            <>
              {/* Vùng hiển thị tin nhắn */}
              <div
                ref={messageContainerRef}
                className="flex-1 p-4 overflow-y-auto"
              >
                {renderMessages()}

                {loading && (
                  <div className="flex justify-center items-center py-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  </div>
                )}

                {error && !loading && (
                  <div className="text-center text-red-500 text-sm py-2">
                    {error}
                  </div>
                )}
              </div>

              {/* Form nhập tin nhắn */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-gray-200"
              >
                <div className="flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nhập câu hỏi của bạn về nông nghiệp..."
                    className="min-h-[60px] resize-none flex-1"
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
                    className="bg-green-500 hover:bg-green-600 text-white self-end h-10 w-10 rounded-full p-0"
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AiChatBox;
