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
  Tabs,
  Tab,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  CardMembership as CardMembershipIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import userSubscriptionService from "../services/userSubscriptionService";
import subscriptionPlanService from "../services/subscriptionPlanService";
import userService from "../services/userService";

const UserSubscriptionsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    userId: "",
    planId: "",
    autoRenew: false,
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, []);

  useEffect(() => {
    if (activeTab === 0 && searchUserId) {
      fetchUserSubscriptions(searchUserId);
    } else if (activeTab === 1) {
      fetchAllSubscriptions();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
      enqueueSnackbar("Không thể tải danh sách người dùng", {
        variant: "error",
      });
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await subscriptionPlanService.getActivePlans();
      setPlans(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gói đăng ký:", error);
      enqueueSnackbar("Không thể tải danh sách gói đăng ký", {
        variant: "error",
      });
    }
  };

  const fetchUserSubscriptions = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userSubscriptionService.getUserSubscriptions(userId);
      setSubscriptions(data);
    } catch (error) {
      console.error(`Lỗi khi lấy đăng ký của người dùng ID ${userId}:`, error);
      setError(
        `Không thể tải danh sách đăng ký của người dùng ID ${userId}. Vui lòng thử lại sau.`
      );
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userSubscriptionService.getAllSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error("Lỗi khi lấy tất cả đăng ký:", error);
      setError("Không thể tải danh sách đăng ký. Vui lòng thử lại sau.");
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = () => {
    if (searchUserId.trim()) {
      fetchUserSubscriptions(searchUserId);
    } else {
      setError("Vui lòng nhập ID người dùng để tìm kiếm.");
    }
  };

  const handleDeleteClick = (subscription) => {
    setSelectedSubscription(subscription);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubscription) return;

    setLoading(true);
    try {
      await userSubscriptionService.cancelSubscription(selectedSubscription.id);

      // Cập nhật state trực tiếp thay vì gọi lại API
      setSubscriptions(
        subscriptions.filter((sub) => sub.id !== selectedSubscription.id)
      );

      enqueueSnackbar("Đã hủy đăng ký thành công!", { variant: "success" });
    } catch (error) {
      console.error("Lỗi khi hủy đăng ký:", error);
      enqueueSnackbar("Không thể hủy đăng ký. Vui lòng thử lại sau.", {
        variant: "error",
      });
    } finally {
      setOpenDeleteDialog(false);
      setSelectedSubscription(null);
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setNewSubscription({
      userId: searchUserId || "",
      planId: "",
      autoRenew: false,
    });
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddSubscription = async () => {
    if (!newSubscription.userId || !newSubscription.planId) {
      enqueueSnackbar("Vui lòng chọn người dùng và gói đăng ký", {
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      await userSubscriptionService.subscribeUserToPlan(
        newSubscription.userId,
        newSubscription.planId,
        newSubscription.autoRenew
      );

      enqueueSnackbar("Đăng ký gói thành công!", { variant: "success" });
      handleCloseAddDialog();

      // Cập nhật danh sách đăng ký
      if (searchUserId === newSubscription.userId) {
        fetchUserSubscriptions(newSubscription.userId);
      }

      // Cập nhật searchUserId nếu trước đó chưa có
      if (!searchUserId) {
        setSearchUserId(newSubscription.userId);
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký gói:", error);
      enqueueSnackbar(
        error.response?.data || "Không thể đăng ký gói. Vui lòng thử lại sau.",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleString("vi-VN");
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.fullName || user.userName : `Người dùng ID: ${userId}`;
  };

  const getPlanName = (planId) => {
    const plan = plans.find((p) => p.id === planId);
    return plan ? plan.name : `Gói ID: ${planId}`;
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (!searchTerm) return true;

    const userName = getUserName(sub.userId).toLowerCase();
    const planName = getPlanName(sub.planId).toLowerCase();

    return (
      userName.includes(searchTerm.toLowerCase()) ||
      planName.includes(searchTerm.toLowerCase()) ||
      sub.userId.toString().includes(searchTerm) ||
      sub.planId.toString().includes(searchTerm)
    );
  });

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" sx={{ mt: 3, mb: 2 }}>
        Quản Lý Đăng Ký Dịch Vụ
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Đăng Ký Theo Người Dùng" />
          <Tab label="Tất Cả Đăng Ký" />
        </Tabs>
      </Paper>

      {/* Thanh tìm kiếm */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {activeTab === 0 && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>ID Người Dùng</InputLabel>
                <Select
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  label="ID Người Dùng"
                >
                  <MenuItem value="">
                    <em>Chọn người dùng</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.fullName || user.userName} (ID: {user.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} md={activeTab === 0 ? 4 : 8}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên người dùng, gói đăng ký hoặc ID..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={activeTab === 0 ? handleSearch : fetchAllSubscriptions}
              startIcon={<RefreshIcon />}
              disabled={activeTab === 0 && !searchUserId}
            >
              {activeTab === 0 ? "Tìm kiếm" : "Làm mới"}
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Thêm mới
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Hiển thị thông báo */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* Bảng dữ liệu */}
      <Paper elevation={3}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Người Dùng</TableCell>
                  <TableCell>Gói Đăng Ký</TableCell>
                  <TableCell>Ngày Bắt Đầu</TableCell>
                  <TableCell>Ngày Kết Thúc</TableCell>
                  <TableCell>Số Địa Điểm</TableCell>
                  <TableCell>Số Dư</TableCell>
                  <TableCell>Thanh Toán</TableCell>
                  <TableCell>Trạng Thái</TableCell>
                  <TableCell align="center">Thao Tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>{subscription.id}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon fontSize="small" color="primary" />
                          {getUserName(subscription.userId)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CardMembershipIcon
                            fontSize="small"
                            color="primary"
                          />
                          {getPlanName(subscription.planId)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(subscription.startDate)}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(subscription.endDate)}
                      </TableCell>
                      <TableCell>
                        {subscription.locationsUsed}/{subscription.maxLocations}
                      </TableCell>
                      <TableCell>
                        {subscription.remainingLocations} địa điểm
                      </TableCell>
                      <TableCell>
                        {formatCurrency(subscription.paymentAmount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            subscription.isActive ? "Đang hoạt động" : "Đã hủy"
                          }
                          color={subscription.isActive ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(subscription)}
                          disabled={!subscription.isActive}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      {activeTab === 0 && !searchUserId
                        ? "Vui lòng chọn người dùng để tìm kiếm đăng ký"
                        : "Không tìm thấy đăng ký nào"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận hủy đăng ký</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn hủy đăng ký gói &quot;
            {getPlanName(selectedSubscription?.planId)}&quot; cho người dùng{" "}
            {getUserName(selectedSubscription?.userId)}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog thêm đăng ký mới */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Thêm đăng ký mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Người Dùng</InputLabel>
                <Select
                  value={newSubscription.userId}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
                      userId: e.target.value,
                    })
                  }
                  label="Người Dùng"
                >
                  <MenuItem value="">
                    <em>Chọn người dùng</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.fullName || user.userName} (ID: {user.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Gói Đăng Ký</InputLabel>
                <Select
                  value={newSubscription.planId}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
                      planId: e.target.value,
                    })
                  }
                  label="Gói Đăng Ký"
                >
                  <MenuItem value="">
                    <em>Chọn gói đăng ký</em>
                  </MenuItem>
                  {plans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name} - {formatCurrency(plan.price)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Hủy</Button>
          <Button
            onClick={handleAddSubscription}
            color="primary"
            variant="contained"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Đăng Ký"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserSubscriptionsPage;
