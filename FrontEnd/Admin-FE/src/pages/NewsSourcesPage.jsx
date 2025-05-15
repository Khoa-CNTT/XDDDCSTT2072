import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Badge,
  LinearProgress,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  CloudDownload as CloudDownloadIcon,
  CheckCircleOutline as SuccessIcon,
} from "@mui/icons-material";
import {
  fetchAllNewsSources,
  deleteNewsSource,
  activateNewsSource,
  deactivateNewsSource,
  fetchNewsFromSource,
} from "../services/newsService";
import NewsSourceForm from "../components/NewsSourceForm";

const NewsSourcesPage = ({ onNewsSourceChange }) => {
  // State variables
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSource, setFetchingSource] = useState(null);
  const [fetchedSources, setFetchedSources] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [openSourceDialog, setOpenSourceDialog] = useState(false);
  const [currentSource, setCurrentSource] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch sources on component mount
  useEffect(() => {
    loadSources();
  }, []);

  // Load sources from API
  const loadSources = async () => {
    setLoading(true);
    try {
      const response = await fetchAllNewsSources();
      setSources(response.data);
    } catch (error) {
      console.error("Error loading news sources:", error);
      showSnackbar(
        "Không thể tải nguồn tin tức. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    const filteredSources = sources.filter(
      (source) =>
        source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filteredSources;
  };

  // Handle add/edit source
  const handleOpenSourceDialog = (source = null) => {
    setCurrentSource(source);
    setOpenSourceDialog(true);
  };

  // Handle closing source dialog
  const handleCloseSourceDialog = (refreshData = false) => {
    setOpenSourceDialog(false);
    setCurrentSource(null);
    if (refreshData) {
      loadSources();
      if (onNewsSourceChange) {
        onNewsSourceChange();
      }
    }
  };

  // Handle delete source
  const handleDeleteSource = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nguồn tin tức này không?")) {
      try {
        await deleteNewsSource(id);
        showSnackbar("Xóa nguồn tin tức thành công", "success");
        loadSources();
      } catch (error) {
        console.error("Error deleting news source:", error);
        showSnackbar(
          "Không thể xóa nguồn tin tức. Vui lòng thử lại sau.",
          "error"
        );
      }
    }
  };

  // Handle activate/deactivate source
  const handleToggleSourceStatus = async (id, active) => {
    try {
      if (active) {
        await deactivateNewsSource(id);
        showSnackbar("Đã vô hiệu hóa nguồn tin tức", "success");
      } else {
        await activateNewsSource(id);
        showSnackbar("Đã kích hoạt nguồn tin tức", "success");
      }
      loadSources();
    } catch (error) {
      console.error("Error toggling news source status:", error);
      showSnackbar(
        "Không thể thay đổi trạng thái nguồn tin tức. Vui lòng thử lại sau.",
        "error"
      );
    }
  };

  // Handle fetching news from source
  const handleFetchFromSource = async (id) => {
    setFetchingSource(id);
    setFetchedSources((prev) => ({ ...prev, [id]: "fetching" }));

    try {
      await fetchNewsFromSource(id);

      // Hiển thị thông báo thành công
      showSnackbar("Đã bắt đầu quá trình thu thập tin tức từ nguồn.", "info");

      // Đánh dấu nguồn đã thu thập thành công
      setFetchedSources((prev) => ({ ...prev, [id]: "success" }));

      // Tự động reload sau khoảng thời gian
      if (onNewsSourceChange) {
        setTimeout(() => {
          onNewsSourceChange();
          // Sau 10 giây, reset trạng thái thành công
          setTimeout(() => {
            setFetchedSources((prev) => {
              const newState = { ...prev };
              delete newState[id];
              return newState;
            });
          }, 10000);
        }, 5000);
      }
    } catch (error) {
      console.error("Error fetching news from source:", error);
      showSnackbar(
        "Không thể thu thập tin tức từ nguồn. Vui lòng thử lại sau.",
        "error"
      );
      // Đánh dấu nguồn thu thập thất bại
      setFetchedSources((prev) => ({ ...prev, [id]: "error" }));

      // Reset trạng thái lỗi sau 5 giây
      setTimeout(() => {
        setFetchedSources((prev) => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      }, 5000);
    } finally {
      setFetchingSource(null);
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

  // Render fetch button with appropriate state
  const renderFetchButton = (source) => {
    const id = source.id;
    const status = fetchedSources[id];

    // Đang fetch
    if (fetchingSource === id) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 90,
          }}
        >
          <CircularProgress size={24} sx={{ mb: 0.5 }} />
          <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
            Đang thu thập...
          </Typography>
        </Box>
      );
    }

    // Đã fetch thành công
    if (status === "success") {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 90,
          }}
        >
          <SuccessIcon color="success" fontSize="small" />
          <Typography
            variant="caption"
            sx={{ fontSize: "0.65rem", color: "success.main" }}
          >
            Thu thập thành công!
          </Typography>
        </Box>
      );
    }

    // Fetch thất bại
    if (status === "error") {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 90,
          }}
        >
          <IconButton
            color="error"
            onClick={() => handleFetchFromSource(id)}
            size="small"
          >
            <CloudDownloadIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="caption"
            sx={{ fontSize: "0.65rem", color: "error.main" }}
          >
            Thử lại
          </Typography>
        </Box>
      );
    }

    // Trạng thái mặc định - chưa fetch
    return (
      <Tooltip title="Thu thập tin tức">
        <IconButton
          color="info"
          onClick={() => handleFetchFromSource(id)}
          size="small"
        >
          <CloudDownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  };

  // Get displayed sources based on search
  const displayedSources = searchTerm ? handleSearch() : sources;

  return (
    <Box>
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
            <Typography variant="h6">Quản lý nguồn tin tức</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenSourceDialog()}
            >
              Thêm nguồn tin
            </Button>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              variant="outlined"
              placeholder="Tìm kiếm nguồn tin..."
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={loadSources}
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
        </CardContent>
      </Card>

      {/* Hiển thị hướng dẫn */}
      <Box sx={{ mb: 2, p: 2, bgcolor: "info.50", borderRadius: 1 }}>
        <Typography variant="body2" color="info.main" fontWeight="medium">
          <strong>Hướng dẫn thu thập tin tức:</strong>
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CloudDownloadIcon color="info" fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption">Chưa thu thập</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CircularProgress size={16} sx={{ mr: 0.5 }} />
            <Typography variant="caption">Đang thu thập</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SuccessIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption">Thu thập thành công</Typography>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="news sources table">
          <TableHead>
            <TableRow>
              <TableCell>Tên nguồn</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Thu thập</TableCell>
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
            ) : displayedSources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không có nguồn tin tức nào
                </TableCell>
              </TableRow>
            ) : (
              displayedSources.map((source) => (
                <TableRow
                  key={source.id}
                  sx={{
                    bgcolor:
                      fetchedSources[source.id] === "success"
                        ? "rgba(76, 175, 80, 0.04)"
                        : fetchedSources[source.id] === "error"
                        ? "rgba(244, 67, 54, 0.04)"
                        : fetchingSource === source.id
                        ? "rgba(33, 150, 243, 0.04)"
                        : "inherit",
                  }}
                >
                  <TableCell>{source.name}</TableCell>
                  <TableCell>
                    <Tooltip title={source.url}>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 250,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {source.url}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={source.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={source.active ? "Kích hoạt" : "Vô hiệu"}
                      size="small"
                      color={source.active ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {renderFetchButton(source)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip
                      title={source.active ? "Vô hiệu hóa" : "Kích hoạt"}
                    >
                      <IconButton
                        color={source.active ? "warning" : "success"}
                        onClick={() =>
                          handleToggleSourceStatus(source.id, source.active)
                        }
                        size="small"
                      >
                        {source.active ? (
                          <BlockIcon fontSize="small" />
                        ) : (
                          <CheckIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenSourceDialog(source)}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteSource(source.id)}
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

      {/* Source Dialog */}
      <Dialog
        open={openSourceDialog}
        onClose={() => handleCloseSourceDialog()}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentSource ? "Chỉnh sửa nguồn tin tức" : "Thêm nguồn tin tức mới"}
        </DialogTitle>
        <DialogContent dividers>
          <NewsSourceForm
            source={currentSource}
            onClose={handleCloseSourceDialog}
          />
        </DialogContent>
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

export default NewsSourcesPage;
