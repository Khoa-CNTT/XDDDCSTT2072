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
  FormControlLabel,
  Switch,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import subscriptionPlanService from "../services/subscriptionPlanService";

const SubscriptionPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    durationMonths: 1,
    maxLocations: 1,
    isActive: true,
    isFree: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionPlanService.getAllPlans();
      setPlans(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gói đăng ký:", error);
      setError("Không thể tải danh sách gói đăng ký. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenEditDialog = (plan = null) => {
    if (plan) {
      setSelectedPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || "",
        price: plan.price,
        durationMonths: plan.durationMonths,
        maxLocations: plan.maxLocations,
        isActive: plan.isActive,
        isFree: plan.isFree,
      });
    } else {
      setSelectedPlan(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        durationMonths: 1,
        maxLocations: 1,
        isActive: true,
        isFree: false,
      });
    }
    setFormErrors({});
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedPlan(null);
    setFormErrors({});
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    // Xóa lỗi khi người dùng chỉnh sửa trường
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Tên gói đăng ký không được để trống";
    }

    if (formData.price < 0) {
      errors.price = "Giá gói đăng ký không được âm";
    }

    if (formData.durationMonths < 1) {
      errors.durationMonths = "Thời hạn gói đăng ký phải lớn hơn 0";
    }

    if (formData.maxLocations < 1) {
      errors.maxLocations = "Số lượng địa điểm tối đa phải lớn hơn 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (selectedPlan) {
        // Cập nhật gói đăng ký hiện có
        await subscriptionPlanService.updatePlan(selectedPlan.id, formData);
        enqueueSnackbar("Cập nhật gói đăng ký thành công!", {
          variant: "success",
        });
      } else {
        // Tạo gói đăng ký mới
        await subscriptionPlanService.createPlan(formData);
        enqueueSnackbar("Tạo gói đăng ký mới thành công!", {
          variant: "success",
        });
      }
      handleCloseEditDialog();
      fetchPlans();
    } catch (error) {
      console.error("Lỗi khi lưu gói đăng ký:", error);
      enqueueSnackbar(
        error.response?.data ||
          "Đã xảy ra lỗi khi lưu gói đăng ký. Vui lòng thử lại sau.",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (plan) => {
    setSelectedPlan(plan);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      await subscriptionPlanService.deletePlan(selectedPlan.id);
      enqueueSnackbar("Xóa gói đăng ký thành công!", { variant: "success" });
      setOpenDeleteDialog(false);
      fetchPlans();
    } catch (error) {
      console.error("Lỗi khi xóa gói đăng ký:", error);
      enqueueSnackbar(
        error.response?.data ||
          "Đã xảy ra lỗi khi xóa gói đăng ký. Vui lòng thử lại sau.",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleToggleStatus = async (plan) => {
    setLoading(true);
    try {
      await subscriptionPlanService.togglePlanStatus(plan.id, !plan.isActive);
      enqueueSnackbar(
        `Gói đăng ký đã được ${
          !plan.isActive ? "kích hoạt" : "vô hiệu hóa"
        } thành công!`,
        { variant: "success" }
      );
      fetchPlans();
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái gói đăng ký:", error);
      enqueueSnackbar(
        error.response?.data ||
          "Đã xảy ra lỗi khi thay đổi trạng thái gói đăng ký. Vui lòng thử lại sau.",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.description &&
        plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format giá thành định dạng VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" sx={{ mt: 3, mb: 2 }}>
        Quản Lý Gói Đăng Ký
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={fetchPlans}
              >
                Làm mới
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => handleOpenEditDialog()}
              >
                Thêm mới
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
                  <TableCell>Tên gói</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell align="right">Giá</TableCell>
                  <TableCell align="center">Thời hạn (tháng)</TableCell>
                  <TableCell align="center">Số địa điểm tối đa</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center">Loại gói</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.id}</TableCell>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell>
                        {plan.description
                          ? plan.description.length > 50
                            ? `${plan.description.substring(0, 50)}...`
                            : plan.description
                          : ""}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(plan.price)}
                      </TableCell>
                      <TableCell align="center">
                        {plan.durationMonths}
                      </TableCell>
                      <TableCell align="center">{plan.maxLocations}</TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={plan.isActive ? <CheckIcon /> : <CloseIcon />}
                          label={
                            plan.isActive ? "Đang hoạt động" : "Vô hiệu hóa"
                          }
                          color={plan.isActive ? "success" : "error"}
                          onClick={() => handleToggleStatus(plan)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={plan.isFree ? "Miễn phí" : "Trả phí"}
                          color={plan.isFree ? "info" : "warning"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditDialog(plan)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(plan)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Không tìm thấy gói đăng ký nào
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
        <DialogTitle>Xác nhận xóa gói đăng ký</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa gói đăng ký &quot;{selectedPlan?.name}
            &quot;? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Xác nhận xóa"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog thêm/sửa gói đăng ký */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedPlan ? "Chỉnh sửa gói đăng ký" : "Thêm gói đăng ký mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên gói đăng ký"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Giá (VND)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                error={!!formErrors.price}
                helperText={formErrors.price}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₫</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Thời hạn (tháng)</InputLabel>
                <Select
                  name="durationMonths"
                  value={formData.durationMonths}
                  onChange={handleFormChange}
                  error={!!formErrors.durationMonths}
                  label="Thời hạn (tháng)"
                >
                  <MenuItem value={1}>1 tháng</MenuItem>
                  <MenuItem value={3}>3 tháng</MenuItem>
                  <MenuItem value={6}>6 tháng</MenuItem>
                  <MenuItem value={12}>12 tháng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Số địa điểm tối đa"
                name="maxLocations"
                type="number"
                value={formData.maxLocations}
                onChange={handleFormChange}
                error={!!formErrors.maxLocations}
                helperText={formErrors.maxLocations}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    name="isActive"
                  />
                }
                label="Gói đăng ký đang hoạt động"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFree}
                    onChange={handleFormChange}
                    name="isFree"
                  />
                }
                label="Gói miễn phí"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Hủy</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {loading ? <CircularProgress size={24} color="inherit" /> : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubscriptionPlansPage;
