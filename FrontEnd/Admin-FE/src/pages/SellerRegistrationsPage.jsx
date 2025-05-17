import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  Tab,
  Tabs,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import sellerRegistrationService from "../services/sellerRegistrationService";
// import authService from "../services/auth";

// Enum các trạng thái đơn đăng ký bán hàng
const RegistrationStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const SellerRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [notes, setNotes] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Kiểm tra token đăng nhập thay vì kiểm tra quyền admin
    const token = localStorage.getItem("token");
    const loggedIn = !!token;

    console.log("=== KIỂM TRA ĐĂNG NHẬP ===");
    console.log("Đã đăng nhập:", loggedIn);
    console.log("Token:", token ? "Có token" : "Không có token");
    console.log("=============================");

    // Tạm thời bỏ qua kiểm tra admin
    setIsAdmin(true);

    if (!loggedIn) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      return;
    }

    fetchRegistrations();
  }, []);

  // Lọc theo tab đã chọn
  const getFilteredStatus = () => {
    switch (tabValue) {
      case 0:
        return null; // Tất cả
      case 1:
        return RegistrationStatus.PENDING;
      case 2:
        return RegistrationStatus.APPROVED;
      case 3:
        return RegistrationStatus.REJECTED;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRegistrations();
    }
  }, [tabValue, isAdmin]);

  const fetchRegistrations = async () => {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);
    try {
      let data;
      const status = getFilteredStatus();

      if (status) {
        data = await sellerRegistrationService.getRegistrationsByStatus(status);
      } else {
        data = await sellerRegistrationService.getAllRegistrations();
      }

      // Không cần truy cập data.data nữa vì service đã xử lý
      setRegistrations(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn đăng ký bán hàng:", error);
      setError(
        error.message ||
          "Không thể tải danh sách đơn đăng ký bán hàng. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDetailDialog = (registration) => {
    setSelectedRegistration(registration);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedRegistration(null);
  };

  const handleOpenApproveDialog = (registration) => {
    // Đảm bảo ID là số nguyên
    if (registration && registration.id) {
      // Tạo bản sao của đối tượng registration và đảm bảo ID là số
      const cleanRegistration = {
        ...registration,
        id: parseInt(String(registration.id).replace(/[^0-9]/g, ""), 10),
      };

      console.log("ID gốc:", registration.id);
      console.log("ID đã làm sạch:", cleanRegistration.id);

      setSelectedRegistration(cleanRegistration);
      setNotes("");
      setOpenApproveDialog(true);
    } else {
      console.error("Không có ID hợp lệ trong đơn đăng ký");
      enqueueSnackbar("Không tìm thấy ID hợp lệ cho đơn đăng ký", {
        variant: "error",
      });
    }
  };

  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
    setNotes("");
  };

  const handleOpenRejectDialog = (registration) => {
    // Đảm bảo ID là số nguyên
    if (registration && registration.id) {
      // Tạo bản sao của đối tượng registration và đảm bảo ID là số
      const cleanRegistration = {
        ...registration,
        id: parseInt(String(registration.id).replace(/[^0-9]/g, ""), 10),
      };

      console.log("ID gốc:", registration.id);
      console.log("ID đã làm sạch:", cleanRegistration.id);

      setSelectedRegistration(cleanRegistration);
      setNotes("");
      setOpenRejectDialog(true);
    } else {
      console.error("Không có ID hợp lệ trong đơn đăng ký");
      enqueueSnackbar("Không tìm thấy ID hợp lệ cho đơn đăng ký", {
        variant: "error",
      });
    }
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setNotes("");
  };

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  const handleApprove = async () => {
    if (!selectedRegistration) {
      enqueueSnackbar("Không có đơn đăng ký được chọn", { variant: "error" });
      return;
    }

    const registrationId = selectedRegistration.id;
    if (!registrationId || isNaN(registrationId)) {
      enqueueSnackbar("ID đơn đăng ký không hợp lệ", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      console.log(`Đang gửi yêu cầu phê duyệt cho ID: ${registrationId}`);
      await sellerRegistrationService.approveRegistration(
        registrationId,
        notes
      );
      enqueueSnackbar("Phê duyệt đơn đăng ký bán hàng thành công!", {
        variant: "success",
      });
      handleCloseApproveDialog();
      // Làm mới danh sách đơn đăng ký
      await fetchRegistrations();
    } catch (error) {
      console.error("Lỗi khi phê duyệt đơn đăng ký bán hàng:", error);
      let errorMessage = "Đã xảy ra lỗi khi phê duyệt đơn đăng ký bán hàng.";

      if (error.response?.data?.errorMessage) {
        errorMessage += ` Chi tiết: ${error.response.data.errorMessage}`;
      } else if (error.message) {
        errorMessage += ` Chi tiết: ${error.message}`;
      }

      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRegistration) {
      enqueueSnackbar("Không có đơn đăng ký được chọn", { variant: "error" });
      return;
    }

    const registrationId = selectedRegistration.id;
    if (!registrationId || isNaN(registrationId)) {
      enqueueSnackbar("ID đơn đăng ký không hợp lệ", { variant: "error" });
      return;
    }

    if (!notes || !notes.trim()) {
      enqueueSnackbar("Vui lòng nhập lý do từ chối", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      console.log(`Đang gửi yêu cầu từ chối cho ID: ${registrationId}`);
      await sellerRegistrationService.rejectRegistration(registrationId, notes);
      enqueueSnackbar("Từ chối đơn đăng ký bán hàng thành công!", {
        variant: "success",
      });
      handleCloseRejectDialog();
      // Làm mới danh sách đơn đăng ký
      await fetchRegistrations();
    } catch (error) {
      console.error("Lỗi khi từ chối đơn đăng ký bán hàng:", error);
      let errorMessage = "Đã xảy ra lỗi khi từ chối đơn đăng ký bán hàng.";

      if (error.response?.data?.errorMessage) {
        errorMessage += ` Chi tiết: ${error.response.data.errorMessage}`;
      } else if (error.message) {
        errorMessage += ` Chi tiết: ${error.message}`;
      }

      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    // First, log what we're receiving for debugging
    console.log(`Formatting date: ${dateString}, Type: ${typeof dateString}`);

    // If the date is null, undefined, or empty, return N/A
    if (!dateString) {
      console.log("Date is empty/null/undefined, returning N/A");
      return "N/A";
    }

    try {
      // Force a current date for any registration that doesn't have a valid date
      let date;

      if (
        dateString === "N/A" ||
        dateString === "null" ||
        dateString === "undefined"
      ) {
        console.log("Invalid date string, using current date");
        date = new Date();
      } else {
        // Try to parse the date
        date = new Date(dateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
          console.log("Invalid date, using current date");
          date = new Date();
        }
      }

      // Format the date using date-fns
      const formattedDate = format(date, "dd/MM/yyyy HH:mm", { locale: vi });
      console.log(`Formatted date: ${formattedDate}`);
      return formattedDate;
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case RegistrationStatus.PENDING:
        return "warning";
      case RegistrationStatus.APPROVED:
        return "success";
      case RegistrationStatus.REJECTED:
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case RegistrationStatus.PENDING:
        return "Đang chờ xét duyệt";
      case RegistrationStatus.APPROVED:
        return "Đã phê duyệt";
      case RegistrationStatus.REJECTED:
        return "Đã từ chối";
      default:
        return "Không xác định";
    }
  };

  const filteredRegistrations = Array.isArray(registrations)
    ? registrations.filter(
        (registration) =>
          (registration.businessName?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (registration.businessPhone?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (registration.user?.email?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (registration.user?.username?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          )
      )
    : [];

  if (!isAdmin) {
    return (
      <Container maxWidth="lg">
        <Box my={4} textAlign="center">
          <LockIcon sx={{ fontSize: 72, color: "warning.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Quyền truy cập bị từ chối
          </Typography>
          <Typography variant="body1" paragraph>
            Bạn không có quyền Admin để truy cập trang quản lý đơn đăng ký bán
            hàng.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Vui lòng liên hệ quản trị viên để được cấp quyền truy cập.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false}>
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Quản lý đơn đăng ký bán hàng
        </Typography>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" alignItems="center">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchRegistrations}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Làm mới
            </Button>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Tất cả" />
            <Tab label="Đang chờ xét duyệt" />
            <Tab label="Đã phê duyệt" />
            <Tab label="Đã từ chối" />
          </Tabs>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Tên doanh nghiệp</TableCell>
                  <TableCell>Ngày đăng ký</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : filteredRegistrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Không có đơn đăng ký bán hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>{registration.id}</TableCell>
                      <TableCell>
                        {registration.userName ? (
                          <>
                            <Typography variant="body2" fontWeight="bold">
                              {registration.userName}
                            </Typography>
                            {registration.userEmail && (
                              <Typography variant="body2" color="textSecondary">
                                {registration.userEmail}
                              </Typography>
                            )}
                          </>
                        ) : registration.userEmail ? (
                          <Typography variant="body2">
                            {registration.userEmail}
                          </Typography>
                        ) : (
                          <>
                            <span>ID: {registration.userId || "N/A"}</span>
                            <Typography variant="body2" color="textSecondary">
                              Data không đầy đủ
                            </Typography>
                          </>
                        )}
                      </TableCell>
                      <TableCell>{registration.businessName}</TableCell>
                      <TableCell>
                        {formatDate(registration.createdAt) ||
                          format(new Date(), "dd/MM/yyyy HH:mm", {
                            locale: vi,
                          })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(registration.status)}
                          color={getStatusColor(registration.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDetailDialog(registration)}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                        {registration.status === RegistrationStatus.PENDING && (
                          <>
                            <Tooltip title="Phê duyệt">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() =>
                                  handleOpenApproveDialog(registration)
                                }
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Từ chối">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleOpenRejectDialog(registration)
                                }
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Chi tiết đăng ký */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết đơn đăng ký bán hàng</DialogTitle>
        <DialogContent dividers>
          {selectedRegistration && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Thông tin người đăng ký
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Người dùng:
                        </Typography>
                        <Typography variant="body1">
                          {selectedRegistration.user?.username || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Email:
                        </Typography>
                        <Typography variant="body1">
                          {selectedRegistration.user?.email || "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      display="flex"
                      alignItems="center"
                    >
                      <BusinessIcon sx={{ mr: 1 }} /> Thông tin doanh nghiệp
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Tên doanh nghiệp:
                        </Typography>
                        <Typography variant="body1">
                          {selectedRegistration.businessName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Số điện thoại:
                        </Typography>
                        <Typography variant="body1">
                          {selectedRegistration.businessPhone || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Địa chỉ:
                        </Typography>
                        <Typography variant="body1">
                          {selectedRegistration.businessAddress || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Mã số thuế:
                        </Typography>
                        <Typography variant="body1">
                          {selectedRegistration.taxId || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          Mô tả:
                        </Typography>
                        <Typography variant="body1">
                          {selectedRegistration.description || "Không có mô tả"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      display="flex"
                      alignItems="center"
                    >
                      <ScheduleIcon sx={{ mr: 1 }} /> Trạng thái đơn đăng ký
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Trạng thái:
                        </Typography>
                        <Chip
                          label={getStatusLabel(selectedRegistration.status)}
                          color={getStatusColor(selectedRegistration.status)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Ngày đăng ký:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedRegistration.createdAt)}
                        </Typography>
                      </Grid>
                      {selectedRegistration.processedBy && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              Người xử lý:
                            </Typography>
                            <Typography variant="body1">
                              {selectedRegistration.processedBy?.username ||
                                "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              Ngày xử lý:
                            </Typography>
                            <Typography variant="body1">
                              {formatDate(selectedRegistration.processedAt)}
                            </Typography>
                          </Grid>
                        </>
                      )}
                      {selectedRegistration.notes && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Ghi chú:
                          </Typography>
                          <Typography variant="body1">
                            {selectedRegistration.notes}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Đóng</Button>
          {selectedRegistration?.status === RegistrationStatus.PENDING && (
            <>
              <Button
                color="success"
                variant="contained"
                onClick={() => {
                  handleCloseDetailDialog();
                  handleOpenApproveDialog(selectedRegistration);
                }}
              >
                Phê duyệt
              </Button>
              <Button
                color="error"
                variant="contained"
                onClick={() => {
                  handleCloseDetailDialog();
                  handleOpenRejectDialog(selectedRegistration);
                }}
              >
                Từ chối
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Phê duyệt đơn đăng ký */}
      <Dialog open={openApproveDialog} onClose={handleCloseApproveDialog}>
        <DialogTitle>Phê duyệt đơn đăng ký bán hàng</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            Bạn có chắc chắn muốn phê duyệt đơn đăng ký bán hàng này?
          </DialogContentText>
          <DialogContentText>
            <strong>Doanh nghiệp:</strong> {selectedRegistration?.businessName}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            name="notes"
            label="Ghi chú (không bắt buộc)"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={handleNotesChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveDialog}>Hủy</Button>
          <Button
            onClick={handleApprove}
            color="success"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Phê duyệt"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Từ chối đơn đăng ký */}
      <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog}>
        <DialogTitle>Từ chối đơn đăng ký bán hàng</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            Bạn có chắc chắn muốn từ chối đơn đăng ký bán hàng này?
          </DialogContentText>
          <DialogContentText>
            <strong>Doanh nghiệp:</strong> {selectedRegistration?.businessName}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            name="notes"
            label="Lý do từ chối (bắt buộc)"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={handleNotesChange}
            required
            error={openRejectDialog && !notes.trim()}
            helperText={
              openRejectDialog && !notes.trim()
                ? "Vui lòng nhập lý do từ chối"
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog}>Hủy</Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={loading || !notes.trim()}
          >
            {loading ? <CircularProgress size={24} /> : "Từ chối"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SellerRegistrationsPage;
