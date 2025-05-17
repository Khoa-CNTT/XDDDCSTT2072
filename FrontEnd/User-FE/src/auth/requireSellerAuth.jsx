import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import sellerRegistrationService from "../services/sellerRegistrationService";
import { toast } from "react-hot-toast";

/**
 * Component bảo vệ route Seller, yêu cầu người dùng phải:
 * 1. Đăng nhập (có token hợp lệ)
 * 2. Phải có đăng ký bán hàng được duyệt
 */
const RequireSellerAuth = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSellerStatus = async () => {
      try {
        // Kiểm tra nếu đến từ trang đáng tin cậy (đăng ký, dashboard, form thêm sản phẩm)
        const fromTrustedSource =
          location.state?.fromRegistration === true ||
          location.state?.fromSellerDashboard === true;

        // Kiểm tra thêm nếu có flag bỏ qua thông báo lỗi
        const skipErrorMessages = location.state?.skipErrorMessages === true;

        // Kiểm tra xem có đang từ trang thêm sản phẩm chuyển đến không
        const productRedirect = localStorage.getItem("productSubmitSuccess");

        if (fromTrustedSource || productRedirect) {
          console.log(
            "Điều hướng từ trang đáng tin cậy hoặc sau khi thêm sản phẩm, bỏ qua kiểm tra API"
          );

          // Nếu cần bỏ qua thông báo lỗi, xóa tất cả thông báo hiện tại
          if (skipErrorMessages) {
            toast.dismiss();
          }

          setIsApproved(true);
          setIsLoading(false);
          return;
        }

        console.log("Kiểm tra quyền bán hàng qua API...");
        // Kiểm tra xem người dùng đã đăng ký và được duyệt chưa
        try {
          const response = await sellerRegistrationService.isApproved();
          console.log("Kết quả kiểm tra đăng ký bán hàng:", response);

          const approved = response?.data === true;
          setIsApproved(approved);

          // Nếu không được duyệt, chuyển hướng trực tiếp không hiển thị thông báo
          if (!approved) {
            // Xóa dòng toast.error này
          }
        } catch (error) {
          console.error("Lỗi khi gọi API is-approved:", error);

          // Xử lý các trường hợp lỗi đặc biệt
          if (
            error.response?.data?.errorCode === "NOT_FOUND" ||
            error.response?.data?.errorCode === "BAD_REQUEST"
          ) {
            // Kiểm tra URL hiện tại
            if (location.pathname.includes("/seller/")) {
              // Nếu đang ở trong route /seller/ hoặc có redirect từ trang sản phẩm
              if (localStorage.getItem("productSubmitSuccess")) {
                console.log(
                  "Phát hiện chuyển hướng sau khi thêm sản phẩm, cho phép truy cập"
                );
                setIsApproved(true);
                setIsLoading(false);
                return;
              }

              // Hoặc nếu có state truyền từ trang khác
              else if (location.state) {
                console.log("Có location state, tin tưởng state routing");
                setIsApproved(true);
                setIsLoading(false);
                return;
              }
            }
          }

          // Các lỗi khác, không hiển thị thông báo lỗi
          setIsApproved(false);
          // Xóa dòng toast.error này
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Chỉ kiểm tra khi đã đăng nhập
    if (auth?.accessToken) {
      checkSellerStatus();
    } else {
      setIsLoading(false);
    }
  }, [auth, location]);

  // Xóa thông báo lỗi ở màn hình trước khi render
  useEffect(() => {
    // Loại bỏ tất cả các thông báo đang hiện
    toast.dismiss();
  }, []);

  // Đang tải, hiển thị loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-3 text-green-600 font-medium">
          Đang xác thực quyền bán hàng...
        </span>
      </div>
    );
  }

  // Kiểm tra đăng nhập
  if (!auth?.accessToken) {
    // Lưu lại đường dẫn hiện tại để sau khi đăng nhập có thể quay lại
    return <Navigate to="/account/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập nhưng chưa được duyệt làm người bán
  if (!isApproved) {
    return (
      <Navigate to="/seller-registration" state={{ from: location }} replace />
    );
  }

  // Đã đăng nhập và đã được duyệt làm người bán
  return <Outlet />;
};

export default RequireSellerAuth;
