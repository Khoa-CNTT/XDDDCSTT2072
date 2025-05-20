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
import {
  Users,
  Check,
  ShoppingBag,
  Shield,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import subscriptionService from "@/services/subscriptionService";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

// Custom keyframes animation CSS
const animationStyles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7); }
    70% { box-shadow: 0 0 0 15px rgba(124, 58, 237, 0); }
    100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
  }

  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes shine {
    0% { background-position: -100px; }
    60% { background-position: 140px; }
    100% { background-position: 140px; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-20px); }
    60% { transform: translateY(-10px); }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-pulse-shadow {
    animation: pulse 2s infinite;
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 5s ease infinite;
  }

  .animate-shine {
    position: relative;
    overflow: hidden;
  }

  .animate-shine::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
    transform: skewX(-20deg);
    animation: shine 3s infinite;
  }

  .animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.5s ease-out forwards;
  }

  .animate-bounce {
    animation: bounce 2s infinite;
  }

  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .delay-400 { animation-delay: 0.4s; }
  .delay-500 { animation-delay: 0.5s; }
  .delay-600 { animation-delay: 0.6s; }
  .delay-700 { animation-delay: 0.7s; }
  .delay-800 { animation-delay: 0.8s; }
  .delay-900 { animation-delay: 0.9s; }
  .delay-1000 { animation-delay: 1s; }
