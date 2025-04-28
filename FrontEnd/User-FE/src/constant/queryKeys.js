export const queryKeys = {
    comments: (postId) => ['comments', postId],
    childReplies: (commentId) => ['childReplies', commentId]
}

