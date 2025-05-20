/* eslint-disable react/prop-types */
import { timeAgo } from "@/lib/utils";
import { useRef, useState } from "react";
import { CornerDownRight } from "lucide-react";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

const CommentItem = ({ comment, postId }) => {
  const axiosPrivate = useAxiosPrivate();
  const { userImageUrl, userName, content, updatedAt } = comment;
  const [showReplies, setShowReplies] = useState(false);
  console.log(comment);
  const [showInputReply, setShowInPutRelply] = useState(false);
  const inputRef = useRef(null);

  // lấy reaction của user
  const { data: userReaction } = useQuery({
    queryKey: ["userCommentReaction", comment.id],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `reactions/reply/${comment.id}/user`
      );
      return response.data.data;
    },
  });

  // console.log(u);

  // handle react
  const { mutate: toggleLike } = useMutation({
    mutationFn: async () => {
      const isLiked = userReaction?.includes("LIKE");
      return isLiked
        ? await axiosPrivate.post(`replies/${comment.id}/unlike`)
        : await axiosPrivate.post(`replies/${comment.id}/like`);
    },
    onSuccess: () => {},
  });

  const handleReplyClick = () => {
    if (!showInputReply) {
      setShowInPutRelply(!showInputReply);
      setTimeout(() => {
        inputRef.current?.focus(); // 👉 Focus sau khi input được render
      }, 0);
    }
    else {
      setShowInPutRelply(!showInputReply);
    }
  };

  return (
    <div>
      <div className="flex space-x-4 p-2 rounded-md shadow-sm">
        {/* Avatar bên trái */}
        <div className="flex-shrink-0">
          <img
            src={userImageUrl || "/default-avatar.png"}
            alt={`${userName}'s avatar`}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>

        {/* Nội dung + nút bên phải */}
        <div className="flex flex-col flex-1">
          <div className="bg-gray-100 p-2 rounded-xl">
            <h4 className="font-semibold text-gray-900">
              {userName || "Anonymous"}
            </h4>
            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{content}</p>
          </div>

          {/* Nút thích và phản hồi */}
          <div className="mt-2 flex space-x-4 text-sm text-gray-500">
            <button
              className="hover:underline hover:text-blue-600 transition"
              onClick={() => toggleLike()}
            >
              Thích
            </button>
            <button
              className={`hover:underline hover:text-blue-600 transition ${
                showInputReply && "text-blue-600"
              }`}
              onClick={handleReplyClick}
            >
              Phản hồi
            </button>
            <p>{timeAgo(updatedAt)}</p>
          </div>
          <div className="mt-1">
            {comment.replies.length > 0 && (
              <button
                className="text-sm text-blue-600 flex cursor-pointer"
                onClick={() => setShowReplies(!showReplies)}
              >
                {!showReplies && <CornerDownRight size={16} />}
                <div>
                  {showReplies
                    ? "Ẩn phản hồi"
                    : `Xem phản hồi (${comment.replies.length})`}
                </div>
              </button>
            )}
          </div>
          {showReplies && (
            <div className="mt-2">
              <CommentList parentId={comment.id} postId={postId} />
            </div>
          )}
          <div>
            {showInputReply && (
              <CommentInput
                postId={postId}
                parentId={comment.id}
                inputRef={inputRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
