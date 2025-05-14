/* eslint-disable react/prop-types */
import { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { useNavigate } from "react-router";

const Search = ({ setIsSearchActive, isSearchActive }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/farmhub2/search?keyword=${searchTerm.trim()}`);
    }
  };

  return (
    <div className="relative w-[200px] md:w-[300px] hidden md:block">
      <input
        type="text"
        placeholder="Search"
        className={`w-full pl-2 pr-4 py-2 rounded-full bg-green-100 focus:outline-none ${
          isSearchActive
            ? "transition-all duration-300 transform scale-105"
            : ""
        }`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsSearchActive(true)}
        onBlur={() => setIsSearchActive(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <button className="cursor-pointer" onClick={handleSearch}>
        <IoIosSearch
          size={20}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
        />
      </button>
    </div>
  );
};

export default Search;
