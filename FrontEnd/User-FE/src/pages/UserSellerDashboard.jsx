import { useState, useEffect } from "react";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaStore,
  FaBoxOpen,
  FaChartLine,
  FaShoppingCart,
  FaSearch,
  FaEye,
  FaSort,
  FaFilter,
  FaTags,
  FaTag,
  FaPercent,
  FaBell,
  FaClipboardList,
} from "react-icons/fa";
import { formatDistance } from "date-fns";
import { vi } from "date-fns/locale";

const UserSellerDashboard = () => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeSales: 0,
    views: 0,
    orders: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        setLoading(true);
        console.log("Auth object:", auth);
        console.log("User ID:", auth?.user?.id);

        // Sử dụng auth.user.id thay vì auth.userId
        const userId = auth?.user?.id;

        if (!userId) {
          console.error("Không tìm thấy ID người dùng trong auth object");
          setLoading(false);
          return;
        }

        console.log("Gọi API với userId:", userId);
        const response = await axiosPrivate.get(`/marketplace/user/${userId}`);
        console.log("Kết quả API sản phẩm:", response.data);

        const products = response.data.content || [];
        setProducts(products);

        // Lấy số lượng đơn hàng của người bán bằng API chính thức
        let orderCount = 0;
        try {
          // Gọi API lấy đơn hàng người bán với pagination để tối ưu hiệu suất
          const orderResponse = await axiosPrivate.get("/orders/seller", {
            params: { page: 0, size: 100 }, // Lấy tối đa 100 đơn hàng mới nhất
          });
          console.log("Kết quả API đơn hàng người bán:", orderResponse.data);

          // Lấy số lượng đơn hàng từ API trả về
          if (orderResponse.data && orderResponse.data.content) {
            orderCount =
              orderResponse.data.totalElements ||
              orderResponse.data.content.length;
          }

          console.log("Số đơn hàng của người bán:", orderCount);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin đơn hàng người bán:", error);
        }

        // Thêm đoạn code lấy số đơn hàng đang chờ xác nhận
        try {
          const pendingOrdersResponse = await axiosPrivate.get(
            "/orders/seller/status",
            {
              params: { status: "PENDING", page: 0, size: 1 },
            }
          );

          if (
            pendingOrdersResponse.data &&
            pendingOrdersResponse.data.totalElements
          ) {
            setPendingOrders(pendingOrdersResponse.data.totalElements);
          }
        } catch (error) {
          console.error("Error fetching pending orders:", error);
        }

        // Calculate stats
        const productCount = products.length;
        const activeSales = products.filter((p) => p.onSale).length;
        const totalViews = products.reduce(
          (sum, p) => sum + (p.viewCount || 0),
          0
        );

        setStats({
          totalProducts: productCount,
          activeSales: activeSales,
          views: totalViews,
          orders: orderCount, // Sử dụng số đơn hàng thực tế từ API
        });
      } catch (error) {
        console.error("Error fetching user products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProducts();
  }, [axiosPrivate, auth]);

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await axiosPrivate.delete(`/marketplace/delete/${id}`);
        setProducts(products.filter((p) => p.id !== id));
        alert("Sản phẩm đã được xóa thành công!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Có lỗi xảy ra khi xóa sản phẩm!");
      }
    }
  };

  // Lọc sản phẩm theo tìm kiếm và bộ lọc
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "in_stock")
      return matchesSearch && product.stockStatus === "IN_STOCK";
    if (selectedFilter === "low_stock")
      return matchesSearch && product.stockStatus === "LOW_STOCK";
    if (selectedFilter === "out_of_stock")
      return matchesSearch && product.stockStatus === "OUT_OF_STOCK";
    if (selectedFilter === "on_sale") return matchesSearch && product.onSale;

    return matchesSearch;
  });

  const StatCard = ({
    icon,
    title,
    value,
    bgColor,
    textColor,
    iconBgColor,
  }) => (
    <div
      className={`relative overflow-hidden rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl ${bgColor}`}
    >
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20 bg-white"></div>
      <div
        className={`${iconBgColor} p-3 rounded-xl shadow-md inline-block mb-4`}
      >
        {icon}
      </div>
      <h3 className={`text-sm font-medium ${textColor} mb-1 opacity-80`}>
        {title}
      </h3>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );

  const FilterButton = ({ value, label, icon }) => (
    <button
      onClick={() => setSelectedFilter(value)}
      className={`px-3 py-2 rounded-lg flex items-center transition-all text-sm ${
        selectedFilter === value
          ? "bg-green-600 text-white font-medium shadow-md"
          : "bg-white text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="ml-1">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 mt-16 flex-grow">
        {/* Header section with gradient background */}
        <div className="relative mb-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg overflow-hidden">
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
                <FaStore className="mr-3" /> Quản lý sản phẩm
              </h1>
              <p className="text-green-100 mt-1">
                Quản lý và theo dõi danh sách sản phẩm của bạn
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link
                to="/seller/orders"
                className="bg-white text-green-600 py-2 px-4 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 relative"
              >
                <FaClipboardList className="mr-2" /> Quản lý đơn hàng
                {pendingOrders > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingOrders}
                  </span>
                )}
              </Link>
              <button
                onClick={() => navigate("/seller/add-product")}
                className="bg-white text-green-600 py-2 px-4 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <FaPlus className="mr-2" /> Thêm sản phẩm mới
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FaBoxOpen className="text-2xl text-green-600" />}
            title="Tổng số sản phẩm"
            value={stats.totalProducts}
            bgColor="bg-white"
            textColor="text-gray-800"
            iconBgColor="bg-green-100"
          />
          <Link
            to="/seller/orders"
            className="transition-transform hover:-translate-y-1"
          >
            <StatCard
              icon={<FaShoppingCart className="text-2xl text-blue-600" />}
              title="Đơn hàng"
              value={stats.orders}
              bgColor="bg-white"
              textColor="text-gray-800"
              iconBgColor="bg-blue-100"
            />
          </Link>
          <StatCard
            icon={<FaEye className="text-2xl text-purple-600" />}
            title="Lượt xem"
            value={stats.views}
            bgColor="bg-white"
            textColor="text-gray-800"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            icon={<FaPercent className="text-2xl text-orange-600" />}
            title="Khuyến mãi hoạt động"
            value={stats.activeSales}
            bgColor="bg-white"
            textColor="text-gray-800"
            iconBgColor="bg-orange-100"
          />
        </div>

        {/* Thêm thẻ thông báo đơn hàng chờ xử lý nếu có */}
        {pendingOrders > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <FaBell className="text-yellow-500 mr-3" />
              <div>
                <p className="font-medium text-yellow-700">
                  Bạn có {pendingOrders} đơn hàng đang chờ xác nhận
                </p>
                <p className="text-sm text-yellow-600">
                  Vui lòng xem và xác nhận đơn hàng mới để giao cho khách hàng.
                  <Link
                    to="/seller/orders"
                    className="ml-1 font-medium underline"
                  >
                    Xem ngay
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Product List Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-all duration-300 hover:shadow-lg">
          <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">
              Danh sách sản phẩm
            </h2>

            {/* Search and filter controls */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
                <FilterButton
                  value="all"
                  label="Tất cả"
                  icon={<FaFilter className="mr-1" />}
                />
                <FilterButton
                  value="in_stock"
                  label="Còn hàng"
                  icon={<FaTag className="mr-1 text-green-500" />}
                />
                <FilterButton
                  value="low_stock"
                  label="Sắp hết"
                  icon={<FaTag className="mr-1 text-yellow-500" />}
                />
                <FilterButton
                  value="out_of_stock"
                  label="Hết hàng"
                  icon={<FaTag className="mr-1 text-red-500" />}
                />
                <FilterButton
                  value="on_sale"
                  label="Khuyến mãi"
                  icon={<FaTags className="mr-1 text-purple-500" />}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-6 text-gray-600">Đang tải dữ liệu sản phẩm...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center">
              {searchTerm ? (
                <>
                  <div className="text-gray-400 mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                    <FaSearch className="text-2xl" />
                  </div>
                  <p className="text-gray-500 mb-2">
                    Không tìm thấy sản phẩm "{searchTerm}"
                  </p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-green-600 hover:underline"
                  >
                    Xóa tìm kiếm
                  </button>
                </>
              ) : (
                <>
                  <div className="text-gray-400 mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                    <FaStore className="text-2xl" />
                  </div>
                  <p className="text-gray-500 mb-4">
                    Bạn chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!
                  </p>
                  <button
                    onClick={() => navigate("/seller/add-product")}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg flex items-center mx-auto"
                  >
                    <FaPlus className="mr-2" /> Thêm sản phẩm
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left border-b border-gray-200">
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Cập nhật
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                            <img
                              src={
                                product.imageUrl ||
                                "https://via.placeholder.com/40"
                              }
                              alt={product.productName}
                              className="h-full w-full object-cover transition-all duration-500 hover:scale-110"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 hover:text-green-600 cursor-pointer">
                              {product.productName}
                            </div>
                            {product.shortDescription && (
                              <div className="text-xs text-gray-500 max-w-xs truncate">
                                {product.shortDescription}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {product.onSale ? (
                          <div>
                            <span className="text-gray-500 line-through text-xs block">
                              {product.price?.toLocaleString()}đ
                            </span>
                            <span className="text-red-500 font-medium">
                              {product.salePrice?.toLocaleString()}đ
                            </span>
                            <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                              -
                              {Math.round(
                                ((product.price - product.salePrice) /
                                  product.price) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-700 font-medium">
                            {product.price?.toLocaleString()}đ
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-700 font-medium">
                        {product.quantity}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                            product.stockStatus === "IN_STOCK"
                              ? "bg-green-100 text-green-800"
                              : product.stockStatus === "LOW_STOCK"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-1 ${
                              product.stockStatus === "IN_STOCK"
                                ? "bg-green-500"
                                : product.stockStatus === "LOW_STOCK"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></span>
                          {product.stockStatus === "IN_STOCK"
                            ? "Còn hàng"
                            : product.stockStatus === "LOW_STOCK"
                            ? "Sắp hết hàng"
                            : "Hết hàng"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {product.updatedAt &&
                          formatDistance(
                            new Date(product.updatedAt),
                            new Date(),
                            { addSuffix: true, locale: vi }
                          )}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-3">
                          <button
                            onClick={() =>
                              navigate(`/seller/edit-product/${product.id}`)
                            }
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserSellerDashboard;
