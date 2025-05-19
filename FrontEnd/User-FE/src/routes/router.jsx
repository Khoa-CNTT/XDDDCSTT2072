import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import Dashboard from "@/pages/Dashboard";
import Marketplace from "@/pages/Marketplace";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import WeatherDashboard from "@/pages/WeatherDashboard";
import Subscriptions from "@/pages/Subscriptions";
import SubscriptionDetails from "@/pages/SubscriptionDetails";
import SubscriptionPayment from "@/pages/SubscriptionPayment";
import SubscriptionPlans from "@/pages/admin/SubscriptionPlans";
import PaymentResult from "@/pages/PaymentResult";
import UnreviewedProducts from "@/pages/UnreviewedProducts";
import UserSellerDashboard from "@/pages/UserSellerDashboard";
import SellerProductForm from "@/pages/SellerProductForm";
import SellerRegistration from "@/pages/SellerRegistration";
import SellerOrdersPage from "@/pages/SellerOrdersPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "marketplace",
        element: <Marketplace />,
      },
      {
        path: "marketplace/:id",
        element: <ProductDetail />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "order-success",
        element: <OrderSuccess />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "orders/:id",
        element: <OrderDetail />,
      },
      {
        path: "weather",
        element: <WeatherDashboard />,
      },
      {
        path: "subscriptions",
        element: <Subscriptions />,
      },
      {
        path: "subscriptions/:id",
        element: <SubscriptionDetails />,
      },
      {
        path: "admin/subscriptions",
        element: <SubscriptionPlans />,
      },
      {
        path: "payment/subscription/:id",
        element: <SubscriptionPayment />,
      },
      {
        path: "payment/result",
        element: <PaymentResult />,
      },
      {
        path: "reviews/pending",
        element: <UnreviewedProducts />,
      },
      {
        path: "seller-registration",
        element: <SellerRegistration />,
      },
      {
        path: "seller/dashboard",
        element: <UserSellerDashboard />,
      },
      {
        path: "seller/orders",
        element: <SellerOrdersPage />,
      },
      {
        path: "seller/add-product",
        element: <SellerProductForm />,
      },
      {
        path: "seller/edit-product/:id",
        element: <SellerProductForm />,
      },
    ],
  },
]);

export default router;
