import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";

const Main = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Thêm hiệu ứng loading để tránh hiển thị trang trắng
  useEffect(() => {
    // Đánh dấu đã tải sau 500ms
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Hiển thị loader nếu chưa tải xong
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2 text-gray-700">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20">
        {/* Phần nội dung từ các route con */}
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Main;
