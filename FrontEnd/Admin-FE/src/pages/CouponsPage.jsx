import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Sync as SyncIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import couponService from "../services/couponService";
import userService from "../services/userService";
import productCategoryService from "../services/productCategoryService";
import productService from "../services/productService";
import CouponForm from "../components/CouponForm";

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Xử lý refresh khi thay đổi trang hoặc số lượng hiển thị
  useEffect(() => {
    fetchCoupons();
  }, [page, rowsPerPage, status, refreshTrigger]);

  // Fetch dữ liệu dropdown cho form
  useEffect(() => {
    if (openForm) {
      fetchUsers();
      fetchCategories();
      fetchProducts();
    }
  }, [openForm]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await userService.getAllUsers(0, 100);
      console.log("Dữ liệu users:", response);
      if (response && response.data && response.data.content) {
        // Trường hợp response có cấu trúc {success, data: {content: []}}
        setUsers(response.data.content || []);
      } else if (response && response.content) {
        // Trường hợp response có cấu trúc {content: []}
        setUsers(response.content || []);
      } else if (Array.isArray(response)) {
        // Trường hợp response là array trực tiếp
        setUsers(response);
      } else {
        console.error("Cấu trúc dữ liệu users không đúng định dạng:", response);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await productCategoryService.getAllCategories();
      console.log("Dữ liệu categories:", response);
      if (response && response.data) {
        // Trường hợp response có cấu trúc {success, data: []}
        setCategories(response.data || []);
      } else if (response && response.content) {
        // Trường hợp response có cấu trúc {content: []}
        setCategories(response.content || []);
      } else if (Array.isArray(response)) {
        // Trường hợp response là array trực tiếp
        setCategories(response);
      } else {
        console.error(
          "Cấu trúc dữ liệu categories không đúng định dạng:",
          response
        );
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await productService.getAllProducts(0, 100);
      console.log("Dữ liệu products:", response);
      if (response && response.data && response.data.content) {
        // Trường hợp response có cấu trúc {success, data: {content: []}}
        setProducts(response.data.content || []);
      } else if (response && response.content) {
        // Trường hợp response có cấu trúc {content: []}
        setProducts(response.content || []);
      } else if (Array.isArray(response)) {
        // Trường hợp response là array trực tiếp
        setProducts(response);
      } else {
        console.error(
          "Cấu trúc dữ liệu products không đúng định dạng:",
          response
        );
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Đang gọi API getAllCoupons với status:", status);
      const response = await couponService.getAllCoupons(
        page,
        rowsPerPage,
        status
      );
      console.log("Kết quả trả về từ API:", response);

      if (response.success) {
        console.log("Danh sách mã giảm giá:", response.data.content);
        setCoupons(response.data.content || []);
        setTotalElements(response.data.totalElements || 0);
      } else {
        setError(response.message || "Failed to fetch coupons");
        enqueueSnackbar("Không thể tải danh sách mã giảm giá", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setError(error.message || "Failed to fetch coupons");
      enqueueSnackbar("Không thể tải danh sách mã giảm giá", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddClick = () => {
    setSelectedCoupon(null);
    setOpenForm(true);
  };

  const handleEditClick = (coupon) => {
    setSelectedCoupon(coupon);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedCoupon(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(0); // Reset to first page when changing status filter
  };

  const handleFormSubmit = async (couponData) => {
    try {
      let response;
      if (selectedCoupon) {
        // Cập nhật mã giảm giá
        response = await couponService.updateCoupon(
          selectedCoupon.id,
          couponData
        );
        if (response.success) {
          enqueueSnackbar("Cập nhật mã giảm giá thành công", {
            variant: "success",
          });
        } else {
          enqueueSnackbar(response.message || "Lỗi khi cập nhật mã giảm giá", {
            variant: "error",
          });
          return;
        }
      } else {
        // Tạo mã giảm giá mới
        response = await couponService.createCoupon(couponData);
        if (response.success) {
          enqueueSnackbar("Tạo mã giảm giá thành công", { variant: "success" });
        } else {
          enqueueSnackbar(response.message || "Lỗi khi tạo mã giảm giá", {
            variant: "error",
          });
          return;
        }
      }

      setOpenForm(false);
    } catch (error) {
      enqueueSnackbar(error.message || "Có lỗi xảy ra", { variant: "error" });
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này không?")) {
      try {
        const response = await couponService.deleteCoupon(id);
        if (response.success) {
          enqueueSnackbar("Xóa mã giảm giá thành công", { variant: "success" });
        } else {
          enqueueSnackbar(response.message || "Lỗi khi xóa mã giảm giá", {
            variant: "error",
          });
        }
      } catch (error) {
        enqueueSnackbar(error.message || "Có lỗi xảy ra khi xóa mã giảm giá", {
          variant: "error",
        });
      }
    }
  };

  const handleCopyCouponCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        enqueueSnackbar("Đã sao chép mã giảm giá vào clipboard", {
          variant: "success",
        });
      })
      .catch(() => {
        enqueueSnackbar("Không thể sao chép mã giảm giá", { variant: "error" });
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      // Xử lý trường hợp dateString là mảng (định dạng từ Java LocalDateTime)
      if (Array.isArray(dateString)) {
        // Mảng có dạng [năm, tháng, ngày, giờ, phút, giây]
        const date = new Date(
          dateString[0], // năm
          dateString[1] - 1, // tháng (0-11)
          dateString[2], // ngày
          dateString[3] || 0, // giờ
          dateString[4] || 0, // phút
          dateString[5] || 0 // giây
        );
        return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
      }

      // Xử lý trường hợp thông thường
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      console.error("Lỗi khi định dạng ngày:", dateString, error);
      return "Invalid Date";
    }
  };

  const getStatusChip = (coupon) => {
    // Nếu trạng thái được định nghĩa rõ ràng từ backend
    if (coupon.status === "expired") {
      return <Chip label="Đã hết hạn" color="error" size="small" />;
    }

    if (coupon.status === "disabled") {
      return <Chip label="Đã vô hiệu" color="warning" size="small" />;
    }

    if (coupon.status === "active") {
      // Kiểm tra thêm nếu trong trạng thái active nhưng thực tế đã hết hạn
      const now = new Date();
      const endDate = new Date(coupon.endDate);

      if (endDate < now) {
        return <Chip label="Đã hết hạn" color="error" size="small" />;
      }

      // Kiểm tra nếu đã sử dụng hết lượt
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return <Chip label="Đã hết lượt" color="warning" size="small" />;
      }

      // Kiểm tra nếu chưa đến thời gian bắt đầu
      const startDate = new Date(coupon.startDate);
      if (startDate > now) {
        return <Chip label="Sắp có hiệu lực" color="info" size="small" />;
      }

      // Nếu còn hiệu lực
      return <Chip label="Đang hoạt động" color="success" size="small" />;
    }

    // Fallback cho các trường hợp khác - kiểm tra dựa trên ngày và lượt sử dụng
    if (coupon.isExpired) {
      return <Chip label="Đã hết hạn" color="error" size="small" />;
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return <Chip label="Đã hết lượt" color="warning" size="small" />;
    }

    const now = new Date();
    const startDate = new Date(coupon.startDate);

    if (startDate > now) {
      return <Chip label="Sắp có hiệu lực" color="info" size="small" />;
    }

    return <Chip label="Đang hoạt động" color="success" size="small" />;
  };

  const getCouponTypeLabel = (type) => {
    switch (type) {
      case "PERCENTAGE":
        return "Giảm phần trăm";
      case "FIXED":
        return "Giảm số tiền cố định";
      case "FREE_SHIPPING":
        return "Miễn phí vận chuyển";
      default:
        return type;
    }
  };

  const getCouponDescription = (coupon) => {
    switch (coupon.type) {
      case "PERCENTAGE":
        return `Giảm ${coupon.discountPercentage}% (tối đa ${
          coupon.maxDiscount?.toLocaleString() || "∞"
        }đ)`;
      case "FIXED":
        return `Giảm ${coupon.maxDiscount?.toLocaleString()}đ`;
      case "FREE_SHIPPING":
        return "Miễn phí vận chuyển";
      default:
        return "";
    }
  };

  const filteredCoupons = coupons.filter(
    (coupon) =>
      searchTerm === "" ||
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.specificUserId &&
        String(coupon.specificUserId).includes(searchTerm)) ||
      (coupon.specificCategoryId &&
        String(coupon.specificCategoryId).includes(searchTerm)) ||
      (coupon.specificProductId &&
        String(coupon.specificProductId).includes(searchTerm))
  );

  const handleSyncAllUsage = async () => {
    try {
      setLoading(true);
      const response = await couponService.syncAllCouponsUsage();

      if (response.success) {
        enqueueSnackbar("Đã đồng bộ số lần sử dụng cho tất cả mã giảm giá", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(
          response.message || "Không thể đồng bộ số lần sử dụng",
          {
            variant: "error",
          }
        );
      }
    } catch (error) {
      console.error("Error syncing usage count:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi đồng bộ số lần sử dụng", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCouponUsage = async (id) => {
    try {
      const response = await couponService.syncCouponUsage(id);

      if (response.success) {
        enqueueSnackbar("Đã đồng bộ số lần sử dụng cho mã giảm giá", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(
          response.message || "Không thể đồng bộ số lần sử dụng",
          {
            variant: "error",
          }
        );
      }
    } catch (error) {
      console.error(`Error syncing usage count for coupon ID ${id}:`, error);
      enqueueSnackbar("Đã xảy ra lỗi khi đồng bộ số lần sử dụng", {
        variant: "error",
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Quản lý mã giảm giá
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Tạo mã giảm giá mới
            </Button>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tìm kiếm mã giảm giá"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Nhập mã giảm giá..."
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={status}
                  onChange={handleStatusChange}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="expired">Đã hết hạn</MenuItem>
                  <MenuItem value="disabled">Đã vô hiệu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => setRefreshTrigger((prev) => prev + 1)}
              >
                Làm mới
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box mb={3} display="flex" justifyContent="flex-end">
          <Button
            variant="outlined"
            color="primary"
            onClick={handleSyncAllUsage}
            disabled={loading}
            startIcon={<SyncIcon />}
          >
            Đồng bộ số lần sử dụng
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã giảm giá</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell>Giá trị giảm</TableCell>
                    <TableCell>Áp dụng cho</TableCell>
                    <TableCell>Đơn hàng tối thiểu</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Sử dụng</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <CircularProgress size={30} />
                      </TableCell>
                    </TableRow>
                  ) : filteredCoupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        Không có mã giảm giá nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2" fontWeight="bold">
                              {coupon.code}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleCopyCouponCode(coupon.code)}
                              sx={{ ml: 1 }}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>{getCouponTypeLabel(coupon.type)}</TableCell>
                        <TableCell>{getCouponDescription(coupon)}</TableCell>
                        <TableCell>
                          {coupon.userSpecific && (
                            <Chip
                              label="Người dùng"
                              size="small"
                              color="primary"
                              sx={{ mr: 0.5 }}
                            />
                          )}
                          {coupon.categorySpecific && (
                            <Chip
                              label="Danh mục"
                              size="small"
                              color="success"
                              sx={{ mr: 0.5 }}
                            />
                          )}
                          {coupon.productSpecific && (
                            <Chip
                              label="Sản phẩm"
                              size="small"
                              color="info"
                              sx={{ mr: 0.5 }}
                            />
                          )}
                          {!coupon.userSpecific &&
                            !coupon.categorySpecific &&
                            !coupon.productSpecific && (
                              <Typography variant="body2">Tất cả</Typography>
                            )}
                        </TableCell>
                        <TableCell>
                          {coupon.minOrderValue?.toLocaleString() || 0}đ
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" display="block">
                            Từ: {formatDate(coupon.startDate)}
                          </Typography>
                          <Typography variant="body2" display="block">
                            Đến: {formatDate(coupon.endDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {coupon.usageCount || 0}/{coupon.usageLimit || "∞"}
                          {coupon.usageCount > 0 && (
                            <Typography
                              variant="caption"
                              display="block"
                              color="textSecondary"
                            >
                              * Mỗi người dùng chỉ tính 1 lần
                            </Typography>
                          )}
                          <Button
                            size="small"
                            onClick={() => handleSyncCouponUsage(coupon.id)}
                            sx={{ mt: 1 }}
                            startIcon={<SyncIcon fontSize="small" />}
                          >
                            Đồng bộ
                          </Button>
                        </TableCell>
                        <TableCell>{getStatusChip(coupon)}</TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            <IconButton
                              color="primary"
                              onClick={() => handleEditClick(coupon)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteCoupon(coupon.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
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
              count={totalElements}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Hiển thị"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} trên ${count}`
              }
            />
          </CardContent>
        </Card>
      </Box>

      <CouponForm
        open={openForm}
        handleClose={handleCloseForm}
        coupon={selectedCoupon}
        onSubmit={handleFormSubmit}
        users={users}
        categories={categories}
        products={products}
      />
    </Container>
  );
};

export default CouponsPage;
