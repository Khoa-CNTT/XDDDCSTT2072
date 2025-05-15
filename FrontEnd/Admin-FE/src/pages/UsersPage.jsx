import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Pagination,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  AddAPhoto,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import userService from "../services/userService";

// Dữ liệu giả để test giao diện
const mockUsers = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    email: "admin@example.com",
    phone: "0123456789",
    role: "Admin",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    avatarUrl: "/assets/images/avatar-placeholder.jpg",
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    email: "user1@example.com",
    phone: "0987654321",
    role: "User",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    avatarUrl: "/assets/images/avatar-placeholder.jpg",
  },
  {
    id: 3,
    fullName: "Lê Văn C",
    email: "user2@example.com",
    phone: "0909123456",
    role: "User",
    status: "INACTIVE",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    avatarUrl: "/assets/images/avatar-placeholder.jpg",
  },
];

const UsersPage = () => {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "User",
    status: "ACTIVE",
    userName: "",
    image: null,
    avatarUrl: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Thử gọi API thực
      let usersData = [];
      let totalCount = 0;

      try {
        const response = await userService.getAllUsers(page - 1, rowsPerPage);
        console.log("API Response:", response); // Debug log

        if (Array.isArray(response)) {
          // Trường hợp API trả về mảng trực tiếp
          usersData = response;
          totalCount = response.length;
        } else if (response && response.content) {
          // Trường hợp API trả về dữ liệu phân trang
          usersData = response.content;
          totalCount = response.totalElements || response.content.length;
        }
      } catch (apiError) {
        console.warn("API error, using mock data instead:", apiError);
        // Nếu API không hoạt động, dùng dữ liệu giả
        usersData = mockUsers;
        totalCount = mockUsers.length;
      }

      // Kiểm tra nếu dữ liệu vẫn trống, dùng dữ liệu giả
      if (!usersData || usersData.length === 0) {
        console.log("No users returned from API, using mock data");
        usersData = mockUsers;
        totalCount = mockUsers.length;
      }

      // Cập nhật state
      setUsers(usersData);
      setTotalItems(totalCount);
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải danh sách người dùng. Vui lòng thử lại!",
        severity: "error",
      });

      // Sử dụng dữ liệu giả khi có lỗi
      setUsers(mockUsers);
      setTotalItems(mockUsers.length);
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination changes
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Load users on page load and when page/rowsPerPage changes
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => {
      // Nếu thay đổi fullName, cập nhật luôn userName
      if (name === "fullName") {
        return {
          ...prev,
          [name]: value,
          userName: value, // Đồng bộ userName theo fullName
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        setUserForm((prev) => ({
          ...prev,
          image: selectedFile,
          avatarUrl: event.target.result,
        }));
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  // Open dialog to add new user
  const handleAddUser = () => {
    setSelectedUser(null);
    setUserForm({
      fullName: "",
      email: "",
      password: "",
      phone: "",
      role: "User",
      status: "ACTIVE",
      userName: "",
      image: null,
      avatarUrl: "",
    });
    setOpenDialog(true);
  };

  // Open dialog to edit user
  const handleEditUser = async (id) => {
    try {
      setLoading(true);
      const userData = await userService.getUserById(id);
      setSelectedUser(userData);
      setUserForm({
        fullName: userData.fullName || "",
        email: userData.email || "",
        password: "", // Không hiển thị mật khẩu khi chỉnh sửa
        phone: userData.phone || "",
        role: userData.role || "User",
        status: userData.status || "ACTIVE",
        userName: userData.userName || userData.fullName || "",
        image: null,
        avatarUrl: userData.avatarUrl || "",
      });
      setOpenDialog(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải thông tin người dùng. Vui lòng thử lại!",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open dialog to confirm user deletion
  const handleDeleteDialog = (id) => {
    setSelectedUser({ id });
    setOpenDeleteDialog(true);
  };

  // Submit form to create or update user
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (
        !userForm.fullName ||
        !userForm.email ||
        (!selectedUser && !userForm.password)
      ) {
        setSnackbar({
          open: true,
          message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      // Form data to submit
      const formData = new FormData();

      // Append text fields
      Object.keys(userForm).forEach((key) => {
        if (key !== "image" && key !== "avatarUrl") {
          formData.append(key, userForm[key]);
        }
      });

      // Append image if exists
      if (userForm.image) {
        formData.append("image", userForm.image);
      }

      // Create or update user
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, userForm);
        setSnackbar({
          open: true,
          message: "Cập nhật người dùng thành công!",
          severity: "success",
        });
      } else {
        await userService.createUser(formData);
        setSnackbar({
          open: true,
          message: "Thêm người dùng mới thành công!",
          severity: "success",
        });
      }

      // Close dialog and refresh user list
      setOpenDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      let errorMessage =
        "Không thể lưu thông tin người dùng. Vui lòng thử lại!";

      // Xử lý các trường hợp lỗi từ API
      if (error.response?.data) {
        if (typeof error.response.data === "object") {
          // Trường hợp lỗi trả về là object với các trường lỗi
          const errorDetails = Object.entries(error.response.data)
            .map(([, msg]) => `${msg}`)
            .join("; ");

          if (errorDetails) {
            errorMessage = errorDetails;
          }
        } else if (error.response.data.message) {
          // Trường hợp lỗi có trường message
          errorMessage = error.response.data.message;
        }
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await userService.deleteUser(selectedUser.id);
      setSnackbar({
        open: true,
        message: "Xóa người dùng thành công!",
        severity: "success",
      });
      setOpenDeleteDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbar({
        open: true,
        message: "Không thể xóa người dùng. Vui lòng thử lại!",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mx: 2,
          mt: 1,
          mb: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { sm: "100%" },
            justifyContent: { xs: "flex-start", sm: "center" },
          }}
        >
          {/* Pagination Top */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Pagination
              count={Math.ceil(totalItems / rowsPerPage) || 1}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="small"
              showFirstButton
              showLastButton
              siblingCount={0}
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 1,
                  minWidth: "30px",
                  height: "26px",
                },
              }}
            />
          </Box>
        </Box>

        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon sx={{ fontSize: "0.9rem" }} />}
            onClick={handleAddUser}
            size="small"
            sx={{
              py: 0.5,
              px: 1.5,
              minWidth: "150px",
              height: "28px",
              borderRadius: "16px",
              boxShadow: "0 2px 5px rgba(25, 118, 210, 0.2)",
              fontSize: "0.75rem",
              fontWeight: 500,
              textTransform: "none",
              whiteSpace: "nowrap",
              lineHeight: 1,
              "&:hover": {
                boxShadow: "0 3px 7px rgba(25, 118, 210, 0.3)",
                backgroundColor: "#1565c0",
              },
            }}
          >
            Thêm người dùng
          </Button>
        </Box>
      </Box>

      <Paper
        sx={{
          width: "100%",
          p: 2,
          pt: 1.5,
          pb: 1,
          borderRadius: 0,
          boxShadow: "0 1px 8px rgba(0,0,0,0.1)",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography variant="h6" sx={{ ml: 0.5 }}>
            Danh sách người dùng ({totalItems})
          </Typography>

          {/* Responsive Pagination - Show on mobile/small screens */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <Pagination
              count={Math.ceil(totalItems / rowsPerPage) || 1}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="small"
              siblingCount={0}
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 1,
                  minWidth: "28px",
                  height: "28px",
                  margin: "0 1px",
                },
                "& .Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                },
              }}
            />
          </Box>
        </Box>

        {loading && users.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {users.map((user) => (
              <Grid item xs={12} sm={6} md={3} lg={3} key={user.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    "&:hover": {
                      boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent
                    sx={{ p: 2, pb: 1, textAlign: "center", flexGrow: 0 }}
                  >
                    <Avatar
                      src={user.avatarUrl || "https://i.pravatar.cc/150?img=3"}
                      alt={user.fullName}
                      sx={{
                        width: 60,
                        height: 60,
                        mb: 1,
                        mx: "auto",
                        border: "1px solid #f0f0f0",
                      }}
                    />
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontSize: "0.95rem", fontWeight: 600, mb: 0.5 }}
                    >
                      {user.fullName}
                    </Typography>

                    <Box sx={{ opacity: 0.7, mb: 1 }}>
                      {user.role === "Admin" ? (
                        <Chip
                          label="ADMIN"
                          size="small"
                          color="primary"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      ) : (
                        <Box sx={{ height: 20 }} />
                      )}
                    </Box>

                    <Divider sx={{ mx: -2, mb: 1.5 }} />

                    <Box sx={{ textAlign: "left", px: 0.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <EmailIcon
                          fontSize="small"
                          color="action"
                          sx={{ mr: 0.5, fontSize: "0.9rem" }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: "0.8rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "calc(100% - 20px)",
                          }}
                        >
                          {user.email}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <PhoneIcon
                          fontSize="small"
                          color="action"
                          sx={{ mr: 0.5, fontSize: "0.9rem" }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.8rem" }}
                        >
                          {user.phone || "-"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions
                    sx={{
                      justifyContent: "center",
                      p: 0.5,
                      pt: 0,
                      mt: 0,
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <IconButton
                      color="info"
                      onClick={() => handleEditUser(user.id)}
                      title="Xem chi tiết"
                      size="small"
                      sx={{ padding: "4px" }}
                    >
                      <VisibilityIcon sx={{ fontSize: "1rem" }} />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditUser(user.id)}
                      title="Chỉnh sửa"
                      size="small"
                      sx={{ padding: "4px" }}
                    >
                      <EditIcon sx={{ fontSize: "1rem" }} />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteDialog(user.id)}
                      title="Xóa"
                      size="small"
                      sx={{ padding: "4px" }}
                    >
                      <DeleteIcon sx={{ fontSize: "1rem" }} />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}

            {users.length === 0 && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    backgroundColor: "rgba(0,0,0,0.02)",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Không có dữ liệu
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Chưa có thông tin người dùng nào trong hệ thống.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Paper>

      {/* Dialog for add/edit user */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Avatar upload */}
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  src={
                    userForm.avatarUrl ||
                    "/assets/images/avatar-placeholder.jpg"
                  }
                  alt="User avatar"
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 2,
                    border: "1px solid #eee",
                  }}
                />
                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: -10,
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  }}
                >
                  <AddAPhoto sx={{ fontSize: "1.2rem" }} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="fullName"
                label="Họ và tên"
                value={userForm.fullName}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={userForm.email}
                onChange={handleFormChange}
                fullWidth
                required
                disabled={!!selectedUser}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                label={
                  selectedUser
                    ? "Mật khẩu mới (để trống nếu không thay đổi)"
                    : "Mật khẩu"
                }
                type="password"
                value={userForm.password}
                onChange={handleFormChange}
                fullWidth
                required={!selectedUser}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Số điện thoại"
                value={userForm.phone}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  name="role"
                  value={userForm.role}
                  onChange={handleFormChange}
                  label="Vai trò"
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  name="status"
                  value={userForm.status}
                  onChange={handleFormChange}
                  label="Trạng thái"
                >
                  <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
                  <MenuItem value="LOCKED">Đã khóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for delete confirmation */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không
            thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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

export default UsersPage;
