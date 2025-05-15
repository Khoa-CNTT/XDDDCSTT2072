import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
  alpha,
  TextField,
  InputAdornment,
  styled,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { visuallyHidden } from "@mui/utils";
import PropTypes from "prop-types";

// Hàm so sánh để sắp xếp
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Hàm sắp xếp mảng chính
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// Component TableHead
function EnhancedTableHead({
  columns,
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
  enableSelection,
}) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
        {enableSelection && (
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                "aria-label": "select all",
              }}
            />
          </TableCell>
        )}
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.numeric ? "right" : "left"}
            padding={column.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === column.id ? order : false}
            sx={{
              minWidth: column.minWidth,
              fontWeight: "bold",
              whiteSpace: "nowrap",
              borderBottom: "2px solid rgba(224, 224, 224, 1)",
              fontSize: "0.875rem",
              position: "sticky",
              top: 0,
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              zIndex: 1,
            }}
          >
            {column.sortable ? (
              <TableSortLabel
                active={orderBy === column.id}
                direction={orderBy === column.id ? order : "asc"}
                onClick={createSortHandler(column.id)}
              >
                {column.label}
                {orderBy === column.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
        {/* Actions column */}
        <TableCell
          align="right"
          sx={{
            fontWeight: "bold",
            whiteSpace: "nowrap",
            borderBottom: "2px solid rgba(224, 224, 224, 1)",
            fontSize: "0.875rem",
            minWidth: 120,
            position: "sticky",
            top: 0,
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            zIndex: 1,
          }}
        >
          Thao tác
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

// Thêm PropTypes
EnhancedTableHead.propTypes = {
  columns: PropTypes.array.isRequired,
  onSelectAllClick: PropTypes.func,
  order: PropTypes.oneOf(["asc", "desc"]),
  orderBy: PropTypes.string,
  numSelected: PropTypes.number,
  rowCount: PropTypes.number,
  onRequestSort: PropTypes.func.isRequired,
  enableSelection: PropTypes.bool,
};

// Component Toolbar
function EnhancedTableToolbar({
  numSelected,
  title,
  onDelete,
  filterComponent,
}) {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
        position: "sticky",
        top: 0,
        zIndex: 2,
        backgroundColor: "white",
        borderBottom: "1px solid rgba(224, 224, 224, 0.7)",
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          Đã chọn {numSelected} mục
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {title}
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Xóa">
          <IconButton onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        filterComponent || (
          <Tooltip title="Lọc danh sách">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )
      )}
    </Toolbar>
  );
}

// Thêm PropTypes cho EnhancedTableToolbar
EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number,
  title: PropTypes.string,
  onDelete: PropTypes.func,
  filterComponent: PropTypes.node,
};

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid #e0e0e0",
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: "#1976d2",
  "& .MuiTableCell-head": {
    color: "#ffffff",
    fontWeight: "bold",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#f5f9ff",
  },
  "&:hover": {
    backgroundColor: "#e3f2fd",
  },
  // Hiệu ứng màu khi chọn hàng
  "&.Mui-selected": {
    backgroundColor: "#bbdefb",
    "&:hover": {
      backgroundColor: "#90caf9",
    },
  },
}));

