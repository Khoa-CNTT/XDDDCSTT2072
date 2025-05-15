import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Tooltip,
  CardActions,
  Button,
  Skeleton,
} from "@mui/material";
import {
  WbSunny as SunnyIcon,
  Opacity as RainIcon,
  Grain as SeedIcon,
  AcUnit as ColdIcon,
  Whatshot as HotIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useState } from "react";

/**
 * Component hiển thị sản phẩm được gợi ý theo thời tiết (dành cho Admin)
 *
 * @param {Object} product - Thông tin sản phẩm cần hiển thị
 * @param {Object} weatherData - Dữ liệu thời tiết hiện tại
 * @param {String} recommendReason - Lý do gợi ý sản phẩm này (không bắt buộc)
 * @param {Function} onEdit - Hàm xử lý khi admin chỉnh sửa sản phẩm (không bắt buộc)
 * @param {Function} onViewDetail - Hàm xử lý khi admin xem chi tiết sản phẩm (không bắt buộc)
 * @returns {JSX.Element}
 */
const WeatherProductCard = ({
  product,
  weatherData,
  recommendReason,
  onEdit,
  onViewDetail,
}) => {
  // State quản lý quá trình tải ảnh
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Hàm trả về icon phù hợp dựa vào điều kiện thời tiết
  const getWeatherIcon = () => {
    if (!weatherData) return null;

    const description = weatherData.weatherDescription?.toLowerCase() || "";
    const temperature = weatherData.temperature || 0;

    if (description.includes("mưa") || description.includes("rain")) {
      return <RainIcon fontSize="small" sx={{ fontSize: 14 }} />;
    } else if (temperature > 30) {
      return <HotIcon fontSize="small" sx={{ fontSize: 14 }} color="error" />;
    } else if (temperature < 15) {
      return <ColdIcon fontSize="small" sx={{ fontSize: 14 }} color="info" />;
    } else {
      return (
        <SunnyIcon fontSize="small" sx={{ fontSize: 14 }} color="warning" />
      );
    }
  };

  // Hàm trả về tag phù hợp theo danh mục sản phẩm
  const getCategoryTag = () => {
    if (!product) return null;

    // Lấy tên danh mục, ưu tiên product.category nếu có
    const categoryName = product.category?.name || product.categoryName || "";
    if (!categoryName) return null;

    const category =
      typeof categoryName === "string" ? categoryName.toLowerCase() : "";

    if (category.includes("phân bón")) {
      return (
        <Chip
          size="small"
          label="Phân bón"
          color="success"
          sx={{ mr: 0.5, height: 20, fontSize: "0.65rem" }}
        />
      );
    } else if (category.includes("hạt giống")) {
      return (
        <Chip
          size="small"
          icon={<SeedIcon sx={{ fontSize: 12, mr: -0.5 }} />}
          label="Hạt giống"
          color="primary"
          sx={{ mr: 0.5, height: 20, fontSize: "0.65rem" }}
        />
      );
    } else if (category.includes("thiết bị")) {
      return (
        <Chip
          size="small"
          label="Thiết bị"
          color="secondary"
          sx={{ mr: 0.5, height: 20, fontSize: "0.65rem" }}
        />
      );
    } else {
      return (
        <Chip
          size="small"
          label={categoryName}
          variant="outlined"
          sx={{ mr: 0.5, height: 20, fontSize: "0.65rem" }}
        />
      );
    }
  };

  // Lấy URL ảnh, fallback về URL hình mặc định nếu không có ảnh
  const getImageUrl = () => {
    // Kiểm tra và lấy URL hình ảnh từ nhiều trường khác nhau
    if (product?.thumbnailUrl) {
      return product.thumbnailUrl;
    }
    if (product?.imageUrl) {
      return product.imageUrl;
    }
    if (product?.image) {
      return product.image;
    }

    // Fallback - URL ảnh mặc định theo danh mục
    const categoryName =
      product?.category?.name?.toLowerCase() ||
      product?.categoryName?.toLowerCase() ||
      "";

    if (categoryName.includes("phân bón")) {
      return "https://images.unsplash.com/photo-1624398996248-7c343cc448cd?auto=format&fit=crop&w=400&h=400&q=80";
    } else if (categoryName.includes("hạt giống")) {
      return "https://images.unsplash.com/photo-1582482100335-9798a3f19588?auto=format&fit=crop&w=400&h=400&q=80";
    } else if (categoryName.includes("thiết bị")) {
      return "https://images.unsplash.com/photo-1621947081720-86970823b77a?auto=format&fit=crop&w=400&h=400&q=80";
    } else if (categoryName.includes("thuốc")) {
      return "https://images.unsplash.com/photo-1585636874214-31656f2c33d3?auto=format&fit=crop&w=400&h=400&q=80";
    }

    // Ảnh mặc định
    return "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?auto=format&fit=crop&w=400&h=400&q=80";
  };

  // Hàm xử lý lỗi ảnh
  const handleImageError = (e) => {
    setImageError(true);
    setImageLoading(false);
    e.target.onerror = null; // Tránh lặp vô hạn nếu ảnh fallback cũng lỗi
    e.target.src =
      "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?auto=format&fit=crop&w=400&h=400&q=80";
  };

  // Hàm xử lý khi ảnh đã tải xong
  const handleImageLoaded = () => {
    setImageLoading(false);
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // Kiểm tra xem sản phẩm có đang giảm giá không
  const hasDiscount = product?.salePrice && product.salePrice < product.price;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
        borderRadius: 2,
        overflow: "hidden",
      }}
      elevation={2}
    >
      {weatherData && (
        <Tooltip
          title={`Phù hợp với thời tiết: ${
            weatherData.weatherDescription || "hiện tại"
          }`}
        >
          <Box
            sx={{
              position: "absolute",
              top: 5,
              right: 5,
              backgroundColor: "rgba(255,255,255,0.8)",
              borderRadius: "50%",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {getWeatherIcon()}
          </Box>
        </Tooltip>
      )}

      <Box
        sx={{
          paddingTop: "100%", // Đảm bảo tỷ lệ khung hình 1:1 (hình vuông)
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#f5f5f5", // Màu nền khi đang tải ảnh
        }}
      >
        {imageLoading && (
          <Skeleton
            variant="rectangular"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
            animation="wave"
          />
        )}
        {imageError && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              zIndex: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary" align="center">
              Không thể tải ảnh
            </Typography>
          </Box>
        )}
        <CardMedia
          component="img"
          image={getImageUrl()}
          alt={product.name || product.productName || "Sản phẩm nông nghiệp"}
          onError={handleImageError}
          onLoad={handleImageLoaded}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
            },
            zIndex: imageLoading || imageError ? 0 : 1,
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 1, pb: 0.5, px: 1 }}>
        <Typography
          variant="subtitle2"
          component="div"
          noWrap
          sx={{
            lineHeight: 1.2,
            mb: 0.5,
            fontSize: "0.75rem",
            fontWeight: "medium",
          }}
        >
          {product.name || product.productName || "Không có tên"}
        </Typography>

        <Box sx={{ mb: 0.5, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {getCategoryTag()}
          {product.inStock !== false ? (
            <Chip
              size="small"
              label="Còn hàng"
              color="success"
              variant="outlined"
              sx={{ height: 16, fontSize: "0.6rem" }}
            />
          ) : (
            <Chip
              size="small"
              label="Hết hàng"
              color="error"
              variant="outlined"
              sx={{ height: 16, fontSize: "0.6rem" }}
            />
          )}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            fontSize: "0.65rem",
            lineHeight: 1.2,
          }}
        >
          {product.description || "Không có mô tả"}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 0.5,
          }}
        >
          <Box>
            {hasDiscount ? (
              <>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textDecoration: "line-through",
                    fontSize: "0.65rem",
                    display: "block",
                  }}
                >
                  {formatPrice(product.price)}
                </Typography>
                <Typography
                  variant="body2"
                  color="error"
                  fontWeight="medium"
                  fontSize="0.75rem"
                >
                  {formatPrice(product.salePrice)}
                </Typography>
              </>
            ) : (
              <Typography
                variant="body2"
                color="primary"
                fontWeight="medium"
                fontSize="0.75rem"
              >
                {formatPrice(product.price)}
              </Typography>
            )}
          </Box>
          {product.rating && (
            <Chip
              size="small"
              label={`${product.rating}/5`}
              color="primary"
              variant="outlined"
              sx={{ height: 16, fontSize: "0.6rem" }}
            />
          )}
        </Box>

        {recommendReason && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "flex-start" }}>
            <InfoIcon
              fontSize="small"
              color="info"
              sx={{ mr: 0.5, mt: 0.3, fontSize: "0.8rem" }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.65rem" }}
            >
              {recommendReason}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 0.5, pt: 0, justifyContent: "space-between" }}>
        {onViewDetail && (
          <Button
            size="small"
            startIcon={<VisibilityIcon sx={{ fontSize: 12 }} />}
            onClick={() => onViewDetail(product)}
            variant="text"
            sx={{
              borderRadius: 28,
              fontSize: "0.6rem",
              p: 0.3,
              minWidth: "auto",
            }}
          >
            Chi tiết
          </Button>
        )}
        {onEdit && (
          <Button
            size="small"
            color="secondary"
            startIcon={<EditIcon sx={{ fontSize: 12 }} />}
            onClick={() => onEdit(product)}
            variant="text"
            sx={{
              borderRadius: 28,
              fontSize: "0.6rem",
              p: 0.3,
              minWidth: "auto",
            }}
          >
            Sửa
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

WeatherProductCard.propTypes = {
  product: PropTypes.object,
  weatherData: PropTypes.object,
  recommendReason: PropTypes.string,
  onEdit: PropTypes.func,
  onViewDetail: PropTypes.func,
};

export default WeatherProductCard;
