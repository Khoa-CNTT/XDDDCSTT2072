import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  Refresh,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import productCategoryService from "../services/productCategoryService";
import CategoryForm from "../components/CategoryForm";

const CategoriesPage = () => {
  // State cho danh sách danh mục
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State cho modal thêm/sửa danh mục
  const [openForm, setOpenForm] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formMode, setFormMode] = useState("add"); // "add" hoặc "edit"

  // State cho dialog xác nhận xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  // Fetch danh sách danh mục
  useEffect(() => {
    fetchCategories();
  }, [page, rowsPerPage, refreshTrigger]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      let response;
      if (searchTerm.trim()) {
        // Nếu có từ khóa tìm kiếm
        response = await productCategoryService.searchCategories(
          searchTerm,
          page,
          rowsPerPage
        );
      } else {
        // Lấy tất cả danh mục phân trang
        response = await productCategoryService.getAllCategoriesPaged(
          page,
          rowsPerPage
        );
      }

      console.log("Dữ liệu danh mục:", response);
      setCategories(response.content || []);
      setTotalItems(response.totalElements || 0);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      enqueueSnackbar("Không thể tải danh sách danh mục", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Xử lý thay đổi số hàng mỗi trang
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    setPage(0);
    fetchCategories();
  };

  // Xử lý làm mới danh sách
  const handleRefresh = () => {
    setSearchTerm("");
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Xử lý mở form thêm mới
  const handleAddCategory = () => {
    setCurrentCategory(null);
    setFormMode("add");
    setOpenForm(true);
  };

  // Xử lý mở form chỉnh sửa
  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setFormMode("edit");
    setOpenForm(true);
  };

  // Xử lý mở dialog xác nhận xóa
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  // Xử lý đóng dialog xóa
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  // Xử lý xóa danh mục
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await productCategoryService.deleteCategory(categoryToDelete.id);
      enqueueSnackbar("Xóa danh mục thành công", { variant: "success" });
      handleCloseDeleteDialog();
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        enqueueSnackbar(`Lỗi: ${error.response.data.message}`, {
          variant: "error",
        });
      } else {
        enqueueSnackbar(
          "Không thể xóa danh mục. Có thể còn sản phẩm liên kết đến danh mục này.",
          {
            variant: "error",
          }
        );
      }
      handleCloseDeleteDialog();
    }
  };

  // Xử lý lưu danh mục (thêm mới/cập nhật)
  const handleSaveCategory = async (formData) => {
    try {
      if (formMode === "add") {
        await productCategoryService.createCategory(formData);
        enqueueSnackbar("Thêm danh mục thành công", { variant: "success" });
      } else {
        await productCategoryService.updateCategory(
          currentCategory.id,
          formData
        );
        enqueueSnackbar("Cập nhật danh mục thành công", {
          variant: "success",
        });
      }
      setOpenForm(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(
        `Lỗi khi ${formMode === "add" ? "thêm" : "cập nhật"} danh mục:`,
        error
      );
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        enqueueSnackbar(`Lỗi: ${error.response.data.message}`, {
          variant: "error",
        });
      } else {
        enqueueSnackbar(
          `Không thể ${
            formMode === "add" ? "thêm" : "cập nhật"
          } danh mục. Vui lòng thử lại.`,
          { variant: "error" }
        );
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        Quản lý danh mục sản phẩm
      </Typography>

      {/* Phần thống kê */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item size={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng số danh mục
              </Typography>
              <Typography variant="h4" component="div">
                {loading ? <CircularProgress size={24} /> : totalItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Thanh công cụ */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <TextField
          label="Tìm kiếm danh mục"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          sx={{ flexGrow: 1, maxWidth: { sm: 400 } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} edge="end">
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddCategory}
          >
            Thêm danh mục
          </Button>
        </Box>
      </Box>

      {/* Bảng danh sách danh mục */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Hình ảnh</TableCell>
                <TableCell>Tên danh mục</TableCell>
                <TableCell>Danh mục cha</TableCell>
                <TableCell>Thứ tự hiển thị</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Không có danh mục nào
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell>
                      {category.imageUrl ? (
                        <Box
                          component="img"
                          src={category.imageUrl}
                          alt={category.name}
                          sx={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 1,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            bgcolor: "grey.200",
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            No image
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      {category.parentName || (
                        <Typography variant="caption" color="text.secondary">
                          Danh mục gốc
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{category.displayOrder || 0}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={category.isActive ? "Hiển thị" : "Ẩn"}
                        color={category.isActive ? "success" : "default"}
                        icon={
                          category.isActive ? <Visibility /> : <VisibilityOff />
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(category)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>

      {/* Form thêm/sửa danh mục */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {formMode === "add" ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"}
        </DialogTitle>
        <DialogContent>
          <CategoryForm
            initialData={currentCategory}
            onSubmit={handleSaveCategory}
            onCancel={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa danh mục &ldquo;
            {categoryToDelete?.name}&rdquo;? Thao tác này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button
            onClick={handleDeleteCategory}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;
