import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { BrowserRouter } from "react-router-dom";

// Cấu hình QueryClient với tùy chọn lưu trữ
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tăng thời gian giữ dữ liệu trong cache lên 1 giờ
      staleTime: 60 * 60 * 1000, // 1 giờ
      // Không tự động refetch khi tab được focus lại
      refetchOnWindowFocus: false,
      // Giữ dữ liệu trong cache lên đến 3 giờ
      gcTime: 3 * 60 * 60 * 1000, // 3 giờ
      // Thêm hàm onSuccess để lưu dữ liệu vào localStorage
      onSuccess: (data, query) => {
        try {
          // Lưu dữ liệu vào localStorage dựa trên queryKey
          const queryKeyStr = JSON.stringify(query.queryKey);

          // Lưu dữ liệu bài viết
          if (queryKeyStr === JSON.stringify(["forumPosts"])) {
            localStorage.setItem("forumPosts", JSON.stringify(data));
          }

          // Lưu dữ liệu phản ứng
          if (
            queryKeyStr.includes('"reactions"') &&
            queryKeyStr.includes('"post"')
          ) {
            const postId = query.queryKey[2];
            localStorage.setItem(
              `reaction-post-${postId}`,
              JSON.stringify(data)
            );
          }

          // Lưu dữ liệu số lượng phản ứng
          if (queryKeyStr.includes('"reactionCounts"')) {
            const postId = query.queryKey[1];
            localStorage.setItem(
              `reactionCounts-${postId}`,
              JSON.stringify(data)
            );
          }

          // Lưu dữ liệu bình luận
          if (queryKeyStr.includes('"comments"')) {
            const postId = query.queryKey[1];
            localStorage.setItem(
              `comments-post-${postId}`,
              JSON.stringify(data)
            );
          }
        } catch (error) {
          console.error("Lỗi khi lưu trữ dữ liệu vào localStorage:", error);
        }
      },
    },
    mutations: {
      // Cho phép retry mutations khi mạng bị gián đoạn
      retry: 3,
    },
  },
});

// Bộ lưu trữ localStorage với sync
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "AGRI_FORUM_CACHE",
  // Giới hạn kích thước dữ liệu được lưu trữ
  serialize: (data) => {
    // Lấy danh sách các queries quan trọng cần lưu trữ
    const importantQueries = Object.keys(
      data.clientState?.queries || {}
    ).filter((key) => {
      return (
        key.includes("forumPosts") ||
        key.includes("comments") ||
        key.includes("reactions") ||
        key.includes("reactionCounts") ||
        key.includes("postReaction")
      );
    });

    // Lọc chỉ giữ lại dữ liệu quan trọng
    const filteredQueries = {
      ...data,
      clientState: {
        ...data.clientState,
        queries: Object.fromEntries(
          Object.entries(data.clientState?.queries || {}).filter(([key]) =>
            importantQueries.includes(key)
          )
        ),
      },
    };

    return JSON.stringify(filteredQueries);
  },
  deserialize: (data) => JSON.parse(data),
  // Tăng thời gian lưu trữ lên 48 giờ
  maxAge: 48 * 60 * 60 * 1000, // 48 giờ
});

// Persist cấu hình queryClient
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  // Chỉ lưu trữ khi có thông tin đăng nhập
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      // Kiểm tra xem người dùng đã đăng nhập chưa
      const authData = localStorage.getItem("auth");
      if (!authData) return false; // Nếu chưa đăng nhập, không lưu trữ query

      // Kiểm tra query quan trọng cần lưu trữ
      const importantPrefixes = [
        "forumPosts",
        "comments",
        "reactionCounts",
        "postReaction",
      ];
      return importantPrefixes.some((prefix) =>
        JSON.stringify(query.queryKey).includes(prefix)
      );
    },
  },
});

// Thêm hàm khôi phục dữ liệu từ localStorage
const restoreDataFromLocalStorage = () => {
  try {
    // Khôi phục dữ liệu bài viết
    const forumPostsJSON = localStorage.getItem("forumPosts");
    if (forumPostsJSON) {
      const forumPosts = JSON.parse(forumPostsJSON);
      queryClient.setQueryData(["forumPosts"], forumPosts);

      // Khôi phục dữ liệu phản ứng và bình luận cho từng bài viết
      if (
        forumPosts &&
        forumPosts.content &&
        Array.isArray(forumPosts.content)
      ) {
        forumPosts.content.forEach((post) => {
          if (!post || !post.id) return;

          // Khôi phục bình luận
          const commentsKey = `comments-post-${post.id}`;
          const commentsJSON = localStorage.getItem(commentsKey);
          if (commentsJSON) {
            try {
              const comments = JSON.parse(commentsJSON);
              queryClient.setQueryData(["comments", post.id], comments);
            } catch (e) {
              console.error("Lỗi khi parse comments JSON:", e);
            }
          }

          // Khôi phục số lượng phản ứng
          const reactionCountsKey = `reactionCounts-${post.id}`;
          const reactionCountsJSON = localStorage.getItem(reactionCountsKey);
          if (reactionCountsJSON) {
            try {
              const reactionCounts = JSON.parse(reactionCountsJSON);
              queryClient.setQueryData(["reactionCounts", post.id], {
                counts: reactionCounts,
              });
            } catch (e) {
              console.error("Lỗi khi parse reactionCounts JSON:", e);
            }
          }

          // Khôi phục phản ứng người dùng
          const reactionKey = `reaction-post-${post.id}`;
          const reactionJSON = localStorage.getItem(reactionKey);
          if (reactionJSON) {
            try {
              const reaction = JSON.parse(reactionJSON);
              queryClient.setQueryData(
                ["reactions", "post", post.id],
                reaction
              );
            } catch (e) {
              console.error("Lỗi khi parse reaction JSON:", e);
            }
          }
        });
      }
    }
  } catch (error) {
    console.error("Lỗi khi khôi phục dữ liệu từ localStorage:", error);
  }
};

// Khôi phục dữ liệu khi ứng dụng khởi động
restoreDataFromLocalStorage();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
