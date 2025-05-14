import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "@/layout/Header";
import { Button } from "@/components/ui/button";
import Loading from "@/components/shared/Loading";
import { useCartActions } from "@/hooks/useCartActions";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { getProductById } from "@/services/productService";
import { createPayment } from "../services/PaymentService";
import { createOrder } from "../services/OrderService";

// Mock data cho địa chỉ
const MOCK_ADDRESSES = [
  {
    id: 1,
    recipientName: "Lâm Quang Bách",
    phone: "0123456789",
    streetAddress: "Kiệt 4",
    ward: "Cẩm Toại Trung",
    district: "xã Hoà Vang",
    province: "TP. Đà Nẵng",
    isDefault: true,
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  // Kiểm tra đăng nhập ngay khi vào trang thanh toán
  useEffect(() => {
    if (!auth?.accessToken) {
      toast.info("Vui lòng đăng nhập để tiến hành thanh toán");
      navigate("/account/login", {
        state: { from: { pathname: "/checkout" } },
      });
      return;
    }
  }, [auth, navigate]);

  // Kiểm tra xem có phải đang mua ngay không
  const isBuyNow = location?.state?.fromBuyNow || false;
  const buyNowProductId = location?.state?.productId || null;
  const buyNowQuantity = location?.state?.quantity || 1;

  // State để lưu trữ thông tin sản phẩm mua ngay
  const [buyNowProduct, setBuyNowProduct] = useState(null);

  // Fetch dữ liệu sản phẩm nếu đang mua ngay
  useEffect(() => {
    const fetchBuyNowProduct = async () => {
      if (isBuyNow && buyNowProductId) {
        try {
          const productData = await getProductById(
            axiosPrivate,
            buyNowProductId
          );
          setBuyNowProduct({
            id: productData.id,
            productId: productData.id,
            productName: productData.productName,
            imageUrl: productData.imageUrl,
            quantity: buyNowQuantity,
            unitPrice: productData.onSale
              ? productData.salePrice
              : productData.price,
          });
        } catch (error) {
          console.error("Lỗi khi tải thông tin sản phẩm mua ngay:", error);
          toast.error("Không thể tải thông tin sản phẩm mua ngay");
          navigate("/farmhub2");
        }
      }
    };

    fetchBuyNowProduct();
  }, [isBuyNow, buyNowProductId, buyNowQuantity]);

  // Kiểm tra xem có phải đang mua từ giỏ hàng với sản phẩm đã chọn không
  const selectedCartItems = location?.state?.selectedItems || [];
  const isFromCart = location?.state?.fromCart || false;
  // Lấy thông tin mã giảm giá từ giỏ hàng
  const couponFromCart = location?.state?.couponCode || null;
  const discountFromCart = location?.state?.discount || 0;

  // Lấy dữ liệu giỏ hàng nếu không phải mua ngay và không phải từ sản phẩm đã chọn
  const { getCartQuery } = useCartActions();
  const { data: cart, isLoading: isCartLoading } =
    !isBuyNow && !isFromCart ? getCartQuery : { data: null, isLoading: false };

  // Danh sách sản phẩm (từ mua ngay hoặc giỏ hàng hoặc sản phẩm đã chọn)
  const cartItems = isFromCart
    ? selectedCartItems
    : isBuyNow && buyNowProduct
    ? [buyNowProduct]
    : cart?.cartItems || [];

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // State cho việc thêm địa chỉ mới
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: "",
    phone: "",
    streetAddress: "",
    ward: "",
    district: "",
    province: "",
    isDefault: false,
  });

  // Địa chỉ - sử dụng mock data
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);

  // Tự động chọn địa chỉ đầu tiên
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      // Tìm địa chỉ mặc định
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      } else {
        // Nếu không có địa chỉ mặc định, chọn địa chỉ đầu tiên
        setSelectedAddress(addresses[0].id);
      }
    }
  }, [addresses, selectedAddress]);

  // Xử lý khi thay đổi phương thức thanh toán
  useEffect(() => {
    // Ẩn QR khi chuyển sang COD
    if (paymentMethod === "COD") {
      // Không cần làm gì - QR đã được loại bỏ
    }
  }, [paymentMethod]);

  // Tính toán đơn hàng
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1),
    0
  );
  const shipping = 30000; // Phí vận chuyển cố định
  // Tính toán tổng tiền sau khi áp dụng giảm giá
  const total =
    isFromCart && discountFromCart > 0
      ? subtotal + shipping - discountFromCart
      : subtotal + shipping;

  // Xử lý thay đổi trường trong form địa chỉ mới
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Xử lý thêm địa chỉ mới
  const handleAddAddress = (e) => {
    e.preventDefault();

    // Kiểm tra thông tin bắt buộc
    if (
      !newAddress.recipientName ||
      !newAddress.phone ||
      !newAddress.streetAddress ||
      !newAddress.ward ||
      !newAddress.province
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }

    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(newAddress.phone)) {
      toast.error(
        "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 số)"
      );
      return;
    }

    // Tạo ID cho địa chỉ mới
    const newId =
      addresses.length > 0
        ? Math.max(...addresses.map((addr) => addr.id)) + 1
        : 1;

    // Nếu địa chỉ mới là mặc định, cập nhật tất cả địa chỉ khác
    let updatedAddresses = [...addresses];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((addr) => ({
        ...addr,
        isDefault: false,
      }));
    }

    // Thêm địa chỉ mới vào danh sách
    const addressToAdd = {
      ...newAddress,
      id: newId,
    };

    updatedAddresses.push(addressToAdd);
    setAddresses(updatedAddresses);

    // Nếu là địa chỉ đầu tiên hoặc là địa chỉ mặc định, chọn địa chỉ này
    if (updatedAddresses.length === 1 || newAddress.isDefault) {
      setSelectedAddress(newId);
    }

    // Reset form và đóng form
    setNewAddress({
      recipientName: "",
      phone: "",
      streetAddress: "",
      ward: "",
      district: "",
      province: "",
      isDefault: false,
    });
    setShowAddressForm(false);

    toast.success("Thêm địa chỉ mới thành công");
  };

  // Xử lý đặt hàng
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Không có sản phẩm nào để thanh toán");
      return;
    }

    setIsProcessing(true);

    try {
      // Chuẩn bị dữ liệu đơn hàng để gửi lên server
      const orderRequest = {
        orderDate: new Date().toISOString(),
        totalAmount: total,
        status: "PENDING",
        orderDetails: cartItems.map((item) => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          price: item.unitPrice || 0,
          originalPrice: item.originalPrice || item.unitPrice || 0,
          discountAmount: item.discountAmount || 0,
          totalPrice: (item.unitPrice || 0) * (item.quantity || 1),
          productName: item.productName || "Sản phẩm",
          productImage: item.productImage || item.imageUrl || "",
          status: "PENDING",
        })),
        // Dữ liệu địa chỉ giao hàng - gửi dưới dạng chuỗi thay vì đối tượng
        shippingName: addresses.find((addr) => addr.id === selectedAddress)
          .recipientName,
        shippingPhone: addresses.find((addr) => addr.id === selectedAddress)
          .phone,
        shippingAddress: `${
          addresses.find((addr) => addr.id === selectedAddress).streetAddress
        }, ${addresses.find((addr) => addr.id === selectedAddress).ward}, ${
          addresses.find((addr) => addr.id === selectedAddress).district || ""
        }, ${
          addresses.find((addr) => addr.id === selectedAddress).province
        }`.replace(/, ,/g, ","), // Xóa dấu phẩy dư thừa nếu không có quận/huyện
        notes: note,
        couponCode: couponFromCart || "",
        paymentMethod: paymentMethod,
        shippingFee: shipping,
        discountAmount: discountFromCart,
      };

      console.log("Đang gửi đơn hàng đến server:", orderRequest);
      console.log("Thông tin chi tiết sản phẩm:", orderRequest.orderDetails);

      // Gọi API để tạo đơn hàng trong database
      let orderId;
      let savedOrderData;

      try {
        // Dùng service createOrder để tạo đơn hàng trong database
        const orderResponse = await createOrder(axiosPrivate, orderRequest);
        console.log("Tạo đơn hàng thành công:", orderResponse);

        if (orderResponse && orderResponse.data) {
          // Lấy ID đơn hàng mới tạo từ response
          orderId = orderResponse.data.id;
          savedOrderData = orderResponse.data;

          console.log("Đơn hàng đã được lưu vào database với ID:", orderId);
        } else {
          throw new Error("Không nhận được ID đơn hàng từ server");
        }
      } catch (error) {
        console.error("Lỗi khi tạo đơn hàng trong database:", error);

        // Không dùng ID ngẫu nhiên nữa - thông báo lỗi rõ ràng và dừng quá trình
        toast.error("Không thể tạo đơn hàng. Vui lòng thử lại sau.");
        setIsProcessing(false);
        return; // Dừng quá trình ngay lập tức nếu không tạo được đơn hàng
      }

      // Cập nhật thông tin đơn hàng với ID đã có
      const orderData = {
        ...savedOrderData,
        id: orderId,
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
        shippingAddress: addresses.find((addr) => addr.id === selectedAddress),
      };

      // Xử lý theo phương thức thanh toán
      if (paymentMethod === "VNPAY") {
        // Tạo yêu cầu thanh toán qua VNPAY
        const paymentRequest = {
          orderId: orderId,
          amount: total,
          description: `Thanh toán đơn hàng #${orderId}`,
          paymentMethod: "VNPAY",
        };

        console.log("Gửi yêu cầu thanh toán VNPAY:", paymentRequest);

        // Hiển thị loading
        toast.loading("Đang kết nối đến cổng thanh toán...");

        try {
          // Gọi API backend để tạo URL thanh toán
          const response = await createPayment(axiosPrivate, paymentRequest);

          if (response && response.paymentUrl) {
            // Lưu đơn hàng vào localStorage trước khi chuyển hướng
            const existingOrders = JSON.parse(
              localStorage.getItem("orders") || "[]"
            );
            existingOrders.unshift(orderData);
            localStorage.setItem("orders", JSON.stringify(existingOrders));

            // Chuyển hướng đến trang thanh toán của VNPAY
            console.log(
              "Chuyển hướng đến cổng thanh toán VNPAY:",
              response.paymentUrl
            );
            window.location.href = response.paymentUrl;
          } else {
            toast.dismiss();
            toast.error("Không thể tạo URL thanh toán");
            setIsProcessing(false);
          }
        } catch (error) {
          toast.dismiss();
          console.error("Chi tiết lỗi thanh toán:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Có lỗi xảy ra khi tạo URL thanh toán";
          toast.error(errorMessage);
          setIsProcessing(false);
        }

        return; // Không thực hiện các bước tiếp theo
      } else if (paymentMethod === "MOMO") {
        // Xử lý tương tự cho MoMo (sẽ thực hiện sau)
        // Lưu đơn hàng vào localStorage
        const existingOrders = JSON.parse(
          localStorage.getItem("orders") || "[]"
        );
        existingOrders.unshift(orderData);
        localStorage.setItem("orders", JSON.stringify(existingOrders));

        // Mô phỏng thanh toán MoMo thành công
        setTimeout(() => {
          toast.success("Thanh toán qua MoMo thành công!");
          navigate("/order-success", {
            state: {
              orderId: orderId,
              buyNow: isBuyNow,
              fromCart: isFromCart,
              isPaid: true,
            },
          });
          setIsProcessing(false);
        }, 2000);
        return;
      } else {
        // Thanh toán COD
        // Lưu đơn hàng vào localStorage
        const existingOrders = JSON.parse(
          localStorage.getItem("orders") || "[]"
        );
        existingOrders.unshift(orderData);
        localStorage.setItem("orders", JSON.stringify(existingOrders));

        setTimeout(() => {
          toast.success("Đặt hàng thành công!");
          navigate("/order-success", {
            state: {
              orderId: orderId,
              buyNow: isBuyNow,
              fromCart: isFromCart,
              isPaid: false,
            },
          });
          setIsProcessing(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán:", error);
      toast.error(
        "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."
      );
      setIsProcessing(false);
    }
  };

  // Xử lý quay lại trang trước đó
  const handleBack = () => {
    navigate(isBuyNow ? -1 : "/cart");
  };

  // Hiển thị loading khi đang tải dữ liệu
  if (!isBuyNow && !isFromCart && isCartLoading) {
    return <Loading />;
  }

  // Hiển thị thông báo nếu không có sản phẩm
  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto mt-28 px-4 pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Thanh Toán</h2>

          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 mb-6">
              Không có sản phẩm nào để thanh toán.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/farmhub2")}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto mt-28 px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={handleBack}
          >
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
              <path d="M19 12H5M5 12L12 19M5 12L12 5" />
            </svg>
            Quay lại
          </Button>
          <h2 className="text-2xl font-bold text-center">Thanh Toán</h2>
          <div className="w-[90px]"></div> {/* Spacer để căn giữa tiêu đề */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cart Items & Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">
                {isFromCart
                  ? `Sản phẩm đã chọn (${cartItems.length})`
                  : isBuyNow
                  ? "Sản phẩm mua ngay"
                  : "Sản phẩm"}
              </h3>

              <div className="space-y-4">
                {cartItems.map((item, index) => (
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
                          Đơn giá: {(item.unitPrice || 0).toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                    <p className="text-red-500 font-semibold">
                      {(
                        (item.unitPrice || 0) * (item.quantity || 1)
                      ).toLocaleString()}
                      đ
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Địa chỉ giao hàng</h3>
                {!showAddressForm && (
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() => setShowAddressForm(true)}
                  >
                    + Thêm địa chỉ mới
                  </Button>
                )}
              </div>

              {/* Form thêm địa chỉ mới */}
              {showAddressForm && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Thêm địa chỉ mới</h4>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => setShowAddressForm(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12"></path>
                      </svg>
                    </Button>
                  </div>

                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Họ tên người nhận{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="recipientName"
                          value={newAddress.recipientName}
                          onChange={handleAddressChange}
                          className="w-full border rounded p-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={newAddress.phone}
                          onChange={handleAddressChange}
                          className="w-full border rounded p-2"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Địa chỉ cụ thể <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={newAddress.streetAddress}
                        onChange={handleAddressChange}
                        className="w-full border rounded p-2"
                        placeholder="Số nhà, tên đường"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phường/Xã <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="ward"
                          value={newAddress.ward}
                          onChange={handleAddressChange}
                          className="w-full border rounded p-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Quận/Huyện
                        </label>
                        <input
                          type="text"
                          name="district"
                          value={newAddress.district}
                          onChange={handleAddressChange}
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tỉnh/Thành phố <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="province"
                          value={newAddress.province}
                          onChange={handleAddressChange}
                          className="w-full border rounded p-2"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        checked={newAddress.isDefault}
                        onChange={handleAddressChange}
                        className="w-4 h-4 accent-blue-600 mr-2"
                      />
                      <label htmlFor="isDefault" className="text-sm">
                        Đặt làm địa chỉ mặc định
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Lưu địa chỉ
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Danh sách địa chỉ */}
              {addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border p-4 rounded-lg cursor-pointer transition ${
                        selectedAddress === address.id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === address.id}
                          onChange={() => setSelectedAddress(address.id)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {address.recipientName}
                            </p>
                            {address.isDefault && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{address.phone}</p>
                          <p className="text-sm text-gray-600">
                            {address.streetAddress}, {address.ward}
                            {address.district
                              ? `, ${address.district}`
                              : ""}, {address.province}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ mới.
                  </p>
                </div>
              )}
            </div>

            {/* Note Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Ghi chú</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập ghi chú cho đơn hàng (nếu có)"
                rows={3}
              ></textarea>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment Method */}
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
                  <span>{shipping.toLocaleString()}đ</span>
                </div>
                {isFromCart && discountFromCart > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Giảm giá:
                      {couponFromCart && (
                        <span className="ml-1 text-xs bg-green-100 px-1 rounded">
                          ({couponFromCart})
                        </span>
                      )}
                    </span>
                    <span>-{discountFromCart.toLocaleString()}đ</span>
                  </div>
                )}
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

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">
                Phương thức thanh toán
              </h3>

              <div className="space-y-3">
                <div
                  className={`border p-4 rounded-lg cursor-pointer flex items-center gap-3 ${
                    paymentMethod === "COD"
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => setPaymentMethod("COD")}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </div>
                </div>

                <div
                  className={`border p-4 rounded-lg cursor-pointer flex items-center gap-3 ${
                    paymentMethod === "VNPAY"
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => setPaymentMethod("VNPAY")}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "VNPAY"}
                    onChange={() => setPaymentMethod("VNPAY")}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <span>VNPAY</span>
                    <img
                      src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png"
                      alt="VNPAY"
                      className="h-6"
                    />
                  </div>
                </div>

                <div
                  className={`border p-4 rounded-lg cursor-pointer flex items-center gap-3 ${
                    paymentMethod === "MOMO"
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => setPaymentMethod("MOMO")}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "MOMO"}
                    onChange={() => setPaymentMethod("MOMO")}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <span>Ví MoMo</span>
                    <img
                      src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                      alt="MoMo"
                      className="h-6"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
              onClick={handlePlaceOrder}
              disabled={isProcessing || addresses.length === 0}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : addresses.length === 0 ? (
                "Vui lòng thêm địa chỉ giao hàng"
              ) : paymentMethod === "COD" ? (
                "Đặt hàng"
              ) : (
                "Thanh toán ngay"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
