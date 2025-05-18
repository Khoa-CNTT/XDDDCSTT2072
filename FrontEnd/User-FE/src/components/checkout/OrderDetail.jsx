import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/layout/Header";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  // Kiểm tra đăng nhập ngay khi vào trang chi tiết đơn hàng
  useEffect(() => {
    if (!auth?.accessToken) {
      toast.info("Vui lòng đăng nhập để xem chi tiết đơn hàng");
      navigate("/account/login", {
        state: { from: { pathname: `/order/${id}` } },
      });
      return;
    }
  }, [auth, navigate, id]);

  // Lấy chi tiết đơn hàng từ API
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!auth?.accessToken || !id) return;

      setIsLoading(true);
      try {
        // Gọi API lấy chi tiết đơn hàng theo ID
        const response = await axiosPrivate.get(`/orders/${id}`);

        if (response.data && response.data.success) {
          console.log(
            "Chi tiết đơn hàng từ API (raw):",
            JSON.stringify(response.data.data)
          );
          const orderData = response.data.data;

          // Log chi tiết hơn để debug
          console.log("Thông tin đơn hàng:", {
            id: orderData.id,
            orderNumber: orderData.orderNumber,
            totalQuantity: orderData.totalQuantity,
            subtotal: orderData.subtotal,
            shippingFee: orderData.shippingFee,
            totalAmount: orderData.subtotal + orderData.shippingFee,
            allFields: Object.keys(orderData),
          });

          setOrder(orderData);
        } else {
          console.error("Không tìm thấy đơn hàng hoặc lỗi API");
          toast.error("Không thể tải thông tin đơn hàng");
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);

        // Fallback: Thử lấy từ localStorage nếu API gặp lỗi
        try {
          const orders = JSON.parse(localStorage.getItem("orders") || "[]");
          const foundOrder = orders.find(
            (o) => o.id.toString() === id.toString()
          );
          if (foundOrder) {
            console.log("Chi tiết đơn hàng từ localStorage:", foundOrder);
            setOrder(foundOrder);
          } else {
            toast.error("Không tìm thấy đơn hàng");
          }
        } catch (err) {
          console.error("Lỗi khi đọc từ localStorage:", err);
          toast.error("Không thể tải thông tin đơn hàng");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, auth?.accessToken, axiosPrivate]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      // Xử lý chuỗi JSON timestamp từ Java (có thể có dạng mảng hoặc chuỗi)
      if (Array.isArray(dateString)) {
        // Format từ mảng số [year, month, day, ...] từ Java LocalDateTime
        const [year, month, day, hour = 0, minute = 0] = dateString;
        // Lưu ý: month trong JavaScript bắt đầu từ 0, trong khi Java bắt đầu từ 1
        const date = new Date(year, month - 1, day, hour, minute);

        if (!isNaN(date.getTime())) {
          return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }

      // Xử lý chuỗi timestamp dạng Unix (milliseconds)
      if (typeof dateString === "number" || /^\d+$/.test(dateString)) {
        const timestamp = Number(dateString);
        const date = new Date(timestamp);

        if (!isNaN(date.getTime())) {
          return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }

      // Xử lý các định dạng chuỗi khác
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Lỗi định dạng ngày:", error, dateString);
      return dateString || "N/A";
    }
  };

  // Tính tổng tiền sản phẩm
  const calculateSubtotal = (order) => {
    if (!order) return 0;

    if (order.subtotal !== undefined) {
      return Number(order.subtotal);
    }

    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((total, item) => {
        const price = Number(item.price || item.unitPrice || 0);
        const quantity = Number(item.quantity || 1);
        return total + price * quantity;
      }, 0);
    }

    if (order.orderItems && Array.isArray(order.orderItems)) {
      return order.orderItems.reduce((total, item) => {
        const price = Number(item.price || item.unitPrice || 0);
        const quantity = Number(item.quantity || 1);
        return total + price * quantity;
      }, 0);
    }

    return 0;
  };

  // Lấy phí vận chuyển
  const getShippingFee = (order) => {
    if (!order) return 0;

    if (order.shippingFee !== undefined) {
      return Number(order.shippingFee);
    }

    if (order.shipping_fee !== undefined) {
      return Number(order.shipping_fee);
    }

    return 0;
  };

  // Lấy tổng tiền đơn hàng
  const getOrderTotal = (order) => {
    if (!order) return 0;

    if (order.totalAmount !== undefined) {
      return Number(order.totalAmount);
    }

    const subtotal = calculateSubtotal(order);
    const shippingFee = getShippingFee(order);

    return subtotal + shippingFee;
  };

  // Hiển thị phương thức thanh toán
  const getPaymentMethodName = (method) => {
    if (!method) return "Không xác định";

    const methods = {
      COD: "Thanh toán khi nhận hàng",
      VNPAY: "Thanh toán qua VNPAY",
      MOMO: "Thanh toán qua Ví MoMo",
      ZALOPAY: "Thanh toán qua ZaloPay",
      CREDIT_CARD: "Thanh toán qua thẻ tín dụng",
      BANK_TRANSFER: "Chuyển khoản ngân hàng",
    };

    return methods[method.toUpperCase()] || method;
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto mt-28 px-4 py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-full h-8 bg-gray-200 rounded mb-4"></div>
            <div className="w-full h-64 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto mt-28 px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-6">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-6">
            Đơn hàng bạn tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/order-history")}
          >
            <FaArrowLeft className="mr-2" />
            Quay lại lịch sử đơn hàng
          </Button>
        </div>
      </>
    );
  }

  // Lấy các giá trị tính toán
  const subtotal = calculateSubtotal(order);
  const shippingFee = getShippingFee(order);
  const total = getOrderTotal(order);

  // Lấy danh sách sản phẩm từ các nguồn khác nhau trong API
  const orderItems = order.items || order.orderItems || order.lineItems || [];

  // Hỗ trợ nhiều cấu trúc sản phẩm khác nhau
  const renderOrderItems = () => {
    // Từ hình ảnh, ta thấy chúng ta có totalQuantity và subtotal
    if (order.totalQuantity > 0 && order.subtotal) {
      // Tính đơn giá trung bình
      const avgPrice = Math.round(order.subtotal / order.totalQuantity);

      return (
        <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <div>
              <p className="font-medium">
                Sản phẩm từ đơn hàng {order.orderNumber || `#${order.id}`}
              </p>
              <p className="text-sm text-gray-500">SL: {order.totalQuantity}</p>
              <p className="text-sm text-gray-500">
                Đơn giá bình quân: {avgPrice.toLocaleString()}đ
              </p>
            </div>
          </div>
          <p className="text-red-500 font-semibold">
            {Number(order.subtotal).toLocaleString()}đ
          </p>
        </div>
      );
    } else if (orderItems && orderItems.length > 0) {
      // Nếu có danh sách sản phẩm, hiển thị chi tiết từng sản phẩm
      return orderItems.map((item, index) => {
        // Lấy tên sản phẩm
        const productName =
          item.productName ||
          item.name ||
          (item.product
            ? item.product.name || item.product.productName
            : "Sản phẩm");

        // Lấy giá sản phẩm
        const price = Number(
          item.price ||
            item.unitPrice ||
            (item.product ? item.product.price || item.product.unitPrice : 0)
        );

        // Lấy số lượng
        const quantity = Number(item.quantity || 1);

        // Lấy hình ảnh
        const image =
          item.productImage ||
          item.image ||
          (item.product
            ? item.product.image || item.product.productImage
            : null) ||
          "https://via.placeholder.com/150";

        return (
          <div
            key={index}
            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-4">
              <img
                src={image}
                alt={productName}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="font-medium">{productName}</p>
                <p className="text-sm text-gray-500">SL: {quantity}</p>
                <p className="text-sm text-gray-500">
                  Đơn giá: {price.toLocaleString()}đ
                </p>
              </div>
            </div>
            <p className="text-red-500 font-semibold">
              {(price * quantity).toLocaleString()}đ
            </p>
          </div>
        );
      });
    }

    return (
      <p className="text-gray-500 text-center py-4">
        Không có thông tin sản phẩm
      </p>
    );
  };

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto mt-28 px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => navigate("/order-history")}
          >
            <FaArrowLeft />
          </Button>
          <h2 className="text-2xl font-bold">Chi tiết đơn hàng #{order.id}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-wrap gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Đơn hàng #{order.id}
                  </p>
                  <p className="text-sm">
                    Ngày đặt:{" "}
                    {formatDate(
                      order.orderDate ||
                        order.createdAt ||
                        order.createDate ||
                        order.date
                    )}
                  </p>
                  {order.orderNumber && (
                    <p className="text-sm">Mã đơn hàng: {order.orderNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Sản phẩm</h3>

              <div className="space-y-4">{renderOrderItems()}</div>
            </div>

            {/* Additional Notes */}
            {order.note && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Ghi chú</h3>
                <p className="text-gray-700">{order.note}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{shippingFee.toLocaleString()}đ</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-red-500 text-xl">
                      {total.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">
                Thông tin thanh toán
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Phương thức:</span>
                  <span className="font-medium">
                    {getPaymentMethodName(order.paymentMethod)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/farmhub2")}
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
