import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Paper,
  Slider,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const WeatherLocationForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    country: "",
    latitude: 0,
    longitude: 0,
    monitoringFrequency: 180,
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        city: initialData.city || "",
        country: initialData.country || "",
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        monitoringFrequency: initialData.monitoringFrequency || 180,
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSliderChange = (e, newValue) => {
    setFormData((prev) => ({
      ...prev,
      monitoringFrequency: newValue,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên địa điểm không được để trống";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Tên thành phố không được để trống";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Tên quốc gia không được để trống";
    }

    if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = "Vĩ độ phải nằm trong khoảng -90 đến 90";
    }

    if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = "Kinh độ phải nằm trong khoảng -180 đến 180";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlertInfo({
        show: true,
        message: "Vui lòng điền đầy đủ thông tin",
        severity: "error",
      });
      return;
    }

    try {
      await onSubmit(formData);
      setAlertInfo({
        show: true,
        message: `Đã ${initialData ? "cập nhật" : "tạo"} địa điểm thành công`,
        severity: "success",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        message: `Lỗi: ${error.message || "Không thể lưu địa điểm"}`,
        severity: "error",
      });
    }
  };

  const handleCloseAlert = () => {
    setAlertInfo((prev) => ({
      ...prev,
      show: false,
    }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          {initialData
            ? "Cập Nhật Địa Điểm Theo Dõi"
            : "Thêm Địa Điểm Theo Dõi Mới"}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Tên Địa Điểm"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Thành Phố"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={!!errors.city}
              helperText={errors.city}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Quốc Gia"
              name="country"
              value={formData.country}
              onChange={handleChange}
              error={!!errors.country}
              helperText={errors.country}
              margin="normal"
              placeholder="Nhập mã quốc gia (VN, US, ...)"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="number"
              label="Vĩ Độ"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              error={!!errors.latitude}
              helperText={errors.latitude || "Vĩ độ từ -90 đến 90"}
              margin="normal"
              inputProps={{ step: 0.000001, min: -90, max: 90 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="number"
              label="Kinh Độ"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              error={!!errors.longitude}
              helperText={errors.longitude || "Kinh độ từ -180 đến 180"}
              margin="normal"
              inputProps={{ step: 0.000001, min: -180, max: 180 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>
              Tần suất theo dõi (phút): {formData.monitoringFrequency}
            </Typography>
            <Slider
              value={formData.monitoringFrequency}
              onChange={handleSliderChange}
              min={30}
              max={1440}
              step={30}
              valueLabelDisplay="auto"
              marks={[
                { value: 30, label: "30p" },
                { value: 180, label: "3h" },
                { value: 720, label: "12h" },
                { value: 1440, label: "24h" },
              ]}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleSwitchChange}
                  name="isActive"
                  color="primary"
                />
              }
              label="Kích hoạt theo dõi"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <SaveIcon />
            }
            type="submit"
            disabled={isLoading}
          >
            {initialData ? "Cập Nhật" : "Thêm Mới"}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={alertInfo.show}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertInfo.severity}
          variant="filled"
        >
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

WeatherLocationForm.propTypes = {
  initialData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    city: PropTypes.string,
    country: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    monitoringFrequency: PropTypes.number,
    isActive: PropTypes.bool,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default WeatherLocationForm;
