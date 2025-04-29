export const queryKeys = {
  comments: (postId) => ["comments", postId],
  childReplies: (commentId) => ["childReplies", commentId],
  categories: () => ["categories", "list"],
  products: () => ["products", "list"],
  category: (categoryId) => ["category", categoryId],
};
