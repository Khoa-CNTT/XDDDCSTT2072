import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { vi } from "date-fns/locale";
import { useSnackbar } from "notistack";

const initialCouponState = {
  code: "",
  type: "PERCENTAGE", // PERCENTAGE, FIXED, FREE_SHIPPING
  discountPercentage: "",
  maxDiscount: "",
  minOrderValue: "",
  startDate: new Date(),
  endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // Default: +30 days
  usageLimit: 100,
  userSpecific: false,
  specificUserId: "",
  categorySpecific: false,
  specificCategoryId: "",
  productSpecific: false,
  specificProductId: "",
};

const CouponForm = ({
  open,
  handleClose,
  coupon = null,
  onSubmit,
  users = [],
  categories = [],
  products = [],
}) => {
  const [formData, setFormData] = useState(initialCouponState);
  const [errors, setErrors] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Nếu có coupon được truyền vào, điền dữ liệu vào form
    if (coupon) {
      setFormData({
        ...coupon,
        startDate: coupon.startDate ? new Date(coupon.startDate) : new Date(),
        endDate: coupon.endDate
          ? new Date(coupon.endDate)
          : new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
      });
    } else {
      setFormData(initialCouponState);
    }

    setErrors({});

    // Debug dữ liệu
    console.log("Users data:", users);
    console.log("Categories data:", categories);
    console.log("Products data:", products);
  }, [coupon, open, users, categories, products]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Xóa lỗi khi người dùng sửa trường
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });

    // Xóa lỗi khi người dùng sửa trường
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code || formData.code.trim() === "") {
      newErrors.code = "Mã giảm giá không được để trống";
    }

    if (!formData.type) {
      newErrors.type = "Loại giảm giá không được để trống";
    }

    if (formData.type === "PERCENTAGE") {
      if (!formData.discountPercentage) {
        newErrors.discountPercentage = "Tỉ lệ giảm giá không được để trống";
      } else if (
        parseFloat(formData.discountPercentage) <= 0 ||
        parseFloat(formData.discountPercentage) > 100
      ) {
        newErrors.discountPercentage =
          "Tỉ lệ giảm giá phải nằm trong khoảng 0.01 - 100%";
      }
    }

    if (!formData.minOrderValue) {
      newErrors.minOrderValue =
        "Giá trị đơn hàng tối thiểu không được để trống";
    } else if (parseFloat(formData.minOrderValue) < 0) {
      newErrors.minOrderValue = "Giá trị đơn hàng tối thiểu không được âm";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu không được để trống";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc không được để trống";
    } else if (
      formData.startDate &&
      formData.endDate &&
      formData.endDate <= formData.startDate
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (!formData.usageLimit || formData.usageLimit <= 0) {
      newErrors.usageLimit = "Giới hạn sử dụng phải lớn hơn 0";
    }

    if (formData.userSpecific && !formData.specificUserId) {
      newErrors.specificUserId = "Vui lòng chọn người dùng";
    }

    if (formData.categorySpecific && !formData.specificCategoryId) {
      newErrors.specificCategoryId = "Vui lòng chọn danh mục";
    }

    if (formData.productSpecific && !formData.specificProductId) {
      newErrors.specificProductId = "Vui lòng chọn sản phẩm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      enqueueSnackbar("Vui lòng kiểm tra lại thông tin mã giảm giá", {
        variant: "error",
      });
      return;
    }

    // Xử lý dữ liệu trước khi gửi
    const submissionData = {
      ...formData,
      discountPercentage:
        formData.type === "PERCENTAGE"
          ? parseFloat(formData.discountPercentage)
          : 0.01, // Gửi 0.01 thay vì 0 để thỏa mãn validation > 0
      maxDiscount: formData.maxDiscount
        ? parseFloat(formData.maxDiscount)
        : null,
      minOrderValue: parseFloat(formData.minOrderValue),
      usageLimit: parseInt(formData.usageLimit),
      specificUserId: formData.userSpecific
        ? parseInt(formData.specificUserId)
        : null,
      specificCategoryId: formData.categorySpecific
        ? parseInt(formData.specificCategoryId)
        : null,
      specificProductId: formData.productSpecific
        ? parseInt(formData.specificProductId)
        : null,
    };

    onSubmit(submissionData);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {coupon ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá mới"}
      </DialogTitle>

      <DialogContent>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                name="code"
                label="Mã giảm giá"
                fullWidth
                required
                value={formData.code}
                onChange={handleChange}
                error={!!errors.code}
                helperText={errors.code}
                placeholder="VD: SUMMER2023"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.type}>
                <InputLabel>Loại giảm giá</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Loại giảm giá"
                >
                  <MenuItem value="PERCENTAGE">Giảm theo phần trăm</MenuItem>
                  <MenuItem value="FIXED">Giảm số tiền cố định</MenuItem>
                  <MenuItem value="FREE_SHIPPING">Miễn phí vận chuyển</MenuItem>
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>

            {formData.type === "PERCENTAGE" && (
              <Grid item xs={12} md={6}>
                <TextField
                  name="discountPercentage"
                  label="Tỉ lệ giảm giá (%)"
                  fullWidth
                  required
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  value={formData.discountPercentage}
                  onChange={handleChange}
                  error={!!errors.discountPercentage}
                  helperText={errors.discountPercentage}
                  inputProps={{ min: 0.01, max: 100, step: 0.01 }}
                />
              </Grid>
            )}

            {(formData.type === "PERCENTAGE" || formData.type === "FIXED") && (
              <Grid item xs={12} md={6}>
                <TextField
                  name="maxDiscount"
                  label={
                    formData.type === "PERCENTAGE"
                      ? "Giảm tối đa"
                      : "Số tiền giảm"
                  }
                  fullWidth
                  required={formData.type === "FIXED"}
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">đ</InputAdornment>
                    ),
                  }}
                  value={formData.maxDiscount}
                  onChange={handleChange}
                  error={!!errors.maxDiscount}
                  helperText={errors.maxDiscount}
                  inputProps={{ min: 0, step: 1000 }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                name="minOrderValue"
                label="Giá trị đơn hàng tối thiểu"
                fullWidth
                required
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">đ</InputAdornment>
                  ),
                }}
                value={formData.minOrderValue}
                onChange={handleChange}
                error={!!errors.minOrderValue}
                helperText={errors.minOrderValue}
                inputProps={{ min: 0, step: 1000 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="usageLimit"
                label="Giới hạn sử dụng"
                fullWidth
                required
                type="number"
                value={formData.usageLimit}
                onChange={handleChange}
                error={!!errors.usageLimit}
                helperText={
                  errors.usageLimit || "Số lần mã giảm giá có thể được sử dụng"
                }
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={vi}
              >
                <DateTimePicker
                  label="Ngày bắt đầu"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange("startDate", date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.startDate,
                      helperText: errors.startDate,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={vi}
              >
                <DateTimePicker
                  label="Ngày kết thúc"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange("endDate", date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.endDate,
                      helperText: errors.endDate,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Điều kiện áp dụng
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.userSpecific}
                    onChange={handleChange}
                    name="userSpecific"
                  />
                }
                label="Áp dụng cho người dùng cụ thể"
              />

              {formData.userSpecific && (
                <FormControl
                  fullWidth
                  sx={{ mt: 2 }}
                  error={!!errors.specificUserId}
                >
                  <InputLabel>Người dùng</InputLabel>
                  <Select
                    name="specificUserId"
                    value={formData.specificUserId}
                    onChange={handleChange}
                    label="Người dùng"
                    sx={{
                      minWidth: "100%",
                      maxWidth: "100%",
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                      slotProps: {
                        paper: {
                          sx: {
                            width: "auto",
                            minWidth: "250px",
                          },
                        },
                      },
                    }}
                  >
                    {users.length === 0 ? (
                      <MenuItem disabled>Không có dữ liệu</MenuItem>
                    ) : (
                      users.map((user) => (
                        <MenuItem
                          key={user.id || user.userId || user._id}
                          value={user.id || user.userId || user._id}
                          sx={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            py: 1.5,
                            px: 2,
                          }}
                        >
                          {user.username ||
                            user.userName ||
                            user.fullName ||
                            user.name ||
                            "Người dùng"}
                          {user.email ? ` (${user.email})` : ""}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.specificUserId && (
                    <FormHelperText>{errors.specificUserId}</FormHelperText>
                  )}
                </FormControl>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.categorySpecific}
                    onChange={handleChange}
                    name="categorySpecific"
                  />
                }
                label="Áp dụng cho danh mục cụ thể"
              />

              {formData.categorySpecific && (
                <FormControl
                  fullWidth
                  sx={{ mt: 2 }}
                  error={!!errors.specificCategoryId}
                >
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    name="specificCategoryId"
                    value={formData.specificCategoryId}
                    onChange={handleChange}
                    label="Danh mục"
                    sx={{
                      minWidth: "100%",
                      maxWidth: "100%",
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                      slotProps: {
                        paper: {
                          sx: {
                            width: "auto",
                            minWidth: "250px",
                          },
                        },
                      },
                    }}
                  >
                    {categories.length === 0 ? (
                      <MenuItem disabled>Không có dữ liệu</MenuItem>
                    ) : (
                      categories.map((category) => (
                        <MenuItem
                          key={
                            category.id || category.categoryId || category._id
                          }
                          value={
                            category.id || category.categoryId || category._id
                          }
                          sx={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            py: 1.5,
                            px: 2,
                          }}
                        >
                          {category.name ||
                            category.categoryName ||
                            category.title ||
                            "Danh mục"}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.specificCategoryId && (
                    <FormHelperText>{errors.specificCategoryId}</FormHelperText>
                  )}
                </FormControl>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.productSpecific}
                    onChange={handleChange}
                    name="productSpecific"
                  />
                }
                label="Áp dụng cho sản phẩm cụ thể"
              />

              {formData.productSpecific && (
                <FormControl
                  fullWidth
                  sx={{ mt: 2 }}
                  error={!!errors.specificProductId}
                >
                  <InputLabel>Sản phẩm</InputLabel>
                  <Select
                    name="specificProductId"
                    value={formData.specificProductId}
                    onChange={handleChange}
                    label="Sản phẩm"
                    sx={{
                      minWidth: "100%",
                      maxWidth: "100%",
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                      slotProps: {
                        paper: {
                          sx: {
                            width: "auto",
                            minWidth: "250px",
                          },
                        },
                      },
                    }}
                  >
                    {products.length === 0 ? (
                      <MenuItem disabled>Không có dữ liệu</MenuItem>
                    ) : (
                      products.map((product) => (
                        <MenuItem
                          key={product.id || product.productId || product._id}
                          value={product.id || product.productId || product._id}
                          sx={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            py: 1.5,
                            px: 2,
                          }}
                        >
                          {product.productName ||
                            product.name ||
                            product.title ||
                            "Sản phẩm"}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.specificProductId && (
                    <FormHelperText>{errors.specificProductId}</FormHelperText>
                  )}
                </FormControl>
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} color="error">
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {coupon ? "Cập nhật" : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CouponForm;
