import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "./useAxiosPrivate";
import {
  createReply,
  getChildReplies,
  likeComment,
  updateComment,
} from "@/services/commentService";
import { queryKeys } from "@/constant/queryKeys";

export const useCommentActions = (comment, postId) => {
  const queryClient = useQueryClient();
  const axiosPrivate = useAxiosPrivate();

  const updateMutation = useMutation({
    mutationFn: (content) => updateComment(axiosPrivate, comment.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) });
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => likeComment(axiosPrivate, comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) });
    },
  });

  const replyMutation = useMutation({
    mutationFn: (content) =>
      createReply(
        axiosPrivate,
        postId,
        comment.parentId || comment.id,
        content
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.childReplies(comment.parentId || comment.id),
      });
    },
  });

  const childRepliesQuery = useQuery({
    queryKey: queryKeys.childReplies(comment.id),
    queryFn: () => getChildReplies(axiosPrivate, comment.id),
  });

  console.log(childRepliesQuery);

  return {
    updateMutation,
    likeMutation,
    replyMutation,
    childRepliesQuery,
  };
};
