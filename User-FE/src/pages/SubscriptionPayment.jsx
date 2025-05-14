import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Clock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const SubscriptionPayment = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvc: "",
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        // Sử dụng mock data tạm thời
        const mockPlans = [
          {
            id: "1",
            name: "Gói Miễn Phí",
            shortDescription: "Dành cho người mới bắt đầu",
            price: 0,
            billingCycle: "MONTHLY",
            durationInDays: 30,
            maxUsers: 1,
            features:
              "Dự báo thời tiết cơ bản, Theo dõi mùa vụ, Hỗ trợ kỹ thuật qua email",
            planType: "FREE",
            isActive: true,
            isMostPopular: false,
          },
          {
            id: "2",
            name: "Gói Cơ Bản",
            shortDescription: "Cho nông trại nhỏ",
            price: 99000,
            billingCycle: "MONTHLY",
            durationInDays: 30,
            maxUsers: 3,
            features:
              "Tất cả tính năng của gói miễn phí, Cảnh báo thời tiết nâng cao, Quản lý mùa vụ, Hỗ trợ kỹ thuật ưu tiên",
            planType: "BASIC",
            isActive: true,
            isMostPopular: true,
          },
          {
            id: "3",
            name: "Gói Tiêu Chuẩn",
            shortDescription: "Cho nông trại vừa",
            price: 199000,
            billingCycle: "MONTHLY",
            durationInDays: 30,
            maxUsers: 10,
            features:
              "Tất cả tính năng của gói cơ bản, Phân tích dữ liệu nông nghiệp, Tích hợp IoT cơ bản, Hỗ trợ 24/7, Báo cáo định kỳ",
            planType: "STANDARD",
            isActive: true,
            isMostPopular: false,
          },
          {
            id: "4",
            name: "Gói Cao Cấp",
            shortDescription: "Cho nông trại lớn",
            price: 499000,
            billingCycle: "MONTHLY",
            durationInDays: 30,
            maxUsers: -1,
            features:
              "Tất cả tính năng của gói tiêu chuẩn, Tích hợp IoT nâng cao, Phân tích dữ liệu AI, Dự báo năng suất, Tư vấn chuyên gia, API tích hợp",
            planType: "PREMIUM",
            isActive: true,
            isMostPopular: false,
          },
        ];

        const selectedPlan = mockPlans.find((plan) => plan.id === id);
        setPlan(selectedPlan);
      } catch (error) {
        console.error("Lỗi khi tải thông tin gói đăng ký:", error);
        toast.error(
          "Không thể tải thông tin gói đăng ký. Vui lòng thử lại sau."
        );
        navigate("/subscriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);

    try {
      if (paymentMethod === "VNPAY") {
        // Xử lý thanh toán với VNPay

        try {
          // Hiển thị thông báo đang xử lý
          toast.loading("Đang kết nối với cổng thanh toán...");

          // Gọi API backend để tạo URL thanh toán VNPay
          const paymentData = {
            orderId: parseInt(plan.id), // Chuyển đổi sang integer
            amount: Math.round(plan.price),
            description: `Thanh toán gói ${plan.name}`,
            paymentMethod: "VNPAY",
            returnUrl: window.location.origin + "/payment/result",
          };

          console.log("Gửi yêu cầu thanh toán đến server:", paymentData);

          // Giả lập gọi API backend
          // Trong thực tế, đây sẽ là một cuộc gọi fetch đến API của bạn
          // fetch('/api/v1/subscription-plans/payment', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //     'Authorization': `Bearer ${localStorage.getItem('token')}`
          //   },
          //   body: JSON.stringify(paymentData)
          // })
          // .then(response => response.json())
          // .then(data => {
          //   toast.dismiss();
          //   if (data.success) {
          //     window.location.href = data.data.paymentUrl;
          //   } else {
          //     toast.error(data.message || "Có lỗi xảy ra khi tạo URL thanh toán");
          //     setProcessingPayment(false);
          //   }
          // })
          // .catch(error => {
          //   toast.error("Không thể kết nối với server. Vui lòng thử lại sau.");
          //   setProcessingPayment(false);
          // });

          // Chỉ cho môi trường demo - Sẽ gọi trực tiếp API trong môi trường thực tế
          setTimeout(() => {
            // Giả lập một phản hồi từ server
            toast.dismiss();

            // URL VNPay chuẩn cho môi trường sandbox với các tham số đúng định dạng
            const vnpayParams = new URLSearchParams();
            vnpayParams.append("vnp_Version", "2.1.0");
            vnpayParams.append("vnp_Command", "pay");
            vnpayParams.append("vnp_TmnCode", "T4A9FEAR"); // Mã merchant đăng ký với VNPAY
            vnpayParams.append("vnp_Locale", "vn");
            vnpayParams.append("vnp_CurrCode", "VND");

            // Tạo mã đơn hàng duy nhất
            const currentDate = new Date();
            const createDate =
              currentDate.getFullYear().toString() +
              ("0" + (currentDate.getMonth() + 1)).slice(-2) +
              ("0" + currentDate.getDate()).slice(-2) +
              ("0" + currentDate.getHours()).slice(-2) +
              ("0" + currentDate.getMinutes()).slice(-2) +
              ("0" + currentDate.getSeconds()).slice(-2);
            const orderId =
              createDate + "_" + Math.floor(Math.random() * 1000000);

            vnpayParams.append("vnp_TxnRef", orderId);
            vnpayParams.append("vnp_OrderInfo", "Thanh toan goi " + plan.name);
            vnpayParams.append("vnp_OrderType", "billpayment");
            vnpayParams.append("vnp_Amount", Math.round(plan.price) * 100);
            vnpayParams.append(
              "vnp_ReturnUrl",
              window.location.origin + "/payment/result"
            );
            vnpayParams.append("vnp_IpAddr", "127.0.0.1");
            vnpayParams.append("vnp_CreateDate", createDate);

            const vnpayUrl =
              "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?" +
              vnpayParams.toString();

            console.log("Chuyển hướng đến cổng thanh toán VNPay:", vnpayUrl);

            // Chuyển hướng đến trang thanh toán VNPay
            window.location.href = vnpayUrl;
          }, 1500);
        } catch (error) {
          console.error("Lỗi khi xử lý thanh toán:", error);
          toast.error(
            "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."
          );
          setProcessingPayment(false);
        }
      } else if (paymentMethod === "MOMO") {
        // Mô phỏng thanh toán MoMo
        setTimeout(() => {
          toast.success(
            "Đã tạo yêu cầu thanh toán MoMo. Vui lòng kiểm tra ứng dụng MoMo của bạn."
          );
          setProcessingPayment(false);
        }, 1500);
      } else if (paymentMethod === "BANKING") {
        // Mô phỏng thanh toán chuyển khoản
        setTimeout(() => {
          toast.success(
            "Đã ghi nhận yêu cầu chuyển khoản. Vui lòng hoàn tất thanh toán trong vòng 24 giờ."
          );
          navigate("/");
        }, 1500);
      } else {
        // Mô phỏng thanh toán thẻ tín dụng thành công
        setTimeout(() => {
          toast.success(
            "Thanh toán thành công! Gói đăng ký của bạn đã được kích hoạt."
          );
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      console.error("Lỗi xử lý thanh toán:", error);
      toast.error(
        "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."
      );
      setProcessingPayment(false);
    }
  };

  // Hàm format giá tiền sang VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Gói đăng ký không tồn tại</h2>
        <p className="text-gray-600 mb-6">
          Không tìm thấy thông tin gói đăng ký hoặc gói đã bị vô hiệu hóa.
        </p>
        <Button onClick={() => navigate("/subscriptions")}>
          Xem tất cả gói đăng ký
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Thanh toán gói đăng ký</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Tóm tắt đơn hàng */}
          <div className="md:col-span-1">
            <Card className="shadow-md">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Gói đăng ký</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="flex items-center">
                        <Badge className="mr-2">{plan.planType}</Badge>
                        {plan.name}
                      </span>
                      <span className="font-semibold">
                        {plan.price === 0
                          ? "Miễn phí"
                          : formatCurrency(plan.price)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Thời hạn</h3>
                    <div className="flex items-center mt-1 text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{plan.durationInDays} ngày</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Chu kỳ thanh toán</h3>
                    <div className="flex items-center mt-1 text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        {plan.billingCycle === "MONTHLY"
                          ? "Hàng tháng"
                          : plan.billingCycle === "QUARTERLY"
                          ? "Hàng quý"
                          : "Hàng năm"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-lg text-blue-600">
                        {plan.price === 0
                          ? "Miễn phí"
                          : formatCurrency(plan.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form thanh toán */}
          <div className="md:col-span-2">
            <Card className="shadow-md">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-lg">Thông tin thanh toán</CardTitle>
                <CardDescription>
                  Chọn phương thức thanh toán và nhập thông tin của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  {/* Phương thức thanh toán */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">
                      Chọn phương thức thanh toán
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      <div
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${
                          paymentMethod === "CREDIT_CARD"
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "hover:border-gray-400"
                        }`}
                        onClick={() => setPaymentMethod("CREDIT_CARD")}
                      >
                        <CreditCard className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                        <span className="text-sm">Thẻ tín dụng</span>
                      </div>
                      <div
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${
                          paymentMethod === "BANKING"
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "hover:border-gray-400"
                        }`}
                        onClick={() => setPaymentMethod("BANKING")}
                      >
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/2168/2168252.png"
                          className="w-6 h-6 mx-auto mb-1"
                          alt="Banking"
                        />
                        <span className="text-sm">Chuyển khoản</span>
                      </div>
                      <div
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${
                          paymentMethod === "MOMO"
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "hover:border-gray-400"
                        }`}
                        onClick={() => setPaymentMethod("MOMO")}
                      >
                        <img
                          src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png"
                          className="w-6 h-6 mx-auto mb-1"
                          alt="MoMo"
                        />
                        <span className="text-sm">Ví MoMo</span>
                      </div>
                      <div
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${
                          paymentMethod === "VNPAY"
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "hover:border-gray-400"
                        }`}
                        onClick={() => setPaymentMethod("VNPAY")}
                      >
                        <img
                          src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png"
                          className="w-6 h-6 mx-auto mb-1"
                          alt="VNPAY"
                        />
                        <span className="text-sm">VNPAY</span>
                      </div>
                    </div>
                  </div>

                  {/* Form thẻ tín dụng */}
                  {paymentMethod === "CREDIT_CARD" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Số thẻ
                        </label>
                        <Input
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tên chủ thẻ
                        </label>
                        <Input
                          name="cardName"
                          placeholder="NGUYEN VAN A"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Ngày hết hạn
                          </label>
                          <Input
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            CVC/CVV
                          </label>
                          <Input
                            name="cvc"
                            placeholder="123"
                            value={formData.cvc}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Thông tin chuyển khoản */}
                  {paymentMethod === "BANKING" && (
                    <div className="border p-4 rounded-lg bg-gray-50">
                      <h3 className="font-medium mb-3">
                        Thông tin chuyển khoản
                      </h3>
                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="font-semibold">Ngân hàng:</span>{" "}
                          Vietcombank
                        </p>
                        <p>
                          <span className="font-semibold">Số tài khoản:</span>{" "}
                          1234567890
                        </p>
                        <p>
                          <span className="font-semibold">Chủ tài khoản:</span>{" "}
                          CONG TY NONG NGHIEP XYZ
                        </p>
                        <p>
                          <span className="font-semibold">Nội dung:</span>{" "}
                          {plan.name}
                        </p>
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-yellow-800">
                            Sau khi chuyển khoản thành công, vui lòng nhấn nút
                            "Xác nhận thanh toán" bên dưới. Chúng tôi sẽ xác
                            minh và kích hoạt gói đăng ký của bạn.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Thanh toán MoMo */}
                  {paymentMethod === "MOMO" && (
                    <div className="border p-4 rounded-lg bg-pink-50">
                      <div className="flex justify-center mb-4">
                        <img
                          src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png"
                          className="w-24 h-24"
                          alt="MoMo"
                        />
                      </div>
                      <div className="text-center">
                        <p className="mb-2">Quét mã QR bằng ứng dụng MoMo</p>
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png"
                          className="w-32 h-32 mx-auto"
                          alt="QR Code"
                        />
                        <p className="mt-3 text-sm text-gray-600">
                          Hoặc nhấn thanh toán để chuyển đến ứng dụng MoMo
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Thanh toán VNPAY */}
                  {paymentMethod === "VNPAY" && (
                    <div className="border p-4 rounded-lg bg-red-50">
                      <div className="flex justify-center mb-4">
                        <img
                          src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png"
                          className="w-24 h-24"
                          alt="VNPAY"
                        />
                      </div>
                      <div className="text-center">
                        <p className="mb-4">
                          Thanh toán an toàn qua cổng thanh toán VNPAY
                        </p>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
                          <p className="font-medium text-gray-800">
                            Hỗ trợ thanh toán qua:
                          </p>
                          <div className="flex flex-wrap justify-center mt-2 gap-2">
                            <img
                              src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR-300x300.png"
                              alt="VNPAY QR"
                              className="h-8"
                            />
                            <img
                              src="https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-Vietcombank.png"
                              alt="Vietcombank"
                              className="h-8"
                            />
                            <img
                              src="https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-VietinBank-TSB.png"
                              alt="Vietinbank"
                              className="h-8"
                            />
                            <img
                              src="https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-Techcombank.png"
                              alt="Techcombank"
                              className="h-8"
                            />
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-4 text-left">
                          <h4 className="font-medium text-yellow-800 mb-2">
                            Lưu ý khi thanh toán:
                          </h4>
                          <ul className="text-sm text-yellow-800 list-disc pl-5 space-y-1">
                            <li>
                              Sau khi nhấn "Xác nhận thanh toán", bạn sẽ được
                              chuyển đến cổng thanh toán VNPAY
                            </li>
                            <li>
                              Tại đó, bạn cần chọn ngân hàng và phương thức
                              thanh toán (Internet Banking, Ứng dụng Mobile
                              Banking, Quét mã QR...)
                            </li>
                            <li>Nhập thông tin thanh toán theo hướng dẫn</li>
                            <li>
                              Sau khi hoàn tất, bạn sẽ được chuyển về trang kết
                              quả thanh toán
                            </li>
                          </ul>
                        </div>
                        <p className="text-sm text-gray-600">
                          Nhấn "Xác nhận thanh toán" để tiếp tục đến cổng thanh
                          toán VNPAY
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      className="w-4 h-4 mr-2"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      Tôi đồng ý với{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        điều khoản và điều kiện
                      </a>{" "}
                      sử dụng dịch vụ
                    </label>
                  </div>

                  <div className="mt-8">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={processingPayment}
                    >
                      {processingPayment ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      ) : (
                        "Xác nhận thanh toán"
                      )}
                    </Button>
                    <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                      <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
                      <span>Thông tin thanh toán được bảo mật</span>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPayment;
