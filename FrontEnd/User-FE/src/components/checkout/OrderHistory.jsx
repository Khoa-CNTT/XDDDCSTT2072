import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layout/Header";
import { Button } from "@/components/ui/button";
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
        <div className="max-w-6xl mx-auto mt-28 px-4 py-8">
          <h2 className="text-2xl font-bold mb-8">Lịch sử đơn hàng</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto mt-28 px-4 py-8">
        <h2 className="text-2xl font-bold mb-8">Lịch sử đơn hàng</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/farmhub2")}
            >
              Mua sắm ngay
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(
                          order.orderDate ||
                            order.createdAt ||
                            order.createDate ||
                            order.order_date ||
                            order.date ||
                            order.created_at
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-red-600 font-medium">
                          {(() => {
                            // Tính tổng trực tiếp từ subtotal và shippingFee
                            const subtotal = order.subtotal
                              ? Number(order.subtotal)
                              : 0;
                            const shippingFee = order.shippingFee
                              ? Number(order.shippingFee)
                              : 0;
                            const total = subtotal + shippingFee;

                            console.log(
                              `Order ${order.id}: subtotal=${subtotal}, shipping=${shippingFee}, total=${total}`
                            );

                            return total.toLocaleString();
                          })()}
                          đ
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="outline"
                          className="text-sm"
                          onClick={() => navigate(`/order/${order.id}`)}
                        >
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderHistory;
