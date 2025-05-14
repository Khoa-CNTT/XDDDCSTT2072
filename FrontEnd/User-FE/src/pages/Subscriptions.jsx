import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Check } from "lucide-react";
import toast from "react-hot-toast";

const Subscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setLoading(true);
        // Sử dụng mock data tạm thời để hiển thị giao diện
        const mockData = [
          {
            id: 1,
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
            id: 2,
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
            id: 3,
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
            id: 4,
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

        setPlans(mockData);
      } catch (error) {
        console.error("Lỗi khi tải gói đăng ký:", error);
        toast.error(
          "Không thể tải danh sách gói đăng ký. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionPlans();
  }, []);

  const handleSubscribe = (planId) => {
    // Chuyển đến trang thanh toán với ID gói đăng ký mà không cần kiểm tra đăng nhập
    navigate(`/payment/subscription/${planId}`);
  };

  // Hàm format giá tiền sang VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Lấy màu sắc và CSS tương ứng với loại gói
  const getPlanStyles = (planType) => {
    switch (planType) {
      case "FREE":
        return {
          cardClass: "border-gray-200 hover:border-gray-300",
          headerClass: "bg-gray-50",
          buttonClass: "bg-gray-500 hover:bg-gray-600",
          badgeClass: "bg-gray-100 text-gray-800",
        };
      case "BASIC":
        return {
          cardClass: "border-blue-200 hover:border-blue-300",
          headerClass: "bg-blue-50",
          buttonClass: "bg-blue-500 hover:bg-blue-600",
          badgeClass: "bg-blue-100 text-blue-800",
        };
      case "STANDARD":
        return {
          cardClass: "border-green-200 hover:border-green-300",
          headerClass: "bg-green-50",
          buttonClass: "bg-green-500 hover:bg-green-600",
          badgeClass: "bg-green-100 text-green-800",
        };
      case "PREMIUM":
        return {
          cardClass: "border-purple-200 hover:border-purple-300",
          headerClass: "bg-purple-50",
          buttonClass: "bg-purple-500 hover:bg-purple-600",
          badgeClass: "bg-purple-100 text-purple-800",
        };
      default:
        return {
          cardClass: "border-gray-200 hover:border-gray-300",
          headerClass: "bg-gray-50",
          buttonClass: "bg-gray-500 hover:bg-gray-600",
          badgeClass: "bg-gray-100 text-gray-800",
        };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Gói đăng ký</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Nâng cấp tài khoản của bạn để trải nghiệm đầy đủ các tính năng nâng
          cao và nhận được hỗ trợ tốt nhất từ nền tảng nông nghiệp của chúng
          tôi.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const styles = getPlanStyles(plan.planType);

            return (
              <Card
                key={plan.id}
                className={`overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${styles.cardClass}`}
              >
                <CardHeader className={`${styles.headerClass} py-4`}>
                  <div className="flex justify-between items-center">
                    <Badge className={styles.badgeClass}>{plan.planType}</Badge>
                    {plan.isMostPopular && (
                      <Badge className="bg-amber-100 text-amber-800">
                        Phổ biến nhất
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mt-2">{plan.name}</CardTitle>
                  <CardDescription>{plan.shortDescription}</CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="mb-6 text-center">
                    <p className="text-3xl font-bold">
                      {plan.price === 0
                        ? "Miễn phí"
                        : formatCurrency(plan.price)}
                    </p>
                    {plan.price > 0 && (
                      <p className="text-sm text-gray-500">
                        /{plan.billingCycle.toLowerCase()}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                      <span>Thời hạn: {plan.durationInDays} ngày</span>
                    </div>

                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-500 mr-3" />
                      <span>
                        {plan.maxUsers === -1
                          ? "Không giới hạn người dùng"
                          : `${plan.maxUsers} người dùng`}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 my-4 pt-4">
                      <p className="font-medium mb-3">Tính năng bao gồm:</p>
                      <ul className="space-y-2">
                        {plan.features &&
                          plan.features.split(",").map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                              <span className="text-sm">{feature.trim()}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-gray-50 p-6">
                  <Button
                    className={`w-full ${styles.buttonClass}`}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {plan.price === 0 ? "Bắt đầu miễn phí" : "Đăng ký ngay"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-16 p-8 bg-blue-50 rounded-xl">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Câu hỏi thường gặp
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Tôi có thể hủy gói bất kỳ lúc nào không?
            </h3>
            <p className="text-gray-600">
              Có, bạn có thể hủy đăng ký bất kỳ lúc nào. Khi hủy, bạn vẫn có thể
              sử dụng gói dịch vụ cho đến hết thời hạn hiện tại.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Tôi có thể thay đổi gói đăng ký không?
            </h3>
            <p className="text-gray-600">
              Có, bạn có thể nâng cấp hoặc hạ cấp gói đăng ký bất kỳ lúc nào.
              Nếu nâng cấp, bạn sẽ được tính phí cho phần chênh lệch.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Gói miễn phí có những hạn chế gì?
            </h3>
            <p className="text-gray-600">
              Gói miễn phí có giới hạn về số lượng người dùng và một số tính
              năng nâng cao. Bạn có thể nâng cấp lên gói trả phí để mở khóa tất
              cả tính năng.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Phương thức thanh toán nào được hỗ trợ?
            </h3>
            <p className="text-gray-600">
              Chúng tôi hỗ trợ thanh toán qua thẻ tín dụng, thẻ ghi nợ, Momo,
              VNPay và chuyển khoản ngân hàng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
