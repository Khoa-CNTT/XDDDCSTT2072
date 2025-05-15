import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  InputAdornment,
  FormHelperText,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";

const flashSaleStatuses = [
  { value: "UPCOMING", label: "Sắp diễn ra" },
  { value: "ACTIVE", label: "Đang diễn ra" },
  { value: "ENDED", label: "Đã kết thúc" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const initialState = {
  name: "",
  description: "",
  startDate: dayjs().add(1, "hour").toDate(),
  endDate: dayjs().add(1, "day").toDate(),
  status: "UPCOMING",
  discountPercentage: 10,
  maxDiscountAmount: 100000,
};

const FlashSaleForm = ({ open, onClose, flashSale, onSubmit }) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (flashSale) {
      setFormData({
        name: flashSale.name || "",
        description: flashSale.description || "",
        startDate: dayjs(flashSale.startDate).toDate(),
        endDate: dayjs(flashSale.endDate).toDate(),
        status: flashSale.status || "UPCOMING",
        discountPercentage: flashSale.discountPercentage || 10,
        maxDiscountAmount: flashSale.maxDiscountAmount || 100000,
      });
    } else {
      setFormData(initialState);
    }
    setErrors({});
  }, [flashSale, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi khi người dùng sửa trường có lỗi
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));

    // Xóa lỗi khi người dùng sửa trường có lỗi
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên không được để trống";
    }

    if (formData.description.trim().length > 1000) {
      newErrors.description = "Mô tả không được vượt quá 1000 ký tự";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Thời gian bắt đầu không được để trống";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Thời gian kết thúc không được để trống";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      dayjs(formData.startDate).isAfter(dayjs(formData.endDate))
    ) {
      newErrors.endDate = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }

    if (formData.discountPercentage < 1 || formData.discountPercentage > 100) {
      newErrors.discountPercentage = "Phần trăm giảm giá phải từ 1% đến 100%";
    }

    if (formData.maxDiscountAmount <= 0) {
      newErrors.maxDiscountAmount = "Số tiền giảm giá tối đa phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      enqueueSnackbar("Vui lòng kiểm tra lại thông tin", { variant: "error" });
      return;
    }

    // Chuẩn bị dữ liệu để gửi lên server
    const submissionData = {
      ...formData,
      startDate: dayjs(formData.startDate).format("YYYY-MM-DD HH:mm:ss"),
      endDate: dayjs(formData.endDate).format("YYYY-MM-DD HH:mm:ss"),
      discountPercentage: parseInt(formData.discountPercentage, 10),
      maxDiscountAmount: parseFloat(formData.maxDiscountAmount),
    };

    onSubmit(submissionData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {flashSale ? "Chỉnh sửa Flash Sale" : "Tạo Flash Sale mới"}
      </DialogTitle>
      <DialogContent>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Tên chương trình Flash Sale"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Mô tả"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Thời gian bắt đầu"
                  value={dayjs(formData.startDate)}
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

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Thời gian kết thúc"
                  value={dayjs(formData.endDate)}
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

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.status}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Trạng thái"
                >
                  {flashSaleStatuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="discountPercentage"
                label="Phần trăm giảm giá"
                type="number"
                fullWidth
                required
                value={formData.discountPercentage}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 1,
                  max: 100,
                }}
                error={!!errors.discountPercentage}
                helperText={errors.discountPercentage}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="maxDiscountAmount"
                label="Số tiền giảm giá tối đa"
                type="number"
                fullWidth
                required
                value={formData.maxDiscountAmount}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">VNĐ</InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 0,
                }}
                error={!!errors.maxDiscountAmount}
                helperText={errors.maxDiscountAmount}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                * Chú ý: Flash Sale sẽ được áp dụng cho tất cả sản phẩm được
                thêm vào. Bạn có thể quản lý các sản phẩm trong Flash Sale sau
                khi tạo.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {flashSale ? "Cập nhật" : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FlashSaleForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  flashSale: PropTypes.object,
};

export default FlashSaleForm;
