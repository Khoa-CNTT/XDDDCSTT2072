import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import "./index.css";

// Import pages
import UsersPage from "./pages/UsersPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import UserAddressPage from "./pages/UserAddressPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import WeatherLocationsPage from "./pages/WeatherLocationsPage.jsx";
import WeatherDataPage from "./pages/WeatherDataPage.jsx";
import WeatherSubscriptionsPage from "./pages/WeatherSubscriptionsPage.jsx";
import SubscriptionPlansPage from "./pages/SubscriptionPlansPage.jsx";
import UserSubscriptionsPage from "./pages/UserSubscriptionsPage.jsx";
import WeatherRecommendationPage from "./pages/WeatherRecommendationPage.jsx";
import CropWeatherRecommendationPage from "./pages/CropWeatherRecommendationPage.jsx";
import ExtremeWeatherPage from "./pages/ExtremeWeatherPage.jsx";
import ProductPerformancePage from "./pages/ProductPerformancePage.jsx";
import CouponsPage from "./pages/CouponsPage.jsx";
import FlashSalesPage from "./pages/FlashSalesPage.jsx";
import Layout from "./components/layout/Layout";
import PaymentsPage from "./pages/PaymentsPage.jsx";
import NewsPage from "./pages/NewsPage.jsx";
import NewsSourcesRedirect from "./pages/NewsSourcesRedirect.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Layout wrapper for authenticated pages */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/user-addresses" element={<UserAddressPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/flash-sales" element={<FlashSalesPage />} />

            {/* News Routes */}
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news-sources" element={<NewsSourcesRedirect />} />

            {/* Weather Routes */}
            <Route
              path="/weather/locations"
              element={<WeatherLocationsPage />}
            />
            <Route path="/weather/data" element={<WeatherDataPage />} />
            <Route path="/weather/advice" element={<WeatherDataPage />} />
            <Route
              path="/weather/subscriptions"
              element={<WeatherSubscriptionsPage />}
            />

            {/* Weather Recommendation Routes */}
            <Route
              path="/weather-recommendations/by-weather"
              element={<WeatherRecommendationPage />}
            />
            <Route
              path="/weather-recommendations/by-crop"
              element={<CropWeatherRecommendationPage />}
            />
            <Route
              path="/weather-recommendations/extreme-weather"
              element={<ExtremeWeatherPage />}
            />
            <Route
              path="/weather-recommendations/performance"
              element={<ProductPerformancePage />}
            />

            {/* Subscription Routes */}
            <Route
              path="/subscription-plans"
              element={<SubscriptionPlansPage />}
            />
            <Route
              path="/user-subscriptions"
              element={<UserSubscriptionsPage />}
            />

            {/* Payment Routes */}
            <Route path="/payments" element={<PaymentsPage />} />
            <Route
              path="/payment-statistics"
              element={<PaymentsPage showStatisticsTab={true} />}
            />

            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  </StrictMode>
);
