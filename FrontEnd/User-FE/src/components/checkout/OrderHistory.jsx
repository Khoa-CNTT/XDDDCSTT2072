import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layout/Header";
import { Button } from "@/components/ui/button";
import { EyeIcon, ShoppingBagIcon, PackageOpen, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-toastify";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

const OrderHistory = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  // Kiểm tra đăng nhập ngay khi vào trang lịch sử đơn hàng
  useEffect(() => {
    if (!auth?.accessToken) {
      toast.info("Vui lòng đăng nhập để xem lịch sử đơn hàng");
      navigate("/account/login", {
        state: { from: { pathname: "/order-history" } },
      });
      return;
    }
  }, [auth, navigate]);

  // Lấy đơn hàng từ API thay vì localStorage
  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth?.accessToken || !auth?.user?.id) return;

      setIsLoading(true);
      try {
        // Gọi API để lấy đơn hàng của người dùng hiện tại
        const response = await axiosPrivate.get(`/orders/history/buyer`);
        if (response.data && response.data.success) {
          console.log("Đơn hàng từ API (raw):", response.data);

          // Chuyển đổi dữ liệu từ map (grouped by status) thành mảng đơn hàng
          let allOrders = [];
          const ordersByStatus = response.data.data;

          // Log chi tiết về cấu trúc dữ liệu
          console.log("API response structure:", {
            hasData: !!response.data,
            dataType: typeof response.data.data,
            statusKeys: ordersByStatus ? Object.keys(ordersByStatus) : [],
          });

          // Lặp qua từng trạng thái và thu thập đơn hàng
          if (ordersByStatus) {
            Object.entries(ordersByStatus).forEach(([status, orders]) => {
              console.log(`Đơn hàng với trạng thái ${status}:`, orders);
              if (Array.isArray(orders)) {
                // Log mẫu đơn hàng đầu tiên nếu có
                if (orders.length > 0) {
                  console.log(`Chi tiết đơn hàng ${status} mẫu:`, {
                    id: orders[0].id,
                    subtotal: orders[0].subtotal,
                    shippingFee: orders[0].shippingFee,
                    shipping_fee: orders[0].shipping_fee,
                    totalAmount: orders[0].totalAmount,
                    allFields: Object.keys(orders[0]),
                  });
                }

                allOrders = [...allOrders, ...orders];
              }
            });
          }

          console.log("Đơn hàng đã chuyển đổi:", allOrders);

          // Sắp xếp đơn hàng mới nhất lên đầu (dựa trên ngày hoặc ID)
          allOrders.sort((a, b) => {
            // Ưu tiên sắp xếp theo ngày đặt hàng nếu có
            const dateA =
              a.orderDate ||
              a.createdAt ||
              a.createDate ||
              a.order_date ||
              a.date ||
              a.created_at;
            const dateB =
              b.orderDate ||
              b.createdAt ||
              b.createDate ||
              b.order_date ||
              b.date ||
              b.created_at;

            if (dateA && dateB) {
              // Chuyển đổi sang Date để so sánh
              const timeA = new Date(dateA).getTime();
              const timeB = new Date(dateB).getTime();

              if (!isNaN(timeA) && !isNaN(timeB)) {
                return timeB - timeA; // Sắp xếp giảm dần (mới nhất lên đầu)
              }
            }

            // Nếu không có ngày hoặc không thể so sánh ngày, sắp xếp theo ID giảm dần
            return b.id - a.id;
          });

          console.log("Đơn hàng sau khi sắp xếp:", allOrders);
          setOrders(allOrders || []);
        } else {
          // Fallback: Thử lấy từ localStorage nếu API không thành công
          const storedOrders = JSON.parse(
            localStorage.getItem("orders") || "[]"
          );
          console.log("Đơn hàng từ localStorage:", storedOrders);

          // Chỉ lọc những đơn hàng của người dùng hiện tại
          const userOrders = storedOrders.filter((order) => {
            return (
              order.buyerId === auth.user.id ||
              order.userId === auth.user.id ||
              order.buyer_id === auth.user.id
            );
          });

          console.log("Đơn hàng của người dùng:", userOrders);
          setOrders(userOrders);
        }
      } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
        // Fallback: Vẫn thử lấy từ localStorage nếu API gặp lỗi
        try {
          const storedOrders = JSON.parse(
            localStorage.getItem("orders") || "[]"
          );
          const userOrders = storedOrders.filter((order) => {
            return (
              order.buyerId === auth.user.id ||
              order.userId === auth.user.id ||
              order.buyer_id === auth.user.id
            );
          });
          setOrders(userOrders);
        } catch (err) {
          console.error("Lỗi khi đọc từ localStorage:", err);
          setOrders([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [auth?.user?.id, auth?.accessToken, axiosPrivate]);

  // Format date - Sửa lỗi Invalid Date
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

      // Xử lý chuỗi ISO 8601 (YYYY-MM-DDTHH:mm:ss)
      if (typeof dateString === "string" && dateString.includes("T")) {
        const date = new Date(dateString);

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

      // Xử lý định dạng ISO 8601 cơ bản (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        const date = new Date(dateString);

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

      // Xử lý định dạng châu Âu (DD/MM/YYYY)
      if (/^\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
        const parts = dateString.split("/");
        const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);

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

      // Thử chuyển đổi chuỗi bất kỳ
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      console.log("Không thể định dạng ngày:", dateString);
      return "N/A"; // Ngày không hợp lệ
    } catch (err) {
      console.error("Lỗi khi định dạng ngày:", err, dateString);
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 pt-16">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex items-center mb-8 gap-3">
              <ShoppingBagIcon className="h-7 w-7 text-emerald-600" />
              <h2 className="text-3xl font-bold text-gray-800">
                Lịch sử đơn hàng
              </h2>
            </div>

            <div className="animate-pulse space-y-6">
              <div className="h-20 bg-white/60 rounded-xl w-full"></div>
              <div className="h-20 bg-white/60 rounded-xl w-full"></div>
              <div className="h-20 bg-white/60 rounded-xl w-full"></div>
              <div className="h-20 bg-white/60 rounded-xl w-full"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

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
            <ShoppingBagIcon className="h-7 w-7 text-emerald-600" />
            <h2 className="text-3xl font-bold text-gray-800">
              Lịch sử đơn hàng
            </h2>
          </motion.div>

          {orders.length === 0 ? (
            <motion.div
              className="bg-white rounded-xl shadow-md p-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center mb-6">
                <PackageOpen className="h-16 w-16 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                Chưa có đơn hàng nào
              </h3>
              <p className="text-gray-500 mb-6">
                Bạn chưa thực hiện đơn hàng nào. Hãy khám phá các sản phẩm của
                chúng tôi.
              </p>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full px-6"
                onClick={() => navigate("/farmhub2")}
              >
                Mua sắm ngay
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => {
                const total = (() => {
                  // Tính tổng trực tiếp từ subtotal và shippingFee
                  const subtotal = order.subtotal ? Number(order.subtotal) : 0;
                  const shippingFee = order.shippingFee
                    ? Number(order.shippingFee)
                    : 0;
                  return subtotal + shippingFee;
                })();

                return (
                  <motion.div
                    key={order.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-semibold text-gray-800">
                            Đơn hàng #{order.id}
                          </span>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {formatDate(
                              order.orderDate ||
                                order.createdAt ||
                                order.createDate ||
                                order.order_date ||
                                order.date ||
                                order.created_at
                            )}
                          </div>
                        </div>
                        <div className="text-xl font-bold text-emerald-600">
                          {total.toLocaleString()}đ
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="rounded-full border-emerald-200 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors group-hover:bg-emerald-50"
                        onClick={() => navigate(`/order/${order.id}`)}
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderHistory;
