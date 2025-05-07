import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import FarmHub from "./pages/FarmHub";
import ChatAI from "./pages/ChatAI";
import News from "./pages/News";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Main from "./pages/Main";
import RequireAuth from "./auth/requireAuth";
import NoFoundPage from "./pages/NoFoundPage";
import FarmHub2 from "./pages/FarmHub2";
import CategoryPage from "./pages/CategoryPage ";
import ProductDetail from "./pages/ProductDetail";

import Category from "./components/farmhub2/Category";
import NewProducts from "./components/farmhub2/NewProducts";
import SearchPage from "./pages/SearchPage";
import Cart from "./pages/Cart";
import Checkout from "./components/checkout/CheckOut";
import OrderSuccess from "./components/checkout/OrderSuccess";
import OrderHistory from "./components/checkout/OrderHistory";
import OrderDetail from "./components/checkout/OrderDetail";


const ROLES = {
  User: "User",
  Admin: "Admin",
};

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Main />}>
          <Route index element={<Navigate to="home" />} />
          <Route path="account">
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="home" element={<Home />} />
          <Route path="farmhub2" element={<FarmHub2 />}>
            <Route
              index
              element={
                <>
                  <Category />
                  <NewProducts />
                </>
              }
            />
            <Route path="category/:id" element={<CategoryPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="product/:id" element={<ProductDetail />} />
          </Route>
          <Route path="farmhub" element={<FarmHub />} />
          <Route path="chat-ai" element={<ChatAI />} />
          <Route path="news" element={<News />} />
          <Route path="about" element={<AboutUs />} />

          <Route path="*" element={<NoFoundPage />} />
        </Route> */}
        <Route path="/" element={<Main />}>
          <Route index element={<Navigate to="account/login" />} />
          <Route path="account">
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>
          <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
            <Route path="home" element={<Home />} />
            <Route path="farmhub2" element={<FarmHub2 />}>
              <Route
                index
                element={
                  <>
                    <Category />
                    <NewProducts />
                  </>
                }
              />
              <Route path="category/:id" element={<CategoryPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="product/:id" element={<ProductDetail />} />
            </Route>
            <Route path="farmhub" element={<FarmHub />} />
            <Route path="chat-ai" element={<ChatAI />} />
            <Route path="news" element={<News />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} /> 
            <Route path="order-success" element={<OrderSuccess />} />  
            <Route path="order-history" element={<OrderHistory />} />  
            <Route path="order/:id" element={<OrderDetail />} />  
           


          </Route>
          <Route path="*" element={<NoFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
