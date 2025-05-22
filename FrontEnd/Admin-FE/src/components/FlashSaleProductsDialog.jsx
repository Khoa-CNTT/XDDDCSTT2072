import { useState, useEffect, useCallback } from "react";
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

// SafeRender component to catch rendering errors
const SafeRender = ({ children, fallback = null }) => {
  try {
    return children();
  } catch (error) {
    console.error("Render error caught:", error);
    return (
      fallback || (
        <Typography color="error">
          Lỗi hiển thị: {error.message || "Lỗi không xác định"}
        </Typography>
      )
    );
  }
};

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
  const [productLoading, setProductLoading] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Reset state completely when dialog is closed
  useEffect(() => {
    if (!open) {
      // Reset all state values to prevent stale data issues
      setPage(0);
      setFlashSaleItems([]);
      setSelectedProduct(null);
      setErrors({});
      setFormData({
        productId: null,
        stockQuantity: 10,
        discountPrice: 0,
        originalPrice: 0,
        discountPercentage: null,
      });
      setProducts([]);
    }
  }, [open]);

  // Use memoized fetch function to avoid dependencies issues
  const fetchFlashSaleDetails = useCallback(async () => {
    if (!flashSale || !flashSale.id) {
      console.error("Invalid Flash Sale object", flashSale);
      enqueueSnackbar("Không thể tải thông tin Flash Sale", {
        variant: "error",
      });
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching Flash Sale details for ID:", flashSale.id);
      setLoading(true);
      const response = await flashSaleService.getFlashSaleById(flashSale.id);
      console.log("Flash Sale API response:", response);

      if (response && response.success) {
        const safeItems = [];

        if (
          response.data &&
          response.data.items &&
          Array.isArray(response.data.items)
        ) {
          // Process each item to ensure no undefined values
          response.data.items.forEach((item, index) => {
            if (!item) return; // Skip null or undefined items

            // Create a safe item with default values for all required properties
            const safeItem = {
              id: item.id || `temp-${index}`,
              productId: item.productId || null,
              originalPrice: item.originalPrice || 0,
              discountPrice: item.discountPrice || 0,
              discountPercentage: item.discountPercentage || 0,
              stockQuantity: item.stockQuantity || 0,
              soldQuantity: item.soldQuantity || 0,
            };

            // Handle product object safely
            if (item.product) {
              safeItem.product = {
                id: item.product.id || item.productId || null,
                name:
                  item.product.name ||
                  `Sản phẩm ID: ${item.productId || index}`,
              };
            } else if (item.productId) {
              safeItem.product = {
                id: item.productId,
                name: `Sản phẩm ID: ${item.productId}`,
              };
            } else {
              safeItem.product = {
                id: null,
                name: "Sản phẩm không xác định",
              };
            }

            safeItems.push(safeItem);
          });
        }

        console.log("Safe items:", safeItems);
        setFlashSaleItems(safeItems);

        try {
          setProductLoading(true);
          await fetchProducts(safeItems);
        } catch (error) {
          console.error("Error fetching products:", error);
          enqueueSnackbar("Đã xảy ra lỗi khi tải danh sách sản phẩm", {
            variant: "warning",
          });
        } finally {
          setProductLoading(false);
        }
      } else {
        console.error("Failed to fetch Flash Sale details:", response);
        enqueueSnackbar(
          response?.message || "Không thể tải chi tiết Flash Sale",
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
  }, [flashSale, enqueueSnackbar]);

  // Fetch Flash Sale details when the dialog opens
  useEffect(() => {
    if (open && flashSale && flashSale.id) {
      // Use a short timeout to ensure UI renders first
      setTimeout(() => {
        fetchFlashSaleDetails();
      }, 100);
    }
  }, [open, flashSale, fetchFlashSaleDetails]);

  const fetchProducts = async (currentItems = []) => {
    try {
      console.log("Fetching available products...");
      const response = await productService.getAllProducts(0, 1000);

      let productsList = [];

      if (response && response.success && response.data) {
        // Handle different API response formats
        if (Array.isArray(response.data)) {
          productsList = response.data;
        } else if (
          response.data.content &&
          Array.isArray(response.data.content)
        ) {
          productsList = response.data.content;
        } else if (response.data.data) {
          if (Array.isArray(response.data.data)) {
            productsList = response.data.data;
          } else if (
            response.data.data.content &&
            Array.isArray(response.data.data.content)
          ) {
            productsList = response.data.data.content;
          }
        }
      }

      // Ensure all products have valid properties
      productsList = productsList
        .filter((product) => product && product.id)
        .map((product) => ({
          id: product.id,
          name: product.name || `Sản phẩm ID: ${product.id}`,
          price: product.price || 0,
          quantity: product.quantity || 0,
          status: product.status || "UNKNOWN",
        }));

      // Use fallback data if no products found
      if (!productsList || productsList.length === 0) {
        console.warn("No products found, using sample data");
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
            description: "Hạt giống rau muống đỏ chất lượng cao",
            status: "ACTIVE",
          },
        ];
      }

      // Filter out products already in the flash sale
      const availableProducts = productsList.filter((product) => {
        if (!product || !product.id) return false;

        return !currentItems.some((item) => {
          if (!item) return false;
          const productId = item.product?.id || item.productId;
          return productId === product.id;
        });
      });

      console.log(`Found ${availableProducts.length} available products`);
      setProducts(availableProducts);
      return availableProducts;
    } catch (error) {
      console.error("Error fetching products:", error);
      enqueueSnackbar("Không thể tải danh sách sản phẩm", { variant: "error" });
      setProducts([]);
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === undefined || value === undefined) {
      console.warn("Invalid event in handleChange", e);
      return;
    }

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

    // Update related fields based on changes
    if (name === "discountPrice" && selectedProduct) {
      const originalPrice = selectedProduct.price || 0;
      const discountPrice = parseFloat(value) || 0;
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
      const originalPrice = selectedProduct.price || 0;
      const discountPercentage = parseFloat(value) || 0;
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
    try {
      // Validate product
      if (!newValue) {
        setSelectedProduct(null);
        setFormData((prev) => ({
          ...prev,
          productId: null,
          originalPrice: 0,
          discountPrice: 0,
        }));
        return;
      }

      // Ensure the product has valid properties
      const safeProduct = {
        id: newValue.id,
        name: newValue.name || `Sản phẩm ID: ${newValue.id}`,
        price: newValue.price || 0,
      };

      setSelectedProduct(safeProduct);

      // Update form data with product details
      const originalPrice = safeProduct.price;
      let discountPrice = originalPrice;
      let discountPercentage =
        formData.discountPercentage || flashSale?.discountPercentage || 10;

      // Calculate discount price if we have a percentage
      if (discountPercentage > 0 && discountPercentage <= 100) {
        discountPrice = Math.round(
          originalPrice - (originalPrice * discountPercentage) / 100
        );
      }

      setFormData((prev) => ({
        ...prev,
        productId: safeProduct.id,
        originalPrice: originalPrice,
        discountPrice: discountPrice > 0 ? discountPrice : 0,
        discountPercentage: discountPercentage,
      }));

      // Clear product error if it exists
      if (errors.productId) {
        setErrors((prev) => ({
          ...prev,
          productId: null,
        }));
      }
    } catch (error) {
      console.error("Error in handleProductChange:", error);
      enqueueSnackbar(
        `Lỗi khi chọn sản phẩm: ${error.message || "Lỗi không xác định"}`,
        {
          variant: "error",
        }
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productId && !selectedProduct) {
      newErrors.productId = "Vui lòng chọn sản phẩm";
    }

    if (!formData.stockQuantity || formData.stockQuantity <= 0) {
      newErrors.stockQuantity = "Vui lòng nhập số lượng tồn hợp lệ";
    }

    if (!formData.originalPrice || formData.originalPrice <= 0) {
      newErrors.originalPrice = "Giá gốc phải lớn hơn 0";
    }

    if (!formData.discountPrice || formData.discountPrice <= 0) {
      newErrors.discountPrice = "Giá sau giảm phải lớn hơn 0";
    }

    if (formData.discountPercentage < 0 || formData.discountPercentage > 100) {
      newErrors.discountPercentage = "Phần trăm giảm giá phải từ 0 đến 100";
    }

    if (Number(formData.discountPrice) >= Number(formData.originalPrice)) {
      newErrors.discountPrice = "Giá sau giảm phải nhỏ hơn giá gốc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      enqueueSnackbar("Vui lòng kiểm tra lại thông tin", { variant: "error" });
      return;
    }

    // Extra validation for product safety
    if (!formData.productId && selectedProduct) {
      setFormData((prev) => ({
        ...prev,
        productId: selectedProduct.id,
      }));
    }

    if (!formData.productId) {
      enqueueSnackbar("Vui lòng chọn sản phẩm", { variant: "error" });
      return;
    }

    setLoading(true);
    setOperationInProgress(true);
    try {
      const safeFormData = {
        productId: formData.productId,
        stockQuantity: parseInt(formData.stockQuantity) || 10,
        discountPrice: parseInt(formData.discountPrice) || 0,
        originalPrice: parseInt(formData.originalPrice) || 0,
        discountPercentage: parseInt(formData.discountPercentage) || 0,
      };

      console.log("Sending data to API:", safeFormData);
      const response = await flashSaleService.addProductToFlashSale(
        flashSale.id,
        safeFormData
      );
      console.log("API response:", response);

      if (response && response.success) {
        enqueueSnackbar("Thêm sản phẩm vào Flash Sale thành công", {
          variant: "success",
        });
        await fetchFlashSaleDetails();
        setFormData({
          productId: null,
          stockQuantity: 10,
          discountPrice: 0,
          originalPrice: 0,
          discountPercentage: flashSale?.discountPercentage || 10,
        });
        setSelectedProduct(null);
        onUpdate && onUpdate();
      } else {
        console.error("Failed to add product to flash sale:", response);
        enqueueSnackbar(response?.message || "Không thể thêm sản phẩm", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error adding product to flash sale:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi thêm sản phẩm", { variant: "error" });
    } finally {
      setLoading(false);
      setOperationInProgress(false);
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!productId) {
      enqueueSnackbar("Không thể xác định ID sản phẩm cần xóa", {
        variant: "error",
      });
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi Flash Sale?")) {
      return;
    }

    setLoading(true);
    setOperationInProgress(true);
    try {
      console.log(
        `Removing product ID ${productId} from Flash Sale ID ${flashSale.id}`
      );
      const response = await flashSaleService.removeProductFromFlashSale(
        flashSale.id,
        productId
      );

      console.log("Remove product response:", response);

      if (response && response.success) {
        enqueueSnackbar("Xóa sản phẩm thành công", { variant: "success" });

        // Update local state to avoid full reload
        setFlashSaleItems((prevItems) =>
          prevItems.filter((item) => {
            const itemProductId = item.product?.id || item.productId;
            return itemProductId !== productId;
          })
        );

        // Add removed product back to available products
        const removedItem = flashSaleItems.find((item) => {
          const itemProductId = item.product?.id || item.productId;
          return itemProductId === productId;
        });

        if (removedItem && removedItem.product) {
          const productToAdd = {
            id: removedItem.product.id,
            name: removedItem.product.name,
            price: removedItem.originalPrice,
            quantity: removedItem.stockQuantity,
            status: "ACTIVE",
          };

          setProducts((prev) => [...prev, productToAdd]);
        }

        // Refresh data from server after a short delay
        setTimeout(() => {
          fetchFlashSaleDetails();
          onUpdate && onUpdate();
        }, 500);
      } else {
        console.error("Failed to remove product:", response);
        enqueueSnackbar(response?.message || "Không thể xóa sản phẩm", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error removing product:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi xóa sản phẩm", { variant: "error" });
    } finally {
      setLoading(false);
      setOperationInProgress(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Render helper functions
  const renderProductList = () => {
    try {
      if (!flashSaleItems || flashSaleItems.length === 0) {
        return (
          <TableRow>
            <TableCell colSpan={8} align="center">
              Chưa có sản phẩm nào trong Flash Sale
            </TableCell>
          </TableRow>
        );
      }

      const startIndex = page * rowsPerPage;
      const endIndex = Math.min(
        startIndex + rowsPerPage,
        flashSaleItems.length
      );
      const currentPageItems = flashSaleItems.slice(startIndex, endIndex);

      return currentPageItems.map((item, index) => {
        // Safety check
        if (!item) {
          return (
            <TableRow key={`empty-${index}`}>
              <TableCell colSpan={8} align="center">
                Dữ liệu không hợp lệ
              </TableCell>
            </TableRow>
          );
        }

        // Make sure we have a valid name with fallback
        const productName =
          item.product?.name ||
          (item.productId
            ? `Sản phẩm ID: ${item.productId}`
            : `Sản phẩm không xác định ${index}`);

        return (
          <TableRow key={item.id || `item-${index}`}>
            <TableCell>{productName}</TableCell>
            <TableCell align="right">
              {formatCurrency(item.originalPrice || 0)}
            </TableCell>
            <TableCell align="right">
              {formatCurrency(item.discountPrice || 0)}
            </TableCell>
            <TableCell align="center">
              {item.discountPercentage || 0}%
            </TableCell>
            <TableCell align="center">{item.stockQuantity || 0}</TableCell>
            <TableCell align="center">{item.soldQuantity || 0}</TableCell>
            <TableCell align="center">
              {(item.stockQuantity || 0) - (item.soldQuantity || 0)}
            </TableCell>
            <TableCell align="center">
              <IconButton
                color="error"
                onClick={() => {
                  const idToRemove = item.product?.id || item.productId;
                  if (idToRemove) {
                    handleRemoveProduct(idToRemove);
                  } else {
                    enqueueSnackbar("Không thể xác định ID sản phẩm", {
                      variant: "error",
                    });
                  }
                }}
                disabled={loading || operationInProgress}
              >
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        );
      });
    } catch (error) {
      console.error("Error rendering product list:", error);
      return (
        <TableRow>
          <TableCell colSpan={8} align="center">
            <Typography color="error">
              Lỗi hiển thị danh sách: {error.message || "Lỗi không xác định"}
            </Typography>
          </TableCell>
        </TableRow>
      );
    }
  };

  // Main render
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="flash-sale-products-dialog"
    >
      <DialogTitle id="flash-sale-products-dialog">
        {flashSale
          ? `Quản lý sản phẩm Flash Sale: ${flashSale.name || ""}`
          : "Quản lý sản phẩm Flash Sale"}
        {operationInProgress && (
          <CircularProgress
            size={24}
            sx={{
              position: "absolute",
              top: "50%",
              right: 16,
              marginTop: "-12px",
            }}
          />
        )}
      </DialogTitle>

      <DialogContent>
        {!flashSale ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="error">
              Không tìm thấy thông tin Flash Sale. Vui lòng đóng và thử lại.
            </Typography>
            <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
              Đóng
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Thêm sản phẩm mới vào Flash Sale
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={products || []}
                  getOptionLabel={(option) => {
                    if (!option) return "";
                    return (
                      option.name ||
                      option.productName ||
                      `ID: ${option.id || "Unknown"}` ||
                      ""
                    );
                  }}
                  value={selectedProduct}
                  onChange={handleProductChange}
                  renderOption={(props, option) => {
                    if (!option) return null;
                    return (
                      <li {...props}>
                        <strong>
                          {option.name || option.productName || "Unknown"}
                        </strong>{" "}
                        -
                        {option.price ? ` ${formatCurrency(option.price)}` : ""}{" "}
                        - ID: {option.id || "N/A"}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Chọn sản phẩm"
                      required
                      error={!!errors.productId}
                      helperText={
                        errors.productId ||
                        (!products || products.length === 0
                          ? "Không có sản phẩm để chọn"
                          : "")
                      }
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {productLoading && (
                              <CircularProgress color="inherit" size={20} />
                            )}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText="Không tìm thấy sản phẩm phù hợp"
                  loading={productLoading}
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
                      onClick={() => {
                        setProductLoading(true);
                        // Add small delay to ensure loading state is visible
                        setTimeout(() => {
                          fetchProducts(flashSaleItems)
                            .then(() => {
                              enqueueSnackbar(
                                "Danh sách sản phẩm đã được làm mới",
                                {
                                  variant: "success",
                                }
                              );
                            })
                            .catch(() => {})
                            .finally(() => {
                              setProductLoading(false);
                            });
                        }, 300);
                      }}
                      disabled={productLoading || operationInProgress}
                      fullWidth
                      startIcon={
                        productLoading ? <CircularProgress size={18} /> : null
                      }
                    >
                      {productLoading
                        ? "Đang làm mới..."
                        : "Làm mới danh sách sản phẩm"}
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
                  disabled={loading || operationInProgress || !selectedProduct}
                >
                  {operationInProgress ? "Đang thêm..." : "Thêm sản phẩm"}
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
                        <TableCell align="right">
                          Giá khuyến mãi (VNĐ)
                        </TableCell>
                        <TableCell align="center">Giảm giá (%)</TableCell>
                        <TableCell align="center">Số lượng tồn</TableCell>
                        <TableCell align="center">Đã bán</TableCell>
                        <TableCell align="center">Còn lại</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <SafeRender
                        fallback={
                          <TableRow>
                            <TableCell colSpan={8} align="center">
                              <Typography color="error">
                                Có lỗi khi hiển thị danh sách sản phẩm
                              </Typography>
                            </TableCell>
                          </TableRow>
                        }
                      >
                        {() => renderProductList()}
                      </SafeRender>
                    </TableBody>
                  </Table>
                  {flashSaleItems && flashSaleItems.length > 0 && (
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
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          color="primary"
          disabled={operationInProgress}
        >
          Đóng
        </Button>
        <Button
          onClick={() => fetchFlashSaleDetails()}
          color="secondary"
          disabled={loading || operationInProgress}
        >
          Làm mới
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FlashSaleProductsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  flashSale: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
};

export default FlashSaleProductsDialog;
