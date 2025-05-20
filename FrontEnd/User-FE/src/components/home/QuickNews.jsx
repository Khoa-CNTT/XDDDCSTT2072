import { Badge, Award, SunMedium, Newspaper, ChevronRight, Zap } from "lucide-react";
import { Button } from "../ui/button";

const QuickNews = () => {
  return (
    <div className="hidden md:flex flex-wrap justify-between items-center mb-5 gap-3">
      <div className="flex flex-wrap gap-3">
        <Badge
          variant="outline"
          className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200 cursor-pointer px-4 py-2 rounded-lg shadow-sm border-green-200 transition-all duration-200 flex items-center"
        >
          <Zap size={16} className="mr-2 text-green-600" />
          <span className="font-medium">Nông nghiệp thông minh</span>
        </Badge>
        <Badge
          variant="outline"
          className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 cursor-pointer px-4 py-2 rounded-lg shadow-sm border-blue-200 transition-all duration-200 flex items-center"
        >
          <Award size={16} className="mr-2 text-blue-600" />
          <span className="font-medium">Sản phẩm chất lượng cao</span>
        </Badge>
        <Badge
          variant="outline"
          className="bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 hover:from-amber-100 hover:to-amber-200 cursor-pointer px-4 py-2 rounded-lg shadow-sm border-amber-200 transition-all duration-200 flex items-center"
        >
          <SunMedium size={16} className="mr-2 text-amber-600" />
          <span className="font-medium">Mùa vụ và thời tiết</span>
        </Badge>
      </div>

      <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md flex items-center gap-2 rounded-full px-5 py-2 h-auto">
        <Newspaper size={18} />
        <span>Tin mới nhất</span>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

export default QuickNews;
