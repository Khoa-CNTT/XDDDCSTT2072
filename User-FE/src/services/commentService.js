export const updateComment = (axiosPrivate, id, content) => {
  return axiosPrivate.put(`/forum/replies/${id}`, { content });
};

export const likeComment = (axiosPrivate, id) => {
  return axiosPrivate.post(`/forum/replies/${id}/like`);
};

export const createReply = (axiosPrivate, postId, parentId, content) => {
  return axiosPrivate.post(`/forum/replies`, {
    postId,
    parentId,
    content,
  });
};

export const getChildReplies = (axiosPrivate, parentId) => {
  return axiosPrivate.get(`/forum/replies/parent/${parentId}`);
};
