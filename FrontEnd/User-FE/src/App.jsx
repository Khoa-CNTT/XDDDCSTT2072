import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FarmHub from "./pages/FarmHub";
import ChatAI from "./pages/ChatAI";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Main from "./pages/Main";
import RequireAuth from "./auth/requireAuth";
import RequireSellerAuth from "./auth/requireSellerAuth";
import NoFoundPage from "./pages/NoFoundPage";
import FarmHub2 from "./pages/FarmHub2";
import CategoryPage from "./pages/CategoryPage ";
import ProductDetail from "./pages/ProductDetail";
import Coupons from "./pages/Coupons";
import UserProfile from "./pages/UserProfile";
import UserSearchPage from "./pages/UserSearchPage";
import EditProfile from "./pages/EditProfile";
import WeatherDashboard from "./pages/WeatherDashboard";
import Subscriptions from "./pages/Subscriptions";
import SubscriptionDetails from "./pages/SubscriptionDetails";
import SubscriptionPayment from "./pages/SubscriptionPayment";
import SubscriptionPlans from "./pages/admin/SubscriptionPlans";
import PaymentResult from "./pages/PaymentResult";
import ReviewNotification from "./components/product/ReviewNotification";
import { getUnreviewedProducts } from "./services/feedbackService";
import UserSellerDashboard from "./pages/UserSellerDashboard";
import SellerProductForm from "./pages/SellerProductForm";
import SellerOrdersPage from "./pages/SellerOrdersPage";
import SellerRegistration from "./pages/SellerRegistration";

import Category from "./components/farmhub2/Category";
import NewProducts from "./components/farmhub2/NewProducts";
import SearchPage from "./pages/SearchPage";
import Cart from "./pages/Cart";
import Checkout from "./components/checkout/CheckOut";
import OrderSuccess from "./components/checkout/OrderSuccess";
import OrderHistory from "./components/checkout/OrderHistory";
import OrderDetail from "./components/checkout/OrderDetail";
import FeaturedProducts from "./components/farmhub2/FeaturedProducts";
import OnSaleProducts from "./components/farmhub2/OnSaleProducts";
import Wishlist from "./pages/Wishlist";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const ROLES = {
  User: "User",
  Admin: "Admin",
};

function App() {
  return (
    <>
      <Routes>
        <Route path="account">
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
        <Route path="/" element={<Main />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="weather" element={<WeatherDashboard />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="subscriptions/:id" element={<SubscriptionDetails />} />
          <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
            <Route
              path="seller-registration"
              element={<SellerRegistration />}
            />
            <Route path="profile/:userId" element={<UserProfile />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route path="users/search" element={<UserSearchPage />} />
            <Route path="farmhub2" element={<FarmHub2 />}>
              <Route
                index
                element={
                  <>
                    <Category />
                    <FeaturedProducts />
                    <OnSaleProducts />
                    <NewProducts />
                  </>
                }
              />
              <Route path="category/:id" element={<CategoryPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="popular" element={<FeaturedProducts />} />
              <Route path="on-sale" element={<OnSaleProducts />} />
              <Route path="recently-updated" element={<FeaturedProducts />} />
            </Route>
            <Route path="farmhub2/product/:id" element={<ProductDetail />} />
            <Route path="farmhub" element={<FarmHub />} />
            <Route path="chat-ai" element={<ChatAI />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-success" element={<OrderSuccess />} />
            <Route path="order-history" element={<OrderHistory />} />
            <Route path="order/:id" element={<OrderDetail />} />
            <Route path="payment/result" element={<PaymentResult />} />
            <Route
              path="payment/subscription/:id"
              element={<SubscriptionPayment />}
            />
            <Route path="wishlists" element={<Wishlist />} />
            <Route path="admin/subscriptions" element={<SubscriptionPlans />} />

            {/* Khu vực Seller - yêu cầu phải đăng ký và được duyệt */}
            <Route element={<RequireSellerAuth />}>
              <Route
                path="seller/dashboard"
                element={<UserSellerDashboard />}
              />
              <Route path="seller/orders" element={<SellerOrdersPage />} />
            </Route>

            {/* Trang thêm/sửa sản phẩm - đã có kiểm tra riêng trong component */}
            <Route path="seller/add-product" element={<SellerProductForm />} />
            <Route
              path="seller/edit-product/:id"
              element={<SellerProductForm />}
            />
          </Route>
          <Route path="*" element={<NoFoundPage />} />
        </Route>
      </Routes>

      {/* Thông báo đánh giá sản phẩm */}
      <ReviewNotification getUnreviewedProducts={getUnreviewedProducts} />

      {/* Add React Query Devtools - only in development */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </>
  );
}

export default App;
