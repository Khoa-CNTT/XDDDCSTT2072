import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../layout/Header";

function ChatAI() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-screen-2xl mx-auto">
        <Header />
        <div className="flex mt-20">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-64 bg-white border-r h-[calc(100vh-64px)] p-4 flex flex-col relative"
              >
                <div className="absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="bg-white shadow-md rounded-full p-2 hover:bg-blue-100 transition"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <h2 className="font-semibold text-gray-700 mb-4">📜 Lịch sử chat</h2>
                <div className="space-y-3 text-sm overflow-y-auto">
                  <div className="bg-blue-50 p-2 rounded hover:bg-blue-100 cursor-pointer transition">
                    Hỏi thời tiết hôm nay
                  </div>
                  <div className="bg-blue-50 p-2 rounded hover:bg-blue-100 cursor-pointer transition">
                    Gợi ý chăm sóc cây cam
                  </div>
                  <div className="bg-blue-50 p-2 rounded hover:bg-blue-100 cursor-pointer transition">
                    Tôi bị sâu bệnh, phải làm sao?
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isSidebarOpen && (
            <div className="w-10 h-[calc(100vh-64px)] bg-transparent relative">
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="bg-white shadow-md rounded-full p-2 hover:bg-blue-100 transition"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
          <div className="flex-1 h-[calc(100vh-64px)] flex flex-col items-center px-4 pt-10 pb-6">
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              src="https://tse2.mm.bing.net/th?id=OIP.g_R7XFbO-iEWESUfk0AXlQHaEK&pid=Api&P=0&h=220"
              alt="Avatar"
              className="w-24 h-24 object-cover rounded-full shadow-lg mb-4"
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center font-semibold text-xl text-gray-800 mb-10"
            >
              👋 Xin chào! Tôi là Chat AI. Bạn cần hỏi gì không?
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-2xl mt-auto mb-4 bg-white border border-gray-300 shadow-md rounded-2xl flex items-center p-4"
            >
              <textarea
                placeholder="💬 Hỏi tôi điều gì đó..."
                className="w-full h-12 resize-none outline-none bg-transparent text-gray-700 placeholder-gray-400 p-2"
              />
              <button className="text-gray-600 text-2xl px-2 hover:text-blue-500 transition duration-200">
                🚀
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatAI;
