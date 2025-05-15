import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CloudDownload as CloudDownloadIcon,
  OpenInNew as OpenInNewIcon,
  BarChart as BarChartIcon,
  ViewList as ViewListIcon,
  FilterAlt as FilterAltIcon,
  Category as CategoryIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
} from "@mui/icons-material";
import PageHeader from "../components/PageHeader";
import {
  fetchAllNews,
  deleteNews,
  searchNews,
  fetchNewsFromSources,
  fetchNewsById,
} from "../services/newsService";
import NewsForm from "../components/NewsForm";
import NewsSourcesPage from "./NewsSourcesPage";
import NewsDetail from "../components/NewsDetail";
import NewsStats from "../components/NewsStats";
import QuickActions from "../components/QuickActions";

const NewsPage = () => {
  const location = useLocation();
  // State variables
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingNews, setFetchingNews] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [openNewsDialog, setOpenNewsDialog] = useState(false);
  const [currentNews, setCurrentNews] = useState(null);
  const [openSourcesTab, setOpenSourcesTab] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [tabValue, setTabValue] = useState(0);

  // Fetch news on component mount and when page/rowsPerPage changes
  useEffect(() => {
    loadNews();
  }, [page, rowsPerPage]);

  // Xử lý khi được điều hướng từ trang khác
  useEffect(() => {
    if (location.state?.openSourcesTab) {
      setOpenSourcesTab(true);
    }
  }, [location]);

  // Load news from API
  const loadNews = async () => {
    setLoading(true);
    try {
      const response = await fetchAllNews(page, rowsPerPage);
      setNews(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error("Error loading news:", error);
      showSnackbar("Không thể tải tin tức. Vui lòng thử lại sau.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    setLoading(true);
    try {
      if (searchTerm.trim() === "") {
        await loadNews();
        return;
      }

      const response = await searchNews(searchTerm, page, rowsPerPage);
      setNews(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error("Error searching news:", error);
      showSnackbar(
        "Không thể tìm kiếm tin tức. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle add/edit news
  const handleOpenNewsDialog = (news = null) => {
    setCurrentNews(news);
    setOpenNewsDialog(true);
  };

  // Handle closing news dialog
  const handleCloseNewsDialog = (refreshData = false) => {
    setOpenNewsDialog(false);
    setCurrentNews(null);
    if (refreshData) {
      loadNews();
    }
  };

  // Handle delete news
  const handleDeleteNews = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin tức này không?")) {
      try {
        await deleteNews(id);
        showSnackbar("Xóa tin tức thành công", "success");
        loadNews();
      } catch (error) {
        console.error("Error deleting news:", error);
        showSnackbar("Không thể xóa tin tức. Vui lòng thử lại sau.", "error");
      }
    }
  };

  // Handle fetching news from sources
  const handleFetchNews = async () => {
    setFetchingNews(true);
    try {
      await fetchNewsFromSources();
      showSnackbar(
        "Đã bắt đầu quá trình thu thập tin tức. Vui lòng đợi trong giây lát...",
        "info"
      );
      setTimeout(() => {
        loadNews();
      }, 5000); // Reload after 5 seconds to give time for fetching
    } catch (error) {
      console.error("Error fetching news from sources:", error);
      showSnackbar(
        "Không thể thu thập tin tức. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setFetchingNews(false);
    }
  };

  // Toggle sources tab
  const toggleSourcesTab = () => {
    setOpenSourcesTab(!openSourcesTab);
  };

  // Show snackbar
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Handle open news detail dialog
  const handleOpenDetailDialog = async (id) => {
    setDetailLoading(true);
    setOpenDetailDialog(true);
    try {
      const response = await fetchNewsById(id);
      setSelectedNews(response.data);
    } catch (error) {
      console.error("Error loading news detail:", error);
      showSnackbar(
        "Không thể tải chi tiết tin tức. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle close news detail dialog
  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedNews(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Quản lý tin tức" />

      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenNewsDialog()}
          sx={{ mr: 1 }}
        >
          Thêm tin tức
        </Button>

        <Box sx={{ display: "flex" }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={
              openSourcesTab ? <VisibilityIcon /> : <CloudDownloadIcon />
            }
            onClick={toggleSourcesTab}
            sx={{ mr: 1 }}
          >
            {openSourcesTab ? "Xem tin tức" : "Quản lý nguồn tin"}
          </Button>

          {!openSourcesTab && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={
                fetchingNews ? (
                  <CircularProgress size={20} />
                ) : (
                  <CloudDownloadIcon />
                )
              }
              onClick={handleFetchNews}
              disabled={fetchingNews}
            >
              Thu thập tin tức
            </Button>
          )}
        </Box>
      </Box>

      {!openSourcesTab ? (
        <>
          {tabValue === 1 && (
            <>
              {news.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <NewsStats newsData={news} title="Thống kê tin tức" />
                  </Box>
                  <Box sx={{ width: { xs: "100%", md: "300px" } }}>
                    <QuickActions
                      title="Thao tác nhanh"
                      actions={[
                        {
                          icon: <AddIcon />,
                          label: "Thêm tin tức mới",
                          description: "Tạo bài đăng tin tức mới",
                          onClick: () => handleOpenNewsDialog(),
                          color: "primary",
                        },
                        {
                          icon: <CategoryIcon />,
                          label: "Quản lý nguồn tin",
                          description: "Cấu hình nguồn tin tức",
                          onClick: toggleSourcesTab,
                          color: "secondary",
                        },
                        {
                          icon: <CloudDownloadIcon />,
                          label: "Thu thập tin tức",
                          description: "Từ các nguồn đã cấu hình",
                          onClick: handleFetchNews,
                          disabled: fetchingNews,
                          color: "info",
                        },
                        {
                          icon: <FilterAltIcon />,
                          label: "Lọc theo danh mục",
                          description: "Xem tin tức theo loại",
                          onClick: () => {}, // Chức năng sẽ được bổ sung sau
                          color: "warning",
                        },
                        {
                          icon: <PlaylistAddCheckIcon />,
                          label: "Kiểm duyệt tin tức",
                          description: "Duyệt tin tức đang ẩn",
                          onClick: () => {}, // Chức năng sẽ được bổ sung sau
                          color: "success",
                        },
                      ]}
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Không có dữ liệu tin tức nào để hiển thị thống kê
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CloudDownloadIcon />}
                    onClick={handleFetchNews}
                    disabled={fetchingNews}
                    sx={{ mt: 2 }}
                  >
                    Thu thập tin tức mới
                  </Button>
                </Box>
              )}
            </>
          )}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="news tabs"
                >
                  <Tab
                    icon={<ViewListIcon />}
                    iconPosition="start"
                    label="Danh sách"
                  />
                  <Tab
                    icon={<BarChartIcon />}
                    iconPosition="start"
                    label="Thống kê"
                  />
                </Tabs>
              </Box>

              {tabValue === 0 && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    variant="outlined"
                    placeholder="Tìm kiếm tin tức..."
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleSearch}>
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={loadNews}
                    sx={{
                      ml: 2,
                      minWidth: "40px",
                      width: "40px",
                      height: "40px",
                      p: 0,
                    }}
                  >
                    <RefreshIcon />
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {tabValue === 0 && (
            <>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="news table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell>Nguồn</TableCell>
                      <TableCell>Danh mục</TableCell>
                      <TableCell>Ngày đăng</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : news.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Không có tin tức nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      news.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Tooltip title={item.title}>
                              <Typography variant="body2">
                                {truncateText(item.title, 60)}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{item.sourceName || "N/A"}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.category}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {formatDate(item.publishedDate)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.active ? "Hiển thị" : "Ẩn"}
                              size="small"
                              color={item.active ? "success" : "default"}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                color="info"
                                onClick={() => handleOpenDetailDialog(item.id)}
                                size="small"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mở liên kết nguồn">
                              <IconButton
                                color="secondary"
                                onClick={() =>
                                  window.open(item.sourceUrl, "_blank")
                                }
                                size="small"
                                sx={{ ml: 1 }}
                              >
                                <OpenInNewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenNewsDialog(item)}
                                size="small"
                                sx={{ ml: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteNews(item.id)}
                                size="small"
                                sx={{ ml: 1 }}
                              >
                                <DeleteIcon fontSize="small" />
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
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalElements}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Số hàng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} của ${count}`
                }
              />
            </>
          )}
        </>
      ) : (
        <NewsSourcesPage onNewsSourceChange={loadNews} />
      )}

      {/* News Dialog */}
      <Dialog
        open={openNewsDialog}
        onClose={() => handleCloseNewsDialog()}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentNews ? "Chỉnh sửa tin tức" : "Thêm tin tức mới"}
        </DialogTitle>
        <DialogContent dividers>
          <NewsForm news={currentNews} onClose={handleCloseNewsDialog} />
        </DialogContent>
      </Dialog>

      {/* News Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>Chi tiết tin tức</DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <NewsDetail news={selectedNews} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Đóng</Button>
          {selectedNews && (
            <Button
              onClick={() => handleOpenNewsDialog(selectedNews)}
              color="primary"
            >
              Chỉnh sửa
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewsPage;
