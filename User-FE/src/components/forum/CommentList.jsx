/* eslint-disable react/prop-types */
// src/components/forum/CommentList.jsx
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import CommentItem from "./CommentItem";

const CommentList = ({ postId }) => {
  const axiosPrivate = useAxiosPrivate();

  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await axiosPrivate.get(`/forum/replies/post/${postId}`);
      console.log(res.data.data.content);
      return res.data.data.content;
    },
  });

  if (isLoading) return <p>Loading comments...</p>;

  return (
    <div className="mt-4 space-y-3">
      {data.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  );
};

export default CommentList;
