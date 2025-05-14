/**
 * Các dịch vụ API cho tính năng forum
 */

// Lấy tất cả bài viết forum (có phân trang)
export const getForumPosts = async (axiosPrivate, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
  try {
    console.log(`Gọi API lấy bài viết với tham số: page=${page}, size=${size}, sortBy=${sortBy}, sortDir=${sortDir}`);
    const response = await axiosPrivate.get('/posts', {
      params: { page, size, sortBy, sortDir }
    });
    if (response && response.data && response.data.data) {
      console.log('Dữ liệu posts nhận được:', response.data.data);
      
      // Lấy thông tin người dùng hiện tại từ localStorage
      let currentUserId = null;
      try {
        const authJson = localStorage.getItem('auth');
        if (authJson) {
          const auth = JSON.parse(authJson);
          if (auth && auth.user && auth.user.id) {
            currentUserId = auth.user.id;
          }
        }
      } catch (e) {
        console.error('Lỗi khi đọc thông tin user từ localStorage:', e);
      }
      
      // Chuẩn hóa dữ liệu bài viết để đảm bảo các trường hình ảnh được xử lý đúng
      if (response.data.data.content && Array.isArray(response.data.data.content)) {
        response.data.data.content = response.data.data.content.map(post => {
          // Kiểm tra và chuẩn hóa URL hình ảnh
          let enhancedPost = { ...post };
          
          // Đảm bảo cả hai trường attachment đều có dữ liệu
          if (post.attachmentUrl && !post.attachment_url) {
            enhancedPost.attachment_url = post.attachmentUrl;
          }
          
          if (post.attachment_url && !post.attachmentUrl) {
            enhancedPost.attachmentUrl = post.attachment_url;
          }
          
          // Đảm bảo cả hai trường attachment type đều có dữ liệu
          if (post.attachmentType && !post.attachment_type) {
            enhancedPost.attachment_type = post.attachmentType;
          }
          
          if (post.attachment_type && !post.attachmentType) {
            enhancedPost.attachmentType = post.attachment_type;
          }
          
          // Kiểm tra xem post có hình ảnh trong mảng images không
          if (post.images && Array.isArray(post.images) && post.images.length > 0) {
            // Nếu có, sử dụng URL của hình ảnh đầu tiên
            const imageUrl = post.images[0].url || post.images[0].imageUrl;
            if (imageUrl) {
              enhancedPost.attachment_url = imageUrl;
              enhancedPost.attachmentUrl = imageUrl;
              enhancedPost.attachment_type = "IMAGE";
              enhancedPost.attachmentType = "IMAGE";
              
              console.log(`Đã cập nhật URL hình ảnh từ mảng images cho bài viết ID ${post.id}:`, imageUrl);
            }
          }
          
          // Thêm thông tin người dùng reaction
          if (currentUserId && post.userReaction) {
            enhancedPost.userReactionUserId = currentUserId;
          }
          
          // Kiểm tra xem đã có reaction trong localStorage chưa
          try {
            const reactionKey = `reaction-post-${post.id}`;
            const storedReaction = localStorage.getItem(reactionKey);
            if (storedReaction) {
              const parsedReaction = JSON.parse(storedReaction);
              if (parsedReaction && parsedReaction.userId && parsedReaction.userId === currentUserId) {
                enhancedPost.userReaction = parsedReaction.type;
                enhancedPost.userReactionUserId = currentUserId;
              } else if (parsedReaction && parsedReaction.userId && parsedReaction.userId !== currentUserId) {
                // Nếu reaction không thuộc về người dùng hiện tại, không áp dụng
                enhancedPost.userReaction = null;
                enhancedPost.userReactionUserId = null;
              }
            }
          } catch (e) {
            console.error(`Lỗi khi đọc reaction từ localStorage cho bài viết ${post.id}:`, e);
          }
          
          return enhancedPost;
        });
      }
      
      return response.data.data;
    }
    console.log('Không có dữ liệu posts hoặc dữ liệu không đúng định dạng');
    return { content: [], totalElements: 0, totalPages: 0 };
  } catch (error) {
    console.error('Lỗi khi lấy bài viết forum:', error);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

// Lấy bài viết theo ID
export const getForumPostById = async (axiosPrivate, postId) => {
  try {
    const response = await axiosPrivate.get(`/posts/${postId}`);
    
    if (response.data && response.data.data) {
      // Lấy thông tin người dùng hiện tại từ localStorage
      let currentUserId = null;
      try {
        const authJson = localStorage.getItem('auth');
        if (authJson) {
          const auth = JSON.parse(authJson);
          if (auth && auth.user && auth.user.id) {
            currentUserId = auth.user.id;
          }
        }
      } catch (e) {
        console.error('Lỗi khi đọc thông tin user từ localStorage:', e);
      }
      
      // Chuẩn hóa dữ liệu để đảm bảo URL hình ảnh được xử lý đúng
      let post = response.data.data;
      
      // Đảm bảo cả hai trường attachment đều có dữ liệu
      if (post.attachmentUrl && !post.attachment_url) {
        post.attachment_url = post.attachmentUrl;
      }
      
      if (post.attachment_url && !post.attachmentUrl) {
        post.attachmentUrl = post.attachment_url;
      }
      
      // Đảm bảo cả hai trường attachment type đều có dữ liệu
      if (post.attachmentType && !post.attachment_type) {
        post.attachment_type = post.attachmentType;
      }
      
      if (post.attachment_type && !post.attachmentType) {
        post.attachmentType = post.attachment_type;
      }
      
      // Kiểm tra xem post có hình ảnh trong mảng images không
      if (post.images && Array.isArray(post.images) && post.images.length > 0) {
        // Nếu có, sử dụng URL của hình ảnh đầu tiên
        const imageUrl = post.images[0].url || post.images[0].imageUrl;
        if (imageUrl) {
          post.attachment_url = imageUrl;
          post.attachmentUrl = imageUrl;
          post.attachment_type = "IMAGE";
          post.attachmentType = "IMAGE";
          
          console.log(`Đã cập nhật URL hình ảnh từ mảng images cho bài viết ID ${post.id}:`, imageUrl);
        }
      }
      
      // Thêm thông tin người dùng reaction
      if (currentUserId && post.userReaction) {
        post.userReactionUserId = currentUserId;
      }
      
      // Kiểm tra xem đã có reaction trong localStorage chưa
      try {
        const reactionKey = `reaction-post-${post.id}`;
        const storedReaction = localStorage.getItem(reactionKey);
        if (storedReaction) {
          const parsedReaction = JSON.parse(storedReaction);
          if (parsedReaction && parsedReaction.userId && parsedReaction.userId === currentUserId) {
            post.userReaction = parsedReaction.type;
            post.userReactionUserId = currentUserId;
          } else if (parsedReaction && parsedReaction.userId && parsedReaction.userId !== currentUserId) {
            // Nếu reaction không thuộc về người dùng hiện tại, không áp dụng
            post.userReaction = null;
            post.userReactionUserId = null;
          }
        }
      } catch (e) {
        console.error(`Lỗi khi đọc reaction từ localStorage cho bài viết ${post.id}:`, e);
      }
      
      return post;
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi lấy bài viết ID ${postId}:`, error);
    throw error;
  }
};

// Tạo bài viết mới
export const createForumPost = async (axiosPrivate, postData, files = null) => {
  try {
    let response;
    
    if (postData instanceof FormData) {
      // Nếu postData là FormData, kiểm tra xem có trường 'post' không
      console.log("Gửi dữ liệu dạng FormData với ảnh");
      
      // Đảm bảo FormData có trường 'post'
      if (!postData.has('post')) {
        console.error("FormData không có trường 'post' cần thiết");
        throw new Error("Dữ liệu form không hợp lệ: thiếu trường 'post'");
      }
      
      // In ra thông tin chi tiết về FormData để debug
      console.log("Nội dung FormData:");
      for (let [key, value] of postData.entries()) {
        if (key === 'post') {
          console.log("Post data:", value);
        } else if (key === 'images') {
          console.log("Image:", value.name, value.type, value.size);
        } else {
          console.log(key, ":", value);
        }
      }
      
      // Gửi formData lên server với headers rõ ràng
      response = await axiosPrivate.post('/posts/with-images', postData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Log để debug
      console.log("Phản hồi khi tạo bài viết với hình ảnh:", response.data);
    } else if (files && (Array.isArray(files) ? files.length > 0 : files)) {
      // Nếu có file riêng, xử lý như trước đây
      const formData = new FormData();
      
      // Tạo formData mới từ postData
      const postRequestData = {
        title: postData.title,
        content: postData.content,
        privacyLevel: postData.privacyLevel || "PUBLIC",
        location: postData.location,
        feeling: postData.feeling,
        backgroundColor: postData.backgroundColor,
        attachmentType: "IMAGE",
        attachmentUrl: null,
        hashtags: extractHashtags(postData.content)
      };
      
      // Thêm thông tin bài viết dưới dạng JSON string thay vì dùng Blob
      formData.append('post', JSON.stringify(postRequestData));
      
      // Xử lý một hoặc nhiều file
      if (Array.isArray(files)) {
        console.log(`Đang tải lên ${files.length} file hình ảnh`);
        // Nếu là mảng file, thêm từng file vào form với cùng key 'images'
        files.forEach(file => {
          if (file) {
            formData.append('images', file);
          }
        });
      } else {
        // Nếu chỉ là một file đơn lẻ
        console.log('Đang tải lên 1 file hình ảnh');
        formData.append('images', files);
      }
      
      // Gửi formData lên server
      response = await axiosPrivate.post('/posts/with-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      // Không có file, sử dụng endpoint thông thường
      // Đảm bảo dữ liệu gửi đi đúng định dạng mà backend mong đợi
      const postRequestData = {
        title: postData.title,
        content: postData.content,
        privacyLevel: postData.privacyLevel || "PUBLIC",
        location: postData.location,
        feeling: postData.feeling,
        backgroundColor: postData.backgroundColor,
        attachmentType: postData.attachmentType || "NONE",
        attachmentUrl: postData.attachmentUrl,
        hashtags: extractHashtags(postData.content)
      };
      
      response = await axiosPrivate.post('/posts', postRequestData);
    }
    
    // Chuẩn hóa dữ liệu trả về
    let normalizedResponse = response.data.data;
    
    // Đảm bảo dữ liệu hình ảnh được lưu đúng cách
    if (normalizedResponse) {
      // Đảm bảo cả hai trường đều có dữ liệu
      normalizedResponse = {
        ...normalizedResponse,
        attachment_url: normalizedResponse.attachmentUrl || normalizedResponse.attachment_url,
        attachment_type: normalizedResponse.attachmentType || normalizedResponse.attachment_type || "NONE"
      };
      
      console.log("Dữ liệu bài viết đã chuẩn hóa:", normalizedResponse);
    }
    
    // Lưu phản hồi vào cache và localStorage
    if (normalizedResponse) {
      try {
        // Lấy dữ liệu hiện tại từ localStorage
        const forumPostsJSON = localStorage.getItem('forumPosts');
        let forumPosts = { content: [], totalElements: 0, totalPages: 0 };
        
        if (forumPostsJSON) {
          try {
            forumPosts = JSON.parse(forumPostsJSON);
          } catch (e) {
            console.error('Lỗi khi parse forumPosts từ localStorage:', e);
          }
        }
        
        // Thêm bài viết mới vào đầu danh sách
        if (forumPosts && forumPosts.content) {
          forumPosts.content = [normalizedResponse, ...forumPosts.content];
          
          // Cập nhật tổng số phần tử
          if (forumPosts.totalElements) {
            forumPosts.totalElements++;
          }
          
          // Lưu lại vào localStorage
          localStorage.setItem('forumPosts', JSON.stringify(forumPosts));
        }
      } catch (e) {
        console.error('Lỗi khi cập nhật forumPosts trong localStorage:', e);
      }
    }
    
    return normalizedResponse;
  } catch (error) {
    console.error('Lỗi khi tạo bài viết:', error);
    throw error;
  }
};

// Cập nhật bài viết
export const updateForumPost = async (axiosPrivate, postId, postData, file = null) => {
  try {
    // Kiểm tra nếu postData là FormData
    if (postData instanceof FormData) {
      console.log("Cập nhật bài viết với FormData");
      
      // Gửi FormData trực tiếp lên API cập nhật bài viết với ảnh
      const response = await axiosPrivate.post(`/posts/${postId}/with-images`, postData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Chuẩn hóa dữ liệu trả về
      let normalizedResponse = response.data.data;
      
      // Đảm bảo dữ liệu hình ảnh được lưu đúng cách
      if (normalizedResponse) {
        // Đảm bảo cả hai trường đều có dữ liệu
        normalizedResponse = {
          ...normalizedResponse,
          attachment_url: normalizedResponse.attachmentUrl || normalizedResponse.attachment_url,
          attachment_type: normalizedResponse.attachmentType || normalizedResponse.attachment_type || "IMAGE"
        };
        
        console.log("Dữ liệu bài viết đã cập nhật và chuẩn hóa:", normalizedResponse);
      }
      
      // Cập nhật localStorage sau khi sửa bài viết
      updateLocalStorage(postId, normalizedResponse);
      
      return normalizedResponse;
    }
    
    // Xử lý trường hợp thông thường
    let updatedAttachmentUrl = postData.attachment_url;
    
    // Nếu có file mới, upload file trước
    if (file) {
      try {
        const formData = new FormData();
        formData.append('images', file);
        const imageResponse = await axiosPrivate.post(`/posts/${postId}/images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Log để debug
        console.log("Phản hồi khi tải lên hình ảnh:", imageResponse.data);
        
        // Cập nhật URL hình ảnh từ phản hồi nếu có
        if (imageResponse.data && imageResponse.data.data) {
          if (Array.isArray(imageResponse.data.data) && imageResponse.data.data.length > 0) {
            // Nếu nhận một mảng các hình ảnh, lấy URL của hình ảnh đầu tiên
            const firstImage = imageResponse.data.data[0];
            updatedAttachmentUrl = firstImage.url || firstImage.attachmentUrl || firstImage.imageUrl;
          } else if (imageResponse.data.data.attachmentUrl) {
            // Nếu phản hồi chứa attachmentUrl
            updatedAttachmentUrl = imageResponse.data.data.attachmentUrl;
          } else if (imageResponse.data.data.url) {
            // Nếu phản hồi chứa url
            updatedAttachmentUrl = imageResponse.data.data.url;
          }
        }
        
        console.log("URL hình ảnh đã cập nhật:", updatedAttachmentUrl);
      } catch (uploadError) {
        console.error('Lỗi khi tải lên hình ảnh:', uploadError);
      }
    }

    // Cập nhật bài viết
    const postRequestData = {
      title: postData.title,
      content: postData.content,
      privacyLevel: postData.privacyLevel || postData.privacy_level,
      location: postData.location,
      feeling: postData.feeling,
      backgroundColor: postData.backgroundColor || postData.background_color,
      attachmentType: file ? "IMAGE" : (postData.attachmentType || postData.attachment_type || "NONE"),
      attachmentUrl: updatedAttachmentUrl,
      hashtags: extractHashtags(postData.content)
    };

    const response = await axiosPrivate.put(`/posts/${postId}`, postRequestData);
    
    // Chuẩn hóa dữ liệu trả về
    let normalizedResponse = response.data.data;
    
    // Đảm bảo dữ liệu hình ảnh được lưu đúng cách
    if (normalizedResponse) {
      // Đảm bảo cả hai trường đều có dữ liệu
      normalizedResponse = {
        ...normalizedResponse,
        attachment_url: normalizedResponse.attachmentUrl || normalizedResponse.attachment_url || updatedAttachmentUrl,
        attachment_type: normalizedResponse.attachmentType || normalizedResponse.attachment_type || (file ? "IMAGE" : "NONE")
      };
      
      console.log("Dữ liệu bài viết đã cập nhật và chuẩn hóa:", normalizedResponse);
    }
    
    // Cập nhật localStorage sau khi sửa bài viết
    updateLocalStorage(postId, normalizedResponse);
    
    return normalizedResponse;
  } catch (error) {
    console.error(`Lỗi khi cập nhật bài viết ID ${postId}:`, error);
    throw error;
  }
};

// Hàm hỗ trợ cập nhật localStorage
const updateLocalStorage = (postId, normalizedResponse) => {
  if (!normalizedResponse) return;
  
  try {
    // Lấy dữ liệu hiện tại từ localStorage
    const forumPostsJSON = localStorage.getItem('forumPosts');
    
    if (forumPostsJSON) {
      let forumPosts = JSON.parse(forumPostsJSON);
      
      if (forumPosts && forumPosts.content && Array.isArray(forumPosts.content)) {
        // Tìm và cập nhật bài viết trong cache
        const updatedContent = forumPosts.content.map(post => {
          if (post.id === postId) {
            return normalizedResponse;
          }
          return post;
        });
        
        // Lưu lại vào localStorage
        localStorage.setItem('forumPosts', JSON.stringify({
          ...forumPosts,
          content: updatedContent
        }));
      }
    }
  } catch (e) {
    console.error('Lỗi khi cập nhật forumPosts trong localStorage:', e);
  }
};

// Xóa bài viết
export const deleteForumPost = async (axiosPrivate, postId) => {
  try {
    const response = await axiosPrivate.delete(`/posts/${postId}`);
    
    // Cập nhật localStorage sau khi xóa bài viết thành công
    try {
      // Lấy dữ liệu hiện tại từ localStorage
      const forumPostsJSON = localStorage.getItem('forumPosts');
      
      if (forumPostsJSON) {
        let forumPosts = JSON.parse(forumPostsJSON);
        
        if (forumPosts && forumPosts.content && Array.isArray(forumPosts.content)) {
          // Lọc bỏ bài viết đã xóa
          const updatedContent = forumPosts.content.filter(post => post.id !== postId);
          
          // Cập nhật lại localStorage
          localStorage.setItem('forumPosts', JSON.stringify({
            ...forumPosts,
            content: updatedContent,
            totalElements: forumPosts.totalElements > 0 ? forumPosts.totalElements - 1 : 0
          }));
        }
      }
      
      // Xóa các dữ liệu liên quan đến bài viết trong localStorage
      localStorage.removeItem(`comments-post-${postId}`);
      localStorage.removeItem(`reaction-post-${postId}`);
      localStorage.removeItem(`reactionCounts-${postId}`);
    } catch (e) {
      console.error('Lỗi khi cập nhật localStorage sau khi xóa bài viết:', e);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa bài viết ID ${postId}:`, error);
    throw error;
  }
};

// Thêm comment cho bài viết
export const addForumComment = async (axiosPrivate, postId, content, parentId = null) => {
  try {
    // Đảm bảo parentId là số nguyên hoặc null
    let validParentId = null;
    if (parentId !== null) {
      // Kiểm tra xem parentId có phải là ID tạm thời không (bắt đầu bằng 'temp-')
      if (typeof parentId === 'string' && parentId.toString().startsWith('temp-')) {
        validParentId = null; // Nếu là ID tạm thời, gửi null lên server
      } else {
        // Đảm bảo parentId là số nguyên
        validParentId = parseInt(parentId, 10);
        // Nếu không phải số hợp lệ, gán lại là null
        if (isNaN(validParentId)) {
          validParentId = null;
        }
      }
    }
    
    // Tạo đối tượng comment với parentId đã được xử lý
    const commentData = {
      postId: postId,
      content: content,
      parentId: validParentId // Sử dụng giá trị đã được xử lý
    };

    // Kiểm tra xem URL nào hoạt động: /replies hoặc /forum/replies
    let response;
    try {
      // Thử endpoint /replies trước
      response = await axiosPrivate.post(`/replies`, commentData);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("Thử lại với endpoint /forum/replies");
        // Nếu lỗi 401, thử với /forum/replies
        response = await axiosPrivate.post(`/forum/replies`, commentData);
      } else {
        throw error; // Nếu là lỗi khác, ném ra ngoài
      }
    }
    
    // Lưu comment vào localStorage
    try {
      // Thử khôi phục danh sách comment hiện tại
      const commentsKey = `comments-post-${postId}`;
      const savedComments = localStorage.getItem(commentsKey);
      let comments = [];
      
      if (savedComments) {
        comments = JSON.parse(savedComments);
      }
      
      // Thêm comment mới vào đầu danh sách
      if (response.data) {
        // Đảm bảo thông tin parentId được giữ lại
        const newComment = {
          ...response.data,
          parentId: validParentId // Lưu parentId đã được xử lý
        };
        
        comments.unshift(newComment);
        
        // Lưu lại vào localStorage
        localStorage.setItem(commentsKey, JSON.stringify(comments));
      }
    } catch (error) {
      console.error("Lỗi khi lưu comment vào localStorage:", error);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Lấy bình luận của bài viết
export const getComments = async (axiosPrivate, postId, page = 0, size = 10) => {
  try {
    let response;
    try {
      // Thử endpoint /replies/post/... trước
      response = await axiosPrivate.get(`/replies/post/${postId}`, {
        params: { page, size }
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("Thử lại với endpoint /forum/replies/post");
        // Nếu lỗi 401, thử với /forum/replies/post/...
        response = await axiosPrivate.get(`/forum/replies/post/${postId}`, {
          params: { page, size }
        });
      } else {
        throw error;
      }
    }
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi lấy bình luận cho bài viết ID ${postId}:`, error);
    throw error;
  }
};

// Lấy bình luận con
export const getChildComments = async (axiosPrivate, parentId, page = 0, size = 5) => {
  try {
    let response;
    try {
      // Thử endpoint /replies/parent/... trước
      response = await axiosPrivate.get(`/replies/parent/${parentId}`, {
        params: { page, size }
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("Thử lại với endpoint /forum/replies/parent");
        // Nếu lỗi 401, thử với /forum/replies/parent/...
        response = await axiosPrivate.get(`/forum/replies/parent/${parentId}`, {
          params: { page, size }
        });
      } else {
        throw error;
      }
    }
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi lấy bình luận con cho bình luận ID ${parentId}:`, error);
    throw error;
  }
};

// Thích/bỏ thích bình luận
export const likeComment = async (axiosPrivate, commentId) => {
  try {
    const response = await axiosPrivate.post(`/replies/${commentId}/like`);
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi thích bình luận ID ${commentId}:`, error);
    throw error;
  }
};

export const unlikeComment = async (axiosPrivate, commentId) => {
  try {
    const response = await axiosPrivate.post(`/replies/${commentId}/unlike`);
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi bỏ thích bình luận ID ${commentId}:`, error);
    throw error;
  }
};

// Phản ứng với bài viết (thích, yêu thích, v.v.)
export const reactToPost = async (axiosPrivate, postId, reactionType) => {
  try {
    console.log(`Gửi phản ứng ${reactionType} đến bài viết ID ${postId}`);
    
    // Nếu reactionType là null, xóa phản ứng
    if (reactionType === null) {
      return await removeReaction(axiosPrivate, postId);
    }
    
    // Kiểm tra và đảm bảo reactionType là một trong các giá trị hợp lệ
    const validReactions = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "FUNNY", "INSIGHTFUL", "SUPPORT", "CELEBRATE"];
    if (!validReactions.includes(reactionType)) {
      console.error(`Loại phản ứng không hợp lệ: ${reactionType}`);
      throw new Error(`Loại phản ứng không hợp lệ: ${reactionType}`);
    }
    
    // Đường dẫn API đúng theo ForumReactionController.java
    const response = await axiosPrivate.post(`/reactions/post/${postId}?reactionType=${reactionType}`);
    console.log("Phản hồi API:", response.data);
    
    // Lấy thông tin người dùng hiện tại từ phản hồi hoặc localStorage
    let currentUserId = null;

    // Thử lấy từ phản hồi API
    if (response.data && response.data.data && response.data.data.userId) {
      currentUserId = response.data.data.userId;
    } else {
      // Nếu không có trong phản hồi, thử lấy từ localStorage
      try {
        const authJson = localStorage.getItem('auth');
        if (authJson) {
          const auth = JSON.parse(authJson);
          if (auth && auth.user && auth.user.id) {
            currentUserId = auth.user.id;
          }
        }
      } catch (e) {
        console.error('Lỗi khi đọc thông tin user từ localStorage:', e);
      }
    }

    // Chỉ lưu vào localStorage nếu có thông tin userId
    if (currentUserId) {
      // Lưu trực tiếp vào localStorage để đảm bảo dữ liệu được giữ lại khi reload
      try {
        // Lưu thông tin phản ứng với key dựa trên postId
        const reactionKey = `reaction-post-${postId}`;
        const reactionData = {
          type: reactionType,
          timestamp: new Date().toISOString(),
          postId: postId,
          userId: currentUserId // Luôn đính kèm userId
        };
        
        localStorage.setItem(reactionKey, JSON.stringify(reactionData));
        
        // Cập nhật bài viết trong localStorage nếu có
        const forumPostsJson = localStorage.getItem('forumPosts');
        if (forumPostsJson) {
          try {
            const forumPosts = JSON.parse(forumPostsJson);
            if (forumPosts && forumPosts.content && Array.isArray(forumPosts.content)) {
              // Tìm và cập nhật bài viết trong cache
              const updatedContent = forumPosts.content.map(post => {
                if (post.id === postId) {
                  // Cập nhật userReaction
                  post.userReaction = reactionType;
                  post.userReactionUserId = currentUserId; // Thêm userId vào thông tin reaction
                  
                  // Cập nhật reactionCounts
                  if (!post.reactionCounts) {
                    post.reactionCounts = {};
                  }
                  
                  // Tăng số lượng reaction mới
                  post.reactionCounts[reactionType] = (post.reactionCounts[reactionType] || 0) + 1;
                }
                return post;
              });
              
              // Lưu lại vào localStorage
              localStorage.setItem('forumPosts', JSON.stringify({
                ...forumPosts,
                content: updatedContent
              }));
            }
          } catch (e) {
            console.error('Lỗi khi cập nhật forumPosts trong localStorage:', e);
          }
        }
      } catch (e) {
        console.error('Lỗi khi lưu vào localStorage:', e);
      }
    } else {
      console.warn('Không thể lưu reaction vào localStorage vì không có thông tin userId');
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi thêm phản ứng ${reactionType} vào bài viết ID ${postId}:`, error);
    throw error;
  }
};

