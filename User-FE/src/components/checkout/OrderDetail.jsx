import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/layout/Header";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load đơn hàng từ localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      const foundOrder = orders.find((o) => o.id === id);
      setOrder(foundOrder || null);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Chờ xác nhận",
      },
      PROCESSING: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Đang xử lý",
      },
      SHIPPING: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Đang giao hàng",
      },
      COMPLETED: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Hoàn thành",
      },
      CANCELLED: { bg: "bg-red-100", text: "text-red-800", label: "Đã hủy" },
      WAITING_PAYMENT: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        label: "Chờ thanh toán",
      },
    };

    const statusInfo = statusMap[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: status,
    };

    return (
      <span
        className={`${statusInfo.bg} ${statusInfo.text} text-sm font-medium px-3 py-1 rounded-full`}
      >
        {statusInfo.label}
      </span>
    );
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      const updatedOrders = orders.map((o) =>
        o.id === id ? { ...o, status: "CANCELLED" } : o
      );
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      setOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
      toast.success("Đã hủy đơn hàng thành công");
    }
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
            {/* Order Status */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Đơn hàng #{order.id}
                  </p>
                  <p className="text-sm">
                    Ngày đặt: {formatDate(order.orderDate)}
                  </p>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Sản phẩm</h3>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.productImage || "https://via.placeholder.com/150"
                        }
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">
                          SL: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Đơn giá: {item.price.toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                    <p className="text-red-500 font-semibold">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Địa chỉ giao hàng</h3>

              <div className="border p-4 rounded-lg">
                <p className="font-medium">
                  {order.shippingAddress.recipientName}
                </p>
                <p className="text-sm">{order.shippingAddress.phone}</p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.streetAddress},{" "}
                  {order.shippingAddress.ward}, {order.shippingAddress.district}
                  , {order.shippingAddress.province}
                </p>
              </div>
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
                  <span>
                    {(order.totalAmount - order.shippingFee).toLocaleString()}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{order.shippingFee.toLocaleString()}đ</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-red-500 text-xl">
                      {order.totalAmount.toLocaleString()}đ
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
                    {order.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng"
                      : order.paymentMethod === "VNPAY"
                      ? "VNPAY"
                      : order.paymentMethod === "MOMO"
                      ? "Ví MoMo"
                      : order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <span
                    className={
                      order.status === "COMPLETED" ||
                      order.status === "SHIPPING" ||
                      order.status === "PROCESSING"
                        ? "text-green-600 font-medium"
                        : order.status === "WAITING_PAYMENT"
                        ? "text-orange-600 font-medium"
                        : order.status === "CANCELLED"
                        ? "text-red-600 font-medium"
                        : "text-yellow-600 font-medium"
                    }
                  >
                    {order.status === "COMPLETED" ||
                    order.status === "SHIPPING" ||
                    order.status === "PROCESSING"
                      ? "Đã thanh toán"
                      : order.status === "WAITING_PAYMENT"
                      ? "Chờ thanh toán"
                      : order.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng"
                      : "Chưa thanh toán"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {(order.status === "PENDING" ||
                order.status === "WAITING_PAYMENT") && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancelOrder}
                >
                  Hủy đơn hàng
                </Button>
              )}

              {order.status === "COMPLETED" && (
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Mua lại
                </Button>
              )}

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
