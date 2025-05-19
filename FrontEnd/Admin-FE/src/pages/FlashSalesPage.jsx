import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  ShoppingBasket as ShoppingBasketIcon,
  Sync as SyncIcon,
} from "@mui/icons-material";
import PageHeader from "../components/PageHeader";
import flashSaleService from "../services/flashSaleService";
import FlashSaleForm from "../components/FlashSaleForm";
import FlashSaleProductsDialog from "../components/FlashSaleProductsDialog";
import { formatDateTime } from "../utils/formatters";

const statusColors = {
  UPCOMING: "info",
  ACTIVE: "success",
  ENDED: "error",
  CANCELLED: "warning",
};

const statusLabels = {
  UPCOMING: "Sắp diễn ra",
  ACTIVE: "Đang diễn ra",
  ENDED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
};

const FlashSalesPage = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openProducts, setOpenProducts] = useState(false);
  const [selectedFlashSale, setSelectedFlashSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openSyncStatus, setOpenSyncStatus] = useState(false);
  const [syncStatusInfo, setSyncStatusInfo] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchFlashSales = async () => {
    setLoading(true);
    try {
      let response;
      if (statusFilter) {
        response = await flashSaleService.getFlashSalesByStatus(statusFilter);
      } else {
        response = await flashSaleService.getAllFlashSales();
      }

      console.log("Dữ liệu Flash Sale nhận được:", response);

      if (response && response.success) {
        console.log("Dữ liệu Flash Sale hợp lệ:", response.data);

        // Debug dữ liệu ngày tháng
        if (Array.isArray(response.data) && response.data.length > 0) {
          const firstItem = response.data[0];
          console.log("Dữ liệu ngày tháng của item đầu tiên:", {
            startDate: firstItem.startDate,
            endDate: firstItem.endDate,
            startTime: firstItem.startTime,
            endTime: firstItem.endTime,
            isArrayStartTime: Array.isArray(firstItem.startTime),
            isArrayEndTime: Array.isArray(firstItem.endTime),
            status: firstItem.status,
          });
        }

        if (Array.isArray(response.data)) {
          console.log("Số lượng Flash Sale:", response.data.length);
          setFlashSales(response.data || []);
        } else {
          console.error("Dữ liệu không phải là mảng:", response.data);
          setFlashSales([]);
        }
      } else {
        console.error("Phản hồi không thành công:", response);
        setFlashSales([]);
        enqueueSnackbar(
          (response && response.message) ||
            "Không thể tải danh sách Flash Sale",
          { variant: "error" }
        );
      }
    } catch (error) {
      console.error("Error fetching flash sales:", error);
      setFlashSales([]);
      enqueueSnackbar("Đã xảy ra lỗi khi tải danh sách Flash Sale", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashSales();
  }, [statusFilter]);

  const handleOpenForm = (flashSale = null) => {
    setSelectedFlashSale(flashSale);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedFlashSale(null);
  };

  const handleOpenDelete = (flashSale) => {
    setSelectedFlashSale(flashSale);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedFlashSale(null);
  };

  const handleOpenProducts = (flashSale) => {
    setSelectedFlashSale(flashSale);
    setOpenProducts(true);
  };

  const handleCloseProducts = () => {
    setOpenProducts(false);
    setSelectedFlashSale(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      let response;
      if (selectedFlashSale) {
        response = await flashSaleService.updateFlashSale(
          selectedFlashSale.id,
          formData
        );
      } else {
        response = await flashSaleService.createFlashSale(formData);
      }

      console.log("Kết quả lưu Flash Sale:", response);

      if (response && response.success) {
        handleCloseForm();
        fetchFlashSales();

        // Chỉ hiển thị thông báo thành công sau khi kiểm tra response
        if (selectedFlashSale) {
          enqueueSnackbar("Cập nhật Flash Sale thành công", {
            variant: "success",
          });
        } else {
          enqueueSnackbar("Tạo Flash Sale thành công", {
            variant: "success",
          });
        }
      } else {
        enqueueSnackbar(response?.message || "Thao tác không thành công", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting flash sale:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi lưu Flash Sale", { variant: "error" });
    }
  };

  const handleDeleteFlashSale = async () => {
    try {
      const response = await flashSaleService.deleteFlashSale(
        selectedFlashSale.id
      );

      console.log("Kết quả xóa Flash Sale:", response);

      if (response && response.success) {
        enqueueSnackbar("Xóa Flash Sale thành công", { variant: "success" });
        handleCloseDelete();
        fetchFlashSales();
      } else {
        enqueueSnackbar(response?.message || "Không thể xóa Flash Sale", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting flash sale:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi xóa Flash Sale", { variant: "error" });
    }
  };

  // Dùng cho các tính năng trong tương lai hoặc khi người dùng muốn cập nhật trạng thái thủ công
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await flashSaleService.updateFlashSaleStatus(
        id,
        newStatus
      );

      console.log("Kết quả cập nhật trạng thái:", response);

      if (response && response.success) {
        enqueueSnackbar("Cập nhật trạng thái thành công", {
          variant: "success",
        });
        fetchFlashSales();
      } else {
        enqueueSnackbar(response?.message || "Không thể cập nhật trạng thái", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error updating flash sale status:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi cập nhật trạng thái", {
        variant: "error",
      });
    }
  };

  const filterFlashSales = () => {
    console.log("Đang lọc Flash Sales với dữ liệu:", flashSales);

    // Đảm bảo flashSales là một mảng
    if (!Array.isArray(flashSales)) {
      console.warn("flashSales không phải là mảng:", flashSales);
      return [];
    }

    if (flashSales.length === 0) {
      console.log("Mảng flashSales rỗng");
      return [];
    }

    if (!searchTerm) {
      console.log("Không có từ khóa tìm kiếm, trả về tất cả:", flashSales);
      return flashSales;
    }

    const filtered = flashSales.filter((flashSale) => {
      if (!flashSale) return false;

      const nameMatch =
        flashSale.name &&
        flashSale.name.toLowerCase().includes(searchTerm.toLowerCase());

      const descMatch =
        flashSale.description &&
        flashSale.description.toLowerCase().includes(searchTerm.toLowerCase());

      return nameMatch || descMatch;
    });

    console.log("Kết quả lọc:", filtered);
    return filtered;
  };

  const filteredFlashSales = filterFlashSales();

  // Hàm helper để xử lý việc hiển thị startDate hoặc startTime
  const renderDateField = (flashSale, fieldName) => {
    if (!flashSale) return "N/A";

    // Log dữ liệu để debug
    console.log(`Rendering ${fieldName} for:`, flashSale);

    let dateValue = null;

    // Xử lý cho startDate/endDate
    if (fieldName === "startDate") {
      // Lấy giá trị từ các trường hợp có thể có
      dateValue =
        flashSale.startTime ||
        flashSale.startDate ||
        flashSale.start_time ||
        flashSale.start_date;
    } else if (fieldName === "endDate") {
      // Lấy giá trị từ các trường hợp có thể có
      dateValue =
        flashSale.endTime ||
        flashSale.endDate ||
        flashSale.end_time ||
        flashSale.end_date;
    }

    // Nếu không có dữ liệu, trả về N/A
    if (!dateValue) return "N/A";

    // Xử lý trường hợp dữ liệu là mảng (định dạng Java LocalDateTime)
    if (Array.isArray(dateValue)) {
      // Mảng có dạng [năm, tháng, ngày, giờ, phút, giây]
      const date = new Date(
        dateValue[0], // năm
        dateValue[1] - 1, // tháng (0-11)
        dateValue[2], // ngày
        dateValue[3], // giờ
        dateValue[4], // phút
        dateValue[5] || 0 // giây (nếu có)
      );
      return formatDateTime(date);
    }

    // Xử lý trường hợp thông thường (chuỗi hoặc đối tượng Date)
    return formatDateTime(dateValue);
  };

  // Thêm hàm tính toán trạng thái thực tế dựa trên thời gian
  const getActualStatus = (flashSale) => {
    // Nếu đã có trạng thái CANCELLED thì giữ nguyên
    if (flashSale.status === "CANCELLED") return "CANCELLED";

    const now = new Date();

    // Lấy giá trị startTime từ các nguồn có thể có
    let startTimeValue =
      flashSale.startTime ||
      flashSale.startDate ||
      flashSale.start_time ||
      flashSale.start_date;

    // Lấy giá trị endTime từ các nguồn có thể có
    let endTimeValue =
      flashSale.endTime ||
      flashSale.endDate ||
      flashSale.end_time ||
      flashSale.end_date;

    // Xử lý trường hợp dữ liệu là mảng (định dạng Java LocalDateTime)
    if (Array.isArray(startTimeValue)) {
      startTimeValue = new Date(
        startTimeValue[0], // năm
        startTimeValue[1] - 1, // tháng (0-11)
        startTimeValue[2], // ngày
        startTimeValue[3], // giờ
        startTimeValue[4], // phút
        startTimeValue[5] || 0 // giây (nếu có)
      );
    } else {
      startTimeValue = new Date(startTimeValue);
    }

    // Xử lý trường hợp dữ liệu là mảng (định dạng Java LocalDateTime)
    if (Array.isArray(endTimeValue)) {
      endTimeValue = new Date(
        endTimeValue[0], // năm
        endTimeValue[1] - 1, // tháng (0-11)
        endTimeValue[2], // ngày
        endTimeValue[3], // giờ
        endTimeValue[4], // phút
        endTimeValue[5] || 0 // giây (nếu có)
      );
    } else {
      endTimeValue = new Date(endTimeValue);
    }

    // Kiểm tra các giá trị có hợp lệ không
    if (isNaN(startTimeValue.getTime()) || isNaN(endTimeValue.getTime())) {
      console.warn(`Thời gian không hợp lệ cho Flash Sale ${flashSale.id}:`, {
        start: startTimeValue,
        end: endTimeValue,
      });
      return flashSale.status; // Giữ nguyên trạng thái nếu không parse được thời gian
    }

    // Tính toán trạng thái thực tế
    if (now < startTimeValue) {
      return "UPCOMING"; // Sắp diễn ra
    } else if (now >= startTimeValue && now <= endTimeValue) {
      return "ACTIVE"; // Đang diễn ra
    } else {
      return "ENDED"; // Đã kết thúc
    }
  };

  // Thêm hàm format tương thích cho thời gian
  const formatDisplayTime = (dateStr) => {
    if (!dateStr) return "";

    let dateToFormat = dateStr;

    // Xử lý trường hợp dữ liệu là mảng (định dạng Java LocalDateTime)
    if (Array.isArray(dateStr)) {
      dateToFormat = new Date(
        dateStr[0], // năm
        dateStr[1] - 1, // tháng (0-11)
        dateStr[2], // ngày
        dateStr[3], // giờ
        dateStr[4], // phút
        dateStr[5] || 0 // giây (nếu có)
      );
    } else {
      dateToFormat = new Date(dateStr);
    }

    if (isNaN(dateToFormat.getTime())) {
      console.warn("Không thể định dạng thời gian:", dateStr);
      return String(dateStr);
    }

    return dateToFormat.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Hàm xử lý mở dialog đồng bộ trạng thái
  const handleOpenSyncStatus = (flashSale) => {
    const actualStatus = getActualStatus(flashSale);
    if (flashSale.status === actualStatus) {
      enqueueSnackbar("Trạng thái đã đồng bộ, không cần cập nhật", {
        variant: "info",
      });
      return;
    }

    setSyncStatusInfo({
      id: flashSale.id,
      name: flashSale.name,
      currentStatus: flashSale.status,
      newStatus: actualStatus,
      currentLabel: statusLabels[flashSale.status] || flashSale.status,
      newLabel: statusLabels[actualStatus] || actualStatus,
    });
    setOpenSyncStatus(true);
  };

  // Hàm đóng dialog đồng bộ trạng thái
  const handleCloseSyncStatus = () => {
    setOpenSyncStatus(false);
    setSyncStatusInfo(null);
  };

  // Hàm xử lý cập nhật trạng thái
  const handleSyncStatus = async () => {
    if (!syncStatusInfo) return;

    try {
      const response = await flashSaleService.updateFlashSaleStatus(
        syncStatusInfo.id,
        syncStatusInfo.newStatus
      );

      if (response && response.success) {
        enqueueSnackbar(
          `Đã cập nhật trạng thái thành ${syncStatusInfo.newLabel}`,
          { variant: "success" }
        );
        fetchFlashSales(); // Tải lại danh sách sau khi cập nhật
      } else {
        enqueueSnackbar(response?.message || "Không thể cập nhật trạng thái", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Lỗi khi đồng bộ trạng thái:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi cập nhật trạng thái", {
        variant: "error",
      });
    } finally {
      handleCloseSyncStatus();
    }
  };

  return (
    <Box>
      <PageHeader
        title="Quản lý Flash Sale"
        subtitle="Tạo và quản lý các chương trình Flash Sale"
        icon={<ShoppingBasketIcon />}
      />

      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6">
              Danh sách chương trình Flash Sale
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
            >
              Thêm mới
            </Button>
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Tìm kiếm"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="UPCOMING">Sắp diễn ra</MenuItem>
                    <MenuItem value="ACTIVE">Đang diễn ra</MenuItem>
                    <MenuItem value="ENDED">Đã kết thúc</MenuItem>
                    <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                item
                xs={12}
                sm={12}
                md={4}
                display="flex"
                justifyContent="flex-end"
              >
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={fetchFlashSales}
                >
                  Làm mới
                </Button>
              </Grid>
            </Grid>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên chương trình</TableCell>
                    <TableCell>Mô tả</TableCell>
                    <TableCell>Thời gian bắt đầu</TableCell>
                    <TableCell>Thời gian kết thúc</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Giảm giá (%)</TableCell>
                    <TableCell>Số lượng SP</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFlashSales.length > 0 ? (
                    filteredFlashSales.map((flashSale) => (
                      <TableRow key={flashSale.id}>
                        <TableCell>{flashSale.name}</TableCell>
                        <TableCell>
                          {flashSale.description ? (
                            flashSale.description.length > 50 ? (
                              <Tooltip title={flashSale.description}>
                                <span>
                                  {flashSale.description.substring(0, 50)}...
                                </span>
                              </Tooltip>
                            ) : (
                              flashSale.description
                            )
                          ) : (
                            "Không có mô tả"
                          )}
                        </TableCell>
                        <TableCell>
                          {renderDateField(flashSale, "startDate")}
                        </TableCell>
                        <TableCell>
                          {renderDateField(flashSale, "endDate")}
                        </TableCell>
                        <TableCell>
                          {/* Hiển thị trạng thái hiện tại từ server */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Tooltip
                              title={
                                flashSale.status !== getActualStatus(flashSale)
                                  ? `Trạng thái từ server: ${
                                      statusLabels[flashSale.status] ||
                                      flashSale.status
                                    }`
                                  : ""
                              }
                            >
                              <Chip
                                label={
                                  statusLabels[getActualStatus(flashSale)] ||
                                  getActualStatus(flashSale)
                                }
                                color={
                                  statusColors[getActualStatus(flashSale)] ||
                                  "default"
                                }
                                size="small"
                                onClick={() => {
                                  // Hiển thị thông tin chi tiết khi click
                                  console.log("Chi tiết Flash Sale:", {
                                    id: flashSale.id,
                                    name: flashSale.name,
                                    serverStatus: flashSale.status,
                                    calculatedStatus:
                                      getActualStatus(flashSale),
                                    startTime: formatDisplayTime(
                                      flashSale.startTime ||
                                        flashSale.startDate ||
                                        flashSale.start_time ||
                                        flashSale.start_date
                                    ),
                                    endTime: formatDisplayTime(
                                      flashSale.endTime ||
                                        flashSale.endDate ||
                                        flashSale.end_time ||
                                        flashSale.end_date
                                    ),
                                    currentTime: formatDisplayTime(new Date()),
                                  });

                                  // Sử dụng handleUpdateStatus nếu cần cập nhật trạng thái
                                  if (
                                    flashSale.status !==
                                    getActualStatus(flashSale)
                                  ) {
                                    // Thông báo trạng thái không đồng bộ
                                    enqueueSnackbar(
                                      `Trạng thái hiển thị: ${
                                        statusLabels[getActualStatus(flashSale)]
                                      }, Trạng thái server: ${
                                        statusLabels[flashSale.status]
                                      }`,
                                      { variant: "info" }
                                    );
                                  }
                                }}
                                sx={{ cursor: "pointer" }}
                              />
                            </Tooltip>

                            {/* Nút đồng bộ trạng thái chỉ hiển thị khi trạng thái không khớp */}
                            {flashSale.status !==
                              getActualStatus(flashSale) && (
                              <Tooltip title="Đồng bộ trạng thái">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() =>
                                    handleOpenSyncStatus(flashSale)
                                  }
                                >
                                  <SyncIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{flashSale.discountPercentage}%</TableCell>
                        <TableCell align="center">
                          {flashSale.items?.length || 0}
                        </TableCell>
                        <TableCell align="center">
                          <Box>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenForm(flashSale)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Quản lý sản phẩm">
                              <IconButton
                                color="secondary"
                                onClick={() => handleOpenProducts(flashSale)}
                              >
                                <ShoppingBasketIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                color="error"
                                onClick={() => handleOpenDelete(flashSale)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Xác nhận xóa Flash Sale</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa Flash Sale "{selectedFlashSale?.name}"?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Hủy</Button>
          <Button
            onClick={handleDeleteFlashSale}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form tạo/chỉnh sửa Flash Sale */}
      {openForm && (
        <FlashSaleForm
          open={openForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          flashSale={selectedFlashSale}
        />
      )}

      {/* Dialog quản lý sản phẩm Flash Sale */}
      {openProducts && (
        <FlashSaleProductsDialog
          open={openProducts}
          onClose={handleCloseProducts}
          flashSale={selectedFlashSale}
          onUpdate={fetchFlashSales}
        />
      )}

      {/* Dialog xác nhận đồng bộ trạng thái */}
      <Dialog open={openSyncStatus} onClose={handleCloseSyncStatus}>
        <DialogTitle>Đồng bộ trạng thái Flash Sale</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {syncStatusInfo && (
              <>
                Bạn có muốn đồng bộ trạng thái của Flash Sale "
                {syncStatusInfo.name}" từ{" "}
                <strong>{syncStatusInfo.currentLabel}</strong> sang{" "}
                <strong>{syncStatusInfo.newLabel}</strong> không?
                <Box mt={2}>
                  <Typography variant="caption" color="textSecondary">
                    Hệ thống đã tính toán trạng thái mới dựa trên thời gian bắt
                    đầu và kết thúc.
                  </Typography>
                </Box>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSyncStatus}>Hủy</Button>
          <Button
            onClick={handleSyncStatus}
            color="primary"
            variant="contained"
            startIcon={<SyncIcon />}
          >
            Đồng bộ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FlashSalesPage;
