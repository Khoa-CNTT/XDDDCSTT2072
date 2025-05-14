import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaStar, FaStarHalfAlt, FaRegStar, FaImage } from "react-icons/fa";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import PropTypes from "prop-types";
import {
  getProductFeedbacks,
  getProductFeedbackStats,
  checkCanReviewProduct,
} from "@/services/feedbackService";
import { Button } from "@/components/ui/button";
import ReviewForm from "./ReviewForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

// Hàm hiển thị rating dưới dạng sao
const RatingStars = ({ rating }) => {
  // Convert rating to array of stars (full, half, empty)
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
  }

  // Add empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
  }

  return <div className="flex">{stars}</div>;
};

const ReviewsSection = ({
  productId,
  productName,
  showReviewForm: externalShowReviewForm,
  setShowReviewForm: externalSetShowReviewForm,
}) => {
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [internalShowReviewForm, setInternalShowReviewForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định nếu sử dụng state bên ngoài hay bên trong
  const showReviewForm =
    externalShowReviewForm !== undefined
      ? externalShowReviewForm
      : internalShowReviewForm;
  const setShowReviewForm = (value) => {
    // Kiểm tra trước khi mở form đánh giá
    if (value === true && auth?.accessToken) {
      if (!canReview) {
        if (hasReviewed) {
          toast.info("Bạn đã đánh giá sản phẩm này rồi");
          return;
        } else if (!hasPurchased) {
          toast.error("Bạn cần mua sản phẩm này trước khi đánh giá");
          return;
        }
      }
    }

    // Gọi hàm set state tương ứng
    if (externalSetShowReviewForm) {
      externalSetShowReviewForm(value);
    } else {
      setInternalShowReviewForm(value);
    }
  };

  // Lấy đánh giá sản phẩm
  const {
    data: feedbacksData,
    isLoading: isLoadingFeedbacks,
    isError: isFeedbacksError,
    error: feedbacksError,
    refetch: refetchFeedbacks,
  } = useQuery({
    queryKey: ["productFeedbacks", productId, page, size],
    queryFn: () => getProductFeedbacks(axiosPrivate, productId, page, size),
    enabled: !!productId,
    keepPreviousData: true,
    onSuccess: (data) => {
      console.log("Feedback data:", data);
    },
    onError: (error) => {
      console.error("Error fetching feedbacks:", error);
    },
  });

  // Lấy dữ liệu phản hồi từ response cấu trúc { data: { content: [...] } }
  const feedbacksContent = feedbacksData?.data?.content || [];
  const totalPages = feedbacksData?.data?.totalPages || 0;

  // Lấy thống kê đánh giá
  const {
    data: statsData,
    refetch: refetchStats,
    isError: isStatsError,
    error: statsError,
  } = useQuery({
    queryKey: ["productFeedbackStats", productId],
    queryFn: () => getProductFeedbackStats(axiosPrivate, productId),
    enabled: !!productId,
    onSuccess: (data) => {
      console.log("Stats data:", data);
    },
    onError: (error) => {
      console.error("Error fetching stats:", error);
    },
  });

  // Lấy dữ liệu thống kê từ response
  const statsContent = statsData?.data || {};

  // Kiểm tra xem người dùng có thể đánh giá không
  const { data: canReviewData, refetch: refetchCanReview } = useQuery({
    queryKey: ["canReviewProduct", productId],
    queryFn: () => checkCanReviewProduct(axiosPrivate, productId),
    enabled: !!productId && !!auth?.accessToken,
    retry: false,
    onError: (error) => {
      console.error("Error checking can review:", error);
    },
    onSuccess: (data) => {
      console.log("Can review data:", data);
    },
  });

  const canReview = canReviewData?.data?.canReview || false;
  const hasPurchased = canReviewData?.data?.hasPurchased || false;
  const hasReviewed = canReviewData?.data?.hasReviewed || false;
  const averageRating = statsContent?.averageRating || 0;
  const totalReviews = statsContent?.totalReviews || 0;
  const ratingDistribution = statsContent?.ratingDistribution || {};

  // Xử lý khi đánh giá thành công
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    refetchFeedbacks();
    refetchStats();
    refetchCanReview();
  };

  // Xử lý khi chọn ảnh để xem
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Format thời gian
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Vừa xong";

      // Đảm bảo dateString có định dạng ISO
      const isoDateString = dateString.includes("T")
        ? dateString
        : dateString + "T00:00:00";

      const date = new Date(isoDateString);

      // Kiểm tra nếu date không hợp lệ
      if (isNaN(date.getTime())) {
        return "Vừa xong";
      }

      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Lỗi định dạng ngày tháng:", error);
      return "Vừa xong";
    }
  };

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-xl font-semibold mb-6">Đánh giá sản phẩm</h2>

      {/* Phần tổng quan đánh giá */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        {isStatsError ? (
          <div className="text-center text-red-500">
            <p>Không thể tải thống kê đánh giá.</p>
            {statsError && <p className="text-xs">{statsError.message}</p>}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center">
            {/* Số sao trung bình và tổng đánh giá */}
            <div className="flex flex-col items-center mr-10 mb-6 md:mb-0">
              <div className="text-4xl font-bold text-yellow-500 mb-2">
                {averageRating.toFixed(1)}/5
              </div>
              <div className="flex mb-1">
                <RatingStars rating={averageRating} />
              </div>
              <div className="text-sm text-gray-500">
                ({totalReviews} đánh giá)
              </div>
            </div>

            {/* Phân phối đánh giá theo số sao */}
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star] || 0;
                const percentage =
                  totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <div key={star} className="flex items-center mb-1">
                    <div className="w-10 text-sm text-gray-600 flex justify-end mr-2">
                      {star} <FaStar className="text-yellow-400 ml-1" />
                    </div>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-xs text-gray-500 ml-2">
                      {count} ({percentage.toFixed(0)}%)
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nút đánh giá */}
            <div className="mt-6 md:mt-0 md:ml-6">
              {auth?.accessToken ? (
                canReview ? (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Viết đánh giá
                  </Button>
                ) : hasReviewed ? (
                  <div className="text-sm text-gray-500 italic border p-3 rounded-md bg-gray-50">
                    Bạn đã đánh giá sản phẩm này rồi
                  </div>
                ) : hasPurchased ? (
                  <div className="text-sm text-gray-500 italic border p-3 rounded-md bg-gray-50">
                    Bạn đã mua sản phẩm này nhưng không thể đánh giá lúc này.
                    Đơn hàng của bạn có thể chưa được xử lý.
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic border p-3 rounded-md bg-gray-50">
                    Bạn cần mua sản phẩm này để có thể đánh giá
                  </div>
                )
              ) : (
                <div className="border p-3 rounded-md bg-gray-50 space-y-2">
                  <div className="text-sm text-gray-500 italic">
                    Vui lòng đăng nhập để đánh giá
                  </div>
                  <Button
                    onClick={() =>
                      navigate("/account/login", {
                        state: { from: location.pathname },
                      })
                    }
                    size="sm"
                    className="w-full"
                  >
                    Đăng nhập
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Danh sách đánh giá */}
      <div className="space-y-6">
        {isLoadingFeedbacks ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Đang tải đánh giá...</p>
          </div>
        ) : isFeedbacksError ? (
          <div className="text-center py-8 text-red-500">
            <p>Có lỗi xảy ra khi tải đánh giá. Vui lòng thử lại sau.</p>
            {feedbacksError && (
              <p className="text-xs mt-2">Chi tiết: {feedbacksError.message}</p>
            )}
          </div>
        ) : !feedbacksData?.data ? (
          <div className="text-center py-8 text-gray-500">
            Không thể tải dữ liệu đánh giá. Vui lòng thử lại sau.
          </div>
        ) : feedbacksContent.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
        ) : (
          <>
            {feedbacksContent.map((feedback) => (
              <div
                key={feedback.id}
                className="border p-4 rounded-lg shadow-sm bg-white"
              >
                {/* Thông tin người đánh giá */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        feedback.user?.imageUrl ||
                        "https://via.placeholder.com/40"
                      }
                      alt={feedback.user?.userName || "Người dùng"}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <span className="font-semibold block">
                        {feedback.user?.userName || "Người dùng"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(feedback.reviewDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < feedback.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    {feedback.isVerifiedPurchase && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Đã mua hàng
                      </span>
                    )}
                  </div>
                </div>

                {/* Nội dung đánh giá */}
                <p className="text-gray-700 mb-3 whitespace-pre-line">
                  {feedback.comment}
                </p>

                {/* Ảnh đánh giá */}
                {feedback.images && feedback.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {feedback.images.map((image, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 cursor-pointer relative group"
                        onClick={() => handleImageClick(image.imageUrl)}
                      >
                        <img
                          src={image.imageUrl}
                          alt={`Đánh giá ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-md flex items-center justify-center">
                          <FaImage className="text-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Phản hồi từ shop nếu có */}
                {feedback.reply && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-300">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">Phản hồi từ shop:</span>
                      <p className="mt-1">{feedback.reply}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Form đánh giá */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Đánh giá sản phẩm</DialogTitle>
          </DialogHeader>
          <ReviewForm
            productId={productId}
            productName={productName}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowReviewForm(false)}
          />
          <DialogClose className="absolute right-4 top-4" />
        </DialogContent>
      </Dialog>

      {/* Modal xem ảnh */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Hình ảnh đánh giá"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <DialogClose className="absolute right-2 top-2 bg-white rounded-full p-1" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

RatingStars.propTypes = {
  rating: PropTypes.number.isRequired,
};

ReviewsSection.propTypes = {
  productId: PropTypes.number.isRequired,
  productName: PropTypes.string.isRequired,
  showReviewForm: PropTypes.bool,
  setShowReviewForm: PropTypes.func,
};

export default ReviewsSection;