// Component DataTable chính
const DataTable = ({
  columns,
  data,
  title,
  selectable = false,
  onSelectionChange,
  onRowClick,
  loading = false,
  pagination = true,
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  orderBy: defaultOrderBy = "",
  order: defaultOrder = "asc",
  // Các props đặc biệt
  toolbarActions = null,
  refreshData = null,
  addAction = null,
  searchable = false,
  searchPlaceholder = "Tìm kiếm...",
  onSearch = null,
  filterComponent = null,
}) => {
  // Debug log
  console.log("DataTable received data:", data);
  console.log("DataTable columns:", columns);

  const [order, setOrder] = useState(defaultOrder);
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    if (!selectable) return;

    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const sortedData = () => {
    return stableSort(data, getComparator(order, orderBy));
  };

  const paginatedData = () => {
    const sorted = sortedData();
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return sorted.slice(start, end);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {/* Toolbar khi có hàng được chọn */}
      {selectable && selected.length > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.activatedOpacity
              ),
          }}
        >
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {selected.length} đã chọn
          </Typography>

          <Tooltip title="Xóa">
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      )}

      {/* Toolbar mặc định */}
      {!selectable || selected.length === 0 ? (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            justifyContent: "space-between",
            backgroundColor: "#f5f9ff",
            borderBottom: "1px solid #e3f2fd",
          }}
        >
          <Typography variant="h6" id="tableTitle" component="div">
            {title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Thành phần tìm kiếm tùy chọn */}
            {searchable && onSearch && (
              <TextField
                size="small"
                variant="outlined"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                sx={{ mr: 1, minWidth: "200px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {/* Thành phần lọc tùy chọn */}
            {filterComponent && <Box sx={{ mr: 1 }}>{filterComponent}</Box>}

            {/* Các action tùy chọn */}
            {toolbarActions}

            {/* Nút làm mới dữ liệu */}
            {refreshData && (
              <Tooltip title="Làm mới">
                <IconButton onClick={refreshData}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Nút thêm mới */}
            {addAction && (
              <Tooltip title="Thêm mới">
                <IconButton color="primary" onClick={addAction}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      ) : null}

      {/* Bảng dữ liệu */}
      <StyledTableContainer>
        <Table
          sx={{ minWidth: 750 }}
          size="medium"
          aria-labelledby="tableTitle"
        >
          <StyledTableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selected.length > 0 && selected.length < data.length
                    }
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                    inputProps={{
                      "aria-label": "select all",
                    }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.numeric ? "right" : "left"}
                  padding={column.disablePadding ? "none" : "normal"}
                  sortDirection={orderBy === column.id ? order : false}
                  sx={{ minWidth: column.minWidth }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={handleRequestSort}
                    >
                      {column.label}
                      {orderBy === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === "desc"
                            ? "sorted descending"
                            : "sorted ascending"}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {loading ? (
              // Hiển thị trạng thái đang tải
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  align="center"
                  sx={{ py: 5 }}
                >
                  <CircularProgress color="primary" />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Đang tải dữ liệu...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : sortedData().length === 0 ? (
              // Hiển thị khi không có dữ liệu
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  align="center"
                  sx={{ py: 5 }}
                >
                  <Typography variant="body1">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            ) : (
              // Hiển thị dữ liệu
              paginatedData().map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `data-table-checkbox-${index}`;

                return (
                  <StyledTableRow
                    hover
                    onClick={(event) => {
                      if (onRowClick) {
                        onRowClick(row);
                      }
                      if (selectable) {
                        handleClick(event, row.id);
                      }
                    }}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{
                      cursor: selectable || onRowClick ? "pointer" : "default",
                    }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.numeric ? "right" : "left"}
                        >
                          {column.format && typeof value === "number"
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </StyledTableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Phân trang */}
      {pagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={sortedData().length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count}`
          }
          sx={{
            backgroundColor: "#f5f9ff",
            borderTop: "1px solid #e3f2fd",
          }}
        />
      )}
    </Paper>
  );
};

// Kiểm tra kiểu dữ liệu cho props
DataTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  title: PropTypes.string,
  selectable: PropTypes.bool,
  onSelectionChange: PropTypes.func,
  onRowClick: PropTypes.func,
  loading: PropTypes.bool,
  pagination: PropTypes.bool,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  defaultRowsPerPage: PropTypes.number,
  orderBy: PropTypes.string,
  order: PropTypes.oneOf(["asc", "desc"]),
  toolbarActions: PropTypes.node,
  refreshData: PropTypes.func,
  addAction: PropTypes.func,
  searchable: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  onSearch: PropTypes.func,
  filterComponent: PropTypes.node,
};

export default DataTable;
