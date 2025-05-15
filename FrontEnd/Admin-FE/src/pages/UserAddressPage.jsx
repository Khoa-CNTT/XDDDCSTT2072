import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Skeleton,
  Snackbar,
  Alert,
  Autocomplete,
  Chip,
  InputAdornment,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  LocationCity as LocationCityIcon,
  Public as PublicIcon,
  LocalPostOffice as PostalCodeIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  RestartAlt as ResetIcon,
} from "@mui/icons-material";
import userAddressService from "../services/userAddressService";
import userService from "../services/userService";

const UserAddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    userId: "",
    address: "",
    city: "",
    country: "Việt Nam",
    postalCode: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Thêm state cho bộ lọc và sắp xếp
  const [filterCity, setFilterCity] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [availableCities, setAvailableCities] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);

  // Fetch addresses with better error handling
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await userAddressService.getAllAddresses(
        page,
        rowsPerPage
      );
      const addressesData = response.content || response || [];
      setAddresses(addressesData);
      setFilteredAddresses(addressesData);
      setTotalItems(response.totalElements || (response ? response.length : 0));

      // Extract unique cities for the filter dropdown
      const cities = [...new Set(addressesData.map((addr) => addr.city))]
        .filter(Boolean)
        .sort();
      setAvailableCities(cities);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải danh sách địa chỉ",
        severity: "error",
      });
      // Set empty addresses to prevent displaying old data
      setAddresses([]);
      setFilteredAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting - improved to manage state correctly
  useEffect(() => {
    if (!loading && addresses.length > 0) {
      let result = [...addresses];

      // Apply city filter if selected
      if (filterCity) {
        result = result.filter((address) => address.city === filterCity);
      }

      // Apply sorting
      switch (sortOrder) {
        case "newest":
          result.sort((a, b) => b.id - a.id);
          break;
        case "oldest":
          result.sort((a, b) => a.id - b.id);
          break;
        case "a-z":
          result.sort((a, b) =>
            (a.address || "").localeCompare(b.address || "")
          );
          break;
        case "z-a":
          result.sort((a, b) =>
            (b.address || "").localeCompare(a.address || "")
          );
          break;
        default:
          break;
      }

      setFilteredAddresses(result);
      setTotalItems(result.length);
    }
  }, [addresses, filterCity, sortOrder, loading]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers(0, 100);
      setUsers(response.content || response);
    } catch (error) {
      console.error("Error fetching users:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải danh sách người dùng",
        severity: "error",
      });
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchAddresses();
    fetchUsers();
  }, [page, rowsPerPage]);

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle user selection
  const handleUserChange = (e) => {
    const userId = parseInt(e.target.value);
    setAddressForm((prev) => ({
      ...prev,
      userId: userId,
    }));
  };

  // Show add address dialog
  const handleAddAddress = () => {
    setAddressForm({
      userId: "",
      address: "",
      city: "",
      country: "Việt Nam",
      postalCode: "",
    });
    setSelectedAddress(null);
    setOpenDialog(true);
  };

  // Show edit address dialog
  const handleEditAddress = (address) => {
    setSelectedAddress(address);
    setAddressForm({
      userId: address.userId,
      address: address.address,
      city: address.city,
      country: address.country,
      postalCode: address.postalCode,
    });
    setOpenDialog(true);
  };

  // Show delete confirmation dialog
  const handleDeleteDialog = (address) => {
    setSelectedAddress(address);
    setOpenDeleteDialog(true);
  };

  // Submit form with improved state management
  const handleSubmit = async () => {
    try {
      // Form validation
      if (
        !addressForm.userId ||
        !addressForm.address ||
        !addressForm.city ||
        !addressForm.country ||
        !addressForm.postalCode
      ) {
        setSnackbar({
          open: true,
          message: "Vui lòng điền đầy đủ thông tin địa chỉ",
          severity: "error",
        });
        return;
      }

      setLoading(true);
      let updatedAddress;

      // Create or update address
      if (selectedAddress) {
        // Update existing address
        updatedAddress = await userAddressService.updateAddress(
          selectedAddress.id,
          addressForm
        );

        // Update the addresses in state to avoid a full refresh
        const updatedAddressIndex = addresses.findIndex(
          (a) => a.id === selectedAddress.id
        );
        if (updatedAddressIndex !== -1) {
          const updatedAddresses = [...addresses];
          updatedAddresses[updatedAddressIndex] = updatedAddress;
          setAddresses(updatedAddresses);

          // Also update filtered addresses if necessary
          const filteredIndex = filteredAddresses.findIndex(
            (a) => a.id === selectedAddress.id
          );
          if (filteredIndex !== -1) {
            const updatedFiltered = [...filteredAddresses];
            updatedFiltered[filteredIndex] = updatedAddress;
            setFilteredAddresses(updatedFiltered);
          }
        }

        setSnackbar({
          open: true,
          message: "Cập nhật địa chỉ thành công",
          severity: "success",
        });
      } else {
        // Create new address
        updatedAddress = await userAddressService.createAddress(addressForm);

        // Add the new address to state to avoid a full refresh
        const updatedAddresses = [updatedAddress, ...addresses];
        setAddresses(updatedAddresses);

        // Update filtered addresses if the new address should be visible with current filters
        let shouldAddToFiltered = true;

        // Check if city filter is active
        if (filterCity && updatedAddress.city !== filterCity) {
          shouldAddToFiltered = false;
        }

        // Check if user filter is active
        if (selectedUserId && updatedAddress.userId !== selectedUserId) {
          shouldAddToFiltered = false;
        }

        if (shouldAddToFiltered) {
          const updatedFiltered = [updatedAddress, ...filteredAddresses];
          setFilteredAddresses(updatedFiltered);
        }

        // Update available cities if needed
        if (
          !availableCities.includes(updatedAddress.city) &&
          updatedAddress.city
        ) {
          setAvailableCities([...availableCities, updatedAddress.city].sort());
        }

        setSnackbar({
          open: true,
          message: "Thêm địa chỉ thành công",
          severity: "success",
        });
      }

      // Close dialog and reset form
      setOpenDialog(false);
      setAddressForm({
        userId: "",
        address: "",
        city: "",
        country: "Việt Nam",
        postalCode: "",
      });
      setSelectedAddress(null);
    } catch (error) {
      console.error("Error saving address:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi lưu địa chỉ: " + (error.message || "Không xác định"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete address with improved state management
  const handleDeleteAddress = async () => {
    if (!selectedAddress) return;

    try {
      setLoading(true);
      await userAddressService.deleteAddress(selectedAddress.id);

      // Remove the address from state to avoid a full refresh
      const updatedAddresses = addresses.filter(
        (a) => a.id !== selectedAddress.id
      );
      setAddresses(updatedAddresses);

      // Update filtered addresses
      const updatedFiltered = filteredAddresses.filter(
        (a) => a.id !== selectedAddress.id
      );
      setFilteredAddresses(updatedFiltered);

      // Update total items
      setTotalItems((prevTotal) => Math.max(0, prevTotal - 1));

      setSnackbar({
        open: true,
        message: "Xóa địa chỉ thành công",
        severity: "success",
      });
      setOpenDeleteDialog(false);
      setSelectedAddress(null);
    } catch (error) {
      console.error("Error deleting address:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi xóa địa chỉ: " + (error.message || "Không xác định"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter addresses by user with improved state management
  const handleFilterByUser = async (userId) => {
    setLoading(true);
    try {
      if (userId) {
        setSelectedUserId(userId);
        const userAddresses = await userAddressService.getUserAddresses(userId);
        const addressesData = userAddresses || [];
        setAddresses(addressesData);

        // Apply any active city filter to the new dataset
        if (filterCity) {
          const filtered = addressesData.filter(
            (addr) => addr.city === filterCity
          );
          setFilteredAddresses(filtered);
          setTotalItems(filtered.length);
        } else {
          setFilteredAddresses(addressesData);
          setTotalItems(addressesData.length);
        }

        // Update available cities for this user
        const cities = [...new Set(addressesData.map((addr) => addr.city))]
          .filter(Boolean)
          .sort();
        setAvailableCities(cities);

        // Reset city filter if the selected city is not available for this user
        if (filterCity && !cities.includes(filterCity)) {
          setFilterCity("");
        }
      } else {
        setSelectedUserId(null);
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Error filtering addresses:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi lọc địa chỉ theo người dùng",
        severity: "error",
      });
      // Set empty addresses on error to prevent showing incorrect data
      setAddresses([]);
      setFilteredAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle city filter change
  const handleCityFilterChange = (event) => {
    setFilterCity(event.target.value);
  };

  // Handle sort order change
  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedUserId(null);
    setFilterCity("");
    setSortOrder("newest");
    fetchAddresses();
  };

  // Handle pagination with better state management
  const handlePageChange = async (event, newPage) => {
    // Only fetch new data if page has changed
    if (newPage !== page) {
      setPage(newPage);
      if (selectedUserId) {
        await handleFilterByUser(selectedUserId);
      } else {
        await fetchAddresses();
      }
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.fullName || user.userName : "Unknown";
  };

  // Render skeleton loading state
  const renderSkeletons = () => {
    return Array(rowsPerPage)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell>
            <Skeleton variant="text" width={30} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={120} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={200} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={100} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={100} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={80} />
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Skeleton variant="circular" width={30} height={30} />
              <Skeleton variant="circular" width={30} height={30} />
            </Box>
          </TableCell>
        </TableRow>
      ));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Page title */}
      <Typography variant="h4" gutterBottom>
        Quản lý địa chỉ người dùng
      </Typography>

      {/* User filter - Improved version */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6">Lọc theo người dùng</Typography>
          </Box>

          <Box
            sx={{ display: "flex", alignItems: "center", flexGrow: 1, gap: 2 }}
          >
            <Autocomplete
              sx={{ minWidth: 300, flexGrow: 1 }}
              options={users}
              getOptionLabel={(option) =>
                `${option.fullName || option.userName} (${option.email})`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tìm kiếm người dùng"
                  variant="outlined"
                  placeholder="Nhập tên hoặc email..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="body1" fontWeight="bold">
                      {option.fullName || option.userName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </li>
              )}
              onChange={(event, newValue) => {
                handleFilterByUser(newValue ? newValue.id : null);
              }}
              value={users.find((user) => user.id === selectedUserId) || null}
            />

            <Tooltip title="Đặt lại tất cả bộ lọc">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ResetIcon />}
                onClick={handleResetFilters}
                disabled={
                  !selectedUserId && !filterCity && sortOrder === "newest"
                }
              >
                Đặt lại
              </Button>
            </Tooltip>
          </Box>

          {selectedUserId && (
            <Chip
              label={`Đang lọc: ${
                users.find((user) => user.id === selectedUserId)?.fullName ||
                users.find((user) => user.id === selectedUserId)?.userName ||
                "Người dùng đã chọn"
              }`}
              color="primary"
              onDelete={() => handleFilterByUser(null)}
              sx={{ fontWeight: "medium" }}
            />
          )}
        </Box>
      </Paper>

      {/* Action buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddAddress}
        >
          Thêm địa chỉ mới
        </Button>

        {/* Additional options: Advanced filters */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Thành phố</InputLabel>
            <Select
              label="Thành phố"
              value={filterCity}
              onChange={handleCityFilterChange}
            >
              <MenuItem value="">Tất cả thành phố</MenuItem>
              {availableCities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sắp xếp</InputLabel>
            <Select
              label="Sắp xếp"
              value={sortOrder}
              onChange={handleSortOrderChange}
            >
              <MenuItem value="newest">Mới nhất</MenuItem>
              <MenuItem value="oldest">Cũ nhất</MenuItem>
              <MenuItem value="a-z">A-Z (Địa chỉ)</MenuItem>
              <MenuItem value="z-a">Z-A (Địa chỉ)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Data table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Người dùng</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell>Thành phố</TableCell>
                <TableCell>Quốc gia</TableCell>
                <TableCell>Mã bưu chính</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? renderSkeletons()
                : filteredAddresses.map((address) => (
                    <TableRow key={address.id} hover>
                      <TableCell>{address.id}</TableCell>
                      <TableCell>{getUserName(address.userId)}</TableCell>
                      <TableCell>{address.address}</TableCell>
                      <TableCell>{address.city}</TableCell>
                      <TableCell>{address.country}</TableCell>
                      <TableCell>{address.postalCode}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditAddress(address)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteDialog(address)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              {!loading && filteredAddresses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Không có địa chỉ nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <Pagination
            count={Math.ceil(totalItems / rowsPerPage)}
            page={page + 1}
            onChange={(e, value) => handlePageChange(e, value - 1)}
            color="primary"
          />
        </Box>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* User selection */}
            <Grid item xs={12}>
              <TextField
                select
                label="Người dùng"
                name="userId"
                value={addressForm.userId}
                onChange={handleUserChange}
                fullWidth
                required
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">-- Chọn người dùng --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.userName} ({user.email})
                  </option>
                ))}
              </TextField>
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                label="Địa chỉ"
                name="address"
                value={addressForm.address}
                onChange={handleFormChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: <HomeIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            {/* City */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Thành phố"
                name="city"
                value={addressForm.city}
                onChange={handleFormChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <LocationCityIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>

            {/* Country */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quốc gia"
                name="country"
                value={addressForm.country}
                onChange={handleFormChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: <PublicIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            {/* Postal Code */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mã bưu chính"
                name="postalCode"
                value={addressForm.postalCode}
                onChange={handleFormChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <PostalCodeIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedAddress ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa địa chỉ này không? Hành động này không thể
            hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteAddress}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
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

export default UserAddressPage;
