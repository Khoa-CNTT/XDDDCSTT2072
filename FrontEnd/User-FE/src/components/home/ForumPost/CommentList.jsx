/* eslint-disable react/prop-types */
// src/components/forum/CommentList.jsx
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import CommentItem from "./CommentItem";
import { useEffect } from "react";

const CommentList = ({ postId, parentId }) => {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const queryKey = parentId
    ? ["commentReplies", parentId]
    : ["postComments", postId];

  useEffect(() => {
    if (parentId) {
      queryClient.removeQueries({ queryKey: ["commentReplies", parentId] });
    } else {
      queryClient.removeQueries({ queryKey: ["postComments", postId] });
    }
  }, [postId, queryClient, parentId]);

  const fetchComments = async ({ pageParam = 0 }) => {
    const endpoint = parentId
      ? `replies/parent/${parentId}?page=${pageParam}&size=5`
      : `replies/post/${postId}?page=${pageParam}&size=5`;

    const res = await axiosPrivate.get(endpoint);
    return res.data.data; // giả sử API trả về { content: [...], totalPages: x, number: currentPage }
  };

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: fetchComments,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
    staleTime: 0,
  });
  // console.log(data);
  // console.log("hello");

  if (isLoading) return <p>Đang tải bình luận...</p>;
  if (isError) return <p>Đã có lỗi xảy ra.</p>;

  return (
    <div className="mt-4 space-y-2">
      {data.pages.flatMap((page) =>
        page.content.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
          />
        ))
      )}

      {hasNextPage && (
        <div
          className="text-center font-bold text-blue-600 cursor-pointer"
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Đang tải thêm..." : "Xem thêm..."}
        </div>
      )}
    </div>
  );
};

export default CommentList;