`;

const Subscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    // Add the animation styles to the document head
    const styleElement = document.createElement("style");
    styleElement.innerHTML = animationStyles;
    document.head.appendChild(styleElement);

    // Clean up function to remove styles when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setLoading(true);

        // Gọi API thực tế
        const response = await subscriptionService.getActivePlans(axiosPrivate);
        if (response && Array.isArray(response)) {
          setPlans(response);
        } else {
          // Sử dụng mock data với mô tả cập nhật
          const mockData = [
            {
              id: 1,
              name: "Gói Miễn Phí",
              shortDescription:
                "Mua sắm, đăng bài, đọc tin tức và trò chuyện với AI",
              price: 0,
              billingCycle: "MONTHLY",
              durationInDays: 30,
              maxUsers: 1,
              features:
                "Tham gia mua sắm sản phẩm, Đăng bài thảo luận trên diễn đàn, Đọc tin tức nông nghiệp, Trò chuyện với AI hỗ trợ, Dự báo thời tiết cơ bản, Theo dõi mùa vụ",
              planType: "FREE",
              isActive: true,
              isMostPopular: false,
            },
            {
              id: 4,
              name: "Gói Premium",
              shortDescription: "Tất cả tính năng + Quyền đăng ký bán hàng",
              price: 499000,
              billingCycle: "MONTHLY",
              durationInDays: 30,
              maxUsers: -1,
              features:
                "Tất cả tính năng của gói miễn phí, Quyền đăng ký bán hàng trên nền tảng",
              planType: "PREMIUM",
              isActive: true,
              isMostPopular: true,
            },
          ];

          setPlans(mockData);
        }
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
  }, [axiosPrivate]);

  const handleSubscribe = (planId) => {
    // Tìm plan theo ID
    const selectedPlan = plans.find((p) => p.id === planId);

    // Nếu là gói Premium, chuyển đến trang đăng ký bán hàng
    if (
      selectedPlan &&
      (selectedPlan.planType === "PREMIUM" ||
        selectedPlan.name.toLowerCase().includes("premium"))
    ) {
      navigate("/seller-registration");
    } else if (
      selectedPlan &&
      (selectedPlan.planType === "FREE" || selectedPlan.price === 0)
    ) {
      // Nếu là gói Free, chuyển đến trang Home
      navigate("/");
    } else {
      // Các gói khác vẫn chuyển đến trang thanh toán
      navigate(`/payment/subscription/${planId}`);
    }
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
          cardClass: "border-blue-200 hover:border-blue-300",
          headerClass: "bg-blue-50",
          buttonClass: "bg-blue-500 hover:bg-blue-600",
          badgeClass: "bg-blue-100 text-blue-800",
          color: "blue",
          icon: <Shield className="w-16 h-16 text-blue-500 animate-float" />,
        };
      case "PREMIUM":
        return {
          cardClass: "border-purple-200 hover:border-purple-300",
          headerClass: "bg-purple-50",
          buttonClass: "bg-purple-500 hover:bg-purple-600",
          badgeClass: "bg-purple-100 text-purple-800",
          color: "purple",
          icon: <Award className="w-16 h-16 text-purple-500 animate-float" />,
        };
      default:
        return {
          cardClass: "border-gray-200 hover:border-gray-300",
          headerClass: "bg-gray-50",
          buttonClass: "bg-gray-500 hover:bg-gray-600",
          badgeClass: "bg-gray-100 text-gray-800",
          color: "gray",
          icon: <Shield className="w-16 h-16 text-gray-500 animate-float" />,
        };
    }
  };

  // Kiểm tra xem gói có cho phép đăng ký bán hàng không
  const canRegisterAsSeller = (plan) => {
    return (
      plan.planType === "PREMIUM" || plan.name.toLowerCase().includes("premium")
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* TOP SECTION - Seller Registration CTA (moved from bottom) */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 animate-gradient rounded-xl text-white shadow-xl transform hover:scale-[1.01] transition-all duration-300 animate-scale-in">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
          {/* Animated sparkles */}
          <div className="absolute -top-10 -left-10 opacity-20">
            <Sparkles className="w-24 h-24 text-white animate-float" />
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-20">
            <Sparkles className="w-20 h-20 text-white animate-float delay-500" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-extrabold mb-2 tracking-tight">
              Trở thành người bán hàng
            </h2>
            <p className="max-w-2xl opacity-90 text-base">
              Với gói Premium, bạn không chỉ được sử dụng tất cả tính năng cơ
              bản mà còn có quyền đăng ký bán hàng trên nền tảng của chúng tôi.
              Tiếp cận hàng ngàn khách hàng tiềm năng và tăng doanh thu của bạn.
            </p>
          </div>
          <Button
            className="bg-white text-purple-600 hover:bg-gray-100 px-6 py-4 text-base font-bold rounded-xl shadow-lg animate-pulse-shadow relative z-10 group overflow-hidden"
            onClick={() => navigate("/seller-registration")}
          >
            <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-all" />
              <span>Đăng ký bán hàng</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-all" />
            </div>
          </Button>
        </div>
      </div>

      {/* Phần Hero */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 animate-gradient text-white rounded-2xl p-6 md:p-8 mb-8 shadow-xl relative overflow-hidden animate-fade-in">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-20 -mr-20 animate-float delay-300"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-white opacity-10 rounded-full -mb-16 -ml-16 animate-float delay-700"></div>

        {/* Animated decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-12 h-12 rounded-full bg-white opacity-10 animate-float delay-200"></div>
        <div className="absolute bottom-1/4 left-1/3 w-8 h-8 rounded-full bg-white opacity-10 animate-float delay-400"></div>
        <div className="absolute top-1/3 left-1/4 w-6 h-6 rounded-full bg-white opacity-10 animate-float delay-600"></div>

        <div className="text-center max-w-3xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight animate-scale-in">
            Nền tảng nông nghiệp toàn diện
          </h1>
          <p className="text-lg mb-6 opacity-90 animate-fade-in delay-200">
            Trải nghiệm ngay để mua sắm, đăng bài, đọc tin tức và trò chuyện với AI - hoặc nâng cấp lên Premium để trở thành người bán hàng
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Badge className="bg-white text-green-700 px-3 py-1 text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 animate-fade-in delay-300">
              <Check className="w-4 h-4 mr-1" />
              Mua sắm sản phẩm
            </Badge>
            <Badge className="bg-white text-green-700 px-3 py-1 text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 animate-fade-in delay-400">
              <Check className="w-4 h-4 mr-1" />
              Đăng bán sản phẩm
            </Badge>
            <Badge className="bg-white text-green-700 px-3 py-1 text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 animate-fade-in delay-500">
              <Check className="w-4 h-4 mr-1" />
              AI Hỗ trợ
            </Badge>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="md:grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, index) => {
            const styles = getPlanStyles(plan.planType);
            const allowSellerRegistration = canRegisterAsSeller(plan);
            const isFree = plan.price === 0;
            const animationDelay = `delay-${(index + 3) * 100}`;

            return (
              <Card
                key={plan.id}
                className={`overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl ${
                  styles.cardClass
                } ${
                  plan.isMostPopular
                    ? "ring-2 ring-amber-400 transform hover:-translate-y-2"
                    : "hover:-translate-y-1"
                } mb-6 md:mb-0 rounded-xl animate-scale-in ${animationDelay}`}
              >
                <CardHeader className={`${styles.headerClass} py-4 relative`}>
                  {plan.isMostPopular && (
                    <div className="absolute top-0 right-0 -mt-1 -mr-1 animate-pulse-shadow">
                      <Badge className="bg-amber-400 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg rounded-tr-lg animate-shine">
                        Khuyên dùng
                      </Badge>
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center">
                    {styles.icon}
                    <CardTitle className="text-xl mt-3 font-bold">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      {plan.shortDescription}
                    </CardDescription>

                    <div className="mt-3">
                      <p className="text-3xl font-bold">
                        {isFree ? "Miễn phí" : formatCurrency(plan.price)}
                      </p>
                      {!isFree && (
                        <p className="text-sm opacity-70">
                          /{plan.billingCycle.toLowerCase()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold mb-2 text-base">
                        Tính năng chính:
                      </p>
                      <ul className="space-y-2">
                        {plan.features &&
                          plan.features.split(",").map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start animate-fade-in"
                              style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
                            >
                              <div
                                className={`p-1 rounded-full bg-${styles.color}-100 mr-2 shrink-0`}
                              >
                                <Check
                                  className={`w-3 h-3 text-${styles.color}-500`}
                                />
                              </div>
                              <span className="text-sm">{feature.trim()}</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    {allowSellerRegistration && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 hover:shadow-md transition-all duration-300 hover:bg-purple-100">
                        <div className="flex items-center text-purple-700 font-medium mb-1">
                          <ShoppingBag className="w-4 h-4 text-purple-600 mr-2 animate-float" />
                          <span className="text-base">
                            Quyền đăng ký bán hàng
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs">
                          Đăng ký gói Premium để có quyền bán hàng trên nền
                          tảng. Ngoài ra bạn cũng sẽ có đầy đủ các quyền trong
                          gói miễn phí.
                        </p>
                      </div>
                    )}

                    {isFree && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 hover:shadow-md transition-all duration-300 hover:bg-blue-100">
                        <div className="flex items-center text-blue-700 font-medium mb-1">
                          <Users className="w-4 h-4 text-blue-600 mr-2 animate-float" />
                          <span className="text-base">
                            Gói trải nghiệm cơ bản
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs">
                          Gói miễn phí cho phép bạn mua sắm sản phẩm, đăng bài
                          thảo luận, đọc tin tức nông nghiệp và trò chuyện với
                          AI hỗ trợ.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className={`p-4 ${styles.headerClass}`}>
                  <Button
                    className={`w-full ${styles.buttonClass} py-4 text-base font-semibold transition-all duration-300 hover:shadow-lg group relative overflow-hidden`}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    <div className="absolute inset-0 w-0 bg-white opacity-20 group-hover:w-full transition-all duration-500 ease-out"></div>
                    <span className="relative z-10">
                      {isFree ? "Trải nghiệm ngay" : "Đăng ký Premium"}
                    </span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Phần so sánh hai gói */}
      <div className="mt-12 bg-white rounded-xl p-6 shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-xl animate-fade-in delay-800 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-center">
          So sánh gói Free và Premium
        </h2>
        <div className="overflow-hidden rounded-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 text-left font-semibold text-sm">
                  Tính năng
                </th>
                <th className="py-3 px-4 text-center font-semibold bg-blue-50 text-sm">
                  <div className="flex flex-col items-center">
                    <Shield className="w-5 h-5 text-blue-500 mb-1 animate-float" />
                    <span>Free</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-center font-semibold bg-purple-50 text-sm">
                  <div className="flex flex-col items-center">
                    <Award className="w-5 h-5 text-purple-500 mb-1 animate-float" />
                    <span>Premium</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-6 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : plans.length > 0 ? (
                (() => {
                  // Tìm gói Free và Premium
                  const freePlan = plans.find(
                    (p) => p.planType === "FREE" || p.price === 0
                  );
                  const premiumPlan = plans.find(
                    (p) =>
                      p.planType === "PREMIUM" ||
                      p.name.toLowerCase().includes("premium")
                  );

                  if (!freePlan || !premiumPlan) {
                    // Fallback nếu không tìm thấy plan
                    const hardcodedFeatures = [
                      {
                        feature: "Tham gia mua sắm sản phẩm",
                        free: true,
                        premium: true,
                      },
                      {
                        feature: "Đăng bài thảo luận trên diễn đàn",
                        free: true,
                        premium: true,
                      },
                      {
                        feature: "Đọc tin tức nông nghiệp",
                        free: true,
                        premium: true,
                      },
                      {
                        feature: "Trò chuyện với AI hỗ trợ",
                        free: true,
                        premium: true,
                      },
                      {
                        feature: "Dự báo thời tiết cơ bản",
                        free: true,
                        premium: true,
                      },
                      { feature: "Theo dõi mùa vụ", free: true, premium: true },
                      {
                        feature: "Quyền đăng ký bán hàng",
                        free: false,
                        premium: true,
                      },
                    ];

                    return hardcodedFeatures.map((item, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 ${
                          index % 2 === 0 ? "bg-gray-50" : ""
                        } animate-fade-in hover:bg-opacity-70 hover:bg-gray-100 transition-all duration-300`}
                        style={{ animationDelay: `${0.9 + index * 0.1}s` }}
                      >
                        <td className="py-2 px-4 text-left font-medium text-sm">
                          {item.feature}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {item.free ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <Check
                            className={`w-4 h-4 text-green-500 mx-auto ${
                              item.premium && !item.free ? "animate-bounce" : ""
                            }`}
                          />
                        </td>
                      </tr>
                    ));
                  }

                  // Gộp tất cả tính năng từ cả hai gói
                  const freeFeatures = freePlan.features
                    ? freePlan.features.split(",").map((f) => f.trim())
                    : [];
                  const premiumFeatures = premiumPlan.features
                    ? premiumPlan.features.split(",").map((f) => f.trim())
                    : [];

                  // Tạo mảng các tính năng duy nhất từ cả hai gói
                  const allFeatures = [
                    ...new Set([...freeFeatures, ...premiumFeatures]),
                  ];

                  return allFeatures.map((feature, index) => {
                    const isInFreePlan = freeFeatures.includes(feature);
                    const isInPremiumPlan = premiumFeatures.includes(feature);

                    return (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 ${
                          index % 2 === 0 ? "bg-gray-50" : ""
                        } animate-fade-in hover:bg-opacity-70 hover:bg-gray-100 transition-all duration-300`}
                        style={{ animationDelay: `${0.9 + index * 0.1}s` }}
                      >
                        <td className="py-2 px-4 text-left font-medium text-sm">
                          {feature}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {isInFreePlan ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {isInPremiumPlan ? (
                            <Check
                              className={`w-4 h-4 text-green-500 mx-auto ${
                                isInPremiumPlan && !isInFreePlan
                                  ? "animate-bounce"
                                  : ""
                              }`}
                            />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })()
              ) : (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-gray-500">
                    Không có dữ liệu về gói đăng ký
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phần FAQ - Câu hỏi thường gặp */}
      <div className="mt-10 p-6 bg-blue-50 rounded-xl shadow-md animate-fade-in delay-1000 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-center">
          Câu hỏi thường gặp
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              question: "Gói miễn phí có những quyền gì?",
              answer:
                "Gói miễn phí cho phép bạn mua sắm sản phẩm, đăng bài thảo luận trên diễn đàn, đọc tin tức nông nghiệp, trò chuyện với AI hỗ trợ, xem dự báo thời tiết cơ bản và theo dõi mùa vụ.",
            },
            {
              question: "Làm thế nào để đăng ký bán hàng?",
              answer:
                "Để bán hàng trên nền tảng, bạn cần đăng ký gói Premium. Sau khi đăng ký, bạn sẽ có quyền đăng ký làm người bán và đăng sản phẩm của mình lên nền tảng.",
            },
            {
              question: "Tôi có thể đăng bài viết với gói miễn phí không?",
              answer:
                "Có, với gói miễn phí bạn vẫn có thể đăng bài viết thảo luận trên diễn đàn và tham gia trao đổi với cộng đồng. Tuy nhiên, để đăng bán sản phẩm thì cần nâng cấp lên gói Premium.",
            },
            {
              question: "Tính năng trò chuyện với AI hoạt động như thế nào?",
              answer:
                "Cả hai gói đều cho phép bạn trò chuyện với AI hỗ trợ để được tư vấn về nông nghiệp, thời tiết và các vấn đề liên quan.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group animate-fade-in"
              style={{ animationDelay: `${1.1 + index * 0.1}s` }}
            >
              <h3 className="font-semibold text-base mb-1 group-hover:text-blue-600 transition-colors">
                {faq.question}
              </h3>
              <p className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
