import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaShoppingCart, FaUserCircle, FaBars } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { Link, useLocation } from "react-router-dom";
import list from "../data/list.js";

const Header = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const menuRef = useRef([]);
  const dropdownRef = useRef(null);
  const location = useLocation();

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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
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

  return (
    <div className="w-full bg-lime-500 px-4 md:px-8 py-3 shadow-md rounded-b-2xl dark:bg-gray-900 transition-colors duration-300">
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

        {/* Tìm kiếm */}
        <div className="relative w-[200px] md:w-[300px] hidden md:block">
          <input
            type="text"
            placeholder="Search"
            className={`w-full pl-9 pr-4 py-2 rounded-full bg-green-100 focus:outline-none ${
              isSearchActive ? "transition-all duration-300 transform scale-105" : ""
            }`}
            onFocus={() => setIsSearchActive(true)}
            onBlur={() => setIsSearchActive(false)}
          />
          <IoIosSearch
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600"
          />
        </div>

        {/* Icon */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Thông báo */}
          <div className="relative hover:scale-110 transition-transform cursor-pointer">
            <FaBell size={22} className="text-black dark:text-white" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
              2
            </span>
          </div>

          {/* Giỏ hàng */}
          <div className="relative hover:scale-110 transition-transform cursor-pointer">
            <FaShoppingCart size={22} className="text-black dark:text-white" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
              0
            </span>
          </div>

          {/* Avatar dropdown */}
          <div className="relative hidden md:block">
            <FaUserCircle
              size={36}
              className="text-black dark:text-white hover:scale-110 transition-transform cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 bg-white dark:bg-gray-700 border shadow-lg rounded-lg w-40 p-2 z-50 text-black dark:text-white"
              >
                <ul>
                  <li className="py-1 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">👤 Profile</li>
                  <li className="py-1 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">⚙️ Settings</li>
                  <li className="py-1 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">🚪 Logout</li>
                  <li
                    onClick={toggleDarkMode}
                    className="py-1 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
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
              <li className="py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded">👤 Profile</li>
              <li className="py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded">⚙️ Settings</li>
              <li className="py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded">🚪 Logout</li>
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
