import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import Header from "@/layout/Header";
import ForumPost from "@/components/forum/ForumPost";
import PostInput from "@/components/forum/PostInput";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";

function Home() {
  const { auth } = useAuth();
  console.log(auth);
  
  const axiosPrivate = useAxiosPrivate();
  const [showPostInput, setShowPostInput] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const { data: posts, isPending } = useQuery({
    queryKey: ["forumPosts"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/posts/all");
      return response.data;
    },
  });

  // Sort posts by date (newest first)
  const sortedPosts = posts?.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Calculate pagination
  const totalPages = Math.ceil((sortedPosts?.length || 0) / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts?.slice(indexOfFirstPost, indexOfLastPost) || [];

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="md:col-span-2">
            {/* Post Input Area */}
            <Card className="mb-6 p-4">
              <div className="flex items-start gap-3">
                <img
                  src={auth?.user?.imageUrl || "/default-avatar.png"}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <Input
                    placeholder="What do you want to write?"
                    className="bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => setShowPostInput(true)}
                    readOnly
                  />
                </div>
              </div>
            </Card>

            {/* Post Input Modal */}
            {showPostInput && (
              <PostInput onClose={() => setShowPostInput(false)} />
            )}

            {/* Posts Feed */}
            <div className="space-y-4">
              {isPending ? (
                // Loading Skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/6" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </Card>
                ))
              ) : (
                currentPosts.map((post) => (
                  <ForumPost
                    key={post.id}
                    post={post}
                    isOwner={post.userId === auth?.user?.id}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {!isPending && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={`cursor-pointer ${
                          currentPage === 1 ? "pointer-events-none opacity-50" : ""
                        }`}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => handlePageChange(i + 1)}
                          isActive={currentPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={`cursor-pointer ${
                          currentPage === totalPages ? "pointer-events-none opacity-50" : ""
                        }`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <Card className="overflow-hidden">
              <div className="p-4">
                <h2 className="font-semibold text-lg">Weather</h2>
              </div>
              <div className="bg-black text-white p-6">
                <h3 className="text-xl font-medium">CONTENT</h3>
                {/* Add weather content here */}
              </div>
            </Card>

            {/* Social Follow Widget */}
            <Card className="overflow-hidden">
              <div className="p-4">
                <h2 className="font-semibold text-lg">FOLLOW</h2>
              </div>
              <div className="bg-purple-900 text-white p-6">
                <div className="flex justify-center gap-6">
                  <a 
                    href="#" 
                    className="hover:opacity-80 transition-opacity"
                    aria-label="Follow us on Instagram"
                  >
                    <FaInstagram size={28} />
                  </a>
                  <a 
                    href="#" 
                    className="hover:opacity-80 transition-opacity"
                    aria-label="Follow us on Facebook"
                  >
                    <FaFacebook size={28} />
                  </a>
                  <a 
                    href="#" 
                    className="hover:opacity-80 transition-opacity"
                    aria-label="Follow us on Twitter"
                  >
                    <FaTwitter size={28} />
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;