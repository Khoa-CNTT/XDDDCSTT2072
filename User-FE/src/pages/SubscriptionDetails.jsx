import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

const SubscriptionDetails = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
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
            description:
              "Gói miễn phí cung cấp các tính năng cơ bản để giúp bạn làm quen với nền tảng của chúng tôi. Phù hợp cho người mới bắt đầu hoặc các nông trại nhỏ chỉ cần các tính năng cơ bản.",
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
            description:
              "Gói dịch vụ cơ bản giúp nâng cao năng suất cho nông trại của bạn với các công cụ quản lý và dự báo thời tiết nâng cao. Phù hợp cho các nông trại nhỏ muốn nâng cao hiệu quả sản xuất.",
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
            description:
              "Gói tiêu chuẩn cung cấp giải pháp toàn diện cho nông trại vừa với các tính năng phân tích dữ liệu và tích hợp IoT. Phù hợp cho nông trại đang phát triển cần giải pháp quản lý hiệu quả.",
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
            description:
              "Gói cao cấp mang đến giải pháp quản lý nông nghiệp tối ưu với công nghệ AI và tích hợp IoT nâng cao. Phù hợp cho nông trại lớn và doanh nghiệp nông nghiệp cần giải pháp toàn diện.",
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

  const handleSubscribe = () => {
    navigate(`/payment/subscription/${id}`);
  };

  // Hàm format giá tiền sang VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Lấy màu sắc và CSS tương ứng với loại gói
  const getPlanTypeStyles = () => {
    if (!plan) return {};

    switch (plan.planType) {
      case "FREE":
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          badge: "bg-gray-100 text-gray-800",
          button: "bg-gray-500 hover:bg-gray-600",
        };
      case "BASIC":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          badge: "bg-blue-100 text-blue-800",
          button: "bg-blue-500 hover:bg-blue-600",
        };
      case "STANDARD":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          badge: "bg-green-100 text-green-800",
          button: "bg-green-500 hover:bg-green-600",
        };
      case "PREMIUM":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          badge: "bg-purple-100 text-purple-800",
          button: "bg-purple-500 hover:bg-purple-600",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          badge: "bg-gray-100 text-gray-800",
          button: "bg-gray-500 hover:bg-gray-600",
        };
    }
  };

  const styles = getPlanTypeStyles();

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
      <button
        onClick={() => navigate("/subscriptions")}
        className="mb-8 flex items-center text-blue-600 hover:underline"
      >
        ← Quay lại danh sách gói đăng ký
      </button>

      <div className="max-w-4xl mx-auto">
        <Card className={`shadow-lg ${styles.border} overflow-hidden`}>
          <CardHeader className={`${styles.bg} pb-6`}>
            <div className="flex justify-between items-start">
              <div>
                <Badge className={styles.badge}>{plan.planType}</Badge>
                {plan.isMostPopular && (
                  <Badge className="ml-2 bg-amber-100 text-amber-800">
                    Phổ biến nhất
                  </Badge>
                )}
                <CardTitle className="text-2xl mt-3">{plan.name}</CardTitle>
                <CardDescription className="text-base mt-1">
                  {plan.shortDescription}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {plan.price === 0 ? "Miễn phí" : formatCurrency(plan.price)}
                </div>
                {plan.price > 0 && (
                  <div className="text-sm text-gray-500">
                    /{plan.billingCycle.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium text-lg mb-4">
                  Thông tin gói đăng ký
                </h3>
                <div className="space-y-5">
                  <div className="flex">
                    <Calendar className="w-5 h-5 text-gray-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Thời hạn</div>
                      <div className="text-gray-600">
                        {plan.durationInDays} ngày
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    <Clock className="w-5 h-5 text-gray-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Chu kỳ thanh toán</div>
                      <div className="text-gray-600">
                        {plan.billingCycle === "MONTHLY"
                          ? "Hàng tháng"
                          : plan.billingCycle === "QUARTERLY"
                          ? "Hàng quý"
                          : "Hàng năm"}
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    <Users className="w-5 h-5 text-gray-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Số người dùng tối đa</div>
                      <div className="text-gray-600">
                        {plan.maxUsers === -1
                          ? "Không giới hạn"
                          : plan.maxUsers}
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    <CreditCard className="w-5 h-5 text-gray-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Phương thức thanh toán</div>
                      <div className="text-gray-600">
                        Thẻ tín dụng/ghi nợ, VNPay, MoMo, Chuyển khoản
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-4">Mô tả chi tiết</h3>
                <p className="text-gray-600 whitespace-pre-line mb-6">
                  {plan.description || "Không có mô tả chi tiết."}
                </p>

                <h3 className="font-medium text-lg mb-3">Tính năng bao gồm</h3>
                <ul className="space-y-2">
                  {plan.features &&
                    plan.features.split(",").map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature.trim()}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </CardContent>

          <CardFooter className={`p-6 border-t ${styles.bg}`}>
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
              <div className="flex items-center text-gray-600">
                <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />
                <span>Đảm bảo hoàn tiền trong vòng 7 ngày</span>
              </div>
              <Button
                className={`w-full md:w-auto ${styles.button}`}
                onClick={handleSubscribe}
              >
                {plan.price === 0 ? "Bắt đầu miễn phí" : "Đăng ký ngay"}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Các câu hỏi thường gặp */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Câu hỏi thường gặp</h2>
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2">
                Làm thế nào để nâng cấp gói đăng ký?
              </h3>
              <p className="text-gray-600">
                Bạn có thể nâng cấp gói đăng ký bất kỳ lúc nào bằng cách truy
                cập vào trang Cài đặt tài khoản và chọn &quot;Nâng cấp
                gói&quot;. Khi nâng cấp, bạn sẽ chỉ phải trả phần chênh lệch
                giữa hai gói.
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2">
                Tôi có thể hủy gói đăng ký không?
              </h3>
              <p className="text-gray-600">
                Có, bạn có thể hủy đăng ký bất kỳ lúc nào. Khi hủy, bạn vẫn có
                thể sử dụng gói dịch vụ cho đến hết thời hạn hiện tại. Chúng tôi
                cũng cung cấp chính sách hoàn tiền trong vòng 7 ngày nếu bạn
                không hài lòng với dịch vụ.
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2">
                Tôi có được hỗ trợ kỹ thuật không?
              </h3>
              <p className="text-gray-600">
                Tất cả các gói đăng ký đều được hỗ trợ kỹ thuật qua email. Các
                gói cao cấp sẽ được ưu tiên hỗ trợ và có thêm tùy chọn hỗ trợ
                qua điện thoại hoặc chat trực tiếp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
