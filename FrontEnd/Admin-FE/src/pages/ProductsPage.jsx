import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Pagination,
  Skeleton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Stack,
  FormControlLabel,
  Switch,
  LinearProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  RestartAlt as ResetIcon,
  Category as CategoryIcon,
  LocalOffer as SaleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import productService from "../services/productService";
import { formatCurrency } from "../utils/formatters";
import ProductForm from "../components/ProductForm";

// Xóa SAMPLE_PRODUCTS nếu không sử dụng
// const SAMPLE_PRODUCTS = [...];

const SAMPLE_CATEGORIES = [
  { id: 1, name: "Rau củ hữu cơ" },
  { id: 2, name: "Trái cây nhập khẩu" },
  { id: 3, name: "Nông sản địa phương" },
];

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openProductForm, setOpenProductForm] = useState(false);
  const [formMode, setFormMode] = useState("add"); // 'add' hoặc 'edit'
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterOnSale, setFilterOnSale] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, rowsPerPage, searchQuery, filterCategory, filterOnSale, sortBy]);

  // Fetch products with filters applied
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let response;

      // Sử dụng forceRefreshProducts để đảm bảo dữ liệu luôn mới nhất
      console.log("Đang fetch dữ liệu mới nhất...");
      console.log("Bộ lọc hiện tại:", {
        searchQuery,
        filterCategory,
        filterOnSale,
        sortBy,
        page,
      });

      // Check if we need to use advanced search
      if (
        searchQuery ||
        filterCategory ||
        filterOnSale ||
        sortBy !== "newest"
      ) {
        const filters = {
          keyword: searchQuery || undefined,
          categoryId: filterCategory || undefined,
          onSaleOnly: filterOnSale,
          sortBy: sortBy, // Thêm tham số sắp xếp
        };
        console.log("Gọi advanced search với bộ lọc:", filters);
        response = await productService.advancedSearch(
          filters,
          page,
          rowsPerPage
        );
      } else {
        // Default fetch all products with force refresh
        console.log("Gọi default search không có bộ lọc");
        response = await productService.forceRefreshProducts(page, rowsPerPage);
      }

      // Debug log chi tiết từng sản phẩm
      if (response.content && response.content.length > 0) {
        console.log("===== DEBUG TRẠNG THÁI GIẢM GIÁ CỦA CÁC SẢN PHẨM =====");
        response.content.forEach((product) => {
          console.log(`ID: ${product.id} - ${product.productName}: 
            onSale = ${product.onSale}, 
            salePrice = ${product.salePrice}, 
            categoryId = ${product.categoryId},
            category = ${getCategoryName(product.categoryId)}`);
        });
      }

      if (response) {
        setProducts(response.content);
        setTotalItems(response.totalElements);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi tải dữ liệu sản phẩm",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await productService.getAllCategories();
      setCategories(response || []);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      // Sử dụng dữ liệu mẫu cho danh mục
      setCategories(SAMPLE_CATEGORIES);
    }
  };

  // Handle search
  const handleSearch = () => {
    setPage(0); // Reset to first page
    fetchProducts();
  };

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value, checked } = event.target;
    console.log(`Thay đổi ${name} thành:`, value || checked);

    if (name === "category") {
      setFilterCategory(value);
    } else if (name === "onSale") {
      setFilterOnSale(checked);
    } else if (name === "sortBy") {
      setSortBy(value);
    }
    setPage(0); // Reset to first page
    // fetchProducts được gọi tự động qua useEffect
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterCategory("");
    setFilterOnSale(false);
    setSortBy("newest");
    setPage(0);
    fetchProducts();
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1);
  };

  // Open edit form
  const handleEditProduct = (product) => {
    console.log("Thông tin sản phẩm trước khi cập nhật:", product);

    // Đảm bảo đồng bộ giữa imageUrl và thumbnailUrl
    if (!product.thumbnailUrl && product.imageUrl) {
      product.thumbnailUrl = product.imageUrl;
    } else if (!product.imageUrl && product.thumbnailUrl) {
      product.imageUrl = product.thumbnailUrl;
    }

    console.log("Thông tin sản phẩm sau khi điều chỉnh:", product);

    setSelectedProduct(product);
    setFormMode("edit");
    setOpenProductForm(true);
  };

  // Open delete dialog
  const handleDeleteDialog = (product) => {
    setSelectedProduct(product);
    setOpenDeleteDialog(true);
  };

  // Delete product
  const handleDeleteProduct = async () => {
    try {
      await productService.deleteProduct(selectedProduct.id);
      setSnackbar({
        open: true,
        message: "Xóa sản phẩm thành công!",
        severity: "success",
      });

      // Refresh the products list
      fetchProducts();

      // Close the dialog
      setOpenDeleteDialog(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      setSnackbar({
        open: true,
        message: "Không thể xóa sản phẩm. Vui lòng thử lại sau.",
        severity: "error",
      });
    }
  };

  // Open add form
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormMode("add");
    setOpenProductForm(true);
  };

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      let savedProduct;
      if (formMode === "add") {
        savedProduct = await productService.createProduct(formData);
        setSnackbar({
          open: true,
          message: "Thêm sản phẩm mới thành công!",
          severity: "success",
        });
      } else {
        savedProduct = await productService.updateProduct(
          selectedProduct.id,
          formData
        );
        setSnackbar({
          open: true,
          message: "Cập nhật sản phẩm thành công!",
          severity: "success",
        });
      }

      // Close form and refresh product list
      setOpenProductForm(false);

      // Đặt timeout ngắn để đảm bảo dữ liệu đã được cập nhật trên server
      setTimeout(() => {
        console.log("Force fetch lại dữ liệu sau khi cập nhật");
        fetchProducts();
      }, 500);

      return savedProduct;
    } catch (error) {
      console.error("Lỗi khi xử lý form:", error);
      setSnackbar({
        open: true,
        message: "Có lỗi xảy ra, vui lòng thử lại sau.",
        severity: "error",
      });
      throw error;
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setOpenProductForm(false);
    setSelectedProduct(null);
  };

  // View product details
  const handleViewProduct = (id) => {
    // Navigate to product detail page or open modal with product details
    console.log("Xem sản phẩm:", id);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Chưa phân loại";
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from(new Array(5)).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell>
          <Skeleton variant="rectangular" width={50} height={50} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Skeleton variant="circular" width={30} height={30} />
            <Skeleton variant="circular" width={30} height={30} />
            <Skeleton variant="circular" width={30} height={30} />
          </Box>
        </TableCell>
      </TableRow>
    ));
  };

  // Render statistics for dashboard-like view
  const renderStatistics = () => {
    const totalValue = products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );

    const totalProducts = products.length;

    const productsOnSale = products.filter(
      (product) => product.salePrice && product.salePrice > 0
    ).length;

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng sản phẩm
              </Typography>
              <Typography variant="h4" component="div">
                {totalProducts}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(totalProducts / 100) * 100}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng giá trị
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(totalValue)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={75}
                color="secondary"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Sản phẩm đang giảm giá
              </Typography>
              <Typography variant="h4" component="div">
                {productsOnSale}
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mt: 1 }}
              >
                <SaleIcon color="error" />
                <Typography variant="body2">
                  {((productsOnSale / totalProducts) * 100).toFixed(0)}% tổng
                  sản phẩm
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Danh mục
              </Typography>
              <Typography variant="h4" component="div">
                {categories.length}
              </Typography>
              <Button
                size="small"
                startIcon={<CategoryIcon />}
                sx={{ mt: 1 }}
                onClick={() => navigate("/categories")}
              >
                Quản lý danh mục
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Thêm hàm xử lý ảnh
  const handleImageError = (e, product) => {
    console.log(`Lỗi tải ảnh cho sản phẩm ${product.id}:`, product.imageUrl);
    if (e.target.src !== "/placeholder-image.png") {
      e.target.src = "/placeholder-image.png";
    }
  };

  // Thêm cache buster cho URLs hình ảnh
  const getImageUrlWithCacheBuster = (url) => {
    if (!url) return "/placeholder-image.png";

    const cacheBuster = new Date().getTime();

    // Kiểm tra nếu URL đã có tham số query
    if (url.includes("?")) {
      return `${url}&_t=${cacheBuster}`;
    } else {
      return `${url}?_t=${cacheBuster}`;
    }
  };

  // Handle refresh stock status
  const handleRefreshStockStatus = async () => {
    try {
      setLoading(true);
      setSnackbar({
        open: true,
        message: "Đang làm mới trạng thái sản phẩm...",
        severity: "info",
      });

      await productService.refreshAllStockStatus();

      // Refetch products after refreshing stock status
      await fetchProducts();

      setSnackbar({
        open: true,
        message: "Đã làm mới trạng thái tất cả sản phẩm",
        severity: "success",
      });
    } catch (error) {
      console.error("Lỗi khi làm mới trạng thái:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi làm mới trạng thái sản phẩm",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý sản phẩm
      </Typography>

      {/* Render statistics dashboard */}
      {!loading && products.length > 0 && renderStatistics()}

      {/* Search and filter bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={5}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery("")}>
                      <ResetIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Danh mục</InputLabel>
              <Select
                labelId="category-filter-label"
                value={filterCategory}
                onChange={(e) =>
                  handleFilterChange({
                    target: { name: "category", value: e.target.value },
                  })
                }
                label="Danh mục"
              >
                <MenuItem value="">Tất cả danh mục</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-filter-label">Sắp xếp theo</InputLabel>
              <Select
                labelId="sort-filter-label"
                value={sortBy}
                onChange={(e) =>
                  handleFilterChange({
                    target: { name: "sortBy", value: e.target.value },
                  })
                }
                label="Sắp xếp theo"
              >
                <MenuItem value="newest">Mới nhất</MenuItem>
                <MenuItem value="price-low">Giá tăng dần</MenuItem>
                <MenuItem value="price-high">Giá giảm dần</MenuItem>
                <MenuItem value="name-asc">Tên A-Z</MenuItem>
                <MenuItem value="name-desc">Tên Z-A</MenuItem>
                <MenuItem value="rating">Đánh giá cao nhất</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={1.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={filterOnSale}
                  onChange={(e) =>
                    handleFilterChange({
                      target: { name: "onSale", checked: e.target.checked },
                    })
                  }
                  color="primary"
                />
              }
              label="Giảm giá"
              sx={{ m: 0 }}
            />
          </Grid>

          <Grid size={1.5}>
            <Button
              fullWidth
              startIcon={<ResetIcon />}
              onClick={handleResetFilters}
              variant="outlined"
            >
              Đặt lại
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Action bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" component="div">
          {loading ? (
            <Skeleton width={150} />
          ) : (
            `Hiển thị ${products.length} / ${totalItems} sản phẩm`
          )}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={handleRefreshStockStatus}
            disabled={loading}
          >
            Làm mới trạng thái
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
          >
            Thêm sản phẩm
          </Button>
        </Box>
      </Box>

      {/* Products table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Tồn kho</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderSkeletons()
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        variant="rounded"
                        src={getImageUrlWithCacheBuster(product.imageUrl)}
                        alt={product.productName}
                        sx={{ width: 50, height: 50, mr: 2 }}
                        onError={(e) => handleImageError(e, product)}
                      />
                      <Typography variant="body2" fontWeight="medium">
                        {product.productName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {product.productName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      SKU: {product.sku || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {product.categoryId ? (
                      <Chip
                        size="small"
                        label={getCategoryName(product.categoryId)}
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      "Chưa phân loại"
                    )}
                  </TableCell>
                  <TableCell>
                    {product.salePrice ? (
                      <>
                        <Typography
                          variant="body2"
                          color="error"
                          fontWeight="bold"
                        >
                          {formatCurrency(product.salePrice)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ textDecoration: "line-through" }}
                        >
                          {formatCurrency(product.price)}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2">
                        {formatCurrency(product.price)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.quantity > 0 ? (
                      <Chip
                        size="small"
                        label={`${product.quantity} sản phẩm`}
                        color={product.quantity > 10 ? "success" : "warning"}
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        size="small"
                        label="Hết hàng"
                        color="error"
                        variant="outlined"
                      />
                    )}
                    {product.onSale && (
                      <Chip
                        size="small"
                        label="Đang giảm giá"
                        color="error"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {product.stockStatus === "IN_STOCK" ? (
                      <Chip size="small" label="Còn hàng" color="success" />
                    ) : product.stockStatus === "LOW_STOCK" ? (
                      <Chip size="small" label="Sắp hết hàng" color="warning" />
                    ) : (
                      <Chip size="small" label="Hết hàng" color="default" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewProduct(product.id)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditProduct(product)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteDialog(product)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box sx={{ py: 3 }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Không tìm thấy sản phẩm
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Thử thay đổi bộ lọc hoặc thêm sản phẩm mới
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                      onClick={handleAddProduct}
                    >
                      Thêm sản phẩm
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={Math.ceil(totalItems / rowsPerPage)}
            page={page + 1}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa sản phẩm &quot;
            {selectedProduct?.productName}&quot;? Hành động này không thể hoàn
            tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy bỏ</Button>
          <Button
            onClick={handleDeleteProduct}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Form Dialog */}
      <Dialog
        open={openProductForm}
        onClose={handleFormClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          <ProductForm
            initialData={selectedProduct}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsPage;
