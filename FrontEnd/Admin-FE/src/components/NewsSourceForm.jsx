import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
  FormHelperText,
} from "@mui/material";
import { createNewsSource, updateNewsSource } from "../services/newsService";

const NewsSourceForm = ({ source, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    articleSelector: "",
    titleSelector: "",
    summarySelector: "",
    contentSelector: "",
    imageSelector: "",
    dateSelector: "",
    dateFormat: "",
    category: "Nông nghiệp",
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form with existing source data if editing
  useEffect(() => {
    if (source) {
      setFormData({
        name: source.name || "",
        url: source.url || "",
        articleSelector: source.articleSelector || "",
        titleSelector: source.titleSelector || "",
        summarySelector: source.summarySelector || "",
        contentSelector: source.contentSelector || "",
        imageSelector: source.imageSelector || "",
        dateSelector: source.dateSelector || "",
        dateFormat: source.dateFormat || "",
        category: source.category || "Nông nghiệp",
        active: source.active !== undefined ? source.active : true,
      });
    }
  }, [source]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "active" ? checked : value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (source) {
        // Update existing source
        await updateNewsSource(source.id, formData);
      } else {
        // Create new source
        await createNewsSource(formData);
      }
      onClose(true); // Close and refresh
    } catch (err) {
      console.error("Error saving news source:", err);
      setError("Không thể lưu nguồn tin tức. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Thông tin cơ bản
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            name="name"
            label="Tên nguồn tin"
            fullWidth
            required
            value={formData.name}
            onChange={handleChange}
            margin="normal"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            name="url"
            label="URL nguồn tin"
            fullWidth
            required
            value={formData.url}
            onChange={handleChange}
            margin="normal"
            placeholder="https://example.com/news"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            name="category"
            label="Danh mục"
            fullWidth
            required
            value={formData.category}
            onChange={handleChange}
            margin="normal"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Cấu hình CSS Selector
          </Typography>
          <FormHelperText>
            Các CSS selector dưới đây được sử dụng để trích xuất nội dung từ
            trang web nguồn. Tham khảo tài liệu về CSS selector để biết thêm chi
            tiết.
          </FormHelperText>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            name="articleSelector"
            label="Article Selector"
            fullWidth
            required
            value={formData.articleSelector}
            onChange={handleChange}
            margin="normal"
            placeholder="article.story, div.news-item, ..."
            helperText="CSS selector để lấy danh sách bài viết từ trang danh sách"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            name="titleSelector"
            label="Title Selector"
            fullWidth
            required
            value={formData.titleSelector}
            onChange={handleChange}
            margin="normal"
            placeholder="h1.title, .article-heading, ..."
            helperText="CSS selector để lấy tiêu đề bài viết"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            name="summarySelector"
            label="Summary Selector"
            fullWidth
            value={formData.summarySelector}
            onChange={handleChange}
            margin="normal"
            placeholder="p.summary, .article-description, ..."
            helperText="CSS selector để lấy tóm tắt bài viết (không bắt buộc)"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            name="contentSelector"
            label="Content Selector"
            fullWidth
            value={formData.contentSelector}
            onChange={handleChange}
            margin="normal"
            placeholder="div.content, .article-body, ..."
            helperText="CSS selector để lấy nội dung bài viết"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            name="imageSelector"
            label="Image Selector"
            fullWidth
            value={formData.imageSelector}
            onChange={handleChange}
            margin="normal"
            placeholder="img.main, .article-image, ..."
            helperText="CSS selector để lấy hình ảnh chính của bài viết"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            name="dateSelector"
            label="Date Selector"
            fullWidth
            value={formData.dateSelector}
            onChange={handleChange}
            margin="normal"
            placeholder="span.date, .article-time, ..."
            helperText="CSS selector để lấy ngày đăng bài viết"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            name="dateFormat"
            label="Date Format"
            fullWidth
            value={formData.dateFormat}
            onChange={handleChange}
            margin="normal"
            placeholder="dd/MM/yyyy HH:mm:ss"
            helperText="Định dạng ngày (Java DateTimeFormatter)"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                name="active"
                checked={formData.active}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Kích hoạt nguồn tin tức"
          />
          <FormHelperText>
            Khi kích hoạt, nguồn tin tức này sẽ được sử dụng khi hệ thống tự
            động thu thập tin tức
          </FormHelperText>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Grid>
        )}

        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
        >
          <Button onClick={() => onClose()} sx={{ mr: 1 }}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {source ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

NewsSourceForm.propTypes = {
  source: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default NewsSourceForm;
