import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getForumPosts, getComments } from "@/services/forumService";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import PostCard from "@/components/forum/PostCard";
import useAuth from "@/hooks/useAuth";
import CreatePostCard from "@/components/forum/CreatePostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const ForumPage = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Lấy tab từ URL hoặc mặc định là "latest"
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("tab") || "latest";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Cấu hình sortBy dựa trên tab
  const getSortConfig = (tab) => {
    switch (tab) {
      case "latest":
        return { sortBy: "createdAt", sortDir: "desc" };
      case "popular":
        return { sortBy: "likeCount", sortDir: "desc" };
      case "trending":
        return { sortBy: "commentCount", sortDir: "desc" };
      default:
        return { sortBy: "createdAt", sortDir: "desc" };
    }
  };

  const { sortBy, sortDir } = getSortConfig(activeTab);

  // Query để lấy danh sách bài viết
  const {
    data: postsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["forumPosts", page, sortBy, sortDir],
    queryFn: async () => {
      // Lấy dữ liệu từ API
      const result = await getForumPosts(
        axiosPrivate,
        page,
        5,
        sortBy,
        sortDir
      );

      // Nếu không có dữ liệu hoặc đã hết trang, đánh dấu không còn dữ liệu để tải thêm
      if (!result || !result.content || result.content.length === 0) {
        setHasMore(false);
      } else {
        // Sau khi lấy posts, tải sẵn comments cho mỗi bài viết
        await Promise.all(
          result.content.map(async (post) => {
            try {
              // Lấy comments cho bài viết
              const commentsData = await getComments(axiosPrivate, post.id);
              // Lưu vào cache React Query
              if (commentsData && commentsData.content) {
                queryClient.setQueryData(
                  ["comments", post.id],
                  commentsData.content
                );
                // Lưu vào localStorage để dùng offline
                localStorage.setItem(
                  `comments-post-${post.id}`,
                  JSON.stringify(commentsData.content)
                );
              }
              return post;
            } catch (error) {
              console.error(
                `Lỗi khi tải comments cho bài viết ${post.id}:`,
                error
              );
              return post;
            }
          })
        );
      }

      return result;
    },
    keepPreviousData: true,
  });

  // Xử lý khi thay đổi tab
  const handleTabChange = (value) => {
    setActiveTab(value);
    setPage(0);
    setHasMore(true);

    // Cập nhật URL để lưu trạng thái tab
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("tab", value);
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };

  // Xử lý nút "Tải thêm"
  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Reset page khi tab thay đổi
  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Diễn đàn cộng đồng</h1>

      {auth?.user && <CreatePostCard refetchPosts={refetch} />}

      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={handleTabChange}
        className="mt-8"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="latest">Mới nhất</TabsTrigger>
          <TabsTrigger value="popular">Phổ biến</TabsTrigger>
          <TabsTrigger value="trending">Đang thảo luận</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {isLoading ? (
            <Loading />
          ) : postsData && postsData.content && postsData.content.length > 0 ? (
            <>
              {postsData.content.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={auth?.user}
                  onReact={(postId, reactionType) => {
                    // Xử lý reaction
                  }}
                  onComment={async (postId, content, parentId = null) => {
                    // Xử lý comment
                  }}
                  onShare={(postId) => {
                    // Xử lý share
                  }}
                  onEdit={(post) => {
                    // Xử lý edit
                  }}
                  onDelete={(postId) => {
                    // Xử lý delete
                  }}
                />
              ))}

              {hasMore && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    Tải thêm <ChevronDown size={16} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">
                Không có bài viết nào trong mục này
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForumPage;
