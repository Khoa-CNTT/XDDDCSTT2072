import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getComments, addForumComment } from '@/services/forumService';

/**
 * Custom hook để quản lý comments của bài viết forum
 * @param {object} axiosPrivate - AxiosPrivate instance để gọi API
 * @returns {object} - Các hàm để tương tác với comments
 */
export const useForumComments = (axiosPrivate) => {
  const queryClient = useQueryClient();

  /**
   * Tải comments cho bài viết và lưu vào cache + localStorage
   * @param {number} postId - ID bài viết cần tải comments
   * @param {number} page - Trang hiện tại
   * @param {number} size - Số lượng comments mỗi trang
   */
  const loadComments = useCallback(async (postId, page = 0, size = 10) => {
    try {
      // Lấy comments từ API
      const commentsData = await getComments(axiosPrivate, postId, page, size);
      
      if (commentsData && commentsData.content) {
        // Lưu vào React Query Cache
        queryClient.setQueryData(['comments', postId], commentsData.content);
        
        // Cách để lưu và nhóm comments thành cấu trúc cha-con
        const formattedComments = structureComments(commentsData.content);
        
        // Lưu vào localStorage để có thể truy cập khi reload trang
        localStorage.setItem(`comments-post-${postId}`, JSON.stringify(formattedComments));
        
        return formattedComments;
      }
      return [];
    } catch (error) {
      console.error(`Lỗi khi tải comments cho bài viết ID ${postId}:`, error);
      return [];
    }
  }, [axiosPrivate, queryClient]);

  /**
   * Thêm comment mới và cập nhật cache + localStorage
   * @param {number} postId - ID bài viết
   * @param {string} content - Nội dung comment
   * @param {number|null} parentId - ID comment cha (nếu là reply)
   */
  const addComment = useCallback(async (postId, content, parentId = null) => {
    try {
      // Gọi API để thêm comment
      const newComment = await addForumComment(axiosPrivate, postId, content, parentId);
      
      // Nếu thêm thành công, cập nhật cache và localStorage
      if (newComment) {
        // Lấy danh sách comments hiện tại từ cache
        const currentComments = queryClient.getQueryData(['comments', postId]) || [];
        
        // Thêm comment mới vào đầu danh sách
        const updatedComments = [
          { ...newComment, parentId }, // Đảm bảo parentId được giữ lại
          ...currentComments
        ];
        
        // Cập nhật React Query Cache
        queryClient.setQueryData(['comments', postId], updatedComments);
        
        // Cấu trúc lại comments thành dạng cha-con
        const formattedComments = structureComments(updatedComments);
        
        // Cập nhật localStorage
        localStorage.setItem(`comments-post-${postId}`, JSON.stringify(formattedComments));
        
        return formattedComments;
      }
    } catch (error) {
      console.error(`Lỗi khi thêm comment cho bài viết ID ${postId}:`, error);
      throw error;
    }
  }, [axiosPrivate, queryClient]);

  /**
   * Cấu trúc lại comments thành dạng cha-con
   * @param {array} comments - Danh sách comments phẳng
   * @returns {array} - Danh sách comments đã được cấu trúc
   */
  const structureComments = useCallback((comments) => {
    if (!comments || !Array.isArray(comments)) return [];

    // Tạo map để tìm kiếm nhanh
    const commentMap = new Map();
    const rootComments = [];

    // Đầu tiên, tạo map từ ID đến comment
    comments.forEach(comment => {
      // Log để debug
      console.log("Xử lý comment:", comment.id, "parentId:", comment.parentId);
      
      // Đảm bảo mỗi comment có replies là mảng rỗng
      const enhancedComment = { ...comment, replies: [] };
      commentMap.set(comment.id, enhancedComment);
    });

    // Tiếp theo, xác định cấu trúc cha-con
    comments.forEach(comment => {
      const enhancedComment = commentMap.get(comment.id);
      
      // Kiểm tra parentId có hợp lệ (không phải null, không phải ID tạm thời)
      if (comment.parentId && 
          typeof comment.parentId === 'number' &&
          !String(comment.parentId).startsWith('temp-')) {
        // Nếu là comment con, tìm comment cha và thêm vào mảng replies
        const parentComment = commentMap.get(comment.parentId);
        if (parentComment) {
          console.log(`Thêm comment ${comment.id} vào replies của comment cha ${comment.parentId}`);
          parentComment.replies.push(enhancedComment);
        } else {
          // Nếu không tìm thấy parent, coi như comment gốc
          console.log(`Không tìm thấy comment cha ${comment.parentId} cho comment ${comment.id}, thêm vào root`);
          rootComments.push(enhancedComment);
        }
      } else {
        // Nếu là comment gốc (không có parentId hoặc có parentId không hợp lệ), thêm vào mảng rootComments
        console.log(`Comment ${comment.id} là comment gốc`);
        rootComments.push(enhancedComment);
      }
    });

    // Sắp xếp theo thời gian tạo (mới nhất lên đầu)
    return rootComments.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, []);

  /**
   * Lấy comments đã được cấu trúc từ localStorage hoặc cache
   * @param {number} postId - ID bài viết
   * @returns {array} - Danh sách comments đã được cấu trúc
   */
  const getStructuredComments = useCallback((postId) => {
    try {
      // Thử lấy từ localStorage trước
      const commentsFromStorage = localStorage.getItem(`comments-post-${postId}`);
      if (commentsFromStorage) {
        try {
          return JSON.parse(commentsFromStorage);
        } catch (e) {
          console.error('Lỗi khi parse comments từ localStorage:', e);
        }
      }

      // Nếu không có trong localStorage, thử lấy từ cache và cấu trúc lại
      const commentsFromCache = queryClient.getQueryData(['comments', postId]);
      if (commentsFromCache) {
        return structureComments(commentsFromCache);
      }

      // Nếu không có cả hai, trả về mảng rỗng
      return [];
    } catch (error) {
      console.error('Lỗi khi lấy structured comments:', error);
      return [];
    }
  }, [queryClient, structureComments]);

  return {
    loadComments,
    addComment,
    structureComments,
    getStructuredComments
  };
};

export default useForumComments; 