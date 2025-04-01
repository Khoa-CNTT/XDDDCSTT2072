import React from "react";
import { FaBell } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import list from "../data/list.js";
import Avartar from "../assets/images/Avartar-ex.jpg";

const Header = () => {
  return (
    <div className="container bg-green-600 px-4 py-2 max-w-[100%]">
      <div className="flex h-[50px] justify-between items-center">
        <div className="text-[18px] text-white py-1 px-3 rounded-3xl bg-black inline border-none font-medium italic">
          Logo
        </div>
        <ul className="text-white font-bold italic flex gap-12">
          {list.map((item, index) => {
            return (
              <li className="hover:cursor-pointer" key={index}>
                {item}
              </li>
            );
          })}
        </ul>
        <div className="max-w-[500px] relative">
          <input className="w-full input-box pl-8 rounded-lg" type="text" />
          <IoIosSearch
            size={20}
            className="absolute left-2 top-1/2 transform -translate-y-1/2"
          />
        </div>
        <div className="flex gap-8">
          <div className="relative rounded-full bg-red-800 px-2 py-2 border-[1px]">
            <FaBell size={20} />
            <span className="absolute -right-2 -top-2 text-white text-sm font-bold bg-red-500 w-5 h-5 rounded-full flex items-center justify-center ">
              2
            </span>
          </div>
          <img
            src={Avartar}
            className="h-9 w-9 rounded-full object-cover border-[1px]"
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
