import { useState, useRef, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { FaStar, FaCamera, FaTimes, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  createFeedback,
  checkCanReviewProduct,
} from "@/services/feedbackService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useAuth from "@/hooks/useAuth";
import PropTypes from "prop-types";

const ReviewForm = ({ productId, productName, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();

  // Kiểm tra xem người dùng có thể đánh giá sản phẩm này không
  const {
    data: canReviewData,
    isLoading: isCheckingPermission,
    isError: isCheckError,
  } = useQuery({
    queryKey: ["canReviewProduct", productId],
    queryFn: () => checkCanReviewProduct(axiosPrivate, productId),
    enabled: !!productId && !!auth?.accessToken,
    retry: 1,
    onError: (error) => {
      console.error("Lỗi khi kiểm tra quyền đánh giá:", error);
      if (onCancel) {
        setTimeout(() => {
          toast.error(
            "Không thể xác minh quyền đánh giá. Vui lòng thử lại sau."
          );
          onCancel();
        }, 1000);
      }
    },
  });

  // Lấy kết quả kiểm tra
  const canReview = canReviewData?.data?.canReview || false;
  const hasPurchased = canReviewData?.data?.hasPurchased || false;
  const hasReviewed = canReviewData?.data?.hasReviewed || false;

  // Hiển thị thông báo và đóng form nếu không thể đánh giá
  useEffect(() => {
    if (!isCheckingPermission && !isCheckError && !canReview) {
      if (hasReviewed) {
        toast.info("Bạn đã đánh giá sản phẩm này rồi");
      } else if (!hasPurchased) {
        toast.error("Bạn cần mua sản phẩm này trước khi đánh giá");
      } else {
        toast.error(
          "Bạn không thể đánh giá sản phẩm này lúc này. Đơn hàng của bạn có thể chưa được xử lý."
        );
      }

      if (onCancel) {
        setTimeout(() => onCancel(), 1000);
      }
    }
  }, [
    canReview,
    hasPurchased,
    hasReviewed,
    isCheckingPermission,
    isCheckError,
    onCancel,
  ]);

  // Xử lý thay đổi rating
  const handleRatingChange = (value) => {
    setRating(value);
  };

  // Xử lý hover rating
  const handleRatingHover = (value) => {
    setHoverRating(value);
  };

  // Xử lý chọn ảnh
  const handleImageSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Kiểm tra số lượng ảnh (tối đa 5 ảnh)
    if (images.length + selectedFiles.length > 5) {
      toast.warning("Bạn chỉ có thể tải lên tối đa 5 ảnh");
      return;
    }

    // Kiểm tra kích thước và loại file
    const validFiles = selectedFiles.filter((file) => {
      // Kiểm tra loại file (chỉ chấp nhận ảnh)
      if (!file.type.startsWith("image/")) {
        toast.error(`File "${file.name}" không phải là ảnh`);
        return false;
      }

      // Kiểm tra kích thước (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" vượt quá 5MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Thêm file vào state
    setImages((prev) => [...prev, ...validFiles]);

    // Tạo URL preview cho các ảnh đã chọn
    const newPreviewImages = validFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewImages((prev) => [...prev, ...newPreviewImages]);
  };

  // Xử lý xóa ảnh
  const handleRemoveImage = (index) => {
    // Xóa file khỏi danh sách
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    // Xóa URL preview và giải phóng bộ nhớ
    URL.revokeObjectURL(previewImages[index]);
    const newPreviewImages = [...previewImages];
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
  };

  // Xử lý gửi đánh giá
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra lại một lần nữa để đảm bảo người dùng đã mua sản phẩm
    if (!hasPurchased) {
      toast.error("Bạn chưa mua sản phẩm này nên không thể đánh giá");
      if (onCancel) {
        setTimeout(() => onCancel(), 1000);
      }
      return;
    }

    // Kiểm tra xem người dùng đã đánh giá chưa
    if (hasReviewed) {
      toast.info("Bạn đã đánh giá sản phẩm này rồi");
      if (onCancel) {
        setTimeout(() => onCancel(), 1000);
      }
      return;
    }

    if (rating < 1) {
      toast.warning("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (!comment.trim()) {
      toast.warning("Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      setSubmitting(true);

      // Tạo dữ liệu đánh giá
      const feedbackData = {
        productId: productId,
        rating: rating,
        comment: comment.trim(),
      };

      // Gọi API tạo đánh giá
      const response = await createFeedback(axiosPrivate, feedbackData, images);

      // Làm mới cache để hiển thị đánh giá mới
      queryClient.invalidateQueries(["productFeedbacks", productId]);
      queryClient.invalidateQueries(["productFeedbackStats", productId]);

      // Thông báo thành công
      toast.success("Đánh giá sản phẩm thành công!");

      // Gọi callback thành công nếu có
      if (onSuccess) {
        onSuccess(response);
      }

      // Reset form
      setRating(5);
      setComment("");

      // Giải phóng bộ nhớ từ URL preview
      previewImages.forEach((url) => URL.revokeObjectURL(url));
      setImages([]);
      setPreviewImages([]);
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">
        Đánh giá sản phẩm: {productName}
      </h3>

      {isCheckingPermission ? (
        <div className="flex flex-col items-center justify-center py-8">
          <FaSpinner className="animate-spin text-blue-500 text-2xl mb-4" />
          <p className="text-gray-600">Đang kiểm tra quyền đánh giá...</p>
        </div>
      ) : isCheckError ? (
        <div className="text-center py-8 text-red-500">
          <p>Có lỗi xảy ra khi kiểm tra quyền đánh giá.</p>
          <Button variant="outline" className="mt-4" onClick={onCancel}>
            Đóng
          </Button>
        </div>
      ) : !canReview ? (
        <div className="text-center py-8">
          {hasReviewed ? (
            <p className="text-blue-500">Bạn đã đánh giá sản phẩm này rồi.</p>
          ) : !hasPurchased ? (
            <p className="text-red-500">
              Bạn cần mua sản phẩm này trước khi đánh giá.
            </p>
          ) : (
            <p className="text-red-500">
              Đơn hàng của bạn có thể chưa được xử lý.
            </p>
          )}
          <Button variant="outline" className="mt-4" onClick={onCancel}>
            Đóng
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Rating stars */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Chọn số sao đánh giá:</p>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={() => handleRatingHover(0)}
                  className="text-2xl mr-1 focus:outline-none"
                >
                  <FaStar
                    className={`${
                      (hoverRating || rating) >= star
                        ? "text-yellow-400"
                        : "text-gray-300"
                    } hover:text-yellow-400 transition-colors`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">{rating} sao</span>
            </div>
          </div>

          {/* Comment textarea */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Nội dung đánh giá:</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              className="w-full border rounded-md p-2 text-sm"
              required
            />
          </div>

          {/* Image uploads */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Hình ảnh sản phẩm (tối đa 5 ảnh):
            </p>

            {/* Preview images */}
            {previewImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {previewImages.map((url, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={url}
                      alt={`Preview ${index}`}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Image upload button */}
            {images.length < 5 && (
              <div className="flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center text-sm"
                >
                  <FaCamera className="mr-2" />
                  Thêm ảnh
                </Button>
                <span className="text-xs text-gray-500 ml-3">
                  {images.length}/5 ảnh, JPG/PNG, tối đa 5MB mỗi ảnh
                </span>
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="text-sm"
                disabled={submitting}
              >
                Hủy
              </Button>
            )}

            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white text-sm flex items-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : (
                "Gửi đánh giá"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

ReviewForm.propTypes = {
  productId: PropTypes.number.isRequired,
  productName: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

export default ReviewForm;
