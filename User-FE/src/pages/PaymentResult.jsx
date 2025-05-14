import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Home,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const PaymentResult = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm gọi API để kiểm tra và cập nhật trạng thái thanh toán
  const updatePaymentStatus = async (transactionNo, txnRef) => {
    try {
      // Thử kiểm tra nếu có transaction_id trong localStorage
      let storedTransactionId = null;
      if (txnRef) {
        // Tìm và lấy transaction_id từ localStorage dựa vào vnp_TxnRef
        const orderId =
          txnRef.length > 6
            ? parseInt(txnRef.substring(0, txnRef.length - 6))
            : parseInt(txnRef);

        const orders = JSON.parse(localStorage.getItem("orders") || "[]");
        const matchedOrder = orders.find((order) => order.id === orderId);

        if (matchedOrder && matchedOrder.transaction_id) {
          storedTransactionId = matchedOrder.transaction_id;
          console.log(
            "Tìm thấy transaction_id từ localStorage:",
            storedTransactionId
          );

          // Thử gọi API với transaction_id chính xác từ localStorage
          const transactionIdResponse = await axios.get(
            `${API_URL}/payments/check/${storedTransactionId}`
          );

          if (
            transactionIdResponse.data &&
            transactionIdResponse.data.success
          ) {
            console.log(
              "Cập nhật thành công với transaction_id từ localStorage:",
              transactionIdResponse.data
            );
            return true;
          }
        }
      }

      // Nếu không tìm thấy hoặc không thành công với transaction_id, thử các phương pháp khác

      // Thử sử dụng vnp_TransactionNo trước
      if (transactionNo) {
        console.log(
          "Gọi API kiểm tra trạng thái thanh toán bằng vnp_TransactionNo:",
          transactionNo
        );
        const response = await axios.get(
          `${API_URL}/payments/query-dr?transactionId=${transactionNo}`
        );

        if (response.data && response.data.success) {
          console.log("Kết quả kiểm tra trạng thái thanh toán:", response.data);

          // Cập nhật transaction_id vào localStorage nếu có trong kết quả
          if (
            response.data.data &&
            response.data.data.payment &&
            response.data.data.payment.transaction_id &&
            txnRef
          ) {
            const orderId =
              txnRef.length > 6
                ? parseInt(txnRef.substring(0, txnRef.length - 6))
                : parseInt(txnRef);

            const orders = JSON.parse(localStorage.getItem("orders") || "[]");
            const orderIndex = orders.findIndex(
              (order) => order.id === orderId
            );

            if (orderIndex !== -1) {
              orders[orderIndex].transaction_id =
                response.data.data.payment.transaction_id;
              localStorage.setItem("orders", JSON.stringify(orders));
              console.log(
                "Đã lưu transaction_id vào localStorage:",
                response.data.data.payment.transaction_id
              );
            }
          }

          return true;
        } else {
          console.warn(
            "Không thể cập nhật trạng thái thanh toán bằng vnp_TransactionNo:",
            response.data?.message
          );

          // Nếu không thành công với vnp_TransactionNo, thử với vnp_TxnRef
          if (txnRef) {
            console.log(
              "Thử gọi API kiểm tra trạng thái thanh toán bằng vnp_TxnRef:",
              txnRef
            );
            const txnRefResponse = await axios.get(
              `${API_URL}/payments/query-dr?transactionId=${txnRef}`
            );

            if (txnRefResponse.data && txnRefResponse.data.success) {
              console.log(
                "Kết quả kiểm tra trạng thái thanh toán với vnp_TxnRef:",
                txnRefResponse.data
              );

              // Cập nhật transaction_id vào localStorage nếu có trong kết quả
              if (
                txnRefResponse.data.data &&
                txnRefResponse.data.data.payment &&
                txnRefResponse.data.data.payment.transaction_id
              ) {
                const orderId =
                  txnRef.length > 6
                    ? parseInt(txnRef.substring(0, txnRef.length - 6))
                    : parseInt(txnRef);

                const orders = JSON.parse(
                  localStorage.getItem("orders") || "[]"
                );
                const orderIndex = orders.findIndex(
                  (order) => order.id === orderId
                );

                if (orderIndex !== -1) {
                  orders[orderIndex].transaction_id =
                    txnRefResponse.data.data.payment.transaction_id;
                  localStorage.setItem("orders", JSON.stringify(orders));
                  console.log(
                    "Đã lưu transaction_id vào localStorage:",
                    txnRefResponse.data.data.payment.transaction_id
                  );
                }
              }

              return true;
            } else {
              console.warn(
                "Không thể cập nhật trạng thái thanh toán với cả hai phương thức"
              );
              return false;
            }
          }

          return false;
        }
      } else if (txnRef) {
        // Nếu không có vnp_TransactionNo, thử dùng vnp_TxnRef
        console.log(
          "Gọi API kiểm tra trạng thái thanh toán bằng vnp_TxnRef:",
          txnRef
        );
        const response = await axios.get(
          `${API_URL}/payments/query-dr?transactionId=${txnRef}`
        );

        if (response.data && response.data.success) {
          console.log("Kết quả kiểm tra trạng thái thanh toán:", response.data);

          // Cập nhật transaction_id vào localStorage nếu có trong kết quả
          if (
            response.data.data &&
            response.data.data.payment &&
            response.data.data.payment.transaction_id
          ) {
            const orderId =
              txnRef.length > 6
                ? parseInt(txnRef.substring(0, txnRef.length - 6))
                : parseInt(txnRef);

            const orders = JSON.parse(localStorage.getItem("orders") || "[]");
            const orderIndex = orders.findIndex(
              (order) => order.id === orderId
            );

            if (orderIndex !== -1) {
              orders[orderIndex].transaction_id =
                response.data.data.payment.transaction_id;
              localStorage.setItem("orders", JSON.stringify(orders));
              console.log(
                "Đã lưu transaction_id vào localStorage:",
                response.data.data.payment.transaction_id
              );
            }
          }

          return true;
        } else {
          console.warn(
            "Không thể cập nhật trạng thái thanh toán:",
            response.data?.message
          );
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error("Lỗi khi gọi API kiểm tra trạng thái thanh toán:", error);
      return false;
    }
  };

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        setLoading(true);
        // Lấy query parameters từ URL
        const searchParams = new URLSearchParams(location.search);

        // Xử lý kết quả từ VNPay
        const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
        const vnp_TransactionNo = searchParams.get("vnp_TransactionNo");
        const vnp_Amount = searchParams.get("vnp_Amount");
        const vnp_OrderInfo = searchParams.get("vnp_OrderInfo");
        const vnp_TxnRef = searchParams.get("vnp_TxnRef");
        const vnp_BankCode = searchParams.get("vnp_BankCode");
        const vnp_CardType = searchParams.get("vnp_CardType");
        const vnp_PayDate = searchParams.get("vnp_PayDate");

        console.log(
          "VNPay response params:",
          Object.fromEntries(searchParams.entries())
        );

        // Mã "00" đồng nghĩa với giao dịch thành công
        const isSuccess = vnp_ResponseCode === "00";

        // Trong trường hợp thành công và có mã giao dịch, thực hiện cập nhật đơn hàng
        if (isSuccess && vnp_TxnRef) {
          // Phân tích vnp_TxnRef để lấy đúng orderId
          // vnp_TxnRef có định dạng: {orderId}{random6digits}
          const orderId =
            vnp_TxnRef.length > 6
              ? parseInt(vnp_TxnRef.substring(0, vnp_TxnRef.length - 6))
              : parseInt(vnp_TxnRef);

          console.log("Đã phân tích orderId từ vnp_TxnRef:", orderId);

          // Đọc đơn hàng từ localStorage
          const orders = JSON.parse(localStorage.getItem("orders") || "[]");

          // Tìm đơn hàng trong localStorage theo ID
          const orderIndex = orders.findIndex((order) => order.id === orderId);

          if (orderIndex !== -1) {
            // Cập nhật trạng thái đơn hàng
            orders[orderIndex].status = "PAID";
            orders[orderIndex].paymentDate = new Date().toISOString();
            orders[orderIndex].transactionId = vnp_TransactionNo;
            orders[orderIndex].paymentReference = vnp_TxnRef;

            // Để xử lý tìm kiếm theo transaction_id lần sau
            // Khi có thêm thông tin backend, thêm transaction_id vào localStorage
            // Khi gọi API check/query-dr thành công

            // Lưu lại danh sách đơn hàng
            localStorage.setItem("orders", JSON.stringify(orders));

            console.log("Đã cập nhật trạng thái đơn hàng ID:", orderId);

            // Gọi API để cập nhật trạng thái thanh toán trong database
            if (vnp_TransactionNo) {
              try {
                const updated = await updatePaymentStatus(
                  vnp_TransactionNo,
                  vnp_TxnRef
                );
                if (updated) {
                  console.log(
                    "Đã cập nhật trạng thái thanh toán trong database"
                  );

                  // Kiểm tra xem đã có transaction_id trong localStorage chưa
                  // Nếu chưa, fetch lại để lấy transaction_id chính xác từ backend
                  const existingOrders = JSON.parse(
                    localStorage.getItem("orders") || "[]"
                  );
                  const orderToCheck = existingOrders.find(
                    (o) => o.id === orderId
                  );

                  if (!orderToCheck?.transaction_id) {
                    try {
                      console.log(
                        "Thử lấy transaction_id chính xác từ backend..."
                      );
                      const queryResponse = await axios.get(
                        `${API_URL}/payments/query-dr?transactionId=${vnp_TransactionNo}`
                      );

                      if (
                        queryResponse.data?.success &&
                        queryResponse.data?.data?.payment?.transaction_id
                      ) {
                        const actualTransactionId =
                          queryResponse.data.data.payment.transaction_id;
                        console.log(
                          "Lấy được transaction_id từ backend:",
                          actualTransactionId
                        );

                        // Cập nhật vào localStorage
                        const updatedOrders = JSON.parse(
                          localStorage.getItem("orders") || "[]"
                        );
                        const orderIndex = updatedOrders.findIndex(
                          (o) => o.id === orderId
                        );

                        if (orderIndex !== -1) {
                          updatedOrders[orderIndex].transaction_id =
                            actualTransactionId;
                          localStorage.setItem(
                            "orders",
                            JSON.stringify(updatedOrders)
                          );
                          console.log("Đã lưu transaction_id vào localStorage");
                        }
                      }
                    } catch (err) {
                      console.error(
                        "Lỗi khi lấy transaction_id từ backend:",
                        err
                      );
                    }
                  }

                  // Thông báo thành công bổ sung
                  toast.success("Trạng thái đơn hàng đã được cập nhật!");
                } else {
                  console.warn(
                    "Không thể cập nhật trạng thái thanh toán trong database"
                  );
                }
              } catch (error) {
                console.error("Lỗi khi cập nhật trạng thái thanh toán:", error);
              }
            }
          } else {
            console.warn("Không tìm thấy đơn hàng với ID:", orderId);
          }
        }

        if (isSuccess) {
          // Thông báo thành công
          toast.success("Thanh toán thành công!");

          setPaymentStatus("success");
          setPaymentInfo({
            transactionId: vnp_TransactionNo || "N/A",
            transactionRef: vnp_TxnRef || "N/A",
            amount: vnp_Amount
              ? (parseInt(vnp_Amount) / 100).toLocaleString("vi-VN") + " VND"
              : "N/A",
            orderInfo: vnp_OrderInfo || "N/A",
            paymentDate:
              formatVNPayDate(vnp_PayDate) ||
              new Date().toLocaleString("vi-VN"),
            paymentMethod: "VNPAY",
            bankCode: vnp_BankCode || "N/A",
            cardType: vnp_CardType || "N/A",
          });
        } else {
          // Thông báo thất bại
          toast.error(
            `Thanh toán không thành công! ${getErrorMessage(vnp_ResponseCode)}`
          );

          setPaymentStatus("failed");
          setPaymentInfo({
            errorCode: vnp_ResponseCode || "99",
            errorMessage: getErrorMessage(vnp_ResponseCode),
            orderInfo: vnp_OrderInfo || "N/A",
            transactionRef: vnp_TxnRef || "N/A",
            paymentMethod: "VNPAY",
          });
        }
      } catch (error) {
        console.error("Lỗi xử lý kết quả thanh toán:", error);
        toast.error("Có lỗi xảy ra khi xử lý kết quả thanh toán");
        setPaymentStatus("failed");
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [location.search]);

  // Hàm định dạng ngày từ VNPay (yyyyMMddHHmmss)
  const formatVNPayDate = (dateString) => {
    if (!dateString) return null;

    try {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const hour = dateString.substring(8, 10);
      const minute = dateString.substring(10, 12);
      const second = dateString.substring(12, 14);

      const date = new Date(year, month - 1, day, hour, minute, second);
      return date.toLocaleString("vi-VN");
    } catch (error) {
      console.error("Lỗi định dạng ngày:", error);
      return dateString;
    }
  };

  // Hàm lấy thông báo lỗi dựa trên mã lỗi
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      "01": "Giao dịch đã tồn tại",
      "02": "Merchant không hợp lệ (kiểm tra lại vnp_TmnCode)",
      "03": "Dữ liệu gửi sang không đúng định dạng",
      "04": "Khởi tạo GD không thành công do Website đang bị tạm khóa",
      "05": "Giao dịch không thành công do: Quý khách nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
      "06": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "08": "Giao dịch không thành công do: Hệ thống Ngân hàng đang bảo trì. Xin quý khách tạm thời không thực hiện giao dịch bằng thẻ/tài khoản của Ngân hàng này",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng",
      10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch",
      12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
      13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
      24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
      65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
      75: "Ngân hàng thanh toán đang bảo trì",
      79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán nhiều lần",
      99: "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
      91: "Không tìm thấy giao dịch yêu cầu",
      92: "Giao dịch thất bại do không nhập được OTP",
      93: "Giao dịch thất bại do OTP không đúng",
      94: "Giao dịch thất bại do lỗi hệ thống",
      97: "Chữ ký không hợp lệ",
      98: "Timeout giao dịch",
      Canceled: "Giao dịch đã bị hủy bởi người dùng",
      null: "Không nhận được mã phản hồi từ cổng thanh toán",
      undefined: "Không nhận được mã phản hồi từ cổng thanh toán",
    };

    // Chuyển đổi errorCode sang string để đảm bảo so sánh đúng
    const errorCodeStr = String(errorCode);
    return (
      errorMessages[errorCodeStr] || `Lỗi không xác định (mã: ${errorCodeStr})`
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader
            className={
              paymentStatus === "success" ? "bg-green-50" : "bg-red-50"
            }
          >
            <div className="flex items-center justify-center mb-4">
              {paymentStatus === "success" ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-center text-2xl">
              {paymentStatus === "success"
                ? "Thanh toán thành công"
                : "Thanh toán thất bại"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {paymentStatus === "success" && paymentInfo && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Mã giao dịch</p>
                  <p className="font-semibold">{paymentInfo.transactionId}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Mã đơn hàng</p>
                  <p className="font-semibold">{paymentInfo.transactionRef}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Số tiền</p>
                  <p className="font-semibold text-green-600">
                    {paymentInfo.amount}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Nội dung thanh toán</p>
                  <p className="font-semibold">{paymentInfo.orderInfo}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Ngân hàng</p>
                  <p className="font-semibold">{paymentInfo.bankCode}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Ngày thanh toán</p>
                  <p className="font-semibold">{paymentInfo.paymentDate}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Phương thức thanh toán</p>
                  <p className="font-semibold">{paymentInfo.paymentMethod}</p>
                </div>

                <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-center text-green-600">
                    Thanh toán đã được xác nhận thành công!
                  </p>
                </div>
              </div>
            )}

            {paymentStatus === "failed" && paymentInfo && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Mã lỗi</p>
                  <p className="font-semibold text-red-600">
                    {paymentInfo.errorCode}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Thông báo lỗi</p>
                  <p className="font-semibold text-red-600">
                    {paymentInfo.errorMessage}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Mã đơn hàng</p>
                  <p className="font-semibold">{paymentInfo.transactionRef}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Nội dung thanh toán</p>
                  <p className="font-semibold">{paymentInfo.orderInfo}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Phương thức thanh toán</p>
                  <p className="font-semibold">{paymentInfo.paymentMethod}</p>
                </div>

                <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-center text-red-600">
                    Thanh toán không thành công. Vui lòng thử lại sau!
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center mt-8 space-x-4">
              <Button
                className="flex items-center"
                variant="outline"
                onClick={() => navigate("/cart")}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Quay lại giỏ hàng
              </Button>

              <Button
                className="flex items-center"
                onClick={() => navigate("/")}
              >
                <Home className="w-4 h-4 mr-2" />
                Trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentResult;
