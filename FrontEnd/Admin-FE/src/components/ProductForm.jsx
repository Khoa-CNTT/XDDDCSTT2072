import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Typography,
  Divider,
  FormHelperText,
  InputAdornment,
  Switch,
  FormControlLabel,
  IconButton,
  Card,
  CardMedia,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { vi } from "date-fns/locale";
import { CloudUpload, Clear, Add, Delete } from "@mui/icons-material";
import productService from "../services/productService";

const ProductForm = ({ initialData, onSubmit, onCancel }) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    shortDescription: "",
    quantity: 0,
    price: 0,
    salePrice: 0,
    saleStartDate: null,
    saleEndDate: null,
    categoryId: "",
    sku: "",
    weight: 0,
    dimensions: "",
    image: null,
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [additionalImages, setAdditionalImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSaleOptions, setShowSaleOptions] = useState(
    !!initialData?.salePrice
  );

  const [alertInfo, setAlertInfo] = useState({
    show: false,
    message: "",
    severity: "info",
  });

  // Tải danh sách danh mục khi component được mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };

    fetchCategories();

    // Nếu đang chỉnh sửa, tải hình ảnh hiện có
    if (isEditMode && initialData.id) {
      console.log("Đang chỉnh sửa sản phẩm:", initialData);

      // Ưu tiên sử dụng imageUrl, nếu không có thì mới dùng thumbnailUrl
      let imageToUse = initialData.imageUrl || initialData.thumbnailUrl || "";
      console.log("Ảnh sẽ sử dụng:", imageToUse);

      if (imageToUse) {
        console.log("Đặt previewImage:", imageToUse);
        setPreviewImage(imageToUse);
      }

      loadExistingImages(initialData.id);

      // Hiển thị tùy chọn giảm giá nếu có
      if (initialData.salePrice) {
        setShowSaleOptions(true);
      }
    }
  }, [isEditMode, initialData]);

  const loadExistingImages = async (productId) => {
    try {
      const images = await productService.getProductImages(productId);
      // Lọc ra hình ảnh không phải là hình ảnh chính
      const nonPrimaryImages = images.filter((img) => !img.isPrimary);
      setAdditionalImages(
        nonPrimaryImages.map((img) => ({
          id: img.id,
          url: img.imageUrl,
          file: null,
          isExisting: true,
        }))
      );
    } catch (error) {
      console.error("Lỗi khi tải hình ảnh:", error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Xóa lỗi khi người dùng sửa trường đó
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Xóa lỗi khi người dùng sửa trường đó
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    console.log("File đã chọn:", file);

    if (!file.type.match("image.*")) {
      setAlertInfo({
        show: true,
        message: "Vui lòng chọn tệp ảnh hợp lệ",
        severity: "error",
      });
      return;
    }

    // Giới hạn kích thước file (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAlertInfo({
        show: true,
        message: "Kích thước ảnh không được vượt quá 5MB",
        severity: "error",
      });
      return;
    }

    // Lưu file vào state
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    // Tạo URL xem trước cho ảnh
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
      console.log(
        "Đã tạo URL xem trước cho ảnh:",
        e.target.result.substring(0, 50) + "..."
      );
    };
    reader.readAsDataURL(file);

    console.log("Đã chọn file:", file.name, file.type, file.size);
  };

  const handleAdditionalImageChange = (event) => {
    const files = Array.from(event.target.files);

    const newImages = files.map((file) => ({
      id: null,
      url: URL.createObjectURL(file),
      file: file,
      isExisting: false,
    }));

    setAdditionalImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productName) {
      newErrors.productName = "Tên sản phẩm không được để trống";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Giá sản phẩm phải lớn hơn 0";
    }

    if (!formData.quantity || formData.quantity < 0) {
      newErrors.quantity = "Số lượng không được âm";
    }

    if (showSaleOptions) {
      if (!formData.salePrice || formData.salePrice <= 0) {
        newErrors.salePrice = "Giá giảm phải lớn hơn 0";
      }

      if (formData.salePrice >= formData.price) {
        newErrors.salePrice = "Giá giảm phải nhỏ hơn giá gốc";
      }

      if (!formData.saleStartDate) {
        newErrors.saleStartDate = "Ngày bắt đầu giảm giá không được để trống";
      }

      if (!formData.saleEndDate) {
        newErrors.saleEndDate = "Ngày kết thúc giảm giá không được để trống";
      }

      if (
        formData.saleStartDate &&
        formData.saleEndDate &&
        new Date(formData.saleStartDate) >= new Date(formData.saleEndDate)
      ) {
        newErrors.saleEndDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục sản phẩm";
    }

    // Nếu đang tạo mới và không có hình ảnh
    if (!isEditMode && !formData.image && !previewImage) {
      newErrors.image = "Vui lòng tải lên hình ảnh sản phẩm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra tính hợp lệ của form trước
    if (!validateForm()) {
      console.error("Form không hợp lệ, vui lòng kiểm tra lại");
      setAlertInfo({
        show: true,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      // Tạo FormData object để gửi dữ liệu kèm file
      const productFormData = new FormData();

      // Log thông tin để debug
      console.log("===== THÔNG TIN FORM TRƯỚC KHI GỬI =====");
      console.log("Show sale options:", showSaleOptions);
      console.log("Product name:", formData.productName);
      console.log("Quantity:", formData.quantity, typeof formData.quantity);
      console.log("Sale price (before):", formData.salePrice);
      console.log("Sale start date (before):", formData.saleStartDate);
      console.log("Sale end date (before):", formData.saleEndDate);

      // THÊM CÁC TRƯỜNG BẮT BUỘC
      // Đảm bảo productName luôn được gửi - đây là trường bắt buộc
      if (!formData.productName) {
        console.error("Tên sản phẩm không được để trống");
        setLoading(false);
        setAlertInfo({
          show: true,
          message: "Tên sản phẩm không được để trống",
          severity: "error",
        });
        return;
      }
      productFormData.append("productName", formData.productName);
      console.log("ĐÃ THÊM PRODUCTNAME:", formData.productName);

      // Đảm bảo price luôn được gửi - đây là trường bắt buộc
      if (!formData.price) {
        console.error("Giá sản phẩm không được để trống");
        setLoading(false);
        setAlertInfo({
          show: true,
          message: "Giá sản phẩm không được để trống",
          severity: "error",
        });
        return;
      }
      productFormData.append("price", formData.price);
      console.log("ĐÃ THÊM PRICE:", formData.price);

      // Đảm bảo quantity là số nguyên dương và không bị null
      const quantity = parseInt(formData.quantity || 0, 10);
      productFormData.append("quantity", quantity);
      console.log("ĐÃ THÊM QUANTITY:", quantity);

      // Xử lý các trường thông thường
      for (const key in formData) {
        if (
          key !== "image" &&
          key !== "imageUrl" &&
          key !== "thumbnailUrl" &&
          key !== "quantity" && // Đã thêm ở trên
          key !== "productName" && // Đã thêm ở trên
          key !== "price" && // Đã thêm ở trên
          key !== "salePrice" && // Xử lý riêng bên dưới
          key !== "saleStartDate" && // Xử lý riêng bên dưới
          key !== "saleEndDate" && // Xử lý riêng bên dưới
          key !== "images" && // Bỏ qua để tránh lỗi conversion
          key !== "additionalImages" && // Bỏ qua các trường liên quan đến hình ảnh phụ
          formData[key] !== null &&
          formData[key] !== undefined
        ) {
          productFormData.append(key, formData[key]);
          console.log(`ĐÃ THÊM ${key.toUpperCase()}:`, formData[key]);
        }
      }

      // XỬ LÝ TRƯỜNG IMAGE - ĐẢM BẢO ĐÚNG TÊN TRƯỜNG
      if (formData.image instanceof File) {
        console.log(
          "Đang gửi file ảnh:",
          formData.image.name,
          "Loại:",
          formData.image.type,
          "Kích thước:",
          formData.image.size
        );
        productFormData.append("imageFile", formData.image); // Đổi tên trường thành 'imageFile' để phù hợp với backend
        console.log("ĐÃ THÊM FILE ẢNH MỚI VỚI TÊN TRƯỜNG: imageFile");
      } else if (
        isEditMode &&
        !formData.image &&
        previewImage &&
        !previewImage.startsWith("blob:")
      ) {
        // Nếu đang chỉnh sửa và không có file ảnh mới, giữ lại ảnh cũ
        console.log("Giữ nguyên ảnh cũ, không gửi file mới");
      }

      // XỬ LÝ CÁC TRƯỜNG LIÊN QUAN ĐẾN GIẢM GIÁ
      if (showSaleOptions) {
        console.log("Đang BẬT chế độ giảm giá, kiểm tra các giá trị:");

        // Kiểm tra salePrice có hợp lệ không
        if (
          !formData.salePrice ||
          isNaN(formData.salePrice) ||
          formData.salePrice <= 0
        ) {
          console.error("Lỗi: Giá khuyến mãi không hợp lệ");
          setLoading(false);
          setAlertInfo({
            show: true,
            message: "Giá khuyến mãi phải là số dương lớn hơn 0",
            severity: "error",
          });
          return;
        }

        // Kiểm tra các ngày có hợp lệ không
        if (!formData.saleStartDate || !formData.saleEndDate) {
          console.error(
            "Lỗi: Ngày bắt đầu hoặc kết thúc khuyến mãi không hợp lệ"
          );
          setLoading(false);
          setAlertInfo({
            show: true,
            message: "Vui lòng chọn ngày bắt đầu và kết thúc khuyến mãi",
            severity: "error",
          });
          return;
        }

        // Thêm giá khuyến mãi
        productFormData.append("salePrice", formData.salePrice);
        console.log("ĐÃ THÊM SALEPRICE:", formData.salePrice);

        // Thêm ngày bắt đầu khuyến mãi
        if (formData.saleStartDate) {
          const startDate = new Date(formData.saleStartDate);
          const formattedStartDate = `${startDate.getFullYear()}-${String(
            startDate.getMonth() + 1
          ).padStart(2, "0")}-${String(startDate.getDate()).padStart(
            2,
            "0"
          )}T${String(startDate.getHours()).padStart(2, "0")}:${String(
            startDate.getMinutes()
          ).padStart(2, "0")}`;
          productFormData.append("saleStartDate", formattedStartDate);
          console.log("ĐÃ THÊM SALESTARTDATE:", formattedStartDate);
        }

        // Thêm ngày kết thúc khuyến mãi
        if (formData.saleEndDate) {
          const endDate = new Date(formData.saleEndDate);
          const formattedEndDate = `${endDate.getFullYear()}-${String(
            endDate.getMonth() + 1
          ).padStart(2, "0")}-${String(endDate.getDate()).padStart(
            2,
            "0"
          )}T${String(endDate.getHours()).padStart(2, "0")}:${String(
            endDate.getMinutes()
          ).padStart(2, "0")}`;
          productFormData.append("saleEndDate", formattedEndDate);
          console.log("ĐÃ THÊM SALEENDDATE:", formattedEndDate);
        }
      } else {
        // Khi TẮT chế độ giảm giá, gửi giá trị rõ ràng là null
        console.log("Đã TẮT chế độ giảm giá, đặt các giá trị sale = null");
        productFormData.append("salePrice", "null");
        productFormData.append("saleStartDate", "null");
        productFormData.append("saleEndDate", "null");
        console.log("ĐÃ THÊM CÁC TRƯỜNG SALE VỚI GIÁ TRỊ NULL");
      }

      // Log lại thông tin sau khi xử lý
      console.log("===== THÔNG TIN FORM SAU KHI XỬ LÝ =====");
      // In ra tất cả dữ liệu trong FormData để kiểm tra
      for (let [key, value] of productFormData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      const savedProduct = await onSubmit(productFormData);
      console.log("Sản phẩm đã được lưu:", savedProduct);

      // Gọi API để làm mới trạng thái hàng và thông tin giảm giá
      try {
        console.log("Đang làm mới trạng thái hàng và thông tin giảm giá...");
        await productService.refreshAllStockStatus();
        console.log("Đã làm mới trạng thái thành công!");

        // Đợi 1 giây sau khi cập nhật xong để đảm bảo server đã xử lý
        setTimeout(() => {
          // Force reload lại trang ngay lập tức để thấy thay đổi
          console.log("Làm mới trang để thấy thay đổi...");
          window.location.reload();
        }, 1000);
      } catch (err) {
        console.error("Lỗi khi làm mới trạng thái:", err);
        // Vẫn reload trang dù có lỗi
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error("Lỗi khi submit form:", error);
      setLoading(false);
      setAlertInfo({
        show: true,
        message: "Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại!",
        severity: "error",
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEditMode ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Tên sản phẩm (bắt buộc)"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                error={!!errors.productName}
                helperText={errors.productName}
                margin="normal"
                required
              />
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label="Giá sản phẩm (bắt buộc)"
                name="price"
                type="number"
                value={formData.price || ""}
                onChange={handleInputChange}
                error={!!errors.price}
                helperText={errors.price}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">VND</InputAdornment>
                  ),
                  inputProps: { min: 0 },
                }}
              />
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label="Số lượng (bắt buộc)"
                name="quantity"
                type="number"
                value={formData.quantity || ""}
                onChange={handleInputChange}
                error={!!errors.quantity}
                helperText={errors.quantity}
                margin="normal"
                required
                InputProps={{
                  inputProps: { min: 0 },
                }}
              />
            </Grid>

            <Grid size={6}>
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.categoryId}
              >
                <InputLabel id="category-label">Danh mục</InputLabel>
                <Select
                  labelId="category-label"
                  name="categoryId"
                  value={formData.categoryId || ""}
                  onChange={handleInputChange}
                  label="Danh mục"
                >
                  <MenuItem value="">
                    <em>Không chọn danh mục</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && (
                  <FormHelperText>{errors.categoryId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={formData.sku || ""}
                onChange={handleInputChange}
                error={!!errors.sku}
                helperText={errors.sku}
                margin="normal"
              />
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showSaleOptions}
                    onChange={(e) => setShowSaleOptions(e.target.checked)}
                    color="primary"
                  />
                }
                label="Tạo giảm giá cho sản phẩm này"
              />
            </Grid>

            {showSaleOptions && (
              <>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Giá khuyến mãi"
                    name="salePrice"
                    type="number"
                    value={formData.salePrice || ""}
                    onChange={handleInputChange}
                    error={!!errors.salePrice}
                    helperText={
                      errors.salePrice ||
                      "Nhập giá khuyến mãi thấp hơn giá gốc của sản phẩm"
                    }
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">VND</InputAdornment>
                      ),
                      inputProps: { min: 0 },
                    }}
                  />
                </Grid>

                <Grid size={6}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <DateTimePicker
                      label="Bắt đầu khuyến mãi"
                      value={formData.saleStartDate}
                      onChange={(newValue) =>
                        handleDateChange("saleStartDate", newValue)
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          margin: "normal",
                          error: !!errors.saleStartDate,
                          helperText: errors.saleStartDate,
                        },
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={6}>
                  <DateTimePicker
                    label="Kết thúc khuyến mãi"
                    value={formData.saleEndDate}
                    onChange={(newValue) =>
                      handleDateChange("saleEndDate", newValue)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: "normal",
                        error: !!errors.saleEndDate,
                        helperText: errors.saleEndDate,
                      },
                    }}
                  />
                </Grid>
              </>
            )}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Mô tả ngắn"
                name="shortDescription"
                value={formData.shortDescription || ""}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Mô tả chi tiết"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={4}
              />
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Thông tin bổ sung
              </Typography>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Trọng lượng (kg)"
                  name="weight"
                  type="number"
                  value={formData.weight || ""}
                  onChange={handleInputChange}
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 0, step: 0.1 },
                  }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Kích thước (DxRxC cm)"
                  name="dimensions"
                  value={formData.dimensions || ""}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="VD: 10x5x3"
                />
              </Grid>
            </Grid>

            {/* Hình ảnh sản phẩm chính */}
            <Grid size={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 200,
                  border: errors.image ? "1px solid red" : "none",
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Hình ảnh sản phẩm chính
                </Typography>

                {previewImage ? (
                  <Box sx={{ position: "relative", width: "100%" }}>
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
                        setFormData((prev) => ({ ...prev, image: null }));
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

            {/* Hình ảnh bổ sung */}
            <Grid size={12}>
              <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Hình ảnh bổ sung
                </Typography>

                <Grid container spacing={2}>
                  {additionalImages.map((image, index) => (
                    <Grid size={6} sm={4} md={3} key={index}>
                      <Card sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={image.url}
                          alt={`Hình ảnh ${index + 1}`}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 5,
                            right: 5,
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                          }}
                          onClick={() => handleRemoveAdditionalImage(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}

                  <Grid size={6} sm={4} md={3}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<Add />}
                      fullWidth
                      sx={{ height: "140px" }}
                    >
                      Thêm ảnh
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        multiple
                        onChange={handleAdditionalImageChange}
                      />
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Nút hành động */}
            <Grid size={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Hủy bỏ
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
                    ? "Cập nhật"
                    : "Tạo sản phẩm"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default ProductForm;
