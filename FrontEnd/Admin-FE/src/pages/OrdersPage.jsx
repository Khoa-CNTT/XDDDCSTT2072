import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import orderService from "../services/orderService";

function OrdersPage() {
  // State quản lý danh sách đơn hàng
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // State quản lý phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State quản lý bộ lọc
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý dialog chi tiết đơn hàng
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    order: null,
  });

  // State quản lý dialog cập nhật trạng thái
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    orderId: null,
    newStatus: "",
  });

  // State quản lý dialog hủy đơn
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    orderId: null,
    reason: "",
  });

  // State quản lý thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // State hiển thị thông báo lỗi xác thực
  const [authError, setAuthError] = useState(false);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Lấy danh sách đơn hàng khi component mount hoặc các tham số thay đổi
  useEffect(() => {
    if (!authError) {
      fetchOrders();
    }
  }, [page, rowsPerPage, filterStatus, authError]);

  // Kiểm tra trạng thái đăng nhập
  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthError(true);
      setSnackbar({
        open: true,
        message: "Vui lòng đăng nhập để tiếp tục",
        severity: "error",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } else {
      // Kiểm tra token có hợp lệ không
      setAuthError(false);
    }
  };

  // Hàm lấy danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem("token");
      if (!token) {
        setSnackbar({
          open: true,
          message: "Vui lòng đăng nhập để tiếp tục",
          severity: "error",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      const response = await orderService.getAllOrders(
        page,
        rowsPerPage,
        filterStatus || null
      );
      console.log("API Response Raw:", response);

      // Xử lý dữ liệu đơn hàng
      if (response && response.data) {
        // Kiểm tra cấu trúc response từ API
        let ordersData = [];
        if (response.data.content) {
          // Nếu là định dạng Page (có content và totalElements)
          ordersData = response.data.content;
          setTotalItems(response.data.totalElements || 0);
        } else if (Array.isArray(response.data)) {
          // Nếu response là một mảng đơn hàng
          ordersData = response.data;
          setTotalItems(response.data.length);
        } else {
          // Nếu là định dạng ResponseDTO mà Spring trả về
          ordersData = Array.isArray(response.data)
            ? response.data
            : [response.data];
          setTotalItems(
            Array.isArray(response.data) ? response.data.length : 1
          );
        }

        console.log("Orders data before processing:", ordersData);

        // Xử lý thông tin từng đơn hàng
        const processedOrders = ordersData.map((order) => {
          const processedOrder = { ...order };

          // Nếu trong API response không có buyer và buyerName nhưng có buyerId
          if (!processedOrder.buyer && processedOrder.buyerId) {
            // Tạo object buyer với id
            processedOrder.buyer = {
              id: processedOrder.buyerId,
            };

            // Thêm username hoặc fullName dựa vào buyerId
            if (processedOrder.buyerId === 9) {
              processedOrder.buyer.username = "Admin";
              processedOrder.buyer.fullName = "Tài khoản Admin";
            } else {
              processedOrder.buyer.username = `User ${processedOrder.buyerId}`;
            }
          }

          // Đảm bảo luôn có shippingName để hiển thị
          if (!processedOrder.shippingName) {
            if (processedOrder.buyer) {
              processedOrder.shippingName =
                processedOrder.buyer.fullName ||
                processedOrder.buyer.username ||
                `Người dùng #${processedOrder.buyerId}`;
            } else if (processedOrder.buyerId) {
              processedOrder.shippingName = `Người dùng #${processedOrder.buyerId}`;
            } else {
              processedOrder.shippingName = "Khách hàng";
            }
          }

          // Chuẩn bị dữ liệu cho việc hiển thị
          if (!processedOrder.orderNumber) {
            processedOrder.orderNumber = processedOrder.id;
          }

          return processedOrder;
        });

        console.log("Orders after processing:", processedOrders);
        setOrders(processedOrders);
      } else if (response && response.content) {
        // Tương tự xử lý như trên
        const processedOrders = response.content.map((order) => {
          const processedOrder = { ...order };

          if (!processedOrder.buyer && processedOrder.buyerId) {
            processedOrder.buyer = {
              id: processedOrder.buyerId,
            };

            if (processedOrder.buyerId === 9) {
              processedOrder.buyer.username = "Admin";
              processedOrder.buyer.fullName = "Tài khoản Admin";
            } else {
              processedOrder.buyer.username = `User ${processedOrder.buyerId}`;
            }
          }

          if (!processedOrder.shippingName) {
            if (processedOrder.buyer) {
              processedOrder.shippingName =
                processedOrder.buyer.fullName ||
                processedOrder.buyer.username ||
                `Người dùng #${processedOrder.buyerId}`;
            } else if (processedOrder.buyerId) {
              processedOrder.shippingName = `Người dùng #${processedOrder.buyerId}`;
            } else {
              processedOrder.shippingName = "Khách hàng";
            }
          }

          if (!processedOrder.orderNumber) {
            processedOrder.orderNumber = processedOrder.id;
          }

          return processedOrder;
        });

        console.log("Orders after processing (from content):", processedOrders);
        setOrders(processedOrders);
        setTotalItems(response.totalElements || 0);
      } else if (response && Array.isArray(response)) {
        // Tương tự xử lý như trên
        const processedOrders = response.map((order) => {
          const processedOrder = { ...order };

          if (!processedOrder.buyer && processedOrder.buyerId) {
            processedOrder.buyer = {
              id: processedOrder.buyerId,
            };

            if (processedOrder.buyerId === 9) {
              processedOrder.buyer.username = "Admin";
              processedOrder.buyer.fullName = "Tài khoản Admin";
            } else {
              processedOrder.buyer.username = `User ${processedOrder.buyerId}`;
            }
          }

          if (!processedOrder.shippingName) {
            if (processedOrder.buyer) {
              processedOrder.shippingName =
                processedOrder.buyer.fullName ||
                processedOrder.buyer.username ||
                `Người dùng #${processedOrder.buyerId}`;
            } else if (processedOrder.buyerId) {
              processedOrder.shippingName = `Người dùng #${processedOrder.buyerId}`;
            } else {
              processedOrder.shippingName = "Khách hàng";
            }
          }

          if (!processedOrder.orderNumber) {
            processedOrder.orderNumber = processedOrder.id;
          }

          return processedOrder;
        });

        console.log("Orders after processing (from array):", processedOrders);
        setOrders(processedOrders);
        setTotalItems(processedOrders.length);
      } else {
        console.warn("Unexpected API response format:", response);
        setOrders([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response) {
        // Xử lý các lỗi HTTP cụ thể
        if (error.response.status === 403) {
          setSnackbar({
            open: true,
            message:
              "Bạn không có quyền truy cập trang này. Vui lòng đăng nhập lại.",
            severity: "error",
          });
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }, 2000);
        } else if (error.response.status === 401) {
          setSnackbar({
            open: true,
            message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
            severity: "error",
          });
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }, 2000);
        } else {
          setSnackbar({
            open: true,
            message: `Lỗi khi tải danh sách đơn hàng: ${error.response.status}`,
            severity: "error",
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
          severity: "error",
        });
      }
      setOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Hàm hiển thị tên khách hàng trong bảng
  const getCustomerName = (order) => {
    // Ưu tiên hiển thị theo thứ tự:
    // 1. Thông tin buyer (user) từ buyerId
    // 2. Thông tin người nhận hàng (shippingName)
    // 3. BuyerId mặc định

    if (order.buyer) {
      return order.buyer.fullName || order.buyer.username || order.buyer.email;
    }

    if (order.shippingName) {
      return order.shippingName;
    }

    if (order.buyerId) {
      // Dựa vào hình ảnh database, nếu buyerId = 9, đây là admin nên hiển thị "Tài khoản Admin"
      if (order.buyerId === 9) {
        return "Tài khoản Admin";
      }
      return `Người dùng #${order.buyerId}`;
    }

    // Các trường hợp khác
    if (order.user) {
      return order.user.fullName || order.user.username || order.user.email;
    }

    if (order.customerName) {
      return order.customerName;
    }

    return "Khách hàng";
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Nếu có từ khóa tìm kiếm, lọc trên dữ liệu đã có
      const filteredOrders = orders.filter((order) => {
        // Tìm theo mã đơn
        if (order.id && order.id.toString().includes(searchTerm)) return true;
        if (
          order.orderNumber &&
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
        )
          return true;

        // Tìm theo tên khách hàng
        const customerName = getCustomerName(order);
        if (
          customerName &&
          customerName.toLowerCase().includes(searchTerm.toLowerCase())
        )
          return true;

        return false;
      });

      // Hiển thị kết quả tìm kiếm
      setOrders(filteredOrders);
      setTotalItems(filteredOrders.length);
    } else {
      // Nếu không có từ khóa, tải lại dữ liệu từ API
      fetchOrders();
    }
  };

  // Xử lý thay đổi trạng thái đơn hàng
  const handleStatusChange = async () => {
    try {
      await orderService.updateOrderStatus(
        statusDialog.orderId,
        statusDialog.newStatus
      );
      setSnackbar({
        open: true,
        message: "Cập nhật trạng thái đơn hàng thành công",
        severity: "success",
      });
      setStatusDialog({ open: false, orderId: null, newStatus: "" });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi cập nhật trạng thái đơn hàng",
        severity: "error",
      });
    }
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    try {
      await orderService.cancelOrder(cancelDialog.orderId);
      setSnackbar({
        open: true,
        message: "Hủy đơn hàng thành công",
        severity: "success",
      });
      setCancelDialog({ open: false, orderId: null, reason: "" });
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi hủy đơn hàng",
        severity: "error",
      });
    }
  };

  // Hiển thị trạng thái đơn hàng
  const getStatusChip = (status) => {
    switch (status) {
      case "PENDING":
        return <Chip label="Chờ xử lý" color="warning" size="small" />;
      case "CONFIRMED":
        return <Chip label="Đã xác nhận" color="info" size="small" />;
      case "PROCESSING":
        return <Chip label="Đang xử lý" color="info" size="small" />;
      case "SHIPPED":
        return <Chip label="Đang giao hàng" color="primary" size="small" />;
      case "DELIVERED":
        return <Chip label="Đã giao hàng" color="success" size="small" />;
      case "COMPLETED":
        return <Chip label="Hoàn thành" color="success" size="small" />;
      case "CANCELLED":
        return <Chip label="Đã hủy" color="error" size="small" />;
      case "RETURNED":
        return <Chip label="Đã trả hàng" color="error" size="small" />;
      case "REFUNDED":
        return <Chip label="Đã hoàn tiền" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  // Định dạng ngày giờ
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    try {
      // Xử lý trường hợp dateTimeStr là mảng (từ Java LocalDateTime)
      if (Array.isArray(dateTimeStr) && dateTimeStr.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0] =
          dateTimeStr;
        const date = new Date(year, month - 1, day, hour, minute, second);
        return format(date, "HH:mm:ss dd/MM/yyyy", { locale: vi });
      }

      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return format(date, "HH:mm:ss dd/MM/yyyy", { locale: vi });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Định dạng tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace(/\s/g, "");
  };

  return (
    <Container maxWidth="xl">
      {authError ? (
        <Box sx={{ my: 4, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Bạn không có quyền truy cập trang này hoặc phiên làm việc đã hết
            hạn. Vui lòng đăng nhập lại.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => (window.location.href = "/login")}
          >
            Đăng nhập
          </Button>
        </Box>
      ) : (
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Quản lý đơn hàng
          </Typography>

          {/* Bộ lọc và tìm kiếm */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tìm kiếm theo mã đơn/tên khách hàng"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        size="small"
                        onClick={handleSearch}
                        edge="end"
                      >
                        <SearchIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                    <MenuItem value="CONFIRMED">Đã xác nhận</MenuItem>
                    <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
                    <MenuItem value="SHIPPED">Đang giao hàng</MenuItem>
                    <MenuItem value="DELIVERED">Đã giao hàng</MenuItem>
                    <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                    <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                    <MenuItem value="RETURNED">Đã trả hàng</MenuItem>
                    <MenuItem value="REFUNDED">Đã hoàn tiền</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={5}>
                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchOrders}
                  >
                    Làm mới
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Bảng danh sách đơn hàng */}
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Ngày đặt</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.orderNumber || order.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {getCustomerName(order)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(order.orderDate || order.createdAt)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(order.totalAmount || 0)}
                      </TableCell>
                      <TableCell>{getStatusChip(order.status)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setDetailDialog({ open: true, order })
                              }
                              color="primary"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {order.status === "PENDING" && (
                            <Tooltip title="Xác nhận đơn hàng">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setStatusDialog({
                                    open: true,
                                    orderId: order.id,
                                    newStatus: "CONFIRMED",
                                  })
                                }
                                color="info"
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {order.status === "CONFIRMED" && (
                            <Tooltip title="Chuyển sang đang xử lý">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setStatusDialog({
                                    open: true,
                                    orderId: order.id,
                                    newStatus: "PROCESSING",
                                  })
                                }
                                color="info"
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {order.status === "PROCESSING" && (
                            <Tooltip title="Chuyển sang đang giao hàng">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setStatusDialog({
                                    open: true,
                                    orderId: order.id,
                                    newStatus: "SHIPPED",
                                  })
                                }
                                color="primary"
                              >
                                <ShippingIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {order.status === "SHIPPED" && (
                            <Tooltip title="Đã giao hàng">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setStatusDialog({
                                    open: true,
                                    orderId: order.id,
                                    newStatus: "DELIVERED",
                                  })
                                }
                                color="success"
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {(order.status === "PENDING" ||
                            order.status === "CONFIRMED" ||
                            order.status === "PROCESSING") && (
                            <Tooltip title="Hủy đơn hàng">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setCancelDialog({
                                    open: true,
                                    orderId: order.id,
                                    reason: "",
                                  })
                                }
                                color="error"
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Phân trang */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalItems}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count}`
            }
          />

          {/* Dialog Chi tiết đơn hàng */}
          <Dialog
            open={detailDialog.open}
            onClose={() => setDetailDialog({ ...detailDialog, open: false })}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogContent dividers>
              {detailDialog.order && (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Mã đơn hàng</Typography>
                      <Typography variant="body1" gutterBottom>
                        {detailDialog.order.orderNumber ||
                          detailDialog.order.id}
                      </Typography>

                      <Typography variant="subtitle2">Ngày đặt hàng</Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDateTime(
                          detailDialog.order.orderDate ||
                            detailDialog.order.createdAt
                        )}
                      </Typography>

                      <Typography variant="subtitle2">Trạng thái</Typography>
                      <Typography variant="body1" gutterBottom>
                        {getStatusChip(detailDialog.order.status)}
                      </Typography>

                      <Typography variant="subtitle2">Tổng tiền</Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatCurrency(detailDialog.order.totalAmount || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Khách hàng</Typography>
                      <Typography variant="body1" gutterBottom>
                        {getCustomerName(detailDialog.order)}
                      </Typography>

                      <Typography variant="subtitle2">Email</Typography>
                      <Typography variant="body1" gutterBottom>
                        {detailDialog.order.buyer?.email ||
                          detailDialog.order.user?.email ||
                          detailDialog.order.customerEmail ||
                          "N/A"}
                      </Typography>

                      <Typography variant="subtitle2">Số điện thoại</Typography>
                      <Typography variant="body1" gutterBottom>
                        {detailDialog.order.shippingPhone ||
                          detailDialog.order.buyer?.phone ||
                          detailDialog.order.user?.phone ||
                          detailDialog.order.customerPhone ||
                          "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Địa chỉ giao hàng
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {detailDialog.order.shippingAddress ||
                      "Không có thông tin địa chỉ"}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Ghi chú
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {detailDialog.order.note || "Không có ghi chú"}
                  </Typography>

                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                    Chi tiết sản phẩm
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Sản phẩm</TableCell>
                          <TableCell align="right">Đơn giá</TableCell>
                          <TableCell align="right">Số lượng</TableCell>
                          <TableCell align="right">Thành tiền</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailDialog.order.orderDetails?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {item.productName || "Sản phẩm không xác định"}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.price || 0)}
                            </TableCell>
                            <TableCell align="right">
                              {item.quantity || 1}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(
                                (item.price || 0) * (item.quantity || 1)
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={2} />
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              Tổng cộng:
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              {formatCurrency(
                                detailDialog.order.totalAmount || 0
                              )}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
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

          {/* Dialog Cập nhật trạng thái */}
          <Dialog
            open={statusDialog.open}
            onClose={() => setStatusDialog({ ...statusDialog, open: false })}
          >
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng này?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() =>
                  setStatusDialog({ ...statusDialog, open: false })
                }
              >
                Hủy
              </Button>
              <Button onClick={handleStatusChange} color="primary" autoFocus>
                Xác nhận
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog Hủy đơn hàng */}
          <Dialog
            open={cancelDialog.open}
            onClose={() => setCancelDialog({ ...cancelDialog, open: false })}
          >
            <DialogTitle>Hủy đơn hàng</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Vui lòng nhập lý do hủy đơn hàng:
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Lý do hủy"
                fullWidth
                multiline
                rows={3}
                value={cancelDialog.reason}
                onChange={(e) =>
                  setCancelDialog({ ...cancelDialog, reason: e.target.value })
                }
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() =>
                  setCancelDialog({ ...cancelDialog, open: false })
                }
              >
                Hủy
              </Button>
              <Button
                onClick={handleCancelOrder}
                color="error"
                disabled={!cancelDialog.reason}
              >
                Xác nhận hủy
              </Button>
            </DialogActions>
          </Dialog>

          {/* Thông báo */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={5000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      )}
    </Container>
  );
}

export default OrdersPage;
