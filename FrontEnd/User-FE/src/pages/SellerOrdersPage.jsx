import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { formatDistance, format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FaBoxOpen,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaEye,
  FaAngleDown,
  FaAngleUp,
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCreditCard,
  FaShoppingBag,
} from "react-icons/fa";
import { toast } from "react-toastify";

const SellerOrdersPage = () => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        setLoading(true);
        // Ghi log người dùng hiện tại để debug
        console.log("Auth user hiện tại:", auth?.user);
        console.log("ID người bán (seller):", auth?.user?.id);

        const response = await axiosPrivate.get("/orders/seller", {
          params: { page: 0, size: 100 }, // Lấy tối đa 100 đơn hàng gần nhất
        });

        console.log("Kết quả API đơn hàng người bán:", response.data);

        if (response.data && response.data.content) {
          console.log("Danh sách đơn hàng:", response.data.content);
          setOrders(response.data.content);
        } else {
          console.log("Không có dữ liệu đơn hàng hoặc định dạng không đúng");
        }
      } catch (error) {
        console.error(
          "Chi tiết lỗi khi lấy đơn hàng:",
          error.response || error
        );
        toast.error("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, [axiosPrivate, auth]);

  // Xử lý xác nhận đơn hàng
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axiosPrivate.put(
        `/orders/${orderId}/status`,
        null,
        {
          params: { status: newStatus },
        }
      );

      if (response.status === 200) {
        toast.success(`Đơn hàng #${orderId} đã được cập nhật thành công`);

        // Cập nhật trạng thái đơn hàng trong state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(
        "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau."
      );
    }
  };

  // Lọc đơn hàng theo trạng thái và tìm kiếm
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      (order.orderNumber &&
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.buyerName &&
        order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Hiển thị badge trạng thái đơn hàng
  const OrderStatusBadge = ({ status }) => {
    let badgeClasses =
      "px-3 py-1 rounded-full text-xs font-medium inline-flex items-center";
    let statusText = "";
    let icon = null;

    switch (status) {
      case "PENDING":
        badgeClasses += " bg-yellow-100 text-yellow-800";
        statusText = "Chờ xác nhận";
        icon = <FaFilter className="mr-1" />;
        break;
      case "PROCESSING":
        badgeClasses += " bg-blue-100 text-blue-800";
        statusText = "Đang xử lý";
        icon = <FaBoxOpen className="mr-1" />;
        break;
      case "SHIPPING":
        badgeClasses += " bg-purple-100 text-purple-800";
        statusText = "Đang giao hàng";
        icon = <FaTruck className="mr-1" />;
        break;
      case "COMPLETED":
        badgeClasses += " bg-green-100 text-green-800";
        statusText = "Hoàn thành";
        icon = <FaCheckCircle className="mr-1" />;
        break;
      case "CANCELLED":
        badgeClasses += " bg-red-100 text-red-800";
        statusText = "Đã hủy";
        icon = <FaTimesCircle className="mr-1" />;
        break;
      default:
        badgeClasses += " bg-gray-100 text-gray-800";
        statusText = status || "Unknown";
        icon = <FaFilter className="mr-1" />;
    }

    return (
      <span className={badgeClasses}>
        {icon} {statusText}
      </span>
    );
  };

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString || "N/A";
    }
  };

  // Component nút lọc
  const FilterButton = ({ value, label, icon, count }) => (
    <button
      onClick={() => setFilterStatus(value)}
      className={`px-3 py-2 rounded-lg flex items-center transition-all text-sm ${
        filterStatus === value
          ? "bg-blue-600 text-white font-medium shadow-md"
          : "bg-white text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="ml-1">{label}</span>
      {count !== undefined && (
        <span
          className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
            filterStatus === value
              ? "bg-white text-blue-600"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  // Đếm số lượng đơn hàng theo trạng thái
  const countOrdersByStatus = (status) => {
    return status === "all"
      ? orders.length
      : orders.filter((order) => order.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 mt-16 flex-grow">
        {/* Header section with gradient background */}
        <div className="relative mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg
              className="h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
            </svg>
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
          </div>

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <FaShoppingBag className="mr-3" /> Quản lý đơn hàng
              </h1>
              <p className="text-blue-100 mt-1">
                Quản lý và xử lý các đơn hàng từ khách hàng
              </p>
            </div>
          </div>
        </div>

        {/* Search and filter section */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Tìm đơn hàng hoặc người mua..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <FilterButton
                value="all"
                label="Tất cả"
                icon={<FaFilter className="mr-1" />}
                count={countOrdersByStatus("all")}
              />
              <FilterButton
                value="PENDING"
                label="Chờ xác nhận"
                icon={<FaFilter className="mr-1 text-yellow-500" />}
                count={countOrdersByStatus("PENDING")}
              />
              <FilterButton
                value="PROCESSING"
                label="Đang xử lý"
                icon={<FaBoxOpen className="mr-1 text-blue-500" />}
                count={countOrdersByStatus("PROCESSING")}
              />
              <FilterButton
                value="SHIPPING"
                label="Đang giao"
                icon={<FaTruck className="mr-1 text-purple-500" />}
                count={countOrdersByStatus("SHIPPING")}
              />
              <FilterButton
                value="COMPLETED"
                label="Hoàn thành"
                icon={<FaCheckCircle className="mr-1 text-green-500" />}
                count={countOrdersByStatus("COMPLETED")}
              />
              <FilterButton
                value="CANCELLED"
                label="Đã hủy"
                icon={<FaTimesCircle className="mr-1 text-red-500" />}
                count={countOrdersByStatus("CANCELLED")}
              />
            </div>
          </div>
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-6 text-gray-600">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center">
            <div className="text-gray-400 mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-gray-100 mb-4">
              <FaShoppingBag className="text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Không có đơn hàng nào
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? `Không tìm thấy đơn hàng phù hợp với "${searchTerm}"`
                : filterStatus !== "all"
                ? "Không có đơn hàng nào ở trạng thái này"
                : "Bạn chưa có đơn hàng nào"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:underline"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                {/* Order header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <span className="text-sm text-gray-500">
                        Mã đơn hàng:
                      </span>
                      <span className="font-semibold">
                        {order.orderNumber || `#${order.id}`}
                      </span>
                      <span className="hidden md:inline text-gray-300">|</span>
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-gray-400 mr-1" />
                        <span className="text-sm">
                          {formatDate(order.orderDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <button
                        onClick={() =>
                          setExpandedOrderId(
                            expandedOrderId === order.id ? null : order.id
                          )
                        }
                        className="text-blue-600 hover:bg-blue-50 rounded-full p-1"
                      >
                        {expandedOrderId === order.id ? (
                          <FaAngleUp />
                        ) : (
                          <FaAngleDown />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order details (expandable) */}
                {expandedOrderId === order.id && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Customer Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                          <FaUser className="mr-2 text-blue-500" /> Thông tin
                          người mua
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-500">Tên:</span>{" "}
                            {order.buyerName || "N/A"}
                          </p>
                          <p>
                            <span className="text-gray-500">SĐT:</span>{" "}
                            {order.shippingPhone || "N/A"}
                          </p>
                          <div className="flex items-start">
                            <span className="text-gray-500 mr-1">Địa chỉ:</span>
                            <span>{order.shippingAddress || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                          <FaCreditCard className="mr-2 text-green-500" /> Thông
                          tin thanh toán
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-500">Phương thức:</span>
                            {order.paymentMethod === "COD"
                              ? " Thanh toán khi nhận hàng"
                              : order.paymentMethod || "N/A"}
                          </p>
                          <p>
                            <span className="text-gray-500">Trạng thái:</span>
                            <span
                              className={
                                order.paymentStatus === "PAID"
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }
                            >
                              {" "}
                              {order.paymentStatus === "PAID"
                                ? "Đã thanh toán"
                                : "Chưa thanh toán"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500">Tổng tiền:</span>{" "}
                            {order.totalAmount?.toLocaleString()}đ
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-700 mb-2">
                          Thao tác
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {order.status === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(
                                    order.id,
                                    "PROCESSING"
                                  )
                                }
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm flex items-center"
                              >
                                <FaCheckCircle className="mr-1" /> Xác nhận
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "CANCELLED")
                                }
                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm flex items-center"
                              >
                                <FaTimesCircle className="mr-1" /> Hủy đơn
                              </button>
                            </>
                          )}
                          {order.status === "PROCESSING" && (
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "SHIPPING")
                              }
                              className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm flex items-center"
                            >
                              <FaTruck className="mr-1" /> Giao hàng
                            </button>
                          )}
                          {order.status === "SHIPPING" && (
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "COMPLETED")
                              }
                              className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm flex items-center"
                            >
                              <FaCheckCircle className="mr-1" /> Hoàn thành
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-700 mb-2">
                        Sản phẩm
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sản phẩm
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Giá
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Số lượng
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thành tiền
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {order.orderDetails?.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center">
                                    <img
                                      src={
                                        item.productImage ||
                                        "https://via.placeholder.com/40"
                                      }
                                      alt={item.productName}
                                      className="w-10 h-10 object-cover rounded mr-3"
                                    />
                                    <span className="font-medium text-sm">
                                      {item.productName}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {item.price?.toLocaleString()}đ
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium">
                                  {(
                                    item.price * item.quantity
                                  )?.toLocaleString()}
                                  đ
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td
                                colSpan="3"
                                className="px-4 py-2 text-right font-medium"
                              >
                                Tổng tiền:
                              </td>
                              <td className="px-4 py-2 font-bold text-blue-600">
                                {order.totalAmount?.toLocaleString()}đ
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SellerOrdersPage;
