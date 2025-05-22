import { Button } from "@/components/ui/button";
import { Users, Home as HomeIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeroSection from "@/components/home/HeroSection";
import MobileMenu from "@/components/home/MobileMenu";
import Community from "@/components/home/Community";
import NewsAndEvents from "@/components/home/NewsAndEvents";
import ConnectSuggestion from "@/components/home/ConnectSuggestion";
import TrendingHashTags from "@/components/home/TrendingHashTags";
import QuickNews from "@/components/home/QuickNews";
import UserProfileCard from "@/components/home/UserProfileCard";

import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/services/home/forumService";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

import { useEffect, useState } from "react";

import useAuth from "@/hooks/useAuth";
import SearchPost from "@/components/home/SearchPost";
import FormInput from "@/components/home/ForumPost/FormInput";
import PostSkeleton from "@/components/home/ForumPost/PostSkeleton";
import ForumPost from "@/components/home/ForumPost/ForumPost";

const Home2 = () => {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const [page, setPage] = useState(0);
  const [searchHashtag, setSearchHashtag] = useState(null);
  const [searchPostKey, setSearchPostKey] = useState(null);
  // postlist
  // const { data: postList, isPending } = useQuery({
  //   queryKey: searchHashtag
  //     ? ["postsByHashtag", searchHashtag, page]
  //     : ["postList", page],
  //   queryFn: async () => {
  //     if (searchHashtag) {
  //       const res = await axiosPrivate.get(
  //         `/posts/hashtag/${searchHashtag}?page=${page}&size=10`
  //       );
  //       return res.data.data;
  //     } else {
  //       const res = await getPosts(axiosPrivate, page);
  //       return res.data;
  //     }
  //   },
  //   keepPreviousData: true,
  // });
  const { data: postList, isPending } = useQuery({
    queryKey: searchHashtag
      ? ["postsByHashtag", searchHashtag, page]
      : searchPostKey
      ? ["postsByKeyword", searchPostKey, page]
      : ["postList", page],
    queryFn: async () => {
      if (searchHashtag) {
        const res = await axiosPrivate.get(
          `/posts/hashtag/${searchHashtag}?page=${page}&size=10`
        );
        return res.data.data;
      } else if (searchPostKey) {
        const res = await axiosPrivate.get(
          `/posts/search?keyword=${encodeURIComponent(
            searchPostKey
          )}&page=${page}&size=10`
        );
        return res.data.data;
      } else {
        const res = await getPosts(axiosPrivate, page);
        return res.data;
      }
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    window.scrollTo({ top: 600, behavior: "smooth" });

    // Hàm cleanup
    return () => {};
  }, [page]);

  return (
    <>
      {/* Hero Section - Thêm mới */}
      <HeroSection />
      {/* <CreatePostWithImage /> */}
      <main className="flex-1 container mx-auto px-2 md:px-4 py-4">
        {/* Sticky Search bar with shortcuts - Cải tiến */}
        <SearchPost
          onSearch={(type, value) => {
            if (type === "hashtag") {
              setSearchHashtag(value);
              setSearchPostKey(null);
            } else if (type === "keyword") {
              setSearchHashtag(null);
              setSearchPostKey(value);
            } else {
              setSearchHashtag(null);
              setSearchPostKey(null);
            }
            setPage(0);
          }}
        />

        {/* Tìm kiếm và thông tin nhanh - Cải tiến */}
        <QuickNews />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Sidebar */}
          <div className="hidden md:block md:col-span-3 space-y-5">
            {/* User Profile Card - Cải tiến */}
            {auth.user && <UserProfileCard />}

            {/* Trending Hashtags - Cải tiến */}
            <TrendingHashTags />
          </div>

          {/* Main Content */}
          <div className="col-span-1 md:col-span-6 space-y-5">
            {/* Tabs - Cải tiến */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <Tabs defaultValue="trangchu" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-gradient-to-r from-gray-50 to-gray-100">
                  <TabsTrigger
                    value="trangchu"
                    className="py-4 px-6 social-tab"
                  >
                    <HomeIcon size={18} className="mr-2" />
                    Trang chủ
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="trangchu" className="m-0 p-0">
                  {/* Bộ lọc bài viết - Cải tiến */}
                  <FormInput />
                  {/* Post Feed - Cải tiến */}
                  {isPending ? (
                    <PostSkeleton />
                  ) : (
                    <div className="p-4">
                      <h1 className="text-xl font-bold mb-4">
                        {searchHashtag ? (
                          <>
                            Danh sách bài viết với hashtag{" "}
                            <span className="text-blue-500">
                              #{searchHashtag}
                            </span>
                          </>
                        ) : searchPostKey ? (
                          <>
                            Kết quả tìm kiếm cho từ khoá{" "}
                            <span className="text-green-600 font-medium">
                              "{searchPostKey}"
                            </span>
                          </>
                        ) : (
                          "Danh sách bài viết"
                        )}
                      </h1>

                      {postList?.content?.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                          {searchHashtag ? (
                            <>
                              Không tìm thấy bài viết nào với hashtag{" "}
                              <span className="font-semibold text-green-600">
                                #{searchHashtag}
                              </span>
                              .
                            </>
                          ) : (
                            <>Không có bài viết nào.</>
                          )}
                        </div>
                      ) : (
                        <>
                          <ul className="space-y-2">
                            {postList?.content?.map((post) => (
                              <ForumPost
                                key={post.id}
                                post={post}
                                isOwner={post.userId === auth?.user?.id}
                              />
                            ))}
                          </ul>

                          {/* Pagination */}
                          <div className="flex items-center justify-between mt-6">
                            <Button
                              onClick={() => setPage((p) => p - 1)}
                              disabled={page === 0}
                            >
                              Previous
                            </Button>

                            <span>
                              Trang <strong>{postList?.number + 1}</strong> /{" "}
                              {postList?.totalPages}
                            </span>

                            <Button
                              onClick={() => setPage((p) => p + 1)}
                              disabled={
                                postList && page >= postList.totalPages - 1
                              }
                            >
                              Next
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Danh sach bai viet cua nguoi ket noi */}
                <TabsContent value="ketnoicuatoi" className="p-0"></TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Sidebar - Cải tiến */}
          <div className="hidden md:block md:col-span-3 space-y-5">
            {/* Gợi ý kết nối */}
            <ConnectSuggestion />

            {/* Tin tức và sự kiện */}
            <NewsAndEvents />

            {/* Cộng đồng */}
            <Community />
          </div>
        </div>
      </main>

      {/* Mobile Menu */}
      <MobileMenu />
    </>
  );
};

export default Home2;
