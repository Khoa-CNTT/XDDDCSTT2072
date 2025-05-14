import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import PropTypes from "prop-types";

// Danh sách các trang không yêu cầu đăng nhập
const PUBLIC_ROUTES = [
  "/",
  "/home",
  "/farmhub2",
  "/search",
  "/category",
  "/farmhub2/product",
  "/about",
  "/contact",
  "/account/register",
  "/account/forgot-password",
  "/account/reset-password",
];

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log("Auth state in RequireAuth:", auth);
  console.log("Current path:", location.pathname);
  console.log("Allowed roles:", allowedRoles);
  console.log("User role:", auth?.user?.roleName);

  // Kiểm tra xem đường dẫn hiện tại có phải là public route không
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  // Kiểm tra token hợp lệ trước
  const hasValidToken = Boolean(auth?.accessToken);

  // Kiểm tra vai trò user
  const isAuthorized =
    hasValidToken &&
    auth?.user?.roleName &&
    Array.isArray(allowedRoles) &&
    allowedRoles.includes(auth?.user?.roleName);

  // Nếu đang ở public route, luôn cho phép truy cập
  if (isPublicRoute) {
    console.log("Public route, cho phép truy cập");
    return <Outlet />;
  }

  // Nếu không có token hoặc không có quyền, chuyển hướng đến trang đăng nhập
  if (!hasValidToken || !isAuthorized) {
    // Tránh chuyển hướng vô hạn nếu đang ở hoặc đang cố gắng đến trang đăng nhập
    if (location.pathname === "/account/login") {
      return <Outlet />;
    }

    console.log("Chuyển hướng đến trang đăng nhập từ:", location.pathname);
    return <Navigate to="/account/login" state={{ from: location }} replace />;
  }

  // Nếu hợp lệ, render nội dung
  console.log("User đã xác thực, cho phép truy cập");
  return <Outlet />;
};

RequireAuth.propTypes = {
  allowedRoles: PropTypes.array.isRequired,
};

export default RequireAuth;
