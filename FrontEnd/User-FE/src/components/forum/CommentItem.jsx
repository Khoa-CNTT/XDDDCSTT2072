/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import { FaEdit, FaReply, FaThumbsUp } from "react-icons/fa";
import { renderContentWithTag, timeAgo } from "@/lib/utils";
import { useCommentActions } from "@/hooks/useCommentActions";

const CommentItem = ({ comment, postId }) => {
  const { auth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const [timeAgoDisplay, setTimeAgoDisplay] = useState(() =>
    timeAgo(new Date(comment.updatedAt))
  );

  const { updateMutation, likeMutation, replyMutation, childRepliesQuery } =
    useCommentActions(comment, postId);
  const { data: childReplies } = childRepliesQuery;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgoDisplay(timeAgo(new Date(comment.updatedAt)));
    }, 60000);
    return () => clearInterval(interval);
  }, [comment.updatedAt]);

  const handleSave = () => {
    updateMutation.mutate(editedContent, {
      onSuccess: () => {
        toast.success("Comment updated");
        setIsEditing(false);
      },
      onError: () => {
        toast.error("Failed to update comment");
      },
    });
  };

  const handlePostReply = () => {
    if (replyContent.trim()) {
      replyMutation.mutate(replyContent, {
        onSuccess: () => {
          toast.success("Reply posted");
          setReplyContent("");
          setIsReplying(false);
        },
        onError: () => {
          toast.error("Failed to post reply");
        },
      });
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
                      disabled={updateMutation.isPending}
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
        <Button variant="ghost" size="sm" onClick={() => likeMutation.mutate()}>
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
            {childRepliesQuery.data?.data.data.totalElements || 0})
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

      {showReplies && childReplies.data && (
        <div className="ml-10 mt-2 space-y-2">
          {childReplies?.data?.data.content?.length === 0 ? (
            <p className="text-xs text-gray-500 ml-2">No replies yet.</p>
          ) : (
            childReplies.data.data.content.map((reply) => (
              <CommentItem key={reply.id} comment={reply} postId={postId} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
