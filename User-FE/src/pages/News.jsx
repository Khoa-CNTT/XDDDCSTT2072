import { useEffect, useState } from "react";
import Header from "../layout/Header";
import axiosInstance from "../services/api/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
} from "react-icons/fa";
import { toast } from "react-toastify";

function News() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingNews, setFetchingNews] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const categories = [
    "Nông nghiệp",
    "Thủy sản",
    "Chăn nuôi",
    "Công nghệ",
    "Kinh tế",
    "Thị trường",
  ];

  // Lấy các tham số từ URL
  const page = Number(searchParams.get("page") || "0");
  const size = Number(searchParams.get("size") || "12");
  const category = searchParams.get("category") || "";
  const keyword = searchParams.get("keyword") || "";

  // Sử dụng dữ liệu mẫu khi API không hoạt động
  const sampleData = [
    {
      id: 1,
      title: "Phát triển mô hình nông nghiệp thông minh ở Việt Nam",
      summary:
        "Việt Nam đang đẩy mạnh ứng dụng công nghệ cao vào sản xuất nông nghiệp nhằm tăng năng suất và chất lượng",
      imageUrl:
        "https://tse1.mm.bing.net/th?id=OIP._D-67MXB8hlCTjksAjwebwHaDl&pid=Api&P=0&h=220",
      category: "Nông nghiệp",
      publishedDate: new Date().toISOString(),
      sourceName: "Agricultural News",
    },
    {
      id: 2,
      title: "Người tạo xu hướng nông nghiệp organic tại Mỹ",
      summary:
        "Các nông dân Mỹ đang chuyển đổi sang canh tác hữu cơ để đáp ứng nhu cầu thị trường ngày càng tăng",
      imageUrl:
        "https://tse1.mm.bing.net/th?id=OIP.tU-neYliRjFFZINhZ_F8OAHaEc&pid=Api&P=0&h=220",
      category: "Nông nghiệp",
      publishedDate: new Date().toISOString(),
      sourceName: "Agricultural News",
    },
    {
      id: 3,
      title: "Hàng loạt nông sản Việt rời khỏi thị trường quốc tế",
      summary:
        "Nhiều loại nông sản Việt Nam đang gặp khó khăn trong việc xuất khẩu do các rào cản thương mại mới",
      imageUrl:
        "https://tse1.mm.bing.net/th?id=OIP.E-POXG48lZUN5SKK7fuUTwHaFj&pid=Api&P=0&h=220",
      category: "Thị trường",
      publishedDate: new Date().toISOString(),
      sourceName: "Agricultural News",
    },
    {
      id: 4,
      title: "Ứng dụng công nghệ IoT trong chăn nuôi hiện đại",
      summary:
        "Các thiết bị IoT giúp nông dân theo dõi sức khỏe vật nuôi, tối ưu hóa thức ăn và cảnh báo bệnh dịch",
      imageUrl:
        "https://up.yimg.com/ib/th?id=OIP.m88P1cRUzm3p2bICwK2I-wHaE7&pid=Api&rs=1&c=1&qlt=95&w=149&h=99",
      category: "Công nghệ",
      publishedDate: new Date().toISOString(),
      sourceName: "Agricultural News",
    },
    {
      id: 5,
      title: "Giá phân bón tăng cao ảnh hưởng đến nông dân toàn cầu",
      summary:
        "Cuộc khủng hoảng năng lượng và chiến tranh đã khiến giá phân bón tăng mạnh, ảnh hưởng đến chi phí sản xuất",
      imageUrl:
        "https://up.yimg.com/ib/th?id=OIP.upcVyiUzz2n_UWkZdZmSFwHaEK&pid=Api&rs=1&c=1&qlt=95&w=177&h=99",
      category: "Kinh tế",
      publishedDate: new Date().toISOString(),
      sourceName: "Agricultural News",
    },
    {
      id: 6,
      title: "Kỹ thuật nuôi tôm bền vững tại đồng bằng sông Cửu Long",
      summary:
        "Các mô hình nuôi tôm kết hợp rừng ngập mặn giúp bảo vệ môi trường và tăng thu nhập cho người dân",
      imageUrl:
        "https://up.yimg.com/ib/th?id=OIP.DXqlhh_inDuENzwO9bhplQHaF7&pid=Api&rs=1&c=1&qlt=95&w=124&h=99",
      category: "Thủy sản",
      publishedDate: new Date().toISOString(),
      sourceName: "Agricultural News",
    },
  ];

  const fetchNews = async () => {
    setLoading(true);
    try {
      // In ra URL của API để debug
      let url = "/news";
      let params = {
        page,
        size,
        sortBy: "publishedDate",
        sortDir: "desc",
      };

      // Nếu có category, thêm vào endpoint
      if (category) {
        url = `/news/category/${category}`;
      }

      // Nếu có keyword, chuyển sang endpoint search
      if (keyword) {
        url = "/news/search";
        params.keyword = keyword;
      }

      console.log(`Đang gọi API: ${url}`, params);

      try {
        const response = await axiosInstance.get(url, { params });
        console.log("API response:", response.data);

        if (
          response.data &&
          response.data.content &&
          response.data.content.length > 0
        ) {
          setNews(response.data.content);
          setTotalPages(response.data.totalPages);
        } else {
          console.warn(
            "API trả về mảng trống hoặc không đúng định dạng:",
            response.data
          );
          // Sử dụng dữ liệu mẫu khi API không trả về dữ liệu
          setNews(sampleData);
          setTotalPages(1);
          toast.info("Hiển thị dữ liệu mẫu vì không có tin tức từ hệ thống.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        console.log("Sử dụng dữ liệu mẫu thay thế...");
        // Sử dụng dữ liệu mẫu khi API lỗi
        setNews(sampleData);
        setTotalPages(1);
        toast.error("Không thể tải tin tức từ API. Hiển thị dữ liệu mẫu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestNews = async () => {
    try {
      console.log("Đang gọi API lấy tin tức mới nhất...");

      try {
        const response = await axiosInstance.get("/news/latest");
        console.log("Latest news response:", response.data);

        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          setLatestNews(response.data);
        } else {
          console.warn(
            "API tin mới nhất trả về mảng trống hoặc không đúng định dạng:",
            response.data
          );
          // Sử dụng 3 tin đầu từ dữ liệu mẫu
          setLatestNews(sampleData.slice(0, 3));
        }
      } catch (error) {
        console.error("Lỗi khi tải tin tức mới nhất:", error);
        // Sử dụng 3 tin đầu từ dữ liệu mẫu
        setLatestNews(sampleData.slice(0, 3));
      }
    } catch (error) {
      console.error("Lỗi tổng thể khi lấy tin mới nhất:", error);
    }
  };

  // Thêm hàm để tải tin tức từ nguồn
  const fetchNewsFromSources = async () => {
    setFetchingNews(true);
    try {
      console.log("Đang gọi API tải tin tức từ nguồn...");
      const response = await axiosInstance.post("/news/fetch");
      console.log("Fetch news response:", response.data);
      toast.success(
        "Đã kích hoạt tải tin tức từ nguồn. Vui lòng đợi và làm mới trang sau vài phút."
      );

      // Đợi 5 giây và tải lại dữ liệu
      setTimeout(() => {
        fetchNews();
        fetchLatestNews();
      }, 5000);
    } catch (error) {
      console.error("Lỗi khi tải tin tức từ nguồn:", error);
      toast.error("Không thể tải tin tức từ nguồn. Vui lòng thử lại sau.");
    } finally {
      setFetchingNews(false);
    }
  };

  useEffect(() => {
    // In ra cấu hình Axios khi component mount
    console.log("Cấu hình axios:", axiosInstance.defaults);

    fetchNews();
    fetchLatestNews();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, category, keyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ keyword: searchTerm, page: 0, size });
    }
  };

  const handleCategoryClick = (selectedCategory) => {
    setSearchParams({ category: selectedCategory, page: 0, size });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      const params = { page: newPage, size };
      if (category) params.category = category;
      if (keyword) params.keyword = keyword;
      setSearchParams(params);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleNewsClick = (newsId) => {
    navigate(`/news/${newsId}`);
  };

  return (
    <div className="flex flex-col items-center bg-gray-50 min-h-screen">
      <Header />

      {/* Banner section with latest news */}
      <div className="w-full max-w-7xl px-4 mt-20">
        <div className="flex flex-wrap p-4 w-full border border-gray-200 shadow-md rounded-lg gap-4 bg-white">
          {latestNews.length > 0 && (
            <>
              {/* Featured news (first item) */}
              <div
                className="relative flex-[8] min-w-[300px] cursor-pointer hover:opacity-95 transition-all"
                onClick={() => handleNewsClick(latestNews[0].id)}
              >
                <img
                  className="w-full h-[400px] object-cover rounded-lg"
                  src={
                    latestNews[0].imageUrl ||
                    "https://placehold.co/600x400?text=No+Image"
                  }
                  alt={latestNews[0].title}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-5">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                    {latestNews[0].category || "Tin tức"}
                  </span>
                  <h2 className="text-white font-bold text-xl mt-2">
                    {latestNews[0].title}
                  </h2>
                  <p className="text-gray-200 text-sm mt-1">
                    {truncateText(latestNews[0].summary, 120)}
                  </p>
                  <p className="text-gray-300 text-xs mt-2">
                    {formatDate(latestNews[0].publishedDate)} |{" "}
                    {latestNews[0].sourceName}
                  </p>
                </div>
              </div>

              {/* Other latest news */}
              <div className="flex-[4] flex flex-col gap-4 min-w-[300px]">
                {latestNews.slice(1, 3).map((item) => (
                  <div
                    key={item.id}
                    className="relative w-full h-[195px] cursor-pointer hover:opacity-95 transition-all"
                    onClick={() => handleNewsClick(item.id)}
                  >
                    <img
                      className="w-full h-full object-cover rounded-lg"
                      src={
                        item.imageUrl ||
                        "https://placehold.co/600x400?text=No+Image"
                      }
                      alt={item.title}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                      <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs">
                        {item.category || "Tin tức"}
                      </span>
                      <h3 className="text-white font-semibold text-sm mt-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-300 text-xs mt-1">
                        {formatDate(item.publishedDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="w-full max-w-7xl px-4 mt-8">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                className="border border-gray-300 rounded-full py-2 px-4 pr-10 w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-green-600"
              >
                <FaSearch />
              </button>
            </form>

            {/* Fetch News Button */}
            <button
              onClick={fetchNewsFromSources}
              disabled={fetchingNews}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              {fetchingNews ? (
                <>
                  <FaSync className="animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <FaSync />
                  <span>Tải tin tức mới</span>
                </>
              )}
            </button>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  !category
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSearchParams({ page: 0, size })}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    category === cat
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="w-full max-w-7xl px-4 pb-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {keyword
              ? `Kết quả tìm kiếm: ${keyword}`
              : category
              ? `Tin tức: ${category}`
              : "Tin tức mới nhất"}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Không có tin tức nào phù hợp với tìm kiếm của bạn.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleNewsClick(item.id)}
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={
                          item.imageUrl ||
                          "https://placehold.co/600x400?text=No+Image"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {item.category || "Tin tức"}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatDate(item.publishedDate)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {item.summary}
                      </p>
                      <div className="mt-3 text-xs text-gray-500">
                        Nguồn: {item.sourceName || "Agricultural News"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                      className={`w-10 h-10 flex items-center justify-center rounded-full ${
                        page === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-green-50 border"
                      }`}
                    >
                      <FaChevronLeft size={14} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => {
                      // Giới hạn hiển thị số trang
                      if (
                        i === 0 ||
                        i === totalPages - 1 ||
                        (i >= page - 1 && i <= page + 1)
                      ) {
                        return (
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full ${
                              page === i
                                ? "bg-green-500 text-white"
                                : "bg-white text-gray-700 hover:bg-green-50 border"
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      } else if (i === page - 2 || i === page + 2) {
                        return (
                          <span key={i} className="px-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages - 1}
                      className={`w-10 h-10 flex items-center justify-center rounded-full ${
                        page === totalPages - 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-green-50 border"
                      }`}
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default News;
