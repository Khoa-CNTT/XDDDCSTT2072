import { useState, useEffect } from "react";
import Header from "@/layout/Header";
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/hooks/useCartActions";
import Loading from "@/components/shared/Loading";
import CartUpdate from "@/components/cart/CartUpdate";
import CartDelete from "@/components/cart/CartDelete";
import { useNavigate } from "react-router";
import { validateCoupon, getActiveCoupons } from "@/services/couponService";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-toastify";
import { FaTag, FaAngleRight } from "react-icons/fa";
import CouponModal from "@/components/cart/CouponModal";
import { useQuery } from "@tanstack/react-query";

const Cart = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const { getCartQuery, isLoading } = useCartActions();
  const { data: cart } = getCartQuery;
  const cartItems = cart?.cartItems || [];

  // State để lưu các sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState({});

  // Chọn/bỏ chọn tất cả sản phẩm
  const [selectAll, setSelectAll] = useState(false);

  // State cho mã giảm giá
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountHighlight, setDiscountHighlight] = useState(false);

  // State cho modal mã giảm giá
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Lấy danh sách mã giảm giá
  const { data: couponsData, isLoading: isLoadingCoupons } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      try {
        // Lấy tất cả mã giảm giá đang hoạt động
        const response = await getActiveCoupons(axiosPrivate);
        console.log("Dữ liệu mã giảm giá từ API:", response);

        // API trả về {success, message, data}, nên cần lấy response.data.data
        if (response.success && Array.isArray(response.data)) {
          return response.data;
        } else {
          console.log("Cấu trúc dữ liệu không đúng:", response);
          return [];
        }
      } catch (error) {
        console.error("Lỗi khi lấy mã giảm giá:", error);
        return [];
      }
    },
  });

  const availableCoupons = couponsData || [];

  // Hiệu ứng nhấp nháy khi áp dụng mã giảm giá thành công
  useEffect(() => {
    if (discount > 0) {
      setDiscountHighlight(true);
      const timer = setTimeout(() => {
        setDiscountHighlight(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [discount]);

  // Xử lý chọn/bỏ chọn một sản phẩm
  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));

    // Kiểm tra xem có phải tất cả đều được chọn không
    const updatedSelection = {
      ...selectedItems,
      [itemId]: !selectedItems[itemId],
    };

    const allSelected = cartItems.every((item) => updatedSelection[item.id]);
    setSelectAll(allSelected);

    // Reset mã giảm giá khi thay đổi lựa chọn
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setDiscount(0);
      setCouponError("");
    }
  };

  // Xử lý chọn/bỏ chọn tất cả
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const newSelection = {};
    cartItems.forEach((item) => {
      newSelection[item.id] = newSelectAll;
    });

    setSelectedItems(newSelection);

    // Reset mã giảm giá khi thay đổi lựa chọn
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setDiscount(0);
      setCouponError("");
    }
  };

  // Tính tổng tiền cho các mục đã chọn
  const calculateSelectedTotal = () => {
    return cartItems
      .filter((item) => selectedItems[item.id])
      .reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  };

  // Tính tổng tiền sau khi giảm giá
  const calculateFinalTotal = () => {
    const total = calculateSelectedTotal();
    if (appliedCoupon && discount > 0) {
      // Đảm bảo kết quả không âm và không thấp hơn 0
      console.log(
        `Tính tổng sau giảm giá: ${total} - ${discount} = ${Math.max(
          0,
          total - discount
        )}`
      );
      return Math.max(0, total - discount);
    }
    return total;
  };

  // Đếm số lượng sản phẩm đã chọn
  const countSelectedItems = () => {
    return Object.values(selectedItems).filter((selected) => selected).length;
  };

  // Xử lý chuyển đến thanh toán với các sản phẩm đã chọn
  const handleCheckout = () => {
    const itemsToCheckout = cartItems.filter((item) => selectedItems[item.id]);

    if (itemsToCheckout.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    // Chuyển đến trang checkout với dữ liệu sản phẩm đã chọn và mã giảm giá
    navigate("/checkout", {
      state: {
        selectedItems: itemsToCheckout,
        fromCart: true,
        couponCode: appliedCoupon?.code,
        discount: discount,
      },
    });
  };

  // Mở modal mã giảm giá
  const handleOpenCouponModal = () => {
    if (countSelectedItems() === 0) {
      toast.info("Vui lòng chọn ít nhất một sản phẩm để xem mã giảm giá");
      return;
    }

    setIsCouponModalOpen(true);
  };

  // Xử lý chọn mã giảm giá từ modal
  const handleSelectCoupon = (coupon) => {
    console.log("Coupon được chọn:", coupon);

    // Lấy mã giảm giá
    setCouponCode(coupon.code);
    setIsCouponModalOpen(false);

    // Tự động áp dụng mã giảm giá đã chọn
    setTimeout(() => {
      handleApplyCouponWithCode(coupon.code);
    }, 100);
  };

  // Xử lý áp dụng mã giảm giá
  const handleApplyCoupon = () => {
    handleApplyCouponWithCode(couponCode);
  };

  // Xử lý áp dụng mã giảm giá với mã cụ thể
  const handleApplyCouponWithCode = async (code) => {
    if (!code.trim()) {
      setCouponError("Vui lòng nhập mã giảm giá");
      return;
    }

    if (countSelectedItems() === 0) {
      setCouponError(
        "Vui lòng chọn ít nhất một sản phẩm để áp dụng mã giảm giá"
      );
      return;
    }

    try {
      setIsValidatingCoupon(true);
      setCouponError("");

      const selectedTotal = calculateSelectedTotal();
      console.log("Tổng tiền trước khi áp dụng mã:", selectedTotal);

      try {
        const response = await validateCoupon(
          axiosPrivate,
          code,
          auth?.user?.id || null,
          selectedTotal
        );

        console.log("Response từ API mã giảm giá:", response);

        // Kiểm tra response từ API
        if (response && response.success && response.data) {
          // Nếu API trả về cấu trúc mới
          const couponData = response.data;
          console.log("Dữ liệu mã giảm giá:", couponData);

          // Tính toán số tiền giảm
          let discountAmount = 0;
          const discountType = couponData.type;

          if (discountType === "PERCENTAGE") {
            const percentage = couponData.discountPercentage || 0;
            discountAmount = Math.floor((selectedTotal * percentage) / 100);
            console.log(`Giảm ${percentage}% = ${discountAmount}`);
          } else if (discountType === "FREE_SHIPPING") {
            // Giả sử phí vận chuyển cố định
            discountAmount = 30000;
            console.log(`Miễn phí vận chuyển = ${discountAmount}đ`);
          } else {
            discountAmount = Number(couponData.discountValue || 0);
            console.log(`Giảm cố định ${discountAmount}đ`);
          }

          // Đảm bảo giảm giá không vượt quá tổng tiền
          discountAmount = Math.min(discountAmount, selectedTotal);

          // Lưu thông tin mã giảm giá
          setAppliedCoupon({
            id: couponData.id,
            code: code,
            type: discountType,
            discountValue:
              discountType === "PERCENTAGE"
                ? couponData.discountPercentage
                : discountAmount,
          });

          // Cập nhật giảm giá và thông báo
          setDiscount(discountAmount);
          setCouponError("");

          // Thông báo đẹp hơn
          const messageType =
            discountType === "PERCENTAGE"
              ? `Giảm ${
                  couponData.discountPercentage
                }% (${discountAmount.toLocaleString()}đ)`
              : discountType === "FREE_SHIPPING"
              ? "Miễn phí vận chuyển"
              : `Giảm ${discountAmount.toLocaleString()}đ`;

          toast.success(`🎉 Áp dụng thành công: ${messageType}`, {
            position: "bottom-center",
            autoClose: 3000,
          });
        } else {
          // Xử lý lỗi hoặc mã không hợp lệ
          const errorMsg = response.message || "Mã giảm giá không hợp lệ";
          setCouponError(errorMsg);
          setAppliedCoupon(null);
          setDiscount(0);

          toast.error(`❌ ${errorMsg}`, {
            position: "bottom-center",
          });
        }
      } catch (apiError) {
        console.error("Chi tiết lỗi API:", apiError);

        let errorMsg = "Lỗi khi áp dụng mã giảm giá";
        if (apiError.response?.data?.message) {
          errorMsg = apiError.response.data.message;
        }

        setCouponError(errorMsg);
        setAppliedCoupon(null);
        setDiscount(0);

        toast.error(`❌ ${errorMsg}`, {
          position: "bottom-center",
        });
      }
    } catch (error) {
      console.error("Lỗi khi áp dụng mã giảm giá:", error);
      setCouponError("Lỗi không xác định");
      setAppliedCoupon(null);
      setDiscount(0);

      toast.error("❌ Lỗi không xác định khi áp dụng mã giảm giá", {
        position: "bottom-center",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Xử lý huỷ mã giảm giá
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    setCouponError("");
  };

  const handleBackFarmHubPage = () => {
    navigate("/farmhub2");
  };

  // Cập nhật thành phần hiển thị thông tin tổng cộng
  const renderTotalSection = () => {
    const subtotal = calculateSelectedTotal();
    const finalTotal = calculateFinalTotal();
    const hasDiscount = appliedCoupon && discount > 0;

    return (
      <div className="flex flex-col gap-2 mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between">
          <span>
            Đã chọn {countSelectedItems()}/{cartItems.length} sản phẩm
          </span>
          <span>Tạm tính: {subtotal.toLocaleString()}đ</span>
        </div>

        {hasDiscount && (
          <div
            className={`flex justify-between text-green-600 font-medium ${
              discountHighlight ? "animate-pulse bg-green-100 p-1 rounded" : ""
            }`}
          >
            <span className="flex items-center gap-1">
              <FaTag size={14} />
              <span>Giảm giá:</span>
            </span>
            <span>-{discount.toLocaleString()}đ</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span>Tổng cộng:</span>
          <div className="flex flex-col items-end">
            {hasDiscount && (
              <span className="text-sm font-normal text-gray-500 line-through">
                {subtotal.toLocaleString()}đ
              </span>
            )}
            <span className="text-red-500">{finalTotal.toLocaleString()}đ</span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header />
      {cartItems?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg mb-4">Giỏ hàng của bạn đang trống.</p>
          <Button
            className="bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded-lg"
            onClick={handleBackFarmHubPage}
          >
            Trở về trang FarmHub
          </Button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto mt-28 px-4">
          <h2 className="text-2xl font-bold text-center mb-6">
            Giỏ Hàng Của Bạn
          </h2>

          <table className="w-full border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="select-all">Chọn tất cả</label>
                  </div>
                </th>
                <th className="p-4">Thông tin sản phẩm</th>
                <th className="text-center">Đơn giá</th>
                <th className="text-center">Số lượng</th>
                <th className="text-center">Thành tiền</th>
                <th className="text-center"></th>
              </tr>
            </thead>
            <tbody>
              {cartItems?.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b ${
                    selectedItems[item.id] ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems[item.id] || false}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="flex items-center gap-4 p-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <span>{item.productName}</span>
                  </td>
                  <td className="text-red-500 font-semibold text-center">
                    {item.unitPrice.toLocaleString()}đ
                  </td>
                  <td className="text-center">
                    <CartUpdate cartItemId={item.id} quantity={item.quantity} />
                  </td>
                  <td className="text-red-500 font-semibold text-center">
                    {(item.unitPrice * item.quantity).toLocaleString()}đ
                  </td>
                  <td className="text-center">
                    <CartDelete cartItemId={item.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Phần áp dụng mã giảm giá */}
          <div className="flex flex-col mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <FaTag className="text-green-500" />
              <span>Mã giảm giá</span>
            </h3>

            {/* Button chọn mã giảm giá (giống Shopee) */}
            <div
              onClick={handleOpenCouponModal}
              className="border border-gray-300 rounded-md p-3 mb-3 cursor-pointer bg-white hover:border-green-500 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaTag className="text-green-500" />
                  <span className="text-gray-500">
                    {appliedCoupon
                      ? `Mã đang dùng: ${appliedCoupon.code}`
                      : "Chọn hoặc nhập mã"}
                  </span>
                </div>
                <FaAngleRight className="text-gray-400" />
              </div>
            </div>

            {/* Hoặc nhập thủ công */}
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Nhập mã giảm giá"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                disabled={!!appliedCoupon}
              />

              {appliedCoupon ? (
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                  onClick={handleRemoveCoupon}
                >
                  Huỷ mã
                </Button>
              ) : (
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                  onClick={handleApplyCoupon}
                  disabled={
                    isValidatingCoupon ||
                    !couponCode.trim() ||
                    countSelectedItems() === 0
                  }
                >
                  {isValidatingCoupon ? "Đang áp dụng..." : "Áp dụng"}
                </Button>
              )}
            </div>

            {/* Hiển thị lỗi hoặc thông tin mã giảm giá đã áp dụng */}
            {couponError ? (
              <div className="text-red-500 mt-2">{couponError}</div>
            ) : appliedCoupon ? (
              <div className="flex items-center gap-2 text-green-600 mt-2 p-2 bg-green-50 rounded-md border border-green-100">
                <FaTag className="text-green-500" />
                <div>
                  <div className="font-medium">
                    Đã áp dụng mã: {appliedCoupon.code}
                  </div>
                  <div className="text-sm">
                    {appliedCoupon.type === "PERCENTAGE"
                      ? `Giảm ${
                          appliedCoupon.discountValue
                        }% - Tiết kiệm ${discount.toLocaleString()}đ`
                      : appliedCoupon.type === "FREE_SHIPPING"
                      ? "Miễn phí vận chuyển"
                      : `Giảm ${discount.toLocaleString()}đ`}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {renderTotalSection()}

          <div className="flex justify-end mt-4">
            <Button
              className="bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded-lg"
              onClick={handleCheckout}
              disabled={countSelectedItems() === 0}
            >
              Thanh Toán ({countSelectedItems()} sản phẩm)
            </Button>
          </div>

          {/* Modal chọn mã giảm giá */}
          <CouponModal
            isOpen={isCouponModalOpen}
            onClose={() => setIsCouponModalOpen(false)}
            coupons={availableCoupons}
            loading={isLoadingCoupons}
            onSelectCoupon={handleSelectCoupon}
            selectedCoupon={appliedCoupon}
            orderAmount={calculateSelectedTotal()}
          />
        </div>
      )}
    </>
  );
};

export default Cart;