import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { getUnreviewedProducts } from "@/services/feedbackService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star, ShoppingBag, Package2, LogIn } from "lucide-react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const UnreviewedProducts = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!auth?.accessToken) {
      toast.error("Vui lòng đăng nhập để xem sản phẩm cần đánh giá");
      navigate("/account/login", { state: { from: "/reviews/pending" } });
    }
  }, [auth, navigate]);

  // Fetch unreviewed products
  const {
    data: unreviewedProductsData,
    isLoading: isLoadingUnreviewedProducts,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["unreviewedProducts"],
    queryFn: () => getUnreviewedProducts(axiosPrivate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!auth?.accessToken, // Chỉ gọi API khi có accessToken
    retry: 1,
  });

  // Get unreviewed products from response
  const unreviewedProducts = unreviewedProductsData?.data || [];

  // Navigate to product detail page with review form open
  const navigateToReview = (productId) => {
    navigate(`/marketplace/${productId}`, { state: { showReviewForm: true } });
  };

  // Navigate to orders page
  const navigateToOrders = () => {
    navigate("/orders");
  };

  // Nếu chưa đăng nhập
  if (!auth?.accessToken) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <LogIn className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Vui lòng đăng nhập để tiếp tục
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để xem các sản phẩm cần đánh giá
          </p>
          <Button onClick={() => navigate("/account/login")}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  if (isLoadingUnreviewedProducts) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Đã xảy ra lỗi khi tải dữ liệu
          </h2>
          <p className="text-gray-600 mb-6">
            {error?.response?.data?.message ||
              error?.message ||
              "Lỗi không xác định"}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => refetch()}>Thử lại</Button>
            <Button variant="outline" onClick={() => navigate("/marketplace")}>
              Quay lại cửa hàng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Sản phẩm chưa đánh giá</h1>
          <p className="text-gray-600">
            Hãy chia sẻ trải nghiệm của bạn về những sản phẩm đã mua để giúp
            người khác có quyết định mua sắm tốt hơn.
          </p>
        </div>

        {unreviewedProducts.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Package2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Bạn chưa có sản phẩm nào cần đánh giá
            </h2>
            <p className="text-gray-600 mb-6">
              Sau khi mua và nhận hàng, bạn có thể đánh giá sản phẩm tại đây.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => navigate("/marketplace")}>
                Tiếp tục mua sắm
              </Button>
              <Button variant="outline" onClick={navigateToOrders}>
                Xem đơn hàng
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unreviewedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={product.imageUrl || "/placeholder-product.png"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <CardDescription>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.price)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center">
                      <ShoppingBag className="h-4 w-4 mr-2 text-green-600" />
                      <span>Đã mua thành công</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => navigateToReview(product.id)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Viết đánh giá
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnreviewedProducts;
