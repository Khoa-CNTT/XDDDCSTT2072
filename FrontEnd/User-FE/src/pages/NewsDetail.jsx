import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/api/axios";
import Header from "../layout/Header";
import { FaCalendarAlt, FaTag, FaLink, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import { formatDateWithFallback } from "../lib/utils";

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      setLoading(true);
      try {
        console.log(`Đang gọi API chi tiết tin tức: /news/${id}`);
        const response = await axiosInstance.get(`/news/${id}`);

        console.log("Chi tiết tin tức response:", response.data);

        if (response.data) {
          setNews(response.data);

          // Fetch related news based on category
          if (response.data.category) {
            try {
              const relatedResponse = await axiosInstance.get(
                `/news/category/${response.data.category}`,
                {
                  params: {
                    page: 0,
                    size: 4,
                  },
                }
              );

              if (relatedResponse.data && relatedResponse.data.content) {
                // Filter out the current news
                const filtered = relatedResponse.data.content.filter(
                  (item) => item.id !== Number(id)
                );
                setRelatedNews(filtered.slice(0, 3)); // Limit to 3 items
              } else if (Array.isArray(relatedResponse.data)) {
                // If the response is an array instead of a Page
                const filtered = relatedResponse.data.filter(
                  (item) => item.id !== Number(id)
                );
                setRelatedNews(filtered.slice(0, 3));
              } else {
                console.warn("API tin liên quan trả về không đúng định dạng");
                setRelatedNews([]);
              }
            } catch (error) {
              console.warn("Lỗi khi tải tin liên quan:", error);
              setRelatedNews([]);
            }
          }
        } else {
          console.warn("API chi tiết tin tức trả về không đúng định dạng");
          setNews(null);
          toast.error("Không thể tải chi tiết tin tức. Vui lòng thử lại sau.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API chi tiết tin tức:", error);
        // Kiểm tra xem có phải lỗi 404 không
        if (error.response && error.response.status === 404) {
          console.log("Không tìm thấy tin tức với id=" + id);
          setNews(null);
          toast.error("Tin tức này không tồn tại hoặc đã bị xóa.");
        } else {
          setNews(null);
          toast.error("Không thể tải chi tiết tin tức. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNewsDetail();
    }
  }, [id]);

  const handleNavigateToSource = () => {
    if (news?.sourceUrl) {
      window.open(news.sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleRelatedNewsClick = (newsId) => {
    navigate(`/news/${newsId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="w-full max-w-5xl mx-auto px-4 pt-20 pb-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : !news ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-gray-700">
              Không tìm thấy bài viết
            </h2>
            <p className="mt-2 text-gray-500">
              Bài viết này không tồn tại hoặc đã bị xóa.
            </p>
            <button
              onClick={() => navigate("/news")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <FaArrowLeft /> Quay lại trang tin tức
            </button>
          </div>
        ) : (
          <div>
            {/* Back button */}
            <button
              onClick={() => navigate("/news")}
              className="inline-flex items-center gap-2 mb-6 text-green-600 hover:text-green-700"
            >
              <FaArrowLeft /> Quay lại tin tức
            </button>

            {/* News article */}
            <article className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Header section */}
              <div className="relative">
                <img
                  src={
                    news.imageUrl ||
                    "https://placehold.co/1200x400?text=No+Image"
                  }
                  alt={news.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      {news.category || "Tin tức"}
                    </span>
                    {news.tags &&
                      news.tags.split(",").map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {news.title}
                  </h1>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaCalendarAlt />
                    <span>
                      {formatDateWithFallback(
                        news.publishedDate,
                        "Không rõ ngày đăng"
                      )}
                    </span>
                  </div>

                  {news.sourceName && (
                    <div className="flex items-center gap-1">
                      <FaTag />
                      <span>Nguồn: {news.sourceName}</span>
                    </div>
                  )}

                  {news.sourceUrl && (
                    <button
                      onClick={handleNavigateToSource}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700"
                    >
                      <FaLink />
                      <span>Xem bài gốc</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Summary */}
                {news.summary && (
                  <div className="mb-6 italic text-gray-700 border-l-4 border-green-500 pl-4 py-2">
                    {news.summary}
                  </div>
                )}

                {/* Main content */}
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                ></div>
              </div>
            </article>

            {/* Related news */}
            {relatedNews.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  Bài viết liên quan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedNews.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleRelatedNewsClick(item.id)}
                    >
                      <div className="h-48 overflow-hidden">
                        <img
                          src={
                            item.imageUrl ||
                            "https://placehold.co/600x400?text=No+Image"
                          }
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>
                            {
                              formatDateWithFallback(
                                item.publishedDate,
                                "Không rõ ngày đăng"
                              ).split(", ")[0]
                            }
                          </span>
                          <span>{item.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsDetail;
