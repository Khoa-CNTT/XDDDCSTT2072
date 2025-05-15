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
  FormControlLabel,
  Switch,
  Divider,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  PersonSearch as PersonSearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import weatherSubscriptionService from "../services/weatherSubscriptionService";
import userService from "../services/userService";
import weatherService from "../services/weatherService";

const WeatherSubscriptionsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchActiveSubscriptions();
    fetchLocations();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchUserId) {
      fetchUserSubscriptions(searchUserId);
    }
  }, [searchUserId]);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers(0, 100);
      setUsers(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await weatherService.getAllMonitoredLocations();
      setLocations(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách địa điểm:", error);
    }
  };

  const fetchActiveSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data =
        await weatherSubscriptionService.getActiveNotificationSubscriptions();
      setActiveSubscriptions(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đăng ký kích hoạt:", error);
      setError(
        "Không thể tải danh sách đăng ký kích hoạt. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscriptions = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherSubscriptionService.getUserSubscriptions(
        userId
      );
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0 && searchUserId) {
      fetchUserSubscriptions(searchUserId);
    } else if (newValue === 1) {
      fetchActiveSubscriptions();
    }
  };

  const handleSearch = () => {
    if (searchUserId.trim()) {
      fetchUserSubscriptions(searchUserId);
    } else {
      setError("Vui lòng nhập ID người dùng để tìm kiếm.");
    }
  };

  const handleUpdateNotificationStatus = async (
    userId,
    locationId,
    enableNotifications
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await weatherSubscriptionService.updateUserNotificationStatus(
        userId,
        locationId,
        enableNotifications
      );

      // Cập nhật state trực tiếp thay vì gọi lại API
      if (activeTab === 0) {
        setSubscriptions(
          subscriptions.map((sub) => {
            if (sub.userId === userId && sub.locationId === locationId) {
              return { ...sub, notificationsEnabled: enableNotifications };
            }
            return sub;
          })
        );
      } else {
        const updatedActiveSubscriptions = activeSubscriptions
          .map((sub) => {
            if (sub.userId === userId && sub.locationId === locationId) {
              return { ...sub, notificationsEnabled: enableNotifications };
            }
            return sub;
          })
          .filter(
            (sub) =>
              enableNotifications ||
              sub.userId !== userId ||
              sub.locationId !== locationId
          );

        setActiveSubscriptions(updatedActiveSubscriptions);
      }

      setSuccess(
        `Đã ${enableNotifications ? "bật" : "tắt"} thông báo thành công!`
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái thông báo:", error);
      setError(
        "Không thể cập nhật trạng thái thông báo. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (subscription) => {
    setSelectedSubscription(subscription);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubscription) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await weatherSubscriptionService.unsubscribeUserFromLocation(
        selectedSubscription.userId,
        selectedSubscription.locationId
      );

      // Cập nhật state trực tiếp thay vì gọi lại API
      if (activeTab === 0) {
        setSubscriptions(
          subscriptions.filter(
            (sub) =>
              sub.userId !== selectedSubscription.userId ||
              sub.locationId !== selectedSubscription.locationId
          )
        );
      }
      if (activeTab === 1) {
        setActiveSubscriptions(
          activeSubscriptions.filter(
            (sub) =>
              sub.userId !== selectedSubscription.userId ||
              sub.locationId !== selectedSubscription.locationId
          )
        );
      }

      setSuccess("Đã hủy đăng ký thành công!");
    } catch (error) {
      console.error("Lỗi khi hủy đăng ký:", error);
      setError("Không thể hủy đăng ký. Vui lòng thử lại sau.");
    } finally {
      setOpenDeleteDialog(false);
      setSelectedSubscription(null);
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.fullName : `Người dùng ID: ${userId}`;
  };

  const getLocationName = (locationId) => {
    const location = locations.find((l) => l.id === locationId);
    return location
      ? `${location.name} (${location.city}, ${location.country})`
      : `Địa điểm ID: ${locationId}`;
  };

  const filteredSubscriptions =
    activeTab === 0
      ? subscriptions.filter((sub) => {
          if (!searchTerm) return true;
          const userName = getUserName(sub.userId).toLowerCase();
          const locationName = getLocationName(sub.locationId).toLowerCase();
          return (
            userName.includes(searchTerm.toLowerCase()) ||
            locationName.includes(searchTerm.toLowerCase()) ||
            sub.userId.toString().includes(searchTerm) ||
            sub.locationId.toString().includes(searchTerm)
          );
        })
      : activeSubscriptions.filter((sub) => {
          if (!searchTerm) return true;
          const userName = getUserName(sub.userId).toLowerCase();
          const locationName = getLocationName(sub.locationId).toLowerCase();
          return (
            userName.includes(searchTerm.toLowerCase()) ||
            locationName.includes(searchTerm.toLowerCase()) ||
            sub.userId.toString().includes(searchTerm) ||
            sub.locationId.toString().includes(searchTerm)
          );
        });

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" sx={{ mt: 3, mb: 2 }}>
        Quản Lý Đăng Ký Theo Dõi Thời Tiết
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
          <Tab label="Đăng Ký Có Thông Báo" />
        </Tabs>
      </Paper>

      {/* Thanh tìm kiếm */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {activeTab === 0 && (
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="ID Người Dùng"
                variant="outlined"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch} edge="end">
                        <PersonSearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}
          <Grid item xs={12} md={activeTab === 0 ? 5 : 10}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên người dùng, địa điểm hoặc ID..."
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
              onClick={
                activeTab === 0 ? handleSearch : fetchActiveSubscriptions
              }
              startIcon={<RefreshIcon />}
            >
              {activeTab === 0 ? "Tìm kiếm" : "Làm mới"}
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
                  <TableCell>ID Người Dùng</TableCell>
                  <TableCell>Tên Người Dùng</TableCell>
                  <TableCell>ID Địa Điểm</TableCell>
                  <TableCell>Địa Điểm</TableCell>
                  <TableCell>Thông Báo</TableCell>
                  <TableCell>Thời Gian Đăng Ký</TableCell>
                  <TableCell align="center">Thao Tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((subscription) => (
                    <TableRow
                      key={`${subscription.userId}-${subscription.locationId}`}
                    >
                      <TableCell>{subscription.userId}</TableCell>
                      <TableCell>{getUserName(subscription.userId)}</TableCell>
                      <TableCell>{subscription.locationId}</TableCell>
                      <TableCell>
                        {getLocationName(subscription.locationId)}
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={subscription.notificationsEnabled}
                              onChange={(e) =>
                                handleUpdateNotificationStatus(
                                  subscription.userId,
                                  subscription.locationId,
                                  e.target.checked
                                )
                              }
                              color="primary"
                            />
                          }
                          label={
                            subscription.notificationsEnabled
                              ? "Đã bật"
                              : "Đã tắt"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(subscription.createdAt).toLocaleString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(subscription)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {activeTab === 0 && !searchUserId
                        ? "Vui lòng nhập ID người dùng để tìm kiếm đăng ký"
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
            Bạn có chắc chắn muốn hủy đăng ký theo dõi thời tiết này cho người
            dùng{" "}
            {selectedSubscription
              ? getUserName(selectedSubscription.userId)
              : ""}
            ?
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
    </Container>
  );
};

export default WeatherSubscriptionsPage;
