import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaTimes } from "react-icons/fa";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import PropTypes from "prop-types";

// Component thông báo đánh giá sản phẩm
const ReviewNotification = ({ getUnreviewedProducts }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Chỉ tải sản phẩm khi người dùng đã đăng nhập
    if (!auth?.accessToken) {
      setLoading(false);
      return;
    }

    const loadUnreviewedProducts = async () => {
      try {
        setLoading(true);
        const response = await getUnreviewedProducts(axiosPrivate);

        // Nếu có sản phẩm chưa đánh giá, hiển thị thông báo
        if (response && response.length > 0) {
          setProducts(response);

          // Hiển thị thông báo sau 3 giây để không làm phiền người dùng ngay khi vào trang
          setTimeout(() => {
            setShowNotification(true);
          }, 3000);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm chưa đánh giá:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUnreviewedProducts();
  }, [auth, axiosPrivate, getUnreviewedProducts]);

  // Xử lý khi người dùng click vào sản phẩm để đánh giá
  const handleReviewClick = (productId) => {
    navigate(`/product/${productId}`, { state: { showReviewForm: true } });
    setShowNotification(false);
  };

  // Ẩn thông báo
  const handleClose = () => {
    setShowNotification(false);
  };

  // Nếu đang tải hoặc không có sản phẩm cần đánh giá, không hiển thị gì
  if (loading || products.length === 0 || !showNotification) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 overflow-hidden">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">Đánh giá sản phẩm đã mua</h3>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Đóng thông báo"
        >
          <FaTimes />
        </button>
      </div>

      <p className="text-sm text-gray-600 mt-1 mb-3">
        Hãy đánh giá sản phẩm bạn đã mua để chia sẻ ý kiến với cộng đồng!
      </p>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => handleReviewClick(product.id)}
          >
            <img
              src={product.imageUrl || "https://via.placeholder.com/60"}
              alt={product.name}
              className="w-12 h-12 object-cover rounded-md border"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-800 truncate">
                {product.name}
              </h4>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-gray-300 w-3 h-3" />
                ))}
                <span className="text-xs text-gray-500 ml-1">
                  Chưa đánh giá
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-right">
        <button
          onClick={handleClose}
          className="text-xs text-gray-500 hover:underline"
        >
          Để sau
        </button>
      </div>
    </div>
  );
};

ReviewNotification.propTypes = {
  getUnreviewedProducts: PropTypes.func.isRequired,
};

export default ReviewNotification;
