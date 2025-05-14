import { useState, useRef, useEffect } from "react";
import { FaBell, FaBars } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import list from "../data/list.js";
import useAuth from "@/hooks/useAuth.js";
import { toast } from "react-toastify";
import avatarUser from "@/assets/images/avatar.jpg";
import Search from "@/components/header/Search.jsx";
import Cart from "@/components/header/Cart.jsx";

const Header = () => {
  const { setAuth, auth } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
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
    console.log("test");
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
    console.log("Hello");
    setAuth({});
    navigate("/account/login", { replace: true });
    toast.success("Logout successFully");
  };
  return (
    <div className="w-full bg-lime-500 px-4 md:px-8 py-3 shadow-md rounded-b-2xl dark:bg-gray-900 transition-colors duration-300 fixed z-40 top-0">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-[18px] text-white py-1 px-4 rounded-full bg-black font-semibold italic"
        >
          LOGO
        </Link>

        {/* Menu desktop */}
        <div className="relative hidden md:block">
          <ul className="flex gap-10 text-white font-semibold italic relative">
            {list.map((item, index) => (
              <li
                key={index}
                ref={(el) => (menuRef.current[index] = el)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <Link
                  to={item.path}
                  className="pb-1 hover:text-yellow-300 transition-all duration-200"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <span
            className="absolute bottom-0 h-[2px] bg-white transition-all duration-300"
            style={{
              left: underlineStyle.left || 0,
              width: underlineStyle.width || 0,
            }}
          />
        </div>
        <Search
          isSearchActive={isSearchActive}
          setIsSearchActive={setIsSearchActive}
        />

        {/* Icon */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Thông báo */}
          <div className="relative hover:scale-110 transition-transform cursor-pointer">
            <FaBell size={22} className="text-black dark:text-white" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold"></span>
          </div>

          {/* Giỏ hàng */}
          <Cart />

          {/* Avatar dropdown */}
          <div className="relative hidden md:block">
            <img
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 rounded-full cursor-pointer"
              src={auth?.user?.imageUrl || avatarUser}
            />
            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 bg-white dark:bg-gray-700 border shadow-lg rounded-lg w-40 p-2 z-50 text-black dark:text-white"
              >
                <ul>
                  <li className="py-1 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                    <Link to={`/profile/${auth?.user?.id}`}>👤 Hồ sơ</Link>
                  </li>
                  <li className="py-1 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                    <Link to="/users/search">🔍 Tìm người dùng</Link>
                  </li>
                  <li className="py-1 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                    ⚙️ Cài đặt
                  </li>
                  <li
                    onClick={handleLogout}
                    className="py-1 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    🚪 Đăng xuất
                  </li>
                  <li
                    onClick={toggleDarkMode}
                    className="py-1 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {isDarkMode ? "☀️ Chế độ sáng" : "🌙 Chế độ tối"}
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Menu mobile */}
          <div
            className="md:hidden cursor-pointer text-black dark:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FaBars size={24} />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="block md:hidden mt-4 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl shadow px-4 py-3">
          <ul className="space-y-2 text-base font-medium">
            {list.map((item, index) => (
              <li key={index} onClick={() => setIsMobileMenuOpen(false)}>
                <Link
                  to={item.path}
                  className="block w-full hover:text-lime-600 border-b pb-2"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t pt-2">
            <ul className="space-y-2 text-sm">
              <li className="py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                👤 Profile
              </li>
              <li className="py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                ⚙️ Settings
              </li>
              <li
                onClick={handleLogout}
                className="py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                🚪 Logout
              </li>
              <li
                onClick={toggleDarkMode}
                className="py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
