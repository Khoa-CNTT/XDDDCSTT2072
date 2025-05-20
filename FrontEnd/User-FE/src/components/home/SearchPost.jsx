/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Filter, TrendingUp, Hash, Search } from "lucide-react";

const SearchPost = ({ onSearch }) => {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    const trimmed = input.trim();
    if (trimmed === "") {
      onSearch(null, null); // reset search
    } else if (trimmed.startsWith("#")) {
      onSearch("hashtag", trimmed.substring(1));
    } else {
      onSearch("keyword", trimmed);
    }
  };

  return (
    <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-md p-4 mb-5 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg border border-gray-100">
      <div className="relative flex-1 group">
        <Search
          size={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200"
        />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Tìm kiếm bài viết, hashtag..."
          className="pl-10 h-12 bg-gray-50 border-0 focus-visible:ring-2 focus-visible:ring-green-500/50 rounded-xl"
        />
      </div>

      <Button
        onClick={handleSearch}
        variant="outline"
        className="gap-2 rounded-xl font-medium border-gray-100 shadow-sm hover:bg-green-50 hover:border-green-300 transition-all btn-interactive h-12"
      >
        <Search size={18} className="text-green-600" />
        <span className="hidden sm:inline">Tìm</span>
      </Button>

      <Button
        variant="outline"
        className="gap-2 rounded-xl font-medium border-gray-100 shadow-sm hover:bg-green-50 hover:border-green-300 transition-all btn-interactive h-12"
        onClick={() =>
          document
            .getElementById("post-filters")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        <Filter size={18} className="text-green-600" />
        <span className="hidden sm:inline">Lọc</span>
      </Button>

      <Button
        variant="outline"
        className="gap-2 rounded-xl font-medium border-gray-100 shadow-sm hover:bg-green-50 hover:border-green-300 transition-all btn-interactive h-12"
      >
        <TrendingUp size={18} className="text-green-600" />
        <span className="hidden sm:inline">Xu hướng</span>
      </Button>

      <Button
        variant="outline"
        className="gap-2 rounded-xl font-medium border-gray-100 shadow-sm hover:bg-green-50 hover:border-green-300 transition-all btn-interactive h-12"
      >
        <Hash size={18} className="text-green-600" />
        <span className="hidden sm:inline">Hashtag</span>
      </Button>
    </div>
  );
};

export default SearchPost;
