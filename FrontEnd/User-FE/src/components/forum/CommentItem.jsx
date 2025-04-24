/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import { FaEdit, FaReply, FaThumbsUp } from "react-icons/fa";
import { Input } from "../ui/input";
import { renderContentWithTag, timeAgo } from "@/lib/utils";

const CommentItem = ({ comment, postId }) => {
  console.log(comment);
    
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const [timeAgoDisplay, setTimeAgoDisplay] = useState(() =>
    timeAgo(new Date(comment.updatedAt))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgoDisplay(timeAgo(new Date(comment.updatedAt)));
    }, 60000);
    return () => clearInterval(interval);
  }, [comment.updatedAt]);

  // updateReply
  const { mutate: updateReply, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      const res = await axiosPrivate.put(`/forum/replies/${comment.id}`, {
        content: editedContent,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Comment updated");
      queryClient.invalidateQueries(["comments", postId]);
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update comment");
    },
  });

  //like Reply
//   const { mutate: likeReply } = useMutation({
//     mutationFn: async () => {
//       await axiosPrivate.post(`/forum/replies/${comment.id}/like`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["comments", postId]);
//     },
//   });



  // create Reply
  const { mutate: createReply } = useMutation({
    mutationFn: async () => {
      return await axiosPrivate.post(`/forum/replies`, {
        postId,
        parentId: comment.parentId || comment.id, 
        content: replyContent,
      });
    },
    onSuccess: () => {
      toast.success("Reply posted");
      setReplyContent("");
      setIsReplying(false);
      queryClient.invalidateQueries(["childReplies", comment.parentId || comment.id]);
    },
    onError: () => {
      toast.error("Failed to post reply");
    },
  });

  // get childReplies
  const { data: childReplies } = useQuery({
    queryKey: ["childReplies", comment.id],
    queryFn: async () => {
      const res = await axiosPrivate.get(`/forum/replies/parent/${comment.id}`);
      return res.data;
    },
    // enabled: showReplies,
  });
  console.log(childReplies);

  // handle like
  const { mutate: likeReply } = useMutation({
    mutationFn: async () => {
      await axiosPrivate.post(`/forum/replies/${comment.id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
    },
  });

  const handleSave = () => updateReply();
  const handlePostReply = () => {
    if (replyContent.trim()) {
      createReply();
    } else {
      toast.error("Reply cannot be empty");
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <img
          src={comment?.userImageUrl}
          alt="User avatar"
          className="w-10 h-10 rounded-full"
        />
        <div className="p-2 bg-gray-100 rounded shadow-sm text-sm flex flex-col gap-2 flex-grow">
          <div className="flex justify-between">
            <div>
              <div className="flex gap-2 items-center">
                <strong>{comment.userName}</strong>
                <span>{timeAgoDisplay}</span>
              </div>
              {isEditing ? (
                <div className="mt-1 space-y-2">
                  <Input
                    className="min-w-full"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isUpdating}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1">{renderContentWithTag(comment.content)}</p>
              )}
            </div>
            {comment.userId === auth.user.id && !isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-3 ml-10">
        <Button variant="ghost" size="sm" onClick={() => likeReply()}>
          <FaThumbsUp className="mr-1" /> Like
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsReplying(true);
            setReplyContent(`@${comment.userName} `);
          }}
        >
          <FaReply className="mr-1" /> Reply
        </Button>

        {!comment.parentId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? "Hide Replies" : "Show Replies"} (
            {childReplies?.data.totalElements})
          </Button>
        )}
      </div>

      {isReplying && (
        <div className="ml-10 mt-2 space-y-2">
          <Input
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
          />
          <Button size="sm" onClick={handlePostReply}>
            Post Reply
          </Button>
        </div>
      )}

      {showReplies && childReplies && (
        <div className="ml-10 mt-2 space-y-2">
          {childReplies?.data.content.length === 0 ? (
            <p className="text-xs text-gray-500 ml-2">No replies yet.</p>
          ) : (
            childReplies.data.content.map((reply) => (
              <CommentItem key={reply.id} comment={reply} postId={postId} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
