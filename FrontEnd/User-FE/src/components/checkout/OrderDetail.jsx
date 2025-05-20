import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/layout/Header";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  Truck,
  Calendar,
  CreditCard,
  ImageOff,
} from "lucide-react";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { motion } from "framer-motion";
import {
  getDefaultImage,
  getAdjustedImageUrl,
  handleImageError as handleImageErrorUtil,
} from "@/assets/imageUtil";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();
  const [imageError, setImageError] = useState({});

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

  // Get order status with color
  const getOrderStatus = (order) => {
    // Logic đơn giản để xác định trạng thái đơn hàng
    const status = order?.status || "pending";

    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
      case "done":
        return {
          label: "Đã giao hàng",
          color: "bg-green-100 text-green-800",
          badgeColor: "bg-green-500",
          icon: <Package className="w-5 h-5" />,
        };
      case "processing":
      case "shipping":
      case "in_transit":
        return {
          label: "Đang vận chuyển",
          color: "bg-blue-100 text-blue-800",
          badgeColor: "bg-blue-500",
          icon: <Truck className="w-5 h-5" />,
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          color: "bg-red-100 text-red-800",
          badgeColor: "bg-red-500",
          icon: <Package className="w-5 h-5" />,
        };
      case "pending":
      case "waiting":
      default:
        return {
          label: "Chờ xử lý",
          color: "bg-amber-100 text-amber-800",
          badgeColor: "bg-amber-500",
          icon: <Package className="w-5 h-5" />,
        };
    }
  };

  // Xử lý ảnh lỗi
  const handleImageError = (itemId) => {
    setImageError((prev) => ({ ...prev, [itemId]: true }));
  };

  // Hàm điều chỉnh URL ảnh nếu cần
  const getAdjustedImageUrl = (image) => {
    if (!image) return null;

    console.log("Đang kiểm tra URL ảnh:", image);

    // Nếu ảnh là URL đầy đủ, trả về nguyên bản
    if (image.startsWith("http")) {
      return image;
    }

    // Nếu ảnh là đường dẫn tương đối, thêm baseURL
    const baseURL = "http://localhost:8080"; // Thay đổi thành URL API của bạn
    return `${baseURL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 pt-16">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-white/60 rounded-lg w-1/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-32 bg-white/60 rounded-lg w-full"></div>
                  <div className="h-64 bg-white/60 rounded-lg w-full"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-48 bg-white/60 rounded-lg w-full"></div>
                  <div className="h-32 bg-white/60 rounded-lg w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 pt-16">
          <div className="max-w-6xl mx-auto px-4 py-12 text-center">
            <motion.div
              className="bg-white rounded-xl shadow-md p-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center mb-6">
                <Package className="h-16 w-16 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold mb-6">
                Không tìm thấy đơn hàng
              </h2>
              <p className="text-gray-600 mb-6">
                Đơn hàng bạn tìm kiếm không tồn tại hoặc đã bị xóa.
              </p>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full px-6"
                onClick={() => navigate("/order-history")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại lịch sử đơn hàng
              </Button>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // Lấy các giá trị tính toán
  const subtotal = calculateSubtotal(order);
  const shippingFee = getShippingFee(order);
  const total = getOrderTotal(order);
  const orderStatus = getOrderStatus(order);

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
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <ImageOff className="w-6 h-6 text-gray-400" />
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
          <p className="text-emerald-600 font-semibold">
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
        const rawImage =
          item.productImage ||
          item.image ||
          (item.product
            ? item.product.image || item.product.productImage
            : null);

        // Log thông tin ảnh để debug
        console.log(`Thông tin ảnh sản phẩm "${productName}":`, rawImage);

        // Điều chỉnh URL ảnh nếu cần
        const image = getAdjustedImageUrl(rawImage, {
          baseApiUrl: "https://nongsan.online",
          fallbackId: item.id || index,
        });

        const itemId = item.id || index;
        const hasImageError = imageError[itemId];

        return (
          <motion.div
            key={index}
            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {!hasImageError && image ? (
                  <img
                    src={image}
                    alt={productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      handleImageErrorUtil(e, {
                        id: itemId,
                        imageUrl: image,
                        setErrorState: (id) => handleImageError(id),
                        apiBaseUrl: "https://nongsan.online",
                        apiImagePath: "/api/images",
                      });
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageOff className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">{productName}</p>
                <div className="flex gap-2 items-center mt-1">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                    SL: {quantity}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                    {price.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
            <p className="text-emerald-600 font-semibold">
              {(price * quantity).toLocaleString()}đ
            </p>
          </motion.div>
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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <motion.div
            className="flex items-center mb-8 gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              className="rounded-full p-2 hover:bg-white/80"
              onClick={() => navigate("/order-history")}
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
            <h2 className="text-3xl font-bold text-gray-800">
              Chi tiết đơn hàng #{order.id}
            </h2>
            <span
              className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${orderStatus.color}`}
            >
              {orderStatus.label}
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info */}
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Thông tin đơn hàng
                  </h3>
                  <div
                    className={`w-3 h-3 rounded-full ${orderStatus.badgeColor}`}
                  ></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">Mã đơn hàng</p>
                    <p className="font-medium">
                      {order.orderNumber || `#${order.id}`}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">Ngày đặt</p>
                    <p className="font-medium">
                      {formatDate(
                        order.orderDate ||
                          order.createdAt ||
                          order.createDate ||
                          order.date
                      )}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p className="font-medium flex items-center gap-1">
                      {orderStatus.icon}
                      {orderStatus.label}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">
                      Phương thức thanh toán
                    </p>
                    <p className="font-medium">
                      {getPaymentMethodName(order.paymentMethod)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Order Items */}
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  Sản phẩm
                </h3>

                <div className="space-y-4">{renderOrderItems()}</div>
              </motion.div>

              {/* Additional Notes */}
              {order.note && (
                <motion.div
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold mb-4">Ghi chú</h3>
                  <p className="text-gray-700 p-3 rounded-lg bg-gray-50 italic">
                    {order.note}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Order Summary */}
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Tóm tắt đơn hàng
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-lg bg-gray-50">
                    <span>Tạm tính:</span>
                    <span>{subtotal.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-gray-50">
                    <span>Phí vận chuyển:</span>
                    <span>{shippingFee.toLocaleString()}đ</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 font-semibold">
                      <span>Tổng cộng:</span>
                      <span className="text-emerald-600 text-xl">
                        {total.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full"
                  onClick={() => navigate("/farmhub2")}
                >
                  Tiếp tục mua sắm
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-full"
                  onClick={() => navigate("/order-history")}
                >
                  Quay lại lịch sử đơn hàng
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
