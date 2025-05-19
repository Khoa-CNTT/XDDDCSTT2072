import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  Grid,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PushPin as PinIcon,
  PushPinOutlined as UnpinIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Report as ReportIcon,
  Comment as CommentIcon,
  ThumbUp as LikeIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { axiosPrivate } from "../services/api";
import PageHeader from "../components/PageHeader";
import { formatDate, truncateText } from "../utils/formatters";

const ForumPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all"); // 'all', 'pinned', 'deleted'
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Hàm để lấy danh sách bài viết với phân trang
  const fetchPosts = async () => {
    setLoading(true);
    try {
      let endpoint = `/posts?page=${page}&size=${rowsPerPage}`;

      if (searchTerm) {
        endpoint = `/posts/search?keyword=${searchTerm}&page=${page}&size=${rowsPerPage}`;
      }

      const response = await axiosPrivate.get(endpoint);
      setPosts(response.data.data.content);
      setTotalPosts(response.data.data.totalElements);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài viết:", error);
      enqueueSnackbar("Lỗi khi lấy danh sách bài viết", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi các tham số thay đổi
  useEffect(() => {
    fetchPosts();
  }, [page, rowsPerPage, searchTerm]);

  // Xử lý sự kiện thay đổi trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Xử lý sự kiện thay đổi số dòng mỗi trang
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Xử lý sự kiện thay đổi từ khóa tìm kiếm
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Xử lý sự kiện thay đổi trạng thái lọc
  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(0);
  };

  // Xử lý sự kiện xem chi tiết bài viết
  const handleViewPost = async (postId) => {
    try {
      const postResponse = await axiosPrivate.get(`/posts/${postId}`);
      const post = postResponse.data.data;

      try {
        // Lấy thêm bình luận của bài viết
        const repliesResponse = await axiosPrivate.get(
          `/replies/post/${postId}`
        );
        post.replies = repliesResponse.data.data.content || [];
      } catch (repliesError) {
        console.error("Lỗi khi lấy bình luận:", repliesError);
        post.replies = []; // Đặt là mảng rỗng nếu không lấy được bình luận
      }

      setSelectedPost(post);
      setViewDialogOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết bài viết:", error);
      enqueueSnackbar("Lỗi khi lấy chi tiết bài viết", { variant: "error" });
    }
  };

  // Xử lý sự kiện xóa bài viết
  const handleDeleteClick = (postId) => {
    setSelectedPostId(postId);
    setOpenDeleteDialog(true);
  };

  // Xác nhận xóa bài viết
  const confirmDelete = async () => {
    try {
      await axiosPrivate.delete(`/posts/${selectedPostId}`);
      enqueueSnackbar("Xóa bài viết thành công", { variant: "success" });
      fetchPosts();
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
      enqueueSnackbar("Lỗi khi xóa bài viết", { variant: "error" });
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  // Xử lý sự kiện ghim/bỏ ghim bài viết
  const handleTogglePin = async (postId, isPinned) => {
    try {
      const endpoint = isPinned
        ? `/posts/${postId}/unpin`
        : `/posts/${postId}/pin`;
      await axiosPrivate.put(endpoint);
      enqueueSnackbar(
        isPinned ? "Bỏ ghim bài viết thành công" : "Ghim bài viết thành công",
        {
          variant: "success",
        }
      );
      fetchPosts();
    } catch (error) {
      console.error("Lỗi khi ghim/bỏ ghim bài viết:", error);
      enqueueSnackbar("Lỗi khi thay đổi trạng thái ghim bài viết", {
        variant: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Quản Lý Diễn Đàn" />

      {/* Card thống kê */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Tổng số bài viết
              </Typography>
              <Typography variant="h4" color="primary">
                {totalPosts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Bài viết bị báo cáo
              </Typography>
              <Typography variant="h4" color="error">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Bài viết được ghim
              </Typography>
              <Typography variant="h4" color="secondary">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Bình luận
              </Typography>
              <Typography variant="h4" sx={{ color: "info.main" }}>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Thanh công cụ tìm kiếm và lọc */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tìm kiếm bài viết"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
              placeholder="Tìm theo tiêu đề, nội dung..."
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={status}
                label="Trạng thái"
                onChange={handleStatusChange}
                startAdornment={
                  <FilterIcon sx={{ mr: 1, color: "action.active" }} />
                }
              >
                <MenuItem value="all">Tất cả bài viết</MenuItem>
                <MenuItem value="pinned">Bài viết được ghim</MenuItem>
                <MenuItem value="deleted">Bài viết đã xóa</MenuItem>
                <MenuItem value="reported">Bài viết bị báo cáo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={fetchPosts}
            >
              Lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bảng dữ liệu */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Người đăng</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Không có bài viết nào
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow hover key={post.id}>
                    <TableCell>{post.id}</TableCell>
                    <TableCell>{truncateText(post.title, 50)}</TableCell>
                    <TableCell>
                      {post.userName || post.user?.fullName || "Chưa xác định"}
                    </TableCell>
                    <TableCell>{formatDate(post.createdAt)}</TableCell>
                    <TableCell>
                      {post.isPinned && (
                        <Chip
                          size="small"
                          icon={<PinIcon fontSize="small" />}
                          label="Đã ghim"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                      )}
                      {post.isDeleted ? (
                        <Chip size="small" label="Đã xóa" color="error" />
                      ) : (
                        <Chip
                          size="small"
                          label={post.privacyLevel}
                          color={
                            post.privacyLevel === "PUBLIC"
                              ? "success"
                              : post.privacyLevel === "CONNECTIONS"
                              ? "info"
                              : "default"
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewPost(post.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={post.isPinned ? "Bỏ ghim" : "Ghim"}>
                        <IconButton
                          size="small"
                          color={post.isPinned ? "secondary" : "default"}
                          onClick={() =>
                            handleTogglePin(post.id, post.isPinned)
                          }
                        >
                          {post.isPinned ? <UnpinIcon /> : <PinIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(post.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalPosts}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count}`
          }
        />
      </Paper>

      {/* Hộp thoại xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn
            tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hộp thoại xem chi tiết bài viết */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chi tiết bài viết
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setViewDialogOpen(false)}
            aria-label="close"
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            &times;
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPost && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedPost.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mr: 2 }}
                >
                  Đăng bởi:{" "}
                  {selectedPost.userName ||
                    selectedPost.user?.fullName ||
                    "Chưa xác định"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vào lúc: {formatDate(selectedPost.createdAt)}
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                {selectedPost.content}
              </Typography>
              {selectedPost.attachmentUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Tệp đính kèm:</Typography>
                  {selectedPost.attachmentType?.includes("image") ? (
                    <img
                      src={selectedPost.attachmentUrl}
                      alt="Attachment"
                      style={{ maxWidth: "100%", maxHeight: 300 }}
                    />
                  ) : (
                    <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                      <Typography>
                        <a
                          href={selectedPost.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Xem tệp đính kèm
                        </a>
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Phần hiển thị bình luận */}
              {selectedPost.replies && selectedPost.replies.length > 0 ? (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Bình luận ({selectedPost.replies.length})
                  </Typography>

                  {selectedPost.replies.map((reply) => (
                    <Box
                      key={reply.id}
                      sx={{
                        mb: 3,
                        border: "1px solid #eee",
                        p: 2,
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", mr: 1 }}
                        >
                          {reply.userName || "Người dùng ẩn danh"}
                        </Typography>
                        {reply.isInappropriate && (
                          <Tooltip title="Bình luận có nội dung không phù hợp">
                            <ReportIcon color="error" fontSize="small" />
                          </Tooltip>
                        )}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: "auto" }}
                        >
                          {formatDate(reply.createdAt)}
                        </Typography>
                      </Box>

                      <Typography variant="body2">{reply.content}</Typography>

                      <Box sx={{ mt: 1 }}>
                        <Tooltip title="Lượt thích">
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              mr: 2,
                            }}
                          >
                            <LikeIcon
                              fontSize="small"
                              color="action"
                              sx={{ mr: 0.5 }}
                            />
                            <Typography variant="caption">
                              {reply.likeCount || 0}
                            </Typography>
                          </Box>
                        </Tooltip>

                        {/* Hiển thị trả lời của bình luận nếu có */}
                        {reply.replies && reply.replies.length > 0 && (
                          <Tooltip title={`${reply.replies.length} trả lời`}>
                            <Box
                              component="span"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                              }}
                            >
                              <CommentIcon
                                fontSize="small"
                                color="action"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography variant="caption">
                                {reply.replies.length}
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}
                      </Box>

                      {/* Hiển thị các trả lời */}
                      {reply.replies && reply.replies.length > 0 && (
                        <Box sx={{ ml: 4, mt: 2 }}>
                          {reply.replies.map((childReply) => (
                            <Box
                              key={childReply.id}
                              sx={{
                                mb: 2,
                                border: "1px solid #f5f5f5",
                                p: 1.5,
                                borderRadius: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontSize: "0.875rem", mr: 1 }}
                                >
                                  {childReply.userName || "Người dùng ẩn danh"}
                                </Typography>
                                {childReply.isInappropriate && (
                                  <Tooltip title="Bình luận có nội dung không phù hợp">
                                    <ReportIcon
                                      color="error"
                                      fontSize="small"
                                    />
                                  </Tooltip>
                                )}
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ ml: "auto" }}
                                >
                                  {formatDate(childReply.createdAt)}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                sx={{ fontSize: "0.875rem" }}
                              >
                                {childReply.content}
                              </Typography>

                              <Box sx={{ mt: 0.5 }}>
                                <Tooltip title="Lượt thích">
                                  <Box
                                    component="span"
                                    sx={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <LikeIcon
                                      fontSize="small"
                                      color="action"
                                      sx={{ mr: 0.5 }}
                                    />
                                    <Typography variant="caption">
                                      {childReply.likeCount || 0}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    textAlign: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    Chưa có bình luận nào
                  </Typography>
                </Box>
              )}

              {selectedPost.location && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Vị trí: {selectedPost.location}
                </Typography>
              )}
              {selectedPost.feeling && (
                <Typography variant="body2" color="text.secondary">
                  Cảm xúc: {selectedPost.feeling}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<CommentIcon />}
            color="primary"
            onClick={() => setViewDialogOpen(false)}
          >
            Xem bình luận
          </Button>
          <Button
            startIcon={<ReportIcon />}
            color="warning"
            onClick={() => setViewDialogOpen(false)}
          >
            Báo cáo vi phạm
          </Button>
          <Button
            onClick={() => setViewDialogOpen(false)}
            color="inherit"
            variant="outlined"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ForumPostsPage;
