import { useState, useEffect, useRef } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Collapse,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
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
  CalendarToday as CalendarTodayIcon,
  Source as SourceIcon,
  CloudSync as CloudSyncIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  ClearAll as ClearAllIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import PageHeader from "../components/PageHeader";
import {
  fetchAllNews,
  deleteNews,
  searchNews,
  fetchNewsFromSources,
  fetchNewsById,
  fetchNewsByCategory,
  fetchNewsFromSource,
} from "../services/newsService";
import { fetchActiveNewsSources } from "../services/newsService";
import NewsForm from "../components/NewsForm";
import NewsSourcesPage from "./NewsSourcesPage";
import NewsDetail from "../components/NewsDetail";
import NewsStats from "../components/NewsStats";
import QuickActions from "../components/QuickActions";
import { formatDate } from "../utils/formatters";

// Thêm một hàm để export CSV
const exportToCSV = (data, filename) => {
  // Chuyển đổi mảng tin tức thành chuỗi CSV
  const header = "ID,Tiêu đề,Tóm tắt,Nguồn,Danh mục,Ngày đăng,Trạng thái\n";
  const rows = data.map((news) =>
    [
      news.id,
      `"${news.title.replace(/"/g, '""')}"`,
      `"${(news.summary || "").replace(/"/g, '""')}"`,
      `"${news.sourceName || ""}"`,
      `"${news.category || ""}"`,
      formatDate(news.publishedDate),
      news.active ? "Hiển thị" : "Ẩn",
    ].join(",")
  );

  const csv = header + rows.join("\n");

  // Tạo blob và tải xuống
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const NewsPage = () => {
  const location = useLocation();
  const currentDate = new Date().toISOString().split("T")[0]; // Lấy ngày hiện tại

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

  // State cho chức năng filter nâng cao
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    sourceName: "",
    status: "", // "active" hoặc "inactive"
    fromDate: "",
    toDate: currentDate,
  });

  // State cho danh sách nguồn tin
  const [newsSources, setNewsSources] = useState([]);

  // State cho menu more
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Ref cho chức năng xem trước
  const previewIframeRef = useRef(null);

  // Fetch active news sources when component mounts
  useEffect(() => {
    const loadNewsSources = async () => {
      try {
        const response = await fetchActiveNewsSources();
        setNewsSources(response.data);
      } catch (error) {
        console.error("Error loading news sources:", error);
      }
    };

    loadNewsSources();
  }, []);

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

  // Load news from API with filters
  const loadNews = async () => {
    setLoading(true);
    try {
      // Nếu có filter category được áp dụng
      if (filters.category) {
        const response = await fetchNewsByCategory(
          filters.category,
          page,
          rowsPerPage
        );
        setNews(response.data.content);
        setTotalElements(response.data.totalElements);
      } else if (searchTerm) {
        // Nếu đang tìm kiếm
        const response = await searchNews(searchTerm, page, rowsPerPage);
        setNews(response.data.content);
        setTotalElements(response.data.totalElements);
      } else {
        // Lấy tất cả tin tức (có thể có filter khác)
        const response = await fetchAllNews(page, rowsPerPage);

        // Áp dụng filters ở client side nếu có (ngoại trừ category đã xử lý ở trên)
        let filteredNews = response.data.content;

        if (filters.sourceName) {
          filteredNews = filteredNews.filter(
            (item) => item.sourceName === filters.sourceName
          );
        }

        if (filters.status === "active") {
          filteredNews = filteredNews.filter((item) => item.active);
        } else if (filters.status === "inactive") {
          filteredNews = filteredNews.filter((item) => !item.active);
        }

        if (filters.fromDate) {
          filteredNews = filteredNews.filter((item) => {
            const publishDate = new Date(item.publishedDate);
            const fromDate = new Date(filters.fromDate);
            return publishDate >= fromDate;
          });
        }

        if (filters.toDate) {
          filteredNews = filteredNews.filter((item) => {
            const publishDate = new Date(item.publishedDate);
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59, 999); // Đặt thời gian là cuối ngày
            return publishDate <= toDate;
          });
        }

        setNews(filteredNews);
        setTotalElements(response.data.totalElements);
      }
    } catch (error) {
      console.error("Error loading news:", error);
      showSnackbar("Không thể tải tin tức. Vui lòng thử lại sau.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý mở menu More
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Đóng menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Handle search
  const handleSearch = async () => {
    setPage(0); // Reset về trang đầu tiên khi tìm kiếm
    loadNews();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      category: "",
      sourceName: "",
      status: "",
      fromDate: "",
      toDate: currentDate,
    });
    setSearchTerm("");
    setPage(0);
    loadNews();
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    setPage(0); // Reset về trang đầu tiên khi áp dụng bộ lọc
    loadNews();
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Export current news list to CSV
  const handleExportCSV = () => {
    exportToCSV(news, `tin-tuc-${new Date().toISOString().slice(0, 10)}.csv`);
    showSnackbar("Đã xuất dữ liệu tin tức thành công", "success");
    handleCloseMenu();
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
      handleCloseMenu();
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

  // Fetch news from a specific source
  const handleFetchNewsFromSource = async (sourceId) => {
    setFetchingNews(true);
    try {
      await fetchNewsFromSource(sourceId);
      showSnackbar(
        "Đã bắt đầu quá trình thu thập tin tức từ nguồn đã chọn. Vui lòng đợi trong giây lát...",
        "info"
      );
      setTimeout(() => {
        loadNews();
      }, 5000);
      handleCloseMenu();
    } catch (error) {
      console.error("Error fetching news from source:", error);
      showSnackbar(
        "Không thể thu thập tin tức từ nguồn đã chọn. Vui lòng thử lại sau.",
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

  // Handle close detail dialog
  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedNews(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    if (newValue === 0) {
      setTabValue(0); // List view
      setOpenSourcesTab(false);
    } else if (newValue === 1) {
      setTabValue(1); // Stats view
      setOpenSourcesTab(false);
    } else if (newValue === 2) {
      setOpenSourcesTab(true); // Sources view
    }
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

  // Preview article in a new tab
  const handlePreviewArticle = (news) => {
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${news.title}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 24px; margin-bottom: 10px; }
          .summary { font-style: italic; color: #666; margin-bottom: 20px; }
          .meta { font-size: 12px; color: #888; margin-bottom: 20px; }
          img { max-width: 100%; height: auto; margin: 10px 0; }
          .content img { display: block; margin: 15px auto; }
        </style>
      </head>
      <body>
        <h1>${news.title}</h1>
        <div class="meta">
          <div>Nguồn: ${news.sourceName || "Không rõ"}</div>
          <div>Ngày đăng: ${formatDate(news.publishedDate)}</div>
          <div>Danh mục: ${news.category || "Không rõ"}</div>
        </div>
        ${
          news.imageUrl
            ? `<img src="${news.imageUrl}" alt="${news.title}">`
            : ""
        }
        <div class="summary">${news.summary || ""}</div>
        <div class="content">${news.content || ""}</div>
      </body>
      </html>
    `);
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Quản lý tin tức"
        subtitle="Quản lý và đăng tải thông tin nông nghiệp"
        icon={<BarChartIcon fontSize="large" />}
      />

      <QuickActions
        buttons={[
          {
            label: "Tải tin tức mới",
            icon: <CloudDownloadIcon />,
            onClick: handleFetchNews,
            loading: fetchingNews,
            color: "primary",
          },
        ]}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ mr: 1, width: "300px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                size="medium"
              >
                Tìm kiếm
              </Button>
            </Box>
            <Box>
              <Button
                startIcon={showFilters ? <ClearAllIcon /> : <FilterAltIcon />}
                onClick={toggleFilters}
                variant="outlined"
                size="medium"
              >
                {showFilters ? "Ẩn bộ lọc" : "Lọc nâng cao"}
              </Button>
            </Box>
          </Box>

          <Collapse in={showFilters}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    label="Danh mục"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {/* Tạo danh sách duy nhất các danh mục từ dữ liệu tin tức */}
                    {Array.from(
                      new Set(news.map((item) => item.category).filter(Boolean))
                    ).map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Nguồn tin</InputLabel>
                  <Select
                    name="sourceName"
                    value={filters.sourceName}
                    onChange={handleFilterChange}
                    label="Nguồn tin"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {newsSources.map((source) => (
                      <MenuItem key={source.id} value={source.name}>
                        {source.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    label="Trạng thái"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="active">Hiển thị</MenuItem>
                    <MenuItem value="inactive">Ẩn</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  name="fromDate"
                  label="Từ ngày"
                  type="date"
                  value={filters.fromDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  name="toDate"
                  label="Đến ngày"
                  type="date"
                  value={filters.toDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleResetFilters}
                  sx={{ mr: 1 }}
                  startIcon={<ClearAllIcon />}
                >
                  Xóa bộ lọc
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApplyFilters}
                  startIcon={<FilterListIcon />}
                >
                  Áp dụng bộ lọc
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Quick Actions & News Stats Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <QuickActions
            title="Hành động nhanh"
            actions={[
              {
                label: "Thêm tin tức",
                icon: <AddIcon />,
                onClick: () => handleOpenNewsDialog(),
                color: "primary",
              },
              {
                label: "Tải tin tức mới",
                icon: <CloudDownloadIcon />,
                onClick: handleFetchNews,
                loading: fetchingNews,
                color: "secondary",
              },
              {
                label: "Quản lý nguồn tin",
                icon: <SourceIcon />,
                onClick: toggleSourcesTab,
                color: "info",
              },
            ]}
          />
        </Grid>

        <Grid item xs={12} md={9}>
          <NewsStats newsData={news} />
        </Grid>
      </Grid>

      {/* Tabs for News and Sources */}
      <Box sx={{ width: "100%", mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={openSourcesTab ? 2 : tabValue}
            onChange={handleTabChange}
            aria-label="news management tabs"
          >
            <Tab
              icon={<ViewListIcon />}
              iconPosition="start"
              label="Danh sách tin tức"
            />
            <Tab
              icon={<BarChartIcon />}
              iconPosition="start"
              label="Thống kê"
            />
            <Tab
              icon={<SourceIcon />}
              iconPosition="start"
              label="Quản lý nguồn tin"
            />
          </Tabs>
        </Box>
      </Box>

      {/* News Sources Tab */}
      {openSourcesTab && <NewsSourcesPage />}

      {/* News Statistics Tab */}
      {!openSourcesTab && tabValue === 1 && <NewsStats news={news} />}

      {/* News List Tab */}
      {!openSourcesTab && tabValue === 0 && (
        <>
          {/* News List */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell>Nguồn</TableCell>
                  <TableCell>Ngày đăng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={30} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : news.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" sx={{ py: 2 }}>
                        Không có dữ liệu tin tức
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<CloudDownloadIcon />}
                        onClick={handleFetchNews}
                        disabled={fetchingNews}
                      >
                        {fetchingNews ? "Đang tải..." : "Tải tin tức mới"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  news.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Box sx={{ maxWidth: 300 }}>
                          <Typography
                            variant="body2"
                            noWrap
                            title={item.title}
                            sx={{ fontWeight: "bold" }}
                          >
                            {item.title}
                          </Typography>
                          {item.summary && (
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.summary}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.category || "Chưa phân loại"}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{item.sourceName || "N/A"}</TableCell>
                      <TableCell>{formatDate(item.publishedDate)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.active ? "Hiển thị" : "Ẩn"}
                          color={item.active ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDetailDialog(item.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Xem trước">
                          <IconButton
                            size="small"
                            onClick={() => handlePreviewArticle(item)}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenNewsDialog(item)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteNews(item.id)}
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalElements}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
              }
            />
          </TableContainer>
        </>
      )}

      {/* News Form Dialog */}
      <Dialog
        open={openNewsDialog}
        onClose={() => handleCloseNewsDialog(false)}
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
      >
        <DialogTitle>Chi tiết tin tức</DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <NewsDetail news={selectedNews} />
          )}
        </DialogContent>
        <DialogActions>
          {selectedNews && (
            <Button
              onClick={() => handlePreviewArticle(selectedNews)}
              startIcon={<OpenInNewIcon />}
              color="primary"
            >
              Xem trước
            </Button>
          )}
          {selectedNews && (
            <Button
              onClick={() => handleOpenNewsDialog(selectedNews)}
              startIcon={<EditIcon />}
              color="secondary"
            >
              Chỉnh sửa
            </Button>
          )}
          <Button onClick={handleCloseDetailDialog}>Đóng</Button>
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
