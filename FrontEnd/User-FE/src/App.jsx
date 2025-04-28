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
import AboutUs from './pages/AboutUs';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import RequireAuth from "./auth/requireAuth";
import NoFoundPage from "./pages/NoFoundPage";
import ProductDetailPage from "./components/farmhub/product/ProductDetailPage";
import Cart from "./components/farmhub/product/Cart";
// import CartItem from "./components/farmhub/product/CartItem";

const ROLES = {
  User: "User",
  Admin: "Admin",
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route index element={<Navigate to="account/login" />} />
          <Route path="account">
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
          </Route>
          <Route element={<RequireAuth allowedRoles={[ROLES.User.toLowerCase()]} />}>
            <Route path="home" element={<Home />} />
            <Route path="farmhub" element={<FarmHub />} />
            <Route path="chat-ai" element={<ChatAI />} />
            <Route path="news" element={<News />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="farmhub/product/details/:id" element={<ProductDetailPage />} />
            <Route path="farmhub/product/cart" element={<Cart />} />


          </Route>
          <Route path="*" element={<NoFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
