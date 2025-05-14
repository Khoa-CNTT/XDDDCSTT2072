import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import Loading from "@/components/shared/Loading";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { getActiveCoupons, getCouponsForUser } from "@/services/couponService";
import { toast } from "react-toastify";
import { FaTag, FaCalendarAlt, FaClipboard, FaCopy } from "react-icons/fa";

const Coupons = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const userId = auth?.userId;

  const [filter, setFilter] = useState("all"); // all, forYou
  const [copiedCode, setCopiedCode] = useState(null);

  // Lấy tất cả mã giảm giá đang hoạt động
  const {
    data: activeCouponsData,
    isLoading: isLoadingActiveCoupons,
    error: activeCouponsError,
  } = useQuery({
    queryKey: ["activeCoupons"],
    queryFn: () => getActiveCoupons(axiosPrivate),
    retry: 1,
  });

  // Lấy mã giảm giá cho người dùng
  const {
    data: userCouponsData,
    isLoading: isLoadingUserCoupons,
    error: userCouponsError,
  } = useQuery({
    queryKey: ["userCoupons", userId],
    queryFn: () => getCouponsForUser(axiosPrivate, userId),
    retry: 1,
    enabled: !!userId,
  });

  // Dữ liệu mã giảm giá
  const activeCoupons = activeCouponsData?.data || [];
  const userCoupons = userCouponsData?.data || [];

  // Lọc danh sách mã giảm giá theo bộ lọc
  const filteredCoupons = filter === "forYou" ? userCoupons : activeCoupons;

  // Xử lý sao chép mã giảm giá
  const handleCopyCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopiedCode(code);
        toast.success("Đã sao chép mã giảm giá!");

        // Tự động reset sau 3 giây
        setTimeout(() => {
          setCopiedCode(null);
        }, 3000);
      })
      .catch((error) => {
        console.error("Lỗi khi sao chép:", error);
        toast.error("Không thể sao chép mã giảm giá!");
      });
  };

  // Hiển thị thông báo lỗi
  useEffect(() => {
    if (activeCouponsError) {
      toast.error("Không thể tải danh sách mã giảm giá!");
    }
    if (userCouponsError && userId) {
      toast.error("Không thể tải mã giảm giá của bạn!");
    }
  }, [activeCouponsError, userCouponsError, userId]);

  // Định dạng ngày hết hạn
  const formatExpiryDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Tính toán phần trăm còn lại của thời gian hiệu lực
  const calculateTimeLeftPercentage = (startDate, endDate) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (now >= end) return 0;
    if (now <= start) return 100;

    const total = end - start;
    const elapsed = now - start;
    return Math.round(((total - elapsed) / total) * 100);
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (isLoadingActiveCoupons || (isLoadingUserCoupons && userId)) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loading />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 py-8 mt-14">
        <div className="max-w-7xl mx-auto px-4">
          {/* Tiêu đề và bộ lọc */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
              Mã giảm giá
            </h1>

            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                className={`px-4 py-2 rounded-lg ${
                  filter === "all"
                    ? "bg-white shadow-sm font-medium"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => setFilter("all")}
              >
                Tất cả mã
              </button>
              {userId && (
                <button
                  className={`px-4 py-2 rounded-lg ${
                    filter === "forYou"
                      ? "bg-white shadow-sm font-medium"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setFilter("forYou")}
                >
                  Dành cho bạn
                </button>
              )}
            </div>
          </div>

          {/* Danh sách mã giảm giá */}
          {filteredCoupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCoupons.map((coupon, index) => (
                <motion.div
                  key={coupon.id}
                  className="bg-white rounded-lg shadow-md relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {/* Phần trang trí bên trái */}
                  <div className="absolute left-0 top-0 h-full w-2 bg-green-500"></div>

                  {/* Nội dung mã giảm giá */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">
                          {coupon.discountType === "PERCENTAGE"
                            ? `Giảm ${coupon.discountValue || 0}%`
                            : `Giảm ${(
                                coupon.discountValue || 0
                              ).toLocaleString()}đ`}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                          {coupon.description || "Áp dụng cho đơn hàng"}
                        </p>
                      </div>
                      <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded">
                        {coupon.couponType}
                      </div>
                    </div>

                    {/* Thông tin điều kiện */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FaTag size={14} className="text-green-500" />
                        <span>
                          {coupon.minOrderValue > 0
                            ? `Đơn tối thiểu ${(
                                coupon.minOrderValue || 0
                              ).toLocaleString()}đ`
                            : "Không có đơn tối thiểu"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FaCalendarAlt size={14} className="text-green-500" />
                        <span>
                          Hiệu lực đến: {formatExpiryDate(coupon.expiryDate)}
                        </span>
                      </div>
                    </div>

                    {/* Mã giảm giá và nút lưu */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-3/5">
                        <FaClipboard size={14} className="text-gray-500" />
                        <code className="text-sm font-mono font-medium">
                          {coupon.code}
                        </code>
                      </div>

                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm transition-colors"
                        onClick={() => handleCopyCode(coupon.code)}
                      >
                        <FaCopy size={14} />
                        {copiedCode === coupon.code
                          ? "Đã sao chép"
                          : "Sao chép"}
                      </button>
                    </div>

                    {/* Thanh tiến trình thời gian còn lại */}
                    <div className="mt-4">
                      <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${calculateTimeLeftPercentage(
                              coupon.startDate,
                              coupon.expiryDate
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center shadow-md">
              <div className="text-5xl text-gray-300 mx-auto mb-4">
                <FaTag />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Không có mã giảm giá nào
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === "forYou"
                  ? "Hiện tại không có mã giảm giá nào dành cho bạn."
                  : "Không có mã giảm giá nào đang hoạt động."}
              </p>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() => navigate("/farmhub2")}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Coupons;