// Bỏ phản ứng với bài viết
export const removeReaction = async (axiosPrivate, postId, reactionType = "LIKE") => {
  try {
    console.log(`Xóa phản ứng ${reactionType} khỏi bài viết ID ${postId}`);
    
    // Đường dẫn API đúng theo ForumReactionController.java
    const response = await axiosPrivate.delete(`/reactions/post/${postId}?reactionType=${reactionType}`);
    console.log("Phản hồi API xóa phản ứng:", response.data);
    
    // Lấy thông tin người dùng hiện tại
    let currentUserId = null;

    // Thử lấy từ localStorage
    try {
      const authJson = localStorage.getItem('auth');
      if (authJson) {
        const auth = JSON.parse(authJson);
        if (auth && auth.user && auth.user.id) {
          currentUserId = auth.user.id;
        }
      }
    } catch (e) {
      console.error('Lỗi khi đọc thông tin user từ localStorage:', e);
    }
    
    // Cập nhật localStorage khi xóa phản ứng
    try {
      // Xóa phản ứng khỏi localStorage
      localStorage.removeItem(`reaction-post-${postId}`);
      
      // Cập nhật bài viết trong forumPosts nếu có
      const forumPostsJson = localStorage.getItem('forumPosts');
      if (forumPostsJson) {
        try {
          const forumPosts = JSON.parse(forumPostsJson);
          if (forumPosts && forumPosts.content && Array.isArray(forumPosts.content)) {
            // Tìm và cập nhật bài viết trong cache
            const updatedContent = forumPosts.content.map(post => {
              if (post.id === postId) {
                // Lấy phản ứng cũ của người dùng
                const oldReaction = post.userReaction;
                
                // Xóa phản ứng - chỉ xóa nếu userReactionUserId trùng với người dùng hiện tại
                if (!currentUserId || post.userReactionUserId === currentUserId) {
                  post.userReaction = null;
                  post.userReactionUserId = null; // Xóa userId khỏi thông tin reaction
                
                  // Cập nhật reactionCounts
                  if (post.reactionCounts && oldReaction && post.reactionCounts[oldReaction]) {
                    post.reactionCounts[oldReaction] = Math.max(0, post.reactionCounts[oldReaction] - 1);
                    
                    // Cập nhật reactionCounts vào localStorage
                    localStorage.setItem(`reactionCounts-${postId}`, JSON.stringify(post.reactionCounts));
                  }
                }
              }
              return post;
            });
            
            // Lưu lại vào localStorage
            localStorage.setItem('forumPosts', JSON.stringify({
              ...forumPosts,
              content: updatedContent
            }));
          }
        } catch (e) {
          console.error('Lỗi khi cập nhật forumPosts trong localStorage:', e);
        }
      }
    } catch (e) {
      console.error('Lỗi khi cập nhật localStorage:', e);
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi xóa phản ứng khỏi bài viết ID ${postId}:`, error);
    throw error;
  }
};

// Chia sẻ bài viết
export const sharePost = async (axiosPrivate, postId, content = "") => {
  try {
    const response = await axiosPrivate.post(`/posts/${postId}/share`, { content });
    return response.data.data;
  } catch (error) {
    console.error(`Lỗi khi chia sẻ bài viết ID ${postId}:`, error);
    throw error;
  }
};

// Hàm trích xuất hashtag từ nội dung
const extractHashtags = (content) => {
  if (!content) return [];
  
  const hashtagRegex = /#[a-zA-Z0-9_\u00C0-\u017Fàáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]+/g;
  const matches = content.match(hashtagRegex);
  
  if (!matches) return [];
  
  // Trích xuất chỉ tên hashtag (bỏ ký tự #)
  return matches.map(tag => tag.substring(1));
};

// Lấy hình ảnh của bài viết từ bảng forum_post_images
export const getPostImages = async (axiosPrivate, postId) => {
  try {
    console.log(`Đang tải hình ảnh cho bài viết ID ${postId}`);
    const response = await axiosPrivate.get(`/posts/${postId}/images`);
    
    if (response.data && response.data.data) {
      console.log(`Đã tải ${response.data.data.length} hình ảnh cho bài viết ID ${postId}`);
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error(`Lỗi khi tải hình ảnh cho bài viết ID ${postId}:`, error);
    return [];
  }
};

// Lấy hashtag phổ biến
export const getPopularHashtags = async (axiosPrivate, limit = 5) => {
  try {
    const response = await axiosPrivate.get('/hashtags/popular', {
      params: { limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi lấy hashtag phổ biến:', error);
    return [];
  }
};

// Lấy bài viết của người dùng cụ thể
export const getUserPosts = async (axiosPrivate, userId, page = 0, size = 10) => {
  try {
    console.log(`Đang lấy bài viết của người dùng ID ${userId}`);
    const response = await axiosPrivate.get(`/posts/user/${userId}`, {
      params: { page, size }
    });
    
    if (response.data && response.data.data) {
      console.log(`Đã lấy ${response.data.data.content?.length || 0} bài viết của người dùng ID ${userId}`);
      return response.data.data;
    }
    
    return { content: [], totalElements: 0, totalPages: 0 };
  } catch (error) {
    console.error(`Lỗi khi lấy bài viết của người dùng ID ${userId}:`, error);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

// Lấy bài viết từ những người đã kết nối
export const getConnectionPosts = async (axiosPrivate, page = 0, size = 10) => {
  try {
    console.log(`Đang lấy bài viết từ những người kết nối`);
    const response = await axiosPrivate.get('/posts/connections', {
      params: { page, size }
    });
    
    if (response.data && response.data.data) {
      console.log(`Đã lấy ${response.data.data.content?.length || 0} bài viết từ những người kết nối`);
      return response.data.data;
    }
    
    return { content: [], totalElements: 0, totalPages: 0 };
  } catch (error) {
    console.error('Lỗi khi lấy bài viết từ những người kết nối:', error);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};