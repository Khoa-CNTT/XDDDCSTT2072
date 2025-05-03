export const queryKeys = {
  comments: (postId) => ["comments", postId],
  childReplies: (commentId) => ["childReplies", commentId],
  // categories: () => ["categories", "list"],
  products: () => ["products", "list"],
  category: (categoryId) => ["category", categoryId],
  productsByCategory: (categoryId) => ["productsCategory", categoryId],
  searchProducts: (keyword) => ["searchProducts", keyword],
  productById: (id) => ["productById", id],
  userById: (id) => ["userById", id],
  cart: () => ["cart"]
};
