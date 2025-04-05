import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import list from "../data/list.js";

const Header = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);  
  const [isSearchActive, setIsSearchActive] = useState(false);  
  const menuRef = useRef([]);

  useEffect(() => {
    const currentItem = menuRef.current[activeIndex];
    if (currentItem) {
      setUnderlineStyle({
        left: currentItem.offsetLeft,
        width: currentItem.offsetWidth,
      });
    }
  }, [activeIndex]);

  return (
    <div className="w-full bg-lime-500 px-8 py-4 shadow-md rounded-b-2xl">
      <div className="flex justify-between items-center">
        <div className="text-[18px] text-white py-1 px-4 rounded-full bg-black font-semibold italic">
          LOGO
        </div>
        <div className="relative">
          <ul className="flex gap-10 text-white font-semibold italic relative">
            {list.map((item, index) => (
              <li
                key={index}
                ref={(el) => (menuRef.current[index] = el)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`cursor-pointer pb-1 hover:text-yellow-300 transition-all duration-200`}
              >
                {item}
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
        <div className="relative w-[300px]">
          <input
            type="text"
            placeholder="Search"
            className={`w-full pl-9 pr-4 py-2 rounded-full bg-green-100 focus:outline-none ${isSearchActive ? 'transition-all duration-300 transform scale-105' : ''}`}
            onFocus={() => setIsSearchActive(true)}
            onBlur={() => setIsSearchActive(false)}
          />
          <IoIosSearch
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600"
          />
        </div>

        <div className="flex items-center gap-10">
          <div className="relative hover:scale-110 transition-transform cursor-pointer">
            <FaBell size={22} className="text-black" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
              2
            </span>
          </div>
          <div className="relative hover:scale-110 transition-transform cursor-pointer">
            <FaShoppingCart size={22} className="text-black" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
              0
            </span>
          </div>
          <div className="relative">
            <FaUserCircle
              size={36}
              className="text-black hover:scale-110 transition-transform cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}  
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-lg w-40 p-2">
                <ul>
                  <li className="py-1 px-2 cursor-pointer hover:bg-gray-200">Profile</li>
                  <li className="py-1 px-2 cursor-pointer hover:bg-gray-200">Settings</li>
                  <li className="py-1 px-2 cursor-pointer hover:bg-gray-200">Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
