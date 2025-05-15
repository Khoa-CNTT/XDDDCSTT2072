import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Stack,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Visibility as ViewIcon,
  Restore as RefundIcon,
  FilterList as FilterIcon,
  BarChart as ChartIcon,
  Payments as PaymentsIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import PaymentService from "../services/paymentService";
import PropTypes from "prop-types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

/**
 * Trang quản lý giao dịch thanh toán
 * @param {Object} props
 * @param {boolean} props.showStatisticsTab Hiển thị tab thống kê mặc định
 */
const PaymentsPage = ({ showStatisticsTab = false }) => {
  // State quản lý tab hiện tại
  const [currentTab, setCurrentTab] = useState(showStatisticsTab ? 1 : 0);

  // State quản lý danh sách thanh toán
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // State quản lý phân trang và lọc
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // State quản lý thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // State quản lý dialog
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    payment: null,
  });

  const [refundDialog, setRefundDialog] = useState({
    open: false,
    payment: null,
    amount: 0,
    reason: "",
  });

  // State cho thống kê
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    refundedCount: 0,
  });

  // State cho biểu đồ
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [chartType, setChartType] = useState("monthly"); // daily, weekly, monthly, yearly

  // Lấy danh sách thanh toán
  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Chuẩn bị parameters cho API call
      const params = {
        page,
        size: rowsPerPage,
        search: searchTerm || undefined, // Chỉ gửi nếu có giá trị
        paymentMethod: paymentMethod || undefined,
        status: status || undefined,
        fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
        toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
      };

      // Xóa các tham số undefined để không gửi lên server
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      console.log(
        "Fetching payments with exact params:",
        JSON.stringify(params)
      );
      console.log(
        "Current filters - paymentMethod:",
        paymentMethod,
        "status:",
        status
      );

      const response = await PaymentService.getAllPayments(params);
      console.log("API Response:", response);

      // Thử cả hai cấu trúc dữ liệu có thể: data.content hoặc data.data.content
      let paymentsData = [];
      let totalElementsCount = 0;

      if (response.data?.content) {
        // Format 1: data.content trực tiếp
        paymentsData = response.data.content;
        totalElementsCount = response.data.totalElements || 0;
      } else if (response.data?.data?.content) {
        // Format 2: data.data.content (dùng ApiResponse wrapper)
        paymentsData = response.data.data.content;
        totalElementsCount = response.data.data.totalElements || 0;
      } else if (Array.isArray(response.data)) {
        // Format 3: Mảng trực tiếp
        paymentsData = response.data;
        totalElementsCount = response.data.length;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Format 4: data.data là một mảng
        paymentsData = response.data.data;
        totalElementsCount = response.data.data.length;
      }

      console.log("Processed payments data:", paymentsData);
      console.log("Total items:", totalElementsCount);

      setPayments(paymentsData);
      setTotalItems(totalElementsCount);

      // Fetch statistics
      fetchStatistics();
    } catch (error) {
      console.error("Error fetching payments:", error);
      console.error("Error details:", error.response || error.message);
      setSnackbar({
        open: true,
        message:
          "Lỗi khi tải danh sách thanh toán: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Lấy thống kê thanh toán
  const fetchStatistics = async () => {
    try {
      const params = {
        paymentMethod: paymentMethod || undefined,
        fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
        toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
      };

      // Xóa các tham số undefined để không gửi lên server
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      console.log("Fetching statistics with params:", params);
      const response = await PaymentService.getPaymentStatistics(params);
      console.log("Statistics response:", response);

      if (response.data && typeof response.data === "object") {
        setStatistics(response.data);
      } else if (
        response.data?.data &&
        typeof response.data.data === "object"
      ) {
        setStatistics(response.data.data);
      } else {
        console.warn("Unexpected statistics data format:", response.data);
        // Sử dụng dữ liệu mẫu trong trường hợp không có dữ liệu hoặc định dạng không đúng
        setStatistics({
          totalCount: 0,
          totalAmount: 0,
          completedCount: 0,
          pendingCount: 0,
          failedCount: 0,
          refundedCount: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching payment statistics:", error);
      // Đặt giá trị mặc định khi có lỗi
      setStatistics({
        totalCount: 0,
        totalAmount: 0,
        completedCount: 0,
        pendingCount: 0,
        failedCount: 0,
        refundedCount: 0,
      });
    }
  };

  // Lấy dữ liệu thống kê theo thời gian cho biểu đồ
  const fetchChartData = async () => {
    try {
      const params = {
        type: chartType,
        fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
        toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
        paymentMethod: paymentMethod || undefined,
      };

      // Xóa các tham số undefined
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      console.log("Fetching chart data with params:", params);

      // Gọi API để lấy dữ liệu biểu đồ
      const response = await PaymentService.getChartData(params);
      console.log("Chart data response:", response);

      if (response.data) {
        const chartData = response.data;

        // Cập nhật dữ liệu biểu đồ
        setChartData({
          labels: chartData.labels,
          datasets: [
            {
              label: "Doanh thu (VNĐ)",
              data: chartData.revenueData,
              borderColor: "rgb(53, 162, 235)",
              backgroundColor: "rgba(53, 162, 235, 0.5)",
              yAxisID: "y",
            },
            {
              label: "Số giao dịch",
              data: chartData.transactionData,
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              yAxisID: "y1",
            },
          ],
        });

        // Cập nhật state thống kê
        setStatistics({
          totalAmount: chartData.totalRevenue,
          totalCount: chartData.totalTransactions,
          completedCount: Math.floor(
            chartData.totalTransactions * chartData.statusDistribution.COMPLETED
          ),
          pendingCount: Math.floor(
            chartData.totalTransactions * chartData.statusDistribution.PENDING
          ),
          failedCount: Math.floor(
            chartData.totalTransactions * chartData.statusDistribution.FAILED
          ),
          refundedCount: Math.floor(
            chartData.totalTransactions * chartData.statusDistribution.REFUNDED
          ),
          paymentMethodDistribution: chartData.paymentMethodDistribution,
        });
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi tải dữ liệu biểu đồ",
        severity: "error",
      });
    }
  };

  // Load data khi component mount hoặc các tham số thay đổi
  useEffect(() => {
    fetchPayments();
  }, [page, rowsPerPage]); // Chỉ phản ứng với thay đổi trang và số dòng

  // Cập nhật thống kê khi các bộ lọc thay đổi
  useEffect(() => {
    // Chỉ cập nhật thống kê khi các bộ lọc thay đổi mà không bao gồm searchTerm (vì searchTerm chỉ áp dụng cho danh sách)
    if (currentTab === 1) {
      fetchStatistics();
    }
  }, [paymentMethod, fromDate, toDate, currentTab]);

  // Xử lý tìm kiếm
  const handleSearch = () => {
    setPage(0); // Reset về trang đầu tiên khi tìm kiếm
    fetchPayments();
  };

  // Xử lý tìm kiếm khi nhấn Enter trong ô tìm kiếm
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Xử lý thay đổi phương thức thanh toán
  const handlePaymentMethodChange = (e) => {
    const value = e.target.value;
    console.log("Selected payment method:", value);
    setPaymentMethod(value);
    setPage(0);
    setTimeout(fetchPayments, 0);
  };

  // Xử lý thay đổi trạng thái
  const handleStatusChange = (e) => {
    const value = e.target.value;
    console.log("Selected status:", value);
    setStatus(value);
    setPage(0);
    setTimeout(fetchPayments, 0);
  };

  // Xử lý thay đổi từ ngày
  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  // Xử lý thay đổi đến ngày
  const handleToDateChange = (date) => {
    setToDate(date);
  };

  // Xử lý reset bộ lọc
  const handleResetFilters = () => {
    setSearchTerm("");
    setPaymentMethod("");
    setStatus("");
    setFromDate(null);
    setToDate(null);
    setPage(0);
    setTimeout(fetchPayments, 0);
  };

  // Xuất báo cáo
  const handleExport = async () => {
    try {
      const params = {
        search: searchTerm,
        paymentMethod,
        status,
        fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
        toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
      };

      const blob = await PaymentService.exportPaymentsReport(params);

      // Tạo URL và download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `payment-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({
        open: true,
        message: "Báo cáo đã được tải xuống",
        severity: "success",
      });
    } catch (error) {
      console.error("Error exporting payments:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi xuất báo cáo",
        severity: "error",
      });
    }
  };

  // Hiển thị chi tiết thanh toán
  const handleViewDetails = (payment) => {
    setDetailDialog({
      open: true,
      payment,
    });
  };

  // Mở dialog hoàn tiền
  const handleOpenRefundDialog = (payment) => {
    setRefundDialog({
      open: true,
      payment,
      amount: payment.amount,
      reason: "",
    });
  };

  // Xử lý hoàn tiền
  const handleRefund = async () => {
    try {
      const { payment, amount, reason } = refundDialog;

      await PaymentService.refundPayment(payment.transactionId, amount, reason);

      setSnackbar({
        open: true,
        message: "Hoàn tiền thành công",
        severity: "success",
      });

      setRefundDialog({ open: false, payment: null, amount: 0, reason: "" });
      fetchPayments();
    } catch (error) {
      console.error("Error refunding payment:", error);
      setSnackbar({
        open: true,
        message:
          "Lỗi khi hoàn tiền: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  // Định dạng trạng thái thanh toán
  const getStatusChip = (status) => {
    let color = "default";
    let label = status;

    switch (status) {
      case "COMPLETED":
        color = "success";
        label = "Thành công";
        break;
      case "PENDING":
        color = "warning";
        label = "Chờ xử lý";
        break;
      case "FAILED":
        color = "error";
        label = "Thất bại";
        break;
      case "REFUNDED":
        color = "secondary";
        label = "Đã hoàn tiền";
        break;
      default:
        break;
    }

    return <Chip label={label} color={color} size="small" />;
  };

  // Định dạng số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Định dạng ngày giờ
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return format(date, "HH:mm:ss dd/MM/yyyy", { locale: vi });
  };

  // Xử lý chuyển tab
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);

    // Khi chuyển sang tab thống kê, tải lại dữ liệu thống kê
    if (newValue === 1) {
      fetchStatistics();
    } else {
      // Khi chuyển về tab danh sách, tải lại danh sách thanh toán
      fetchPayments();
    }
  };

  // Xử lý thay đổi loại thống kê
  const handleChartTypeChange = (e) => {
    const value = e.target.value;
    console.log("Selected chart type:", value);
    setChartType(value);
  };

  // Load dữ liệu biểu đồ khi loại thống kê thay đổi
  useEffect(() => {
    if (currentTab === 1) {
      fetchChartData();
    }
  }, [chartType, currentTab]);

  // Xử lý áp dụng bộ lọc cho biểu đồ
  const handleApplyChartFilters = () => {
    fetchChartData();
  };

  // Xử lý reset bộ lọc cho biểu đồ
  const handleResetChartFilters = () => {
    setFromDate(null);
    setToDate(null);
    setPaymentMethod("");
    setTimeout(fetchChartData, 0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Quản lý giao dịch thanh toán
          </Typography>

          {/* Tabs */}
          <Paper sx={{ borderRadius: 2, mb: 3 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab icon={<PaymentsIcon />} label="Danh sách giao dịch" />
              <Tab icon={<ChartIcon />} label="Thống kê doanh thu" />
            </Tabs>
          </Paper>

          {/* Tab nội dung: 0 - danh sách giao dịch, 1 - thống kê */}
          {currentTab === 0 ? (
            <>
              {/* Thống kê */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Tổng giao dịch
                      </Typography>
                      <Typography variant="h5" component="div">
                        {statistics.totalCount}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Tổng tiền: {formatCurrency(statistics.totalAmount || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={9}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Theo trạng thái
                      </Typography>
                      <Stack
                        direction="row"
                        divider={<Divider orientation="vertical" flexItem />}
                        spacing={2}
                        justifyContent="space-around"
                      >
                        <Box>
                          <Typography variant="h6" color="success.main">
                            {statistics.completedCount || 0}
                          </Typography>
                          <Typography variant="body2">Thành công</Typography>
                        </Box>

                        <Box>
                          <Typography variant="h6" color="warning.main">
                            {statistics.pendingCount || 0}
                          </Typography>
                          <Typography variant="body2">Chờ xử lý</Typography>
                        </Box>

                        <Box>
                          <Typography variant="h6" color="error.main">
                            {statistics.failedCount || 0}
                          </Typography>
                          <Typography variant="body2">Thất bại</Typography>
                        </Box>

                        <Box>
                          <Typography variant="h6" color="secondary.main">
                            {statistics.refundedCount || 0}
                          </Typography>
                          <Typography variant="body2">Hoàn tiền</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Bộ lọc */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Tìm kiếm"
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      InputProps={{
                        endAdornment: (
                          <IconButton size="small" onClick={handleSearch}>
                            <SearchIcon />
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Phương thức thanh toán</InputLabel>
                      <Select
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                        label="Phương thức thanh toán"
                      >
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value="VNPAY">VNPAY</MenuItem>
                        <MenuItem value="MOMO">MoMo</MenuItem>
                        <MenuItem value="COD">COD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        value={status}
                        onChange={handleStatusChange}
                        label="Trạng thái"
                      >
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value="COMPLETED">Thành công</MenuItem>
                        <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                        <MenuItem value="FAILED">Thất bại</MenuItem>
                        <MenuItem value="REFUNDED">Đã hoàn tiền</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <DatePicker
                      label="Từ ngày"
                      value={fromDate}
                      onChange={handleFromDateChange}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <DatePicker
                      label="Đến ngày"
                      value={toDate}
                      onChange={handleToDateChange}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={1}>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Tìm kiếm">
                        <IconButton color="primary" onClick={handleSearch}>
                          <FilterIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Làm mới">
                        <IconButton onClick={handleResetFilters}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              {/* Thanh công cụ */}
              <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={handleExport}
                >
                  Xuất báo cáo
                </Button>
              </Box>

              {/* Bảng dữ liệu */}
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Đơn hàng</TableCell>
                      <TableCell>Mã giao dịch</TableCell>
                      <TableCell>Phương thức</TableCell>
                      <TableCell>Số tiền</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Thời gian</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <CircularProgress size={30} />
                        </TableCell>
                      </TableRow>
                    ) : payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.id}</TableCell>
                          <TableCell>{payment.orderId}</TableCell>
                          <TableCell>{payment.transactionId}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell>
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>{getStatusChip(payment.status)}</TableCell>
                          <TableCell>
                            {formatDateTime(payment.createdAt)}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewDetails(payment)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {payment.status === "COMPLETED" && (
                              <Tooltip title="Hoàn tiền">
                                <IconButton
                                  size="small"
                                  color="secondary"
                                  onClick={() =>
                                    handleOpenRefundDialog(payment)
                                  }
                                >
                                  <RefundIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Phân trang */}
              <TablePagination
                component="div"
                rowsPerPageOptions={[5, 10, 25]}
                count={totalItems}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage="Dòng trên trang:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} / ${count}`
                }
              />
            </>
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Thống kê doanh thu theo thời gian
              </Typography>

              {/* Bộ lọc cho thống kê */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Loại thống kê</InputLabel>
                      <Select
                        value={chartType}
                        onChange={handleChartTypeChange}
                        label="Loại thống kê"
                      >
                        <MenuItem value="daily">Theo ngày</MenuItem>
                        <MenuItem value="weekly">Theo tuần</MenuItem>
                        <MenuItem value="monthly">Theo tháng</MenuItem>
                        <MenuItem value="yearly">Theo năm</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label="Từ ngày"
                      value={fromDate}
                      onChange={handleFromDateChange}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label="Đến ngày"
                      value={toDate}
                      onChange={handleToDateChange}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<FilterIcon />}
                        onClick={handleApplyChartFilters}
                      >
                        Áp dụng
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleResetChartFilters}
                      >
                        Làm mới
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<ExportIcon />}
                        onClick={handleExport}
                      >
                        Xuất báo cáo
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              {/* Hiển thị biểu đồ doanh thu */}
              <Paper sx={{ p: 3, mb: 3, height: 500 }}>
                <Typography variant="h6" align="center" gutterBottom>
                  {chartType === "daily" && "Doanh thu theo ngày"}
                  {chartType === "weekly" && "Doanh thu theo tuần"}
                  {chartType === "monthly" && "Doanh thu theo tháng"}
                  {chartType === "yearly" && "Doanh thu theo năm"}
                </Typography>
                {chartData.labels.length > 0 ? (
                  <Box sx={{ height: 400, position: "relative" }}>
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                          mode: "index",
                          intersect: false,
                        },
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                let label = context.dataset.label || "";
                                if (label) {
                                  label += ": ";
                                }
                                if (context.parsed.y !== null) {
                                  if (context.datasetIndex === 0) {
                                    // Định dạng doanh thu
                                    label += new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(context.parsed.y);
                                  } else {
                                    // Định dạng số giao dịch
                                    label += context.parsed.y;
                                  }
                                }
                                return label;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            type: "linear",
                            display: true,
                            position: "left",
                            title: {
                              display: true,
                              text: "Doanh thu (VNĐ)",
                            },
                            ticks: {
                              callback: function (value) {
                                return new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                  notation: "compact",
                                  compactDisplay: "short",
                                }).format(value);
                              },
                            },
                          },
                          y1: {
                            type: "linear",
                            display: true,
                            position: "right",
                            title: {
                              display: true,
                              text: "Số giao dịch",
                            },
                            grid: {
                              drawOnChartArea: false,
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                    sx={{ pt: 15 }}
                  >
                    Không có dữ liệu thống kê cho khoảng thời gian này
                  </Typography>
                )}
              </Paper>

              {/* Phân tích biểu đồ tròn theo phương thức thanh toán */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" align="center" gutterBottom>
                  Phân bổ giao dịch theo phương thức thanh toán
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ height: 300 }}>
                      <Pie
                        data={{
                          labels: ["VNPAY", "MOMO", "COD"],
                          datasets: [
                            {
                              label: "Doanh thu",
                              data: [
                                statistics.totalAmount * 0.65, // 65% VNPAY
                                statistics.totalAmount * 0.25, // 25% MOMO
                                statistics.totalAmount * 0.1, // 10% COD
                              ],
                              backgroundColor: [
                                "rgba(54, 162, 235, 0.6)",
                                "rgba(255, 99, 132, 0.6)",
                                "rgba(255, 206, 86, 0.6)",
                              ],
                              borderColor: [
                                "rgba(54, 162, 235, 1)",
                                "rgba(255, 99, 132, 1)",
                                "rgba(255, 206, 86, 1)",
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "right",
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  const label = context.label || "";
                                  const value = context.raw;
                                  const percentage = (
                                    (value / statistics.totalAmount) *
                                    100
                                  ).toFixed(1);
                                  return `${label}: ${new Intl.NumberFormat(
                                    "vi-VN",
                                    {
                                      style: "currency",
                                      currency: "VND",
                                    }
                                  ).format(value)} (${percentage}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ height: 300 }}>
                      <Pie
                        data={{
                          labels: [
                            "Thành công",
                            "Chờ xử lý",
                            "Thất bại",
                            "Hoàn tiền",
                          ],
                          datasets: [
                            {
                              label: "Số giao dịch",
                              data: [
                                statistics.completedCount,
                                statistics.pendingCount,
                                statistics.failedCount,
                                statistics.refundedCount,
                              ],
                              backgroundColor: [
                                "rgba(75, 192, 192, 0.6)",
                                "rgba(255, 159, 64, 0.6)",
                                "rgba(255, 99, 132, 0.6)",
                                "rgba(153, 102, 255, 0.6)",
                              ],
                              borderColor: [
                                "rgba(75, 192, 192, 1)",
                                "rgba(255, 159, 64, 1)",
                                "rgba(255, 99, 132, 1)",
                                "rgba(153, 102, 255, 1)",
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "right",
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  const label = context.label || "";
                                  const value = context.raw;
                                  const percentage = (
                                    (value / statistics.totalCount) *
                                    100
                                  ).toFixed(1);
                                  return `${label}: ${value} giao dịch (${percentage}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}

          {/* Dialog xem chi tiết */}
          <Dialog
            open={detailDialog.open}
            onClose={() => setDetailDialog({ ...detailDialog, open: false })}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Chi tiết giao dịch</DialogTitle>
            <DialogContent dividers>
              {detailDialog.payment && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">ID Giao dịch</Typography>
                    <Typography variant="body1" gutterBottom>
                      {detailDialog.payment.id}
                    </Typography>

                    <Typography variant="subtitle2">Mã giao dịch</Typography>
                    <Typography variant="body1" gutterBottom>
                      {detailDialog.payment.transactionId}
                    </Typography>

                    <Typography variant="subtitle2">Mã đơn hàng</Typography>
                    <Typography variant="body1" gutterBottom>
                      {detailDialog.payment.orderId}
                    </Typography>

                    <Typography variant="subtitle2">
                      Phương thức thanh toán
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {detailDialog.payment.paymentMethod}
                    </Typography>

                    <Typography variant="subtitle2">Số tiền</Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatCurrency(detailDialog.payment.amount)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Trạng thái</Typography>
                    <Typography variant="body1" gutterBottom>
                      {getStatusChip(detailDialog.payment.status)}
                    </Typography>

                    <Typography variant="subtitle2">Thời gian tạo</Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDateTime(detailDialog.payment.createdAt)}
                    </Typography>

                    <Typography variant="subtitle2">
                      Thời gian cập nhật
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDateTime(detailDialog.payment.updatedAt)}
                    </Typography>

                    <Typography variant="subtitle2">Mô tả</Typography>
                    <Typography variant="body1" gutterBottom>
                      {detailDialog.payment.description || "Không có mô tả"}
                    </Typography>

                    <Typography variant="subtitle2">Ghi chú</Typography>
                    <Typography
                      variant="body1"
                      gutterBottom
                      sx={{ wordBreak: "break-word" }}
                    >
                      {detailDialog.payment.paymentNote || "Không có ghi chú"}
                    </Typography>
                  </Grid>

                  {detailDialog.payment.transactionReference && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">
                        Mã tham chiếu giao dịch
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {detailDialog.payment.transactionReference}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() =>
                  setDetailDialog({ ...detailDialog, open: false })
                }
              >
                Đóng
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog hoàn tiền */}
          <Dialog
            open={refundDialog.open}
            onClose={() => setRefundDialog({ ...refundDialog, open: false })}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Hoàn tiền giao dịch</DialogTitle>
            <DialogContent dividers>
              {refundDialog.payment && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">
                      Bạn đang hoàn tiền cho giao dịch:{" "}
                      {refundDialog.payment.transactionId}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Số tiền hoàn lại"
                      type="number"
                      value={refundDialog.amount}
                      onChange={(e) =>
                        setRefundDialog({
                          ...refundDialog,
                          amount: parseFloat(e.target.value),
                        })
                      }
                      InputProps={{
                        inputProps: {
                          min: 0,
                          max: refundDialog.payment.amount,
                        },
                      }}
                      helperText={`Tối đa: ${formatCurrency(
                        refundDialog.payment.amount
                      )}`}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Lý do hoàn tiền"
                      multiline
                      rows={3}
                      value={refundDialog.reason}
                      onChange={(e) =>
                        setRefundDialog({
                          ...refundDialog,
                          reason: e.target.value,
                        })
                      }
                    />
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() =>
                  setRefundDialog({ ...refundDialog, open: false })
                }
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleRefund}
                disabled={!refundDialog.reason || refundDialog.amount <= 0}
              >
                Hoàn tiền
              </Button>
            </DialogActions>
          </Dialog>

          {/* Thông báo */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

PaymentsPage.propTypes = {
  showStatisticsTab: PropTypes.bool,
};

export default PaymentsPage;
