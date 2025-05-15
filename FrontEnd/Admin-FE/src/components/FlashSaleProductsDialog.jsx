import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  InputAdornment,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  TablePagination,
  Autocomplete,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import flashSaleService from "../services/flashSaleService";
import productService from "../services/productService";
import { formatCurrency } from "../utils/formatters";

const FlashSaleProductsDialog = ({ open, onClose, flashSale, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [flashSaleItems, setFlashSaleItems] = useState([]);
  const [formData, setFormData] = useState({
    productId: null,
    stockQuantity: 10,
    discountPrice: 0,
    originalPrice: 0,
    discountPercentage: null,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open && flashSale) {
      fetchFlashSaleDetails();
    }
  }, [open, flashSale]);

  // Thêm useEffect để debug products
  useEffect(() => {
    if (products.length > 0) {
      console.log("Products trong state:", products);
      console.log("Mẫu sản phẩm đầu tiên:", products[0]);
    } else {
      console.log("Không có sản phẩm trong state");
    }
  }, [products]);

  const fetchFlashSaleDetails = async () => {
    setLoading(true);
    try {
      const response = await flashSaleService.getFlashSaleById(flashSale.id);
      if (response.success) {
        setFlashSaleItems(response.data.items || []);
        await fetchProducts(response.data.items || []);
      } else {
        enqueueSnackbar(
          response.message || "Không thể tải chi tiết Flash Sale",
          { variant: "error" }
        );
      }
    } catch (error) {
      console.error("Error fetching flash sale details:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi tải chi tiết Flash Sale", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (currentItems = []) => {
    try {
      console.log("Đang tải danh sách sản phẩm...");
      setLoading(true);

      // Thử lấy sản phẩm từ API
      const response = await productService.getAllProducts(0, 1000);
      console.log("Dữ liệu trả về từ API:", response);

      // Tạo mảng để lưu các sản phẩm sau khi xử lý
      let productsList = [];

      // Kiểm tra API response thành công
      if (response && response.success) {
        // Tìm dữ liệu sản phẩm từ response với nhiều cấu trúc khác nhau

        // Trường hợp 1: data.content[] (Spring Data Page)
        if (
          response.data &&
          response.data.content &&
          Array.isArray(response.data.content)
        ) {
          console.log("Tìm thấy dữ liệu cấu trúc: response.data.content[]");
          productsList = response.data.content;
        }
        // Trường hợp 2: data[] (Array trực tiếp)
        else if (response.data && Array.isArray(response.data)) {
          console.log("Tìm thấy dữ liệu cấu trúc: response.data[]");
          productsList = response.data;
        }
        // Trường hợp 3: data.data[] (Nested data)
        else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          console.log("Tìm thấy dữ liệu cấu trúc: response.data.data[]");
          productsList = response.data.data;
        }
        // Trường hợp 4: data.data.content[] (Nested Spring Data Page)
        else if (
          response.data &&
          response.data.data &&
          response.data.data.content &&
          Array.isArray(response.data.data.content)
        ) {
          console.log(
            "Tìm thấy dữ liệu cấu trúc: response.data.data.content[]"
          );
          productsList = response.data.data.content;
        } else {
          console.error(
            "Không thể xác định cấu trúc dữ liệu sản phẩm:",
            response.data
          );
          // Cấu trúc không xác định, kiểm tra xem có trường nào chứa mảng sản phẩm
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(`Tìm thấy mảng trong response.data.${key}`);
              productsList = response.data[key];
              break;
            }
          }
        }
      }

      // Kiểm tra nếu không lấy được dữ liệu từ API, sử dụng dữ liệu mẫu
      if (productsList.length === 0) {
        console.warn(
          "Không nhận được dữ liệu sản phẩm từ API, sử dụng dữ liệu mẫu"
        );
        productsList = [
          {
            id: 1001,
            name: "Phân bón NPK 16-16-8 + TE (1kg)",
            price: 65000,
            quantity: 100,
            description: "Phân bón NPK cao cấp cho rau màu và cây ăn trái",
            status: "ACTIVE",
          },
          {
            id: 1002,
            name: "Hạt giống rau muống đỏ (gói 50g)",
            price: 35000,
            quantity: 50,
            description:
              "Hạt giống rau muống đỏ chất lượng cao, tỷ lệ nảy mầm cao",
            status: "ACTIVE",
          },
          {
            id: 1003,
            name: "Thuốc trừ sâu sinh học (chai 500ml)",
            price: 120000,
            quantity: 30,
            description: "Thuốc trừ sâu sinh học an toàn cho rau sạch",
            status: "ACTIVE",
          },
          {
            id: 1004,
            name: "Chậu nhựa trồng rau thông minh (bộ 5 chậu)",
            price: 85000,
            quantity: 20,
            description: "Chậu nhựa cao cấp với hệ thống thoát nước thông minh",
            status: "ACTIVE",
          },
          {
            id: 1005,
            name: "Kéo cắt tỉa cây cảnh",
            price: 150000,
            quantity: 15,
            description: "Kéo cắt tỉa sắc bén, chất liệu inox chống gỉ",
            status: "ACTIVE",
          },
        ];

        enqueueSnackbar(
          "Không thể lấy dữ liệu sản phẩm từ API, đang sử dụng dữ liệu mẫu",
          { variant: "warning" }
        );
      }

      console.log(
        "Danh sách sản phẩm (trước khi lọc):",
        productsList.length,
        "sản phẩm"
      );
      console.log("Danh sách sản phẩm đầu tiên:", productsList[0]);
      console.log(
        "Danh sách sản phẩm đã có trong Flash Sale:",
        currentItems.length,
        "sản phẩm"
      );

      // Lọc ra các sản phẩm chưa có trong Flash Sale
      let availableProducts = [];
      if (currentItems && currentItems.length > 0) {
        availableProducts = productsList.filter((product) => {
          // Kiểm tra xem sản phẩm đã tồn tại trong currentItems chưa
          const exists = currentItems.some(
            (item) =>
              (item.product &&
                item.product.id &&
                item.product.id === product.id) ||
              (item.productId && item.productId === product.id)
          );
          return !exists;
        });
      } else {
        availableProducts = productsList;
      }

      console.log(
        "Danh sách sản phẩm có sẵn (sau khi lọc):",
        availableProducts.length,
        "sản phẩm"
      );

      // Cập nhật state
      setProducts(availableProducts);
    } catch (error) {
      console.error("Error fetching products:", error);

      // Log chi tiết lỗi
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }

      // Sử dụng dữ liệu mẫu khi có lỗi
      const sampleProducts = [
        {
          id: 3001,
          name: "Bình xịt thuốc cầm tay (2L)",
          price: 95000,
          quantity: 20,
          description: "Bình xịt thuốc cầm tay tiện dụng",
          status: "ACTIVE",
        },
        {
          id: 3002,
          name: "Cuốc làm vườn mini",
          price: 65000,
          quantity: 25,
          description: "Cuốc làm vườn cỡ nhỏ cho chậu cảnh",
          status: "ACTIVE",
        },
        {
          id: 3003,
          name: "Hạt giống cà chua bi (gói 5g)",
          price: 30000,
          quantity: 40,
          description: "Hạt giống cà chua bi chất lượng cao",
          status: "ACTIVE",
        },
      ];

      setProducts(sampleProducts);
      enqueueSnackbar(
        "Đã xảy ra lỗi khi tải danh sách sản phẩm, đang sử dụng dữ liệu mẫu",
        {
          variant: "error",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    if (name === "discountPrice" && selectedProduct) {
      const originalPrice = selectedProduct.price;
      const discountPrice = parseFloat(value);
      if (originalPrice > 0 && discountPrice > 0) {
        const discountPercentage = Math.round(
          ((originalPrice - discountPrice) / originalPrice) * 100
        );
        setFormData((prev) => ({
          ...prev,
          discountPercentage: discountPercentage > 0 ? discountPercentage : 0,
        }));
      }
    } else if (name === "discountPercentage" && selectedProduct) {
      const originalPrice = selectedProduct.price;
      const discountPercentage = parseFloat(value);
      if (
        originalPrice > 0 &&
        discountPercentage >= 0 &&
        discountPercentage <= 100
      ) {
        const discountPrice = Math.round(
          originalPrice - (originalPrice * discountPercentage) / 100
        );
        setFormData((prev) => ({
          ...prev,
          discountPrice: discountPrice > 0 ? discountPrice : 0,
        }));
      }
    }
  };

  const handleProductChange = (event, newValue) => {
    setSelectedProduct(newValue);
    if (newValue) {
      const originalPrice = newValue.price;
      const discountPercentage = flashSale.discountPercentage || 10;
      const discountPrice = Math.round(
        originalPrice - (originalPrice * discountPercentage) / 100
      );

      setFormData({
        productId: newValue.id,
        stockQuantity: 10,
        discountPrice: discountPrice > 0 ? discountPrice : 0,
        originalPrice,
        discountPercentage,
      });
    } else {
      setFormData({
        productId: null,
        stockQuantity: 10,
        discountPrice: 0,
        originalPrice: 0,
        discountPercentage: flashSale.discountPercentage || 10,
      });
    }
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = "Sản phẩm không được để trống";
    }

    if (!formData.stockQuantity || formData.stockQuantity < 1) {
      newErrors.stockQuantity = "Số lượng tồn phải lớn hơn 0";
    }

    if (!formData.discountPrice || formData.discountPrice < 0) {
      newErrors.discountPrice = "Giá sau giảm không được âm";
    }

    if (formData.originalPrice <= 0) {
      newErrors.originalPrice = "Giá gốc phải lớn hơn 0";
    }

    if (formData.discountPrice >= formData.originalPrice) {
      newErrors.discountPrice = "Giá sau giảm phải nhỏ hơn giá gốc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      enqueueSnackbar("Vui lòng kiểm tra lại thông tin", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await flashSaleService.addProductToFlashSale(
        flashSale.id,
        formData
      );
      if (response.success) {
        enqueueSnackbar("Thêm sản phẩm vào Flash Sale thành công", {
          variant: "success",
        });
        fetchFlashSaleDetails();
        setFormData({
          productId: null,
          stockQuantity: 10,
          discountPrice: 0,
          originalPrice: 0,
          discountPercentage: flashSale.discountPercentage || 10,
        });
        setSelectedProduct(null);
        onUpdate();
      } else {
        enqueueSnackbar(response.message || "Không thể thêm sản phẩm", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error adding product to flash sale:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi thêm sản phẩm", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi Flash Sale?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await flashSaleService.removeProductFromFlashSale(
        flashSale.id,
        productId
      );
      if (response.success) {
        enqueueSnackbar("Xóa sản phẩm khỏi Flash Sale thành công", {
          variant: "success",
        });
        fetchFlashSaleDetails();
        onUpdate();
      } else {
        enqueueSnackbar(response.message || "Không thể xóa sản phẩm", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error removing product from flash sale:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi xóa sản phẩm", { variant: "error" });
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Quản lý sản phẩm Flash Sale: {flashSale?.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Thêm sản phẩm mới vào Flash Sale
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => {
                  console.log("Option trong getOptionLabel:", option);
                  // Đảm bảo option.name tồn tại, nếu không dùng id hoặc empty string
                  return (
                    option?.name ||
                    option?.productName ||
                    `ID: ${option?.id || "Unknown"}` ||
                    ""
                  );
                }}
                value={selectedProduct}
                onChange={handleProductChange}
                filterOptions={(options, state) => {
                  // In ra full info của tất cả options
                  console.log("Tất cả products trong filterOptions:", options);

                  // Hàm chuyển đổi chuỗi sang Unicode NFD để so sánh không phân biệt dấu
                  const normalizeText = (text) => {
                    if (!text) return "";
                    return text
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase();
                  };

                  // Lọc sản phẩm theo tên, không phân biệt hoa thường và dấu
                  const inputValue = normalizeText(state.inputValue);

                  // Lọc các options theo input
                  const filtered = options.filter((option) => {
                    const name = normalizeText(
                      option?.name || option?.productName || ""
                    );
                    return name.includes(inputValue);
                  });

                  console.log("Kết quả lọc:", filtered);
                  return filtered;
                }}
                renderOption={(props, option) => (
                  <li {...props}>
                    <strong>{option?.name || option?.productName}</strong> -
                    {option?.price ? ` ${formatCurrency(option.price)}` : ""} -
                    ID: {option?.id || "N/A"}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn sản phẩm"
                    required
                    error={!!errors.productId}
                    helperText={
                      errors.productId ||
                      (products.length === 0 ? "Không có sản phẩm để chọn" : "")
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading && (
                            <CircularProgress color="inherit" size={20} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText="Không tìm thấy sản phẩm phù hợp"
                loading={loading}
                loadingText="Đang tải..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" flexDirection="column" height="100%">
                <TextField
                  name="stockQuantity"
                  label="Số lượng tồn"
                  type="number"
                  fullWidth
                  required
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                  error={!!errors.stockQuantity}
                  helperText={errors.stockQuantity}
                />
                <Box mt={1}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => fetchProducts(flashSaleItems)}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? "Đang tải..." : "Làm mới danh sách sản phẩm"}
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="originalPrice"
                label="Giá gốc"
                type="number"
                fullWidth
                required
                value={formData.originalPrice}
                onChange={handleChange}
                InputProps={{
                  readOnly: !!selectedProduct,
                  endAdornment: (
                    <InputAdornment position="end">VNĐ</InputAdornment>
                  ),
                }}
                error={!!errors.originalPrice}
                helperText={errors.originalPrice}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="discountPercentage"
                label="Phần trăm giảm giá"
                type="number"
                fullWidth
                required
                value={formData.discountPercentage || ""}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, max: 100 }}
                error={!!errors.discountPercentage}
                helperText={errors.discountPercentage}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="discountPrice"
                label="Giá sau giảm"
                type="number"
                fullWidth
                required
                value={formData.discountPrice}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">VNĐ</InputAdornment>
                  ),
                }}
                error={!!errors.discountPrice}
                helperText={errors.discountPrice}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleSubmit}
                disabled={loading || !selectedProduct}
              >
                Thêm sản phẩm
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Danh sách sản phẩm trong Flash Sale
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" my={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên sản phẩm</TableCell>
                      <TableCell align="right">Giá gốc (VNĐ)</TableCell>
                      <TableCell align="right">Giá khuyến mãi (VNĐ)</TableCell>
                      <TableCell align="center">Giảm giá (%)</TableCell>
                      <TableCell align="center">Số lượng tồn</TableCell>
                      <TableCell align="center">Đã bán</TableCell>
                      <TableCell align="center">Còn lại</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {flashSaleItems.length > 0 ? (
                      flashSaleItems
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product.name}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.originalPrice)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.discountPrice)}
                            </TableCell>
                            <TableCell align="center">
                              {item.discountPercentage}%
                            </TableCell>
                            <TableCell align="center">
                              {item.stockQuantity}
                            </TableCell>
                            <TableCell align="center">
                              {item.soldQuantity}
                            </TableCell>
                            <TableCell align="center">
                              {item.stockQuantity - item.soldQuantity}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                onClick={() =>
                                  handleRemoveProduct(item.product.id)
                                }
                                disabled={loading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Chưa có sản phẩm nào trong Flash Sale
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {flashSaleItems.length > 0 && (
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={flashSaleItems.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số dòng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} trên ${count}`
                    }
                  />
                )}
              </TableContainer>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

FlashSaleProductsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  flashSale: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default FlashSaleProductsDialog;
