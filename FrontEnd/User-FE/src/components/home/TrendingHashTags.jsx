import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { Badge } from "lucide-react";
const TrendingHashTags = () => {
  const axiosPrivate = useAxiosPrivate();
  const { data: trendingHashtags, isLoading } = useQuery({
    queryKey: ["hashtags", "trending"],
    queryFn: async () => {
      const res = await axiosPrivate.get("hashtags/trending", {
        params: {
          page: 0,
          size: 10,
        },
      });
      return res.data.data.content;
    },
  });
  console.log(trendingHashtags);
  

  const filteredTopHashtags = trendingHashtags
    ? trendingHashtags
        .filter((item) => item.postCount > 0)
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 3)
    : [];

  console.log(filteredTopHashtags);

  return (
    <div className="card-3d p-5 bg-gradient-to-br from-white to-gray-50 border border-gray-100">
      <h3 className="font-semibold mb-4 text-gray-800 flex items-center">
        <TrendingUp size={18} className="mr-2 text-green-600" />
        Chủ đề thịnh hành
      </h3>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-loader h-12 rounded-lg"></div>
            ))}
          </div>
        ) : filteredTopHashtags.length > 0 ? (
          filteredTopHashtags.map((tag) => (
            <div
              key={tag.id}
              className="group flex items-center text-sm hover:bg-gray-50 p-3 rounded-lg cursor-pointer transition-all duration-200 border border-gray-100 hover:border-green-100 hover:shadow-md"
            >
              <div className="flex-1">
                <p className="font-medium text-blue-600 group-hover:text-blue-700">
                  {tag.name.startsWith("#") ? tag.name : `#${tag.name}`}
                </p>
                <p className="text-xs text-gray-500">
                  {tag.postCount} bài viết
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-green-100 to-teal-100 text-teal-700 hover:from-green-200 hover:to-teal-200 hover:text-teal-800 border-0 font-normal transition-all duration-200 btn-interactive">
                Theo dõi
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">Không có hashtag thịnh hành</p>
        )}
      </div>
    </div>
  );
};

export default TrendingHashTags;
