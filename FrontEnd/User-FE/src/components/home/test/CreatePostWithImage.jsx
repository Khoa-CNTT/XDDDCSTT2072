import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useState } from "react";

const CreatePostWithImage = () => {
  const axiosPrivate = useAxiosPrivate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append(
        "post",
        new Blob([JSON.stringify({ title, content, privacyLevel: "PUBLIC" })], {
          type: "application/json",
        })
      );
      images.forEach((img) => {
        formData.append("images", img);
      });

      // Sử dụng axiosPrivate đã cấu hình sẵn
      const response = await axiosPrivate.post("posts/with-images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Tạo bài viết thành công!");
      setTitle("");
      setContent("");
      setImages([]);
      console.log(response.data);
    } catch (error) {
      alert("Tạo bài viết thất bại!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>Tạo bài viết mới</h2>
      <div>
        <label>Tiêu đề:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={5}
          maxLength={200}
        />
      </div>
      <div>
        <label>Nội dung:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          minLength={10}
          maxLength={5000}
        />
      </div>
      <div>
        <label>Ảnh (có thể chọn nhiều):</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Đang gửi..." : "Tạo bài viết"}
      </button>
    </form>
  );
};

export default CreatePostWithImage;
