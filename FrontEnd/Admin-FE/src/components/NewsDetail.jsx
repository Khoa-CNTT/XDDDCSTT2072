import PropTypes from "prop-types";
import {
  Typography,
  Box,
  Paper,
  Divider,
  Chip,
  Link,
  Button,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Source as SourceIcon,
  Bookmark as BookmarkIcon,
  Label as LabelIcon,
} from "@mui/icons-material";

const NewsDetail = ({ news }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Format tags
  const formatTags = (tagsString) => {
    if (!tagsString) return [];
    return tagsString.split(",").map((tag) => tag.trim());
  };

  if (!news) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="body1">
          Không có thông tin tin tức để hiển thị
        </Typography>
      </Box>
    );
  }

  return (
    <Box component={Paper} sx={{ p: 3, mb: 3 }}>
      {/* Tiêu đề */}
      <Typography variant="h4" gutterBottom>
        {news.title}
      </Typography>

      {/* Thông tin meta */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">
            {formatDate(news.publishedDate)}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SourceIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">{news.sourceName || "N/A"}</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <BookmarkIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">
            <Chip
              label={news.category}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Chip
            label={news.active ? "Hiển thị" : "Ẩn"}
            size="small"
            color={news.active ? "success" : "default"}
          />
        </Box>
      </Box>

      {/* Hình ảnh */}
      {news.imageUrl && (
        <Box sx={{ mb: 3 }}>
          <img
            src={news.imageUrl}
            alt={news.title}
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
              borderRadius: "4px",
            }}
          />
        </Box>
      )}

      {/* Tóm tắt */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          component="div"
          sx={{ fontWeight: "bold", mb: 1 }}
        >
          Tóm tắt
        </Typography>
        <Typography variant="body1" sx={{ fontStyle: "italic" }}>
          {news.summary}
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Nội dung */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body1"
          component="div"
          sx={{
            lineHeight: 1.7,
            "& p": { mb: 2 },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              my: 2,
              display: "block",
              margin: "16px auto",
              borderRadius: "4px",
            },
          }}
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Tags */}
      {news.tags && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, display: "flex", alignItems: "center" }}
          >
            <LabelIcon fontSize="small" sx={{ mr: 0.5 }} />
            Thẻ
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {formatTags(news.tags).map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}

      {/* Liên kết đến nguồn */}
      <Box sx={{ mt: 3 }}>
        <Link
          href={news.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          underline="none"
        >
          <Button variant="outlined" size="small">
            Xem bài viết gốc
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

NewsDetail.propTypes = {
  news: PropTypes.object,
};

export default NewsDetail;
