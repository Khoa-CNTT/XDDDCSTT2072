import { Bell, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Calendar } from "lucide-react";

const NewsAndEvents = () => {
  // Mock news và events
  const latestNews = [
    { id: 1, title: "Hội nghị Nông nghiệp xanh 2023", date: "24/11/2023" },
    { id: 2, title: "Triển lãm công nghệ nông nghiệp", date: "15/12/2023" },
    { id: 3, title: "Cập nhật kỹ thuật nuôi trồng mới", date: "10/01/2024" },
  ];

  return (
    <div>
      <div className="card-3d p-5 bg-gradient-to-br from-white to-gray-50 border border-gray-100">
        <h3 className="font-semibold mb-4 text-gray-800 flex items-center">
          <Bell size={18} className="mr-2 text-amber-600" />
          Tin tức và sự kiện
        </h3>

        <div className="space-y-3">
          {latestNews.map((news) => (
            <div
              key={news.id}
              className="hover:bg-gray-50 p-3 rounded-lg cursor-pointer border border-gray-50 hover:border-amber-100 hover:shadow-md transition-all duration-200"
            >
              <p className="font-medium text-sm text-gray-800">{news.title}</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Calendar size={12} className="mr-1 text-amber-500" />
                {news.date}
              </p>
            </div>
          ))}
        </div>

        <Button
          variant="link"
          className="w-full text-blue-600 hover:text-blue-700 mt-3 font-medium transition-colors flex items-center justify-center"
        >
          <span>Xem tất cả</span>
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default NewsAndEvents;
