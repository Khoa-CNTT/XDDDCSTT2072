import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProductById,
  getProductsByCategory,
  getProductImages,
  getFlashSaleForProduct,
} from "@/services/productService";
import { createCart } from "@/services/cartService";
import { getCouponsForProduct, validateCoupon } from "@/services/couponService";
import {
  getProductFeedbackStats,
  checkCanReviewProduct,
} from "@/services/feedbackService";
import {
  getUserWishlists,
  addToDefaultWishlist,
} from "@/services/wishlistService";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import Loading from "@/components/shared/Loading";
import { queryKeys } from "@/constant/queryKeys";
import {
  FaStar,
  FaShoppingCart,
  FaBolt,
  FaHeart,
  FaShare,
  FaChevronRight,
  FaChevronLeft,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaExclamationTriangle,
  FaTag,
  FaArrowRight,
  FaClock,
  FaPercentage,
} from "react-icons/fa";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import CouponList from "@/components/product/CouponList";
import ReviewsSection from "@/components/product/ReviewsSection";

import { useCartActions } from "@/hooks/useCartActions";

// Ảnh mặc định khi ảnh sản phẩm không tải được
const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/600x600?text=No+Image";

const ProductDetail = () => {
  const { id } = useParams();
  const { getCartQuery } = useCartActions();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [manualCouponCode, setManualCouponCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  // State cho flash sale
  const [flashSaleEndTime, setFlashSaleEndTime] = useState(null);
  const [flashSaleTimeLeft, setFlashSaleTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [flashSalePrice, setFlashSalePrice] = useState(null);
  const [flashSalePercentage, setFlashSalePercentage] = useState(0);

  const location = useLocation();
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Thêm state cho wishlist
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Kiểm tra người dùng có thể đánh giá không
  const { data: canReviewData } = useQuery({
    queryKey: ["canReviewProduct", id],
    queryFn: () => checkCanReviewProduct(axiosPrivate, id),
    enabled: !!id && !!auth?.accessToken,
    retry: 1,
    onError: (error) => {
      console.error("Lỗi khi kiểm tra quyền đánh giá:", error);
    },
  });

  // Lấy thông tin thống kê đánh giá
  const { data: statsContent } = useQuery({
    queryKey: ["reviewStats", id],
    queryFn: () => getProductFeedbackStats(axiosPrivate, id),
    enabled: !!id,
    retry: 1,
    onError: (error) => {
      console.error("Lỗi khi tải thống kê đánh giá:", error);
    },
  });

  // Kiểm tra nếu có yêu cầu hiển thị form đánh giá từ location state
  useEffect(() => {
    if (location.state?.showReviewForm) {
      // Chỉ hiển thị form đánh giá nếu người dùng đã mua sản phẩm
      if (canReviewData?.data?.canReview) {
        setShowReviewForm(true);
      } else if (canReviewData?.data) {
        if (!canReviewData.data.hasPurchased) {
          toast.error("Bạn cần mua sản phẩm này trước khi đánh giá");
        } else if (canReviewData.data.hasReviewed) {
          toast.info("Bạn đã đánh giá sản phẩm này rồi");
        }
      }
    }
  }, [location.state, canReviewData]);

  // Xử lý lỗi ảnh
  const handleImageError = () => {
    setImageError(true);
  };

  // Lấy thông tin sản phẩm
  const {
    data: product,
    isLoading,
    error: productError,
  } = useQuery({
    queryKey: queryKeys.productById(id),
    queryFn: () => getProductById(axiosPrivate, id),
    retry: 1,
    onError: (error) => {
      console.error("Lỗi khi tải sản phẩm:", error);
    },
  });

  // Lấy sản phẩm liên quan (cùng danh mục)
  const {
    data: relatedProductsData = { content: [] },
    isLoading: isLoadingRelated,
  } = useQuery({
    queryKey: product?.categoryId
      ? queryKeys.relatedProducts(id, product.categoryId)
      : ["relatedProducts", id, "none"],
    queryFn: () => getProductsByCategory(axiosPrivate, product?.categoryId),
    enabled: !!product?.categoryId,
    retry: 1,
    onError: (error) => {
      console.error("Lỗi khi tải sản phẩm liên quan:", error);
    },
  });

  // Lấy danh sách ảnh sản phẩm
  const { data: productImages = [], isLoading: isLoadingImages } = useQuery({
    queryKey: ["productImages", id],
    queryFn: () => getProductImages(axiosPrivate, id),
    enabled: !!product?.id,
    retry: 1,
    onError: (error) => {
      console.error("Lỗi khi tải ảnh sản phẩm:", error);
    },
  });

  // Lấy thông tin flash sale cho sản phẩm
  const { data: flashSaleData, isLoading: isLoadingFlashSale } = useQuery({
    queryKey: ["flashSale", id],
    queryFn: () => getFlashSaleForProduct(axiosPrivate, id),
    enabled: !!product?.id,
    retry: 1,
    onError: (error) => {
      console.error("Lỗi khi tải thông tin flash sale:", error);
    },
  });

  // Lấy sản phẩm liên quan từ data
  const relatedProducts = relatedProductsData?.content || [];

  // Lấy mã giảm giá cho sản phẩm
  const { data: productCouponsData, isLoading: isLoadingCoupons } = useQuery({
    queryKey: ["productCoupons", id],
    queryFn: () => getCouponsForProduct(axiosPrivate, id),
    retry: 1,
    enabled: !!product?.id,
    onError: (error) => {
      console.error("Lỗi khi tải mã giảm giá cho sản phẩm:", error);
    },
  });

  // Xử lý dữ liệu mã giảm giá
  const productCoupons = productCouponsData?.data || [];

  // Tính toán giá sau khi áp dụng mã giảm giá
  useEffect(() => {
    if (!product) return;

    // Lấy giá gốc (đã tính sale nếu có)
    const basePrice = product.onSale ? product.salePrice : product.price;

    // Nếu có mã giảm giá được chọn, tính toán giá sau khi giảm
    if (selectedCoupon) {
      let discount = 0;
      const totalPrice = basePrice * quantity;

      // Kiểm tra điều kiện tối thiểu
      if (
        selectedCoupon.minOrderValue &&
        totalPrice < selectedCoupon.minOrderValue
      ) {
        setCouponError(
          `Đơn hàng tối thiểu ${selectedCoupon.minOrderValue.toLocaleString()}đ`
        );
        setDiscountedPrice(basePrice);
        setDiscountAmount(0);
        return;
      }

      if (selectedCoupon.discountType === "PERCENTAGE") {
        discount = (totalPrice * selectedCoupon.discountValue) / 100;
        // Kiểm tra nếu có giới hạn giảm tối đa
        if (
          selectedCoupon.maxDiscountAmount &&
          discount > selectedCoupon.maxDiscountAmount
        ) {
          discount = selectedCoupon.maxDiscountAmount;
        }
      } else {
        discount = selectedCoupon.discountValue;
      }

      setDiscountAmount(discount);
      setDiscountedPrice(basePrice - discount / quantity);
      setCouponError("");
    } else {
      // Nếu không có mã giảm giá, giá sau giảm = giá gốc
      setDiscountedPrice(basePrice);
      setDiscountAmount(0);
      setCouponError("");
    }
  }, [selectedCoupon, product, quantity]);

  // Xử lý chọn mã giảm giá
  const handleSelectCoupon = (coupon) => {
    // Nếu đã chọn coupon này rồi, bỏ chọn
    if (selectedCoupon && selectedCoupon.id === coupon.id) {
      setSelectedCoupon(null);
      setManualCouponCode("");
    } else {
      setSelectedCoupon(coupon);
      setManualCouponCode(coupon.code);
    }
  };

  // Xử lý nhập mã giảm giá thủ công
  const handleManualCouponChange = (e) => {
    setManualCouponCode(e.target.value);
    // Nếu đang có coupon được chọn, bỏ chọn
    if (selectedCoupon) {
      setSelectedCoupon(null);
    }
  };

  // Xử lý áp dụng mã giảm giá thủ công
  const handleApplyCoupon = async () => {
    if (!manualCouponCode.trim()) {
      setCouponError("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      setIsValidatingCoupon(true);
      setCouponError("");

      // Kiểm tra mã giảm giá có hợp lệ không
      const basePrice = product.onSale ? product.salePrice : product.price;
      const totalPrice = basePrice * quantity;

      try {
        const response = await validateCoupon(
          axiosPrivate,
          manualCouponCode,
          auth?.user?.id || null,
          totalPrice
        );

        if (response.valid) {
          // Tìm coupon trong danh sách coupon sản phẩm
          const foundCoupon = productCoupons.find(
            (c) => c.code === manualCouponCode
          );

          if (foundCoupon) {
            setSelectedCoupon(foundCoupon);
            toast.success("Đã áp dụng mã giảm giá!");
          } else {
            // Nếu không tìm thấy, tạo coupon mới từ response
            const newCoupon = {
              id: response.couponId || Date.now(),
              code: manualCouponCode,
              discountType: response.discountType || "PERCENTAGE",
              discountValue: response.discountValue || 0,
              minOrderValue: response.minOrderValue || 0,
              maxDiscountAmount: response.maxDiscountAmount || null,
            };
            setSelectedCoupon(newCoupon);
            toast.success("Đã áp dụng mã giảm giá!");
          }
        } else {
          // Hiển thị lỗi từ response
          setCouponError(response.message || "Mã giảm giá không hợp lệ");
          setSelectedCoupon(null);
        }
      } catch (apiError) {
        console.error("Chi tiết lỗi API:", apiError);

        // Hiển thị chính xác lỗi từ response
        if (apiError.response?.data) {
          // Nếu response.data là string
          if (typeof apiError.response.data === "string") {
            setCouponError(apiError.response.data);
          }
          // Nếu có trường message
          else if (apiError.response.data.message) {
            setCouponError(apiError.response.data.message);
          }
          // Nếu có trường error
          else if (apiError.response.data.error) {
            setCouponError(apiError.response.data.error);
          }
          // Hiển thị toàn bộ response data dưới dạng string nếu không tìm thấy trường thông báo cụ thể
          else {
            setCouponError(JSON.stringify(apiError.response.data));
          }
        }
        // Hiển thị status text nếu không có response.data
        else if (apiError.response) {
          setCouponError(
            `Lỗi ${apiError.response.status}: ${apiError.response.statusText}`
          );
        }
        // Hiển thị thông báo lỗi trong trường hợp không có response
        else {
          setCouponError(
            apiError.message || "Lỗi không xác định khi kiểm tra mã giảm giá"
          );
        }

        setSelectedCoupon(null);
      }
    } catch (error) {
      console.error("Lỗi khi áp dụng mã giảm giá:", error);
      // Hiện thị thông tin lỗi chi tiết nhất có thể
      setCouponError(error.message || "Lỗi không xác định");
      setSelectedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  // Tăng số lượng
  const incrementQuantity = () => {
    if (product && quantity < product.quantity) {
      setQuantity(quantity + 1);
    } else {
      toast.error(
        `Không thể thêm. Chỉ còn ${product?.quantity || 0} sản phẩm trong kho!`
      );
    }
  };

  // Giảm số lượng
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Mua ngay
  const buyNow = async () => {
    try {
      // Kiểm tra số lượng với tồn kho
      if (product && quantity > product.quantity) {
        toast.error(
          `Không thể mua ngay. Chỉ còn ${product.quantity} sản phẩm trong kho!`
        );
        return;
      }

      // Kiểm tra đăng nhập
      if (!auth?.accessToken) {
        toast.info("Vui lòng đăng nhập để mua sản phẩm");
        navigate("/account/login", {
          state: { from: { pathname: `/farmhub2/product/${id}` } },
        });
        return;
      }

      // Tạo dữ liệu giỏ hàng
      const cartData = {
        productId: product.id,
        quantity: quantity,
      };

      // Truyền flash sale price nếu có
      if (flashSalePrice) {
        cartData.isFlashSale = true;
        cartData.flashSalePrice = flashSalePrice;
      }

      // Gọi API để thêm sản phẩm vào giỏ hàng
      await createCart(
        axiosPrivate,
        cartData.productId,
        cartData.quantity,
        null, // Không còn sử dụng coupon
        cartData.isFlashSale,
        cartData.flashSalePrice
      );

      await getCartQuery.refetch();
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);

      // Chuyển đến trang thanh toán
      navigate("/checkout", {
        state: {
          fromBuyNow: true,
          productId: product.id,
          quantity: quantity,
          flashSalePrice: flashSalePrice,
        },
      });
    } catch (error) {
      console.error("Lỗi khi mua ngay:", error);
      if (error.response && error.response.status === 400) {
        // Xử lý lỗi 400 Bad Request - có thể là vấn đề về số lượng
        if (error.response.data && error.response.data.message) {
          toast.error(`Không thể mua ngay: ${error.response.data.message}`);
        } else {
          toast.error("Số lượng sản phẩm vượt quá số lượng trong kho");
        }
      } else {
        toast.error("Có lỗi xảy ra khi xử lý mua ngay.");
      }
    }
  };

  // Thêm vào giỏ hàng
  const addToCart = async () => {
    try {
      // Kiểm tra số lượng với tồn kho
      if (product && quantity > product.quantity) {
        toast.error(
          `Không thể thêm vào giỏ hàng. Chỉ còn ${product.quantity} sản phẩm trong kho!`
        );
        return;
      }

      // Kiểm tra đăng nhập
      if (!auth?.accessToken) {
        toast.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
        navigate("/account/login", {
          state: { from: { pathname: `/farmhub2/product/${id}` } },
        });
        return;
      }

      // Tạo dữ liệu giỏ hàng
      const cartData = {
        productId: product.id,
        quantity: quantity,
      };

      // Truyền flash sale price nếu có
      if (flashSalePrice) {
        cartData.isFlashSale = true;
        cartData.flashSalePrice = flashSalePrice;
      }

      // Gọi API để thêm sản phẩm vào giỏ hàng
      await createCart(
        axiosPrivate,
        cartData.productId,
        cartData.quantity,
        null, // Không còn sử dụng coupon
        cartData.isFlashSale,
        cartData.flashSalePrice
      );
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      if (error.response && error.response.status === 400) {
        // Xử lý lỗi 400 Bad Request - có thể là vấn đề về số lượng
        if (error.response.data && error.response.data.message) {
          toast.error(
            `Không thể thêm vào giỏ hàng: ${error.response.data.message}`
          );
        } else {
          toast.error("Số lượng sản phẩm vượt quá số lượng trong kho");
        }
      } else {
        toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
      }
    }
  };

  // Hiển thị gallery hình ảnh
  const renderImageGallery = () => {
    // Nếu không có sản phẩm hoặc đang tải, hiển thị placeholder
    if (!product || isLoading || !productImages || imageError) {
      return (
        <div className="relative h-[400px] overflow-hidden rounded-lg mb-3">
          <img
            src={DEFAULT_PRODUCT_IMAGE}
            alt="Placeholder"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      );
    }

    // Tạo gallery từ ảnh sản phẩm
    const images =
      productImages.length > 0
        ? productImages.map((img) => img.imageUrl)
        : [product.imageUrl];

    // Đảm bảo currentImageIndex không vượt quá số lượng ảnh
    if (currentImageIndex >= images.length) {
      setCurrentImageIndex(0);
    }

    return (
      <div className="relative">
        <div className="relative h-[400px] overflow-hidden rounded-lg mb-3">
          <img
            src={images[currentImageIndex]}
            alt={product.productName}
            className="w-full h-full object-cover rounded-lg"
            onError={handleImageError}
          />

          {/* Nút điều hướng - chỉ hiển thị nếu có nhiều hơn 1 ảnh */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  )
                }
              >
                <FaChevronLeft />
              </button>
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  )
                }
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {/* Badge giảm giá Flash Sale */}
          {flashSalePrice && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
              <FaBolt className="text-yellow-300" />
              <span>Giảm {flashSalePercentage}%</span>
            </div>
          )}
          {/* Badge giảm giá thường (nếu không có flash sale) */}
          {!flashSalePrice && product.onSale && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
              Giảm{" "}
              {Math.round(
                ((product.price - product.salePrice) / product.price) * 100
              )}
              %
            </div>
          )}
        </div>

        {/* Thumbnail gallery - hiển thị khi có nhiều ảnh */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                  currentImageIndex === idx
                    ? "border-green-500"
                    : "border-transparent"
                }`}
                onClick={() => setCurrentImageIndex(idx)}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Xử lý dữ liệu flash sale
  useEffect(() => {
    if (flashSaleData?.success && flashSaleData?.data) {
      const flashSale = flashSaleData.data;

      // Tìm sản phẩm trong danh sách flash sale
      const flashSaleProduct = flashSale.items?.find(
        (item) => item.productId === parseInt(id)
      );

      if (flashSaleProduct) {
        // Cập nhật giá flash sale
        setFlashSalePrice(flashSaleProduct.flashSalePrice);

        // Tính % giảm giá
        if (product && product.price > 0) {
          const discount = Math.round(
            ((product.price - flashSaleProduct.flashSalePrice) /
              product.price) *
              100
          );
          setFlashSalePercentage(discount);
        }

        // Cập nhật thời gian kết thúc
        const endTime = new Date(flashSale.endDate);
        setFlashSaleEndTime(endTime);
      }
    }
  }, [flashSaleData, product, id]);

  // Cập nhật đếm ngược thời gian flash sale
  useEffect(() => {
    if (!flashSaleEndTime) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = flashSaleEndTime - now;

      if (difference <= 0) {
        // Flash sale đã kết thúc
        setFlashSaleTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setFlashSalePrice(null);
        setFlashSaleEndTime(null);
        return;
      }

      // Tính toán thời gian còn lại
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setFlashSaleTimeLeft({ hours, minutes, seconds });
    };

    // Tính thời gian lần đầu
    calculateTimeLeft();

    // Cập nhật mỗi giây
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [flashSaleEndTime]);

  // Hiển thị bộ đếm ngược flash sale
  const renderFlashSaleCountdown = () => {
    if (!flashSaleEndTime) return null;

    const { hours, minutes, seconds } = flashSaleTimeLeft;

    return (
      <div className="bg-red-100 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
          <FaBolt className="text-red-500" />
          <span>FLASH SALE</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="bg-red-600 text-white font-bold px-2 py-1 rounded">
              {String(hours).padStart(2, "0")}
            </div>
            <span className="text-red-600 font-bold">:</span>
            <div className="bg-red-600 text-white font-bold px-2 py-1 rounded">
              {String(minutes).padStart(2, "0")}
            </div>
            <span className="text-red-600 font-bold">:</span>
            <div className="bg-red-600 text-white font-bold px-2 py-1 rounded">
              {String(seconds).padStart(2, "0")}
            </div>
          </div>
          <span className="text-red-500 text-sm">Kết thúc trong</span>
        </div>
      </div>
    );
  };

  // Hiển thị giá sản phẩm
  const renderProductPrice = () => {
    if (!product) return null;

    // Nếu có flash sale
    if (flashSalePrice) {
      return (
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-red-600">
              {flashSalePrice.toLocaleString()}đ
            </span>
            <span className="text-gray-500 line-through">
              {product.price.toLocaleString()}đ
            </span>
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
              -{flashSalePercentage}%
            </span>
          </div>
        </div>
      );
    }

    // Nếu sản phẩm đang sale
    if (product.onSale) {
      const discountPercentage = Math.round(
        ((product.price - product.salePrice) / product.price) * 100
      );

      return (
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-red-600">
              {product.salePrice.toLocaleString()}đ
            </span>
            <span className="text-gray-500 line-through">
              {product.price.toLocaleString()}đ
            </span>
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
              -{discountPercentage}%
            </span>
          </div>
        </div>
      );
    }

    // Giá thường
    return (
      <div className="mt-4">
        <span className="text-3xl font-bold text-gray-800">
          {product.price.toLocaleString()}đ
        </span>
      </div>
    );
  };

  // Kiểm tra xem sản phẩm đã nằm trong danh sách yêu thích chưa
  useEffect(() => {
    if (auth?.accessToken && product?.id) {
      const checkWishlistStatus = async () => {
        try {
          const wishlists = await getUserWishlists(axiosPrivate);
          if (wishlists && wishlists.length > 0) {
            // Tìm danh sách mặc định
            const defaultWishlist = wishlists.find((w) => w.isDefault === true);
            if (defaultWishlist && defaultWishlist.items) {
              // Kiểm tra sản phẩm có trong danh sách không
              const found = defaultWishlist.items.some(
                (item) => parseInt(item.productId) === parseInt(product.id)
              );
              setIsInWishlist(found);
            }
          }
        } catch (error) {
          console.error("Không thể kiểm tra trạng thái wishlist:", error);
        }
      };

      checkWishlistStatus();
    }
  }, [auth?.accessToken, product?.id, axiosPrivate]);

  // Thêm hàm xử lý thêm vào danh sách yêu thích
  const handleAddToWishlist = async () => {
    // Kiểm tra đăng nhập
    if (!auth?.accessToken) {
      toast.info("Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích");
      navigate("/account/login", {
        state: { from: { pathname: `/farmhub2/product/${id}` } },
      });
      return;
    }

    try {
      setAddingToWishlist(true);
      console.log("Chuẩn bị thêm sản phẩm vào wishlist, productId:", id);

      // Chuẩn bị dữ liệu sản phẩm cần thêm vào wishlist
      const wishlistItem = {
        productId: parseInt(id),
        variantId: null, // Có thể thêm logic chọn variant nếu cần
      };

      console.log("Dữ liệu item gửi đi:", wishlistItem);

      // Gọi service để thêm vào danh sách yêu thích mặc định
      const response = await addToDefaultWishlist(axiosPrivate, wishlistItem);
      console.log("Phản hồi từ API:", response);

      setIsInWishlist(true);
      toast.success("Đã thêm vào danh sách yêu thích");
    } catch (error) {
      console.error("Lỗi khi thêm vào danh sách yêu thích:", error);

      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes("đã tồn tại")
      ) {
        setIsInWishlist(true);
        toast.info("Sản phẩm đã có trong danh sách yêu thích");
      } else {
        toast.error("Không thể thêm vào danh sách yêu thích");
      }
    } finally {
      setAddingToWishlist(false);
    }
  };

  // Main render
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1">
        {/* Nếu đang tải, hiển thị loading */}
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Loading />
          </div>
        ) : // Nếu có lỗi hoặc không có dữ liệu sản phẩm
        productError || !product ? (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {productError ? "Lỗi khi tải sản phẩm" : "Sản phẩm không tồn tại"}
            </h2>
            <p className="text-gray-600 mb-8">
              {productError
                ? "Đã xảy ra lỗi khi tải thông tin sản phẩm. Vui lòng thử lại sau."
                : "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
            </p>
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              onClick={() => navigate("/farmhub2")}
            >
              Quay lại cửa hàng
            </button>
          </div>
        ) : (
          // Content chi tiết sản phẩm
          <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
            {/* Đường dẫn điều hướng */}
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <span
                className="hover:text-green-500 cursor-pointer"
                onClick={() => navigate("/farmhub2")}
              >
                Trang chủ
              </span>
              <span className="mx-2">/</span>
              <span
                className="hover:text-green-500 cursor-pointer"
                onClick={() =>
                  navigate(`/farmhub2/category/${product.categoryId}`)
                }
              >
                {product.categoryName || "Danh mục"}
              </span>
              <span className="mx-2">/</span>
              <span className="text-green-500">{product.productName}</span>
            </div>

            {/* Thông tin chi tiết sản phẩm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Ảnh sản phẩm - Cột trái */}
              <div className="md:sticky md:top-24 self-start">
                {renderImageGallery()}
              </div>

              {/* Thông tin sản phẩm - Cột phải */}
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {product.productName}
                </h1>

                {/* Đánh giá sản phẩm */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`${
                          star <=
                          (product.averageRating ||
                            statsContent?.data?.averageRating ||
                            0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500">
                    {(
                      product.averageRating ||
                      statsContent?.data?.averageRating ||
                      0
                    ).toFixed(1)}
                    /5 (
                    {product.totalReviews ||
                      statsContent?.data?.totalReviews ||
                      0}{" "}
                    đánh giá)
                  </span>
                </div>

                {/* Flash Sale Countdown */}
                {renderFlashSaleCountdown()}

                {/* Giá sản phẩm */}
                {renderProductPrice()}

                {/* Số lượng */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng
                  </label>
                  <div className="flex items-center w-36">
                    <button
                      className="bg-gray-200 px-3 py-2 rounded-l-md"
                      onClick={decrementQuantity}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-16 text-center border-gray-200 border-t border-b py-2"
                    />
                    <button
                      className="bg-gray-200 px-3 py-2 rounded-r-md"
                      onClick={incrementQuantity}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.quantity} sản phẩm có sẵn
                  </p>
                </div>

                {/* Thông tin vận chuyển */}
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <FaTruck className="text-blue-500 mt-1" />
                    <div>
                      <p className="font-medium">Miễn phí vận chuyển</p>
                      <p className="text-sm text-gray-600">
                        Miễn phí vận chuyển cho đơn hàng từ 300.000đ
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mb-3">
                    <FaShieldAlt className="text-blue-500 mt-1" />
                    <div>
                      <p className="font-medium">Bảo đảm chất lượng</p>
                      <p className="text-sm text-gray-600">
                        Sản phẩm đảm bảo chất lượng từ nhà sản xuất
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaUndo className="text-blue-500 mt-1" />
                    <div>
                      <p className="font-medium">Đổi trả dễ dàng</p>
                      <p className="text-sm text-gray-600">
                        Đổi trả trong vòng 7 ngày nếu sản phẩm lỗi
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nút mua hàng */}
                <div className="flex flex-wrap gap-4 mt-6">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 flex-1 justify-center"
                    onClick={buyNow}
                  >
                    <FaBolt />
                    Mua ngay
                  </button>
                  <button
                    className="bg-orange-100 text-orange-500 hover:bg-orange-200 px-6 py-3 rounded-lg flex items-center gap-2 flex-1 justify-center"
                    onClick={addToCart}
                  >
                    <FaShoppingCart />
                    Thêm vào giỏ
                  </button>
                </div>

                {/* Chia sẻ và thích */}
                <div className="flex items-center gap-6 mt-6">
                  <button className="text-gray-500 hover:text-green-500 flex items-center gap-2">
                    <FaShare />
                    Chia sẻ
                  </button>
                  <Button
                    variant={isInWishlist ? "default" : "outline"}
                    size="sm"
                    className={`flex items-center gap-2 rounded-full transition-all ${
                      isInWishlist
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "hover:bg-red-50 border border-red-300 text-red-500"
                    }`}
                    onClick={handleAddToWishlist}
                    disabled={addingToWishlist}
                  >
                    <Heart
                      size={18}
                      className={isInWishlist ? "text-white" : ""}
                      fill={isInWishlist ? "currentColor" : "none"}
                    />
                    {isInWishlist ? "Đã thích" : "Yêu thích"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs thông tin chi tiết */}
            <div className="mt-10">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="mb-4 border-b w-full justify-start rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="description"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-700 bg-transparent py-3 px-4 text-sm font-medium text-gray-600"
                  >
                    Mô tả sản phẩm
                  </TabsTrigger>
                  <TabsTrigger
                    value="specifications"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-700 bg-transparent py-3 px-4 text-sm font-medium text-gray-600"
                  >
                    Thông số kỹ thuật
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-700 bg-transparent py-3 px-4 text-sm font-medium text-gray-600"
                  >
                    Đánh giá (
                    {statsContent?.data?.totalReviews ||
                      product?.totalReviews ||
                      0}
                    )
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="py-4">
                  <h3 className="text-xl font-bold mb-4">Mô tả sản phẩm</h3>
                  <div className="prose max-w-full">
                    <p>{product.description || "Không có mô tả sản phẩm"}</p>
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="py-4">
                  <h3 className="text-xl font-bold mb-4">Thông số kỹ thuật</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full table-auto">
                      <tbody className="divide-y">
                        <tr className="bg-gray-50">
                          <td className="p-3 font-medium">Mã sản phẩm</td>
                          <td className="p-3">{product.id}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Danh mục</td>
                          <td className="p-3">{product.categoryName}</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-3 font-medium">
                            Số lượng trong kho
                          </td>
                          <td className="p-3">{product.quantity} sản phẩm</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Trọng lượng</td>
                          <td className="p-3">{product.weight || "N/A"} kg</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-3 font-medium">Kích thước</td>
                          <td className="p-3">{product.dimensions || "N/A"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="py-4">
                  {product && (
                    <ReviewsSection
                      productId={product.id}
                      productName={product.productName}
                      showReviewForm={showReviewForm}
                      setShowReviewForm={(value) => {
                        // Kiểm tra kỹ trước khi mở form đánh giá
                        if (value === true) {
                          // Kiểm tra đăng nhập
                          if (!auth?.accessToken) {
                            toast.info("Vui lòng đăng nhập để đánh giá");
                            navigate("/account/login", {
                              state: { from: location.pathname },
                            });
                            return;
                          }

                          // Kiểm tra quyền đánh giá
                          if (canReviewData?.data) {
                            if (!canReviewData.data.hasPurchased) {
                              toast.error(
                                "Bạn chưa mua sản phẩm này nên không thể đánh giá"
                              );
                              return;
                            }

                            if (canReviewData.data.hasReviewed) {
                              toast.info("Bạn đã đánh giá sản phẩm này rồi");
                              return;
                            }

                            if (!canReviewData.data.canReview) {
                              toast.error(
                                "Bạn không có quyền đánh giá sản phẩm này"
                              );
                              return;
                            }
                          }
                        }

                        // Nếu kiểm tra qua hết, hoặc đang đóng form, thì thực hiện
                        setShowReviewForm(value);
                      }}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sản phẩm liên quan */}
            {relatedProducts.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Sản phẩm liên quan</h2>
                  <button
                    className="text-green-600 flex items-center gap-1 hover:underline"
                    onClick={() =>
                      navigate(`/farmhub2/category/${product.categoryId}`)
                    }
                  >
                    Xem thêm <FaArrowRight size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {relatedProducts
                    .filter((p) => p.id !== product.id)
                    .slice(0, 4)
                    .map((product) => (
                      <motion.div
                        key={product.id}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                      >
                        <div className="relative h-48">
                          <img
                            src={product.imageUrl || DEFAULT_PRODUCT_IMAGE}
                            alt={product.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = DEFAULT_PRODUCT_IMAGE;
                            }}
                          />
                          {product.onSale && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              Sale
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-medium line-clamp-2 mb-2">
                            {product.productName}
                          </h3>
                          <div className="flex justify-between items-end">
                            <div>
                              {product.onSale ? (
                                <div>
                                  <span className="text-red-600 font-bold">
                                    {product.salePrice.toLocaleString()}đ
                                  </span>
                                  <br />
                                  <span className="text-gray-400 text-xs line-through">
                                    {product.price.toLocaleString()}đ
                                  </span>
                                </div>
                              ) : (
                                <span className="font-bold">
                                  {product.price.toLocaleString()}đ
                                </span>
                              )}
                            </div>
                            <button
                              className="text-green-600 hover:bg-green-50 p-2 rounded-full"
                              onClick={() => navigate(`/product/${product.id}`)}
                            >
                              <FaArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
