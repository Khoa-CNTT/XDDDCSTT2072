import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Switch,
  FormControlLabel,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import { CloudUpload, Clear } from "@mui/icons-material";
import productCategoryService from "../services/productCategoryService";

const CategoryForm = ({ initialData, onSubmit, onCancel }) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    isActive: true,
    displayOrder: 0,
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [image, setImage] = useState(null);

  // Lấy danh sách danh mục cho dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productCategoryService.getAllCategories();
        // Lọc ra danh mục hiện tại (nếu đang ở chế độ edit) để tránh chọn chính nó làm cha
        const filteredCategories = isEditMode
          ? data.filter((cat) => cat.id !== initialData.id)
          : data;
        setCategories(filteredCategories);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };

    fetchCategories();

    // Nếu đang ở chế độ edit và có url ảnh, hiển thị ảnh đó
    if (isEditMode && initialData.imageUrl) {
      setPreviewImage(initialData.imageUrl);
    }
  }, [isEditMode, initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Xóa lỗi nếu có
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước và loại file
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Kích thước file không được vượt quá 5MB",
        }));
        return;
      }

      // Kiểm tra định dạng file
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)",
        }));
        return;
      }

      setImage(file);
      setPreviewImage(URL.createObjectURL(file));

      // Xóa lỗi nếu có
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: null }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Tên danh mục không được để trống";
    }

    // Kiểm tra các trường bắt buộc khác nếu cần

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataObj = new FormData();

      // Thêm các trường thông tin
      formDataObj.append("name", formData.name);

      if (formData.description) {
        formDataObj.append("description", formData.description);
      }

      if (formData.parentId) {
        formDataObj.append("parentId", formData.parentId);
      }

      formDataObj.append("isActive", formData.isActive);
      formDataObj.append("displayOrder", formData.displayOrder || 0);

      // Thêm hình ảnh nếu có
      if (image) {
        formDataObj.append("image", image);
      }

      await onSubmit(formDataObj);
    } catch (error) {
      console.error("Lỗi khi gửi form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Tên danh mục"
            name="name"
            value={formData.name || ""}
            onChange={handleInputChange}
            required
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={formData.description || ""}
            onChange={handleInputChange}
            multiline
            rows={4}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="parent-category-label">Danh mục cha</InputLabel>
            <Select
              labelId="parent-category-label"
              name="parentId"
              value={formData.parentId || ""}
              onChange={handleInputChange}
              label="Danh mục cha"
            >
              <MenuItem value="">
                <em>Không có (là danh mục gốc)</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Chọn danh mục cha nếu đây là danh mục con
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Thứ tự hiển thị"
            name="displayOrder"
            type="number"
            value={formData.displayOrder || 0}
            onChange={handleInputChange}
            InputProps={{ inputProps: { min: 0 } }}
            helperText="Số nhỏ hơn sẽ hiển thị trước"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive || false}
                onChange={handleInputChange}
                name="isActive"
                color="primary"
              />
            }
            label="Hiển thị danh mục"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Hình ảnh danh mục
          </Typography>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 150,
              border: errors.image ? "1px solid red" : "none",
            }}
          >
            {previewImage ? (
              <Box sx={{ position: "relative", width: "100%", maxWidth: 300 }}>
                <img
                  src={previewImage}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                  }}
                  onClick={() => {
                    setPreviewImage("");
                    setImage(null);
                  }}
                >
                  <Clear />
                </IconButton>
              </Box>
            ) : (
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ mt: 2 }}
              >
                Tải lên hình ảnh
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
            )}
            {errors.image && (
              <FormHelperText error>{errors.image}</FormHelperText>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading
            ? "Đang xử lý..."
            : isEditMode
            ? "Cập nhật danh mục"
            : "Tạo danh mục"}
        </Button>
      </Box>
    </Box>
  );
};

CategoryForm.propTypes = {
  initialData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    parentId: PropTypes.number,
    parentName: PropTypes.string,
    isActive: PropTypes.bool,
    displayOrder: PropTypes.number,
    imageUrl: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

CategoryForm.defaultProps = {
  initialData: null,
};

export default CategoryForm;
