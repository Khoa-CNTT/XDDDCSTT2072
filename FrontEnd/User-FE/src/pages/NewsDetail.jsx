import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/api/axios";
import Header from "../layout/Header";
import { FaCalendarAlt, FaTag, FaLink, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dữ liệu mẫu khi API không hoạt động hoặc bài viết không tồn tại
  const getSampleNewsDetail = (newsId) => ({
    id: Number(newsId),
    title: "Phát triển mô hình nông nghiệp thông minh ở Việt Nam",
    summary:
      "Việt Nam đang đẩy mạnh ứng dụng công nghệ cao vào sản xuất nông nghiệp nhằm tăng năng suất và chất lượng. Các mô hình nông nghiệp thông minh, sử dụng IoT và tự động hóa, đang dần trở nên phổ biến tại các tỉnh thành trên cả nước.",
    content: `<p>Việt Nam đang trải qua một cuộc cách mạng trong lĩnh vực nông nghiệp với việc áp dụng công nghệ 4.0 và các giải pháp thông minh vào sản xuất. Theo số liệu từ Bộ Nông nghiệp và Phát triển Nông thôn, đã có hơn 350 mô hình nông nghiệp ứng dụng công nghệ cao được triển khai tại 40 tỉnh thành trên cả nước trong 5 năm qua.</p>
    <p>Các công nghệ đang được áp dụng bao gồm:</p>
    <ul>
      <li>Hệ thống tưới nhỏ giọt tự động dựa trên độ ẩm đất</li>
      <li>Trạm quan trắc thời tiết mini cung cấp dữ liệu thời gian thực</li>
      <li>Drone phun thuốc bảo vệ thực vật và theo dõi cây trồng</li>
      <li>Cảm biến IoT giám sát các thông số môi trường</li>
      <li>Nhà kính thông minh với kiểm soát khí hậu tự động</li>
    </ul>
    <p>Một trong những mô hình tiêu biểu là trang trại VinEco tại Hải Phòng, nơi áp dụng công nghệ Israel để sản xuất rau sạch trong nhà kính. Hệ thống tự động điều chỉnh nhiệt độ, độ ẩm, ánh sáng và dinh dưỡng cho cây trồng, giúp tăng năng suất lên 30% so với canh tác truyền thống.</p>
    <p>Tại đồng bằng sông Cửu Long, nhiều nông dân đã ứng dụng công nghệ viễn thám và GIS để theo dõi diễn biến mùa vụ, dự báo sâu bệnh và điều chỉnh lịch canh tác phù hợp với biến đổi khí hậu.</p>
    <p>Thách thức lớn nhất hiện nay là chi phí đầu tư ban đầu cao và thiếu nhân lực có kỹ năng số. Để giải quyết vấn đề này, Chính phủ đã triển khai nhiều chương trình hỗ trợ kỹ thuật và tài chính cho nông dân, đồng thời đẩy mạnh đào tạo về công nghệ nông nghiệp tại các trường đại học và cao đẳng nông nghiệp.</p>`,
    imageUrl:
      "https://tse1.mm.bing.net/th?id=OIP._D-67MXB8hlCTjksAjwebwHaDl&pid=Api&P=0&h=220",
    category: "Nông nghiệp",
    publishedDate: new Date().toISOString(),
    sourceName: "Nông Nghiệp Việt Nam",
    sourceUrl: "https://nongnghiep.vn",
    tags: "Nông nghiệp thông minh, IoT, Tự động hóa, Công nghệ cao",
  });

  const getSampleRelatedNews = (newsId) => [
    {
      id: Number(newsId) + 1,
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
      id: Number(newsId) + 2,
      title: "Ứng dụng công nghệ drone trong nông nghiệp Việt Nam",
      summary:
        "Drone đang giúp nông dân tiết kiệm chi phí và tăng hiệu quả trong canh tác nông nghiệp",
      imageUrl:
        "https://up.yimg.com/ib/th?id=OIP.m88P1cRUzm3p2bICwK2I-wHaE7&pid=Api&rs=1&c=1&qlt=95&w=149&h=99",
      category: "Nông nghiệp",
      publishedDate: new Date().toISOString(),
      sourceName: "Agricultural News",
    },
    {
      id: Number(newsId) + 3,
      title: "Kỹ thuật canh tác không đất ngày càng phổ biến",
      summary:
        "Các kỹ thuật thủy canh, khí canh đang được áp dụng rộng rãi trong sản xuất rau sạch",
      imageUrl:
        "https://up.yimg.com/ib/th?id=OIP.DXqlhh_inDuENzwO9bhplQHaF7&pid=Api&rs=1&c=1&qlt=95&w=124&h=99",
      category: "Nông nghiệp",
      publishedDate: new Date().toISOString(),
      sourceName: "Agricultural News",
    },
  ];

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
              } else {
                console.warn("API tin liên quan trả về không đúng định dạng");
                setRelatedNews(getSampleRelatedNews(id));
              }
            } catch (error) {
              console.warn("Lỗi khi tải tin liên quan:", error);
              setRelatedNews(getSampleRelatedNews(id));
            }
          }
        } else {
          console.warn("API chi tiết tin tức trả về không đúng định dạng");
          setNews(getSampleNewsDetail(id));
          setRelatedNews(getSampleRelatedNews(id));
        }
      } catch (error) {
        console.error("Lỗi khi gọi API chi tiết tin tức:", error);
        // Kiểm tra xem có phải lỗi 404 không
        if (error.response && error.response.status === 404) {
          console.log("Không tìm thấy tin tức với id=" + id);
          setNews(getSampleNewsDetail(id));
          setRelatedNews(getSampleRelatedNews(id));
          toast.info("Hiển thị nội dung mẫu vì tin tức này không tồn tại.");
        } else {
          console.log("Sử dụng dữ liệu mẫu thay thế do lỗi API");
          setNews(getSampleNewsDetail(id));
          setRelatedNews(getSampleRelatedNews(id));
          toast.error("Không thể tải chi tiết tin tức. Hiển thị dữ liệu mẫu.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNewsDetail();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
                    <span>{formatDate(news.publishedDate)}</span>
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
                            {formatDate(item.publishedDate).split(", ")[0]}
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
