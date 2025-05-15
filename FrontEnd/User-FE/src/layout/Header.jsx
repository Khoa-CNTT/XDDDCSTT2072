import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import list from "../data/list.js";
import useAuth from "@/hooks/useAuth.js";
import { toast } from "react-toastify";
import avatarUser from "@/assets/images/avatar.jpg";
import Search from "@/components/header/Search.jsx";
import Cart from "@/components/header/Cart.jsx";
import {
  Bell,
  Menu,
  Home,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
  User,
  Search as SearchIcon,
  ChevronDown,
  MessageCircle,
  Award,
  Leaf,
  Cloud,
  FileText,
  Store,
} from "lucide-react";
import { FaClipboardList } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { setAuth, auth } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef([]);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Đặt menu active theo URL
  useEffect(() => {
    const index = list.findIndex((item) => item.path === location.pathname);
    setActiveIndex(index === -1 ? 0 : index);
  }, [location]);

  // Tính toán vị trí underline
  useEffect(() => {
    const currentItem = menuRef.current[activeIndex];
    if (currentItem) {
      setUnderlineStyle({
        left: currentItem.offsetLeft,
        width: currentItem.offsetWidth,
      });
    }
  }, [activeIndex]);

  // Đồng bộ dark mode với localStorage
  useEffect(() => {
    const storedMode = localStorage.getItem("theme");
    if (storedMode === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }

    // Thêm sự kiện scroll để thay đổi header
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click ngoài dropdown thì đóng
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // handle logout
  const handleLogout = () => {
    setAuth({});
    navigate("/account/login", { replace: true });
    toast.success("Đăng xuất thành công");
  };

  return (
    <div
      className={`w-full bg-gradient-to-r from-lime-500 to-green-600 px-4 md:px-8 py-3 shadow-lg rounded-b-2xl dark:from-gray-800 dark:to-gray-900 transition-all duration-300 fixed z-40 top-0 ${
        isScrolled ? "py-2 shadow-xl" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            to="/"
            className="text-[18px] text-white py-2 px-5 rounded-full bg-black dark:bg-gray-950 font-semibold italic shadow-md hover:shadow-lg transition-all duration-300 btn-interactive flex items-center gap-2"
          >
            <Leaf size={18} className="text-lime-400" />
            LOGO
          </Link>
        </div>

        {/* Menu desktop */}
        <div className="relative hidden md:flex flex-1 justify-center">
          <ul className="flex gap-8 text-white font-medium relative px-4">
            {list.map((item, index) => (
              <li
                key={index}
                ref={(el) => (menuRef.current[index] = el)}
                onMouseEnter={() => setActiveIndex(index)}
                className="menu-item"
              >
                <Link
                  to={item.path}
                  className={`h-10 hover:text-yellow-300 transition-all duration-200 flex items-center gap-1.5 ${
                    activeIndex === index ? "font-semibold text-yellow-300" : ""
                  }`}
                >
                  {item.name === "Home" && <Home size={16} />}
                  {item.name === "FarmHub" && <Leaf size={16} />}
                  {item.name === "Weather" && <Cloud size={16} />}
                  {item.name === "Subscriptions" && <Award size={16} />}
                  {item.name === "ChatAI" && <MessageCircle size={16} />}
                  {item.name === "News" && <FileText size={16} />}
                  {item.name === "About Us" && <Users size={16} />}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <span
            className="absolute bottom-0 h-[3px] bg-yellow-300 rounded-full transition-all duration-300"
            style={{
              left: underlineStyle.left || 0,
              width: underlineStyle.width || 0,
            }}
          />
        </div>

        {/* Tools Section: Search, Notifications, Cart, Profile */}
        <div className="flex items-center">
          {/* Search */}
          <div className="header-icon">
            <Search
              isSearchActive={isSearchActive}
              setIsSearchActive={setIsSearchActive}
            />
          </div>

          {/* Notifications */}
          <div className="header-icon relative hover:scale-110 transition-transform cursor-pointer ml-2">
            <Bell size={20} className="text-white" />
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md">
              3
            </Badge>
          </div>

          {/* Cart */}
          <div className="header-icon ml-2">
            <Cart />
          </div>

          {/* Avatar dropdown */}
          <div className="relative hidden md:block ml-1">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 cursor-pointer bg-green-600 dark:bg-gray-700 hover:bg-green-700 dark:hover:bg-gray-600 transition-colors py-1.5 px-3 rounded-full h-10"
            >
              <Avatar className="w-7 h-7 border-2 border-white/50">
                <AvatarImage src={auth?.user?.imageUrl || avatarUser} />
                <AvatarFallback className="bg-green-700 text-white">
                  {auth?.user?.userName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-white text-sm font-medium hidden sm:block">
                {auth?.user?.userName || "User"}
              </span>
              <ChevronDown size={16} className="text-white" />
            </div>

            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl w-52 p-2 z-50 text-gray-700 dark:text-white"
              >
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="font-semibold text-sm">
                    {auth?.user?.userName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {auth?.user?.email || "email@example.com"}
                  </p>
                </div>
                <ul className="py-1">
                  <li className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Link
                      to={`/profile/${auth?.user?.id}`}
                      className="py-2 px-3 flex items-center gap-2 text-sm w-full"
                    >
                      <User size={16} className="text-blue-500" />
                      Hồ sơ
                    </Link>
                  </li>
                  <li className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Link
                      to="/seller/dashboard"
                      className="py-2 px-3 flex items-center gap-2 text-sm w-full"
                    >
                      <Store size={16} className="text-green-500" />
                      Người bán
                    </Link>
                  </li>
                  <li className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Link
                      to="/seller/orders"
                      className="py-2 px-3 flex items-center gap-2 text-sm w-full"
                    >
                      <FaClipboardList size={16} className="text-blue-500" />
                      Quản lý đơn hàng
                    </Link>
                  </li>
                  <li className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Link
                      to="/users/search"
                      className="py-2 px-3 flex items-center gap-2 text-sm w-full"
                    >
                      <SearchIcon size={16} className="text-green-500" />
                      Tìm người dùng
                    </Link>
                  </li>
                  <li className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <button className="py-2 px-3 flex items-center gap-2 text-sm w-full text-left">
                      <Settings size={16} className="text-gray-500" />
                      Cài đặt
                    </button>
                  </li>
                  <li
                    onClick={toggleDarkMode}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="py-2 px-3 flex items-center gap-2 text-sm w-full">
                      {isDarkMode ? (
                        <>
                          <Sun size={16} className="text-amber-500" />
                          Chế độ sáng
                        </>
                      ) : (
                        <>
                          <Moon size={16} className="text-indigo-500" />
                          Chế độ tối
                        </>
                      )}
                    </div>
                  </li>
                  <li className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="py-2 px-3 flex items-center gap-2 text-sm w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div
            className="header-icon md:hidden cursor-pointer text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={20} />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="block md:hidden mt-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-white rounded-xl shadow-xl px-4 py-3 farmhub-animate-fadeIn">
          <ul className="space-y-2 text-base font-medium">
            {list.map((item, index) => (
              <li key={index} onClick={() => setIsMobileMenuOpen(false)}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2 w-full hover:text-lime-600 dark:hover:text-lime-400 py-2 px-3 rounded-lg hover:bg-lime-50 dark:hover:bg-lime-900/10 transition-all ${
                    location.pathname === item.path
                      ? "bg-lime-50 dark:bg-lime-900/10 text-lime-600 dark:text-lime-400 font-semibold"
                      : ""
                  }`}
                >
                  {item.name === "Home" && <Home size={16} />}
                  {item.name === "FarmHub" && <Leaf size={16} />}
                  {item.name === "Weather" && <Cloud size={16} />}
                  {item.name === "Subscriptions" && <Award size={16} />}
                  {item.name === "ChatAI" && <MessageCircle size={16} />}
                  {item.name === "News" && <FileText size={16} />}
                  {item.name === "About Us" && <Users size={16} />}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 px-3 py-2 mb-3">
              <Avatar className="w-10 h-10 border-2 border-gray-100 dark:border-gray-700">
                <AvatarImage src={auth?.user?.imageUrl || avatarUser} />
                <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-700 dark:text-white">
                  {auth?.user?.userName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">
                  {auth?.user?.userName || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {auth?.user?.email || "email@example.com"}
                </p>
              </div>
            </div>

            <ul className="space-y-1 text-sm">
              <li className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Link
                  to={`/profile/${auth?.user?.id}`}
                  className="py-2 px-3 flex items-center gap-2 w-full"
                >
                  <User size={16} className="text-blue-500" />
                  Hồ sơ
                </Link>
              </li>
              <li className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Link
                  to="/seller/dashboard"
                  className="py-2 px-3 flex items-center gap-2 w-full"
                >
                  <Store size={16} className="text-green-500" />
                  Người bán
                </Link>
              </li>
              <li className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Link
                  to="/seller/orders"
                  className="py-2 px-3 flex items-center gap-2 w-full"
                >
                  <FaClipboardList size={16} className="text-blue-500" />
                  Quản lý đơn hàng
                </Link>
              </li>
              <li className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <button className="py-2 px-3 flex items-center gap-2 w-full text-left">
                  <Settings size={16} className="text-gray-500" />
                  Cài đặt
                </button>
              </li>
              <li
                onClick={toggleDarkMode}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <div className="py-2 px-3 flex items-center gap-2 w-full">
                  {isDarkMode ? (
                    <>
                      <Sun size={16} className="text-amber-500" />
                      Chế độ sáng
                    </>
                  ) : (
                    <>
                      <Moon size={16} className="text-indigo-500" />
                      Chế độ tối
                    </>
                  )}
                </div>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="py-2 px-3 flex items-center gap-2 w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-1"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
