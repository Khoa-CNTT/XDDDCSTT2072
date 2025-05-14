import { useState } from "react";
import { FaCopy, FaCheck, FaClock, FaInfoCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const CouponList = ({ coupons, loading, onSelectCoupon, selectedCoupon }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  // Kiểm tra dữ liệu hợp lệ
  const validCoupons = Array.isArray(coupons)
    ? coupons.filter(
        (coupon) => coupon && typeof coupon === "object" && coupon.code
      )
    : [];

  console.log("Valid coupons:", validCoupons);

  // Xử lý sao chép mã giảm giá
  const handleCopyCode = (e, code) => {
    e.stopPropagation(); // Ngăn việc chọn coupon khi nhấn nút sao chép

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
      .catch(() => {
        console.error("Lỗi khi sao chép mã giảm giá");
        toast.error("Không thể sao chép mã giảm giá!");
      });
  };

  // Xử lý chọn mã giảm giá
  const handleSelectCoupon = (coupon) => {
    if (onSelectCoupon) {
      onSelectCoupon(coupon);
    }
  };

  // Định dạng ngày hết hạn
  const formatExpiryDate = (dateString) => {
    if (!dateString) return "Không xác định";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return "Không xác định";
    }
  };

  // Nếu đang tải hoặc không có mã giảm giá
  if (loading) {
    return (
      <div className="text-center py-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-3/5 mx-auto mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5 mx-auto"></div>
      </div>
    );
  }

  if (validCoupons.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Không có mã giảm giá nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
      {validCoupons.map((coupon, index) => {
        const isSelected = selectedCoupon?.id === coupon.id;
        const isPercentage = coupon.type === "PERCENTAGE";
        const hasMinOrder = coupon.minOrderValue && coupon.minOrderValue > 0;

        // Xử lý an toàn cho giá trị giảm giá
        const discountValue = isPercentage
          ? coupon.discountPercentage || coupon.discountValue || 0
          : coupon.discountValue || 0;

        const maxDiscountAmount = coupon.maxDiscountAmount || 0;

        return (
          <motion.div
            key={coupon.id || index}
            className={`relative flex cursor-pointer overflow-hidden ${
              isSelected ? "ring-2 ring-green-500" : "ring-1 ring-gray-200"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            onClick={() => handleSelectCoupon(coupon)}
          >
            {/* Phần bên trái */}
            <div className="flex-none w-24 bg-green-100 flex items-center justify-center p-3 relative">
              <div className="absolute top-0 right-0 h-full w-3">
                <div className="absolute top-0 -right-1.5 h-3 w-3 rounded-full bg-white"></div>
                <div className="absolute bottom-0 -right-1.5 h-3 w-3 rounded-full bg-white"></div>
                <div className="border-dashed border-r border-white h-full"></div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-green-700 font-bold">
                  {isPercentage
                    ? `${discountValue}%`
                    : `${Number(discountValue).toLocaleString()}đ`}
                </div>
                <div className="text-xs text-green-800 mt-1">
                  {isPercentage && maxDiscountAmount > 0
                    ? `Tối đa ${Number(maxDiscountAmount).toLocaleString()}đ`
                    : "Không giới hạn"}
                </div>
              </div>
            </div>

            {/* Phần bên phải */}
            <div className="flex-grow p-3 bg-white">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h4 className="font-medium text-sm text-gray-800 line-clamp-1">
                    {coupon.name || "Mã giảm giá"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {coupon.description ||
                      (isPercentage
                        ? `Giảm ${discountValue}% cho đơn hàng`
                        : `Giảm ${Number(
                            discountValue
                          ).toLocaleString()}đ cho đơn hàng`)}
                  </p>
                  {hasMinOrder && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-orange-500">
                      <FaInfoCircle size={10} />
                      <span>
                        Đơn tối thiểu{" "}
                        {Number(coupon.minOrderValue || 0).toLocaleString()}đ
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FaClock size={10} />
                    <span>HSD: {formatExpiryDate(coupon.expiryDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                      {coupon.code}
                    </div>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-md text-xs flex items-center justify-center transition-colors"
                      onClick={(e) => handleCopyCode(e, coupon.code)}
                      aria-label="Sao chép mã"
                      title="Sao chép mã"
                    >
                      <FaCopy size={10} />
                      {copiedCode === coupon.code && (
                        <span className="sr-only">Đã sao chép</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge cho mã đã chọn */}
            {isSelected && (
              <div className="absolute top-2 right-2 z-10 bg-green-500 text-white rounded-full p-1">
                <FaCheck size={10} />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

CouponList.propTypes = {
  coupons: PropTypes.array,
  loading: PropTypes.bool,
  onSelectCoupon: PropTypes.func,
  selectedCoupon: PropTypes.object,
};

CouponList.defaultProps = {
  coupons: [],
  loading: false,
  onSelectCoupon: null,
  selectedCoupon: null,
};

export default CouponList;
