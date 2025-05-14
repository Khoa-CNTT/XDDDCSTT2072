import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FaImage, FaVideo, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/hooks/useAuth";
import { Globe, ChevronDown, Lock, Users } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";

// Hàm hỗ trợ trích xuất hashtag từ nội dung
const extractHashtags = (content) => {
  if (!content) return [];

  const hashtagRegex =
    /#[a-zA-Z0-9_\u00C0-\u017Fàáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]+/g;
  const matches = content.match(hashtagRegex);

  if (!matches) return [];

  // Trích xuất chỉ tên hashtag (bỏ ký tự #)
  return matches.map((tag) => tag.substring(1));
};

const backgrounds = [
  { id: "default", color: "bg-white text-black", label: "Mặc định" },
  {
    id: "green-blue",
    color: "bg-gradient-to-r from-green-400 to-blue-500 text-white",
    label: "Xanh lá - Xanh dương",
  },
  {
    id: "purple-pink",
    color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    label: "Tím - Hồng",
  },
  {
    id: "yellow-orange",
    color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
    label: "Vàng - Cam",
  },
  { id: "dark", color: "bg-gray-900 text-white", label: "Đen" },
  { id: "blue", color: "bg-blue-600 text-white", label: "Xanh dương" },
];

const emoji = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😃",
  "😄",
  "😅",
  "😆",
  "😉",
  "😊",
  "😋",
  "😎",
  "😍",
  "😘",
  "🥰",
  "😗",
  "😙",
  "😚",
  "🙂",
  "🤗",
];

// eslint-disable-next-line react/prop-types
const CreatePostForm = ({
  onSubmit,
  editMode = false,
  initialPost = null,
  onCancel = null,
}) => {
  const { auth } = useAuth();
  const user = auth?.user || {};

  const fileInputRef = useRef(null);
  const addMoreFileInputRef = useRef(null);
  const editorRef = useRef(null);

  // Map initialPost background_color if it's an ID to the actual color class
  const getInitialBackground = () => {
    if (!initialPost?.background_color) return "bg-white text-black";

    // If the initialPost background is an ID, find the matching color
    const foundBg = backgrounds.find(
      (bg) => bg.id === initialPost.background_color
    );
    if (foundBg) return foundBg.color;

    // Otherwise assume it's already a color class
    return initialPost.background_color;
  };

  // Form state
  const [title, setTitle] = useState(initialPost?.title || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);
  const [location, setLocation] = useState(initialPost?.location || "");
  const [feeling, setFeeling] = useState(initialPost?.feeling || "");
  const [privacy, setPrivacy] = useState(
    initialPost?.privacyLevel || initialPost?.privacy_level || "PUBLIC"
  );
  const [backgroundCssClass, setBackgroundCssClass] = useState(
    getInitialBackground()
  );
  const [selectedBackgroundId, setSelectedBackgroundId] = useState(
    initialPost?.backgroundColor || initialPost?.background_color || "default"
  );
  const [fileType, setFileType] = useState(
    initialPost?.attachmentType || initialPost?.attachment_type || "NONE"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle file change để hỗ trợ nhiều ảnh/file
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Kiểm tra số lượng ảnh đã có + số lượng ảnh sẽ thêm mới
    const totalFiles = selectedFiles.length + files.length;

    // Giới hạn tổng số ảnh tối đa là 10
    if (totalFiles > 10) {
      alert("Bạn chỉ có thể tải lên tối đa 10 ảnh");
      const limitedFiles = files.slice(0, 10 - selectedFiles.length);
      processNewFiles(limitedFiles, e.target);
    } else {
      processNewFiles(files, e.target);
    }
  };

  // Xử lý files mới
  const processNewFiles = (files, inputElement) => {
    // Kiểm tra xem tất cả các file có phải là ảnh hoặc video không
    const hasNonImageVideo = files.some(
      (file) =>
        !file.type.startsWith("image/") && !file.type.startsWith("video/")
    );

    // Tạo preview URL cho tất cả các file mới
    const newPreviewURLs = files.map((file) => URL.createObjectURL(file));

    // Cập nhật state để thêm file mới vào mảng files đã có
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewURLs((prev) => [...prev, ...newPreviewURLs]);

    // Xác định loại file
    // Nếu đã có video trong mảng cũ, hoặc một trong các file mới là video, loại file sẽ là VIDEO
    const hasVideo =
      files.some((file) => file.type.startsWith("video/")) ||
      selectedFiles.some((file) => file.type.startsWith("video/"));

    if (hasNonImageVideo) {
      setFileType("DOCUMENT");
    } else if (hasVideo) {
      setFileType("VIDEO");
    } else {
      setFileType("IMAGE");
    }

    // Reset input để có thể chọn lại cùng một file nếu muốn
    if (inputElement) {
      inputElement.value = null;
    }
  };

  // Xóa một file đã chọn
  const removeFile = (index) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setPreviewURLs((prev) => {
      const newURLs = [...prev];
      // Revoke object URL để tránh rò rỉ bộ nhớ
      URL.revokeObjectURL(newURLs[index]);
      newURLs.splice(index, 1);
      return newURLs;
    });

    // Nếu không còn file nào, đặt lại fileType
    if (selectedFiles.length <= 1) {
      setFileType("NONE");
    }
  };

  // Xóa tất cả file
  const clearAllFiles = () => {
    // Revoke tất cả URL
    previewURLs.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewURLs([]);
    setFileType("NONE");
  };

  // Handle background selection
  const handleBackgroundSelect = (bg, id) => {
    setBackgroundCssClass(bg);
    setSelectedBackgroundId(id);
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setContent(content + emoji);
  };

  // Handle feeling input
  const handleFeelingInput = (value) => {
    setFeeling(value);
  };

  // Handle location input
  const handleLocationInput = (value) => {
    setLocation(value);
  };

  // Handle editor content change
  const handleEditorChange = (content) => {
    setContent(content);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim() || title.length < 5 || title.length > 200) {
      newErrors.title = "Tiêu đề phải có từ 5 đến 200 ký tự";
    }

    // Kiểm tra nội dung từ trình soạn thảo
    // Loại bỏ các thẻ HTML để đếm ký tự thuần văn bản
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    if (
      !textContent.trim() ||
      textContent.length < 10 ||
      textContent.length > 5000
    ) {
      newErrors.content = "Nội dung phải có từ 10 đến 5000 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Lấy nội dung từ trình soạn thảo nếu đang sử dụng
      const finalContent =
        backgroundCssClass === "bg-white text-black" && editorRef.current
          ? editorRef.current.getContent()
          : content;

      // Kiểm tra dữ liệu trước khi gửi
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setErrors({ ...errors, title: "Tiêu đề không được để trống" });
        setIsSubmitting(false);
        return;
      }

      // Kiểm tra nội dung từ trình soạn thảo
      if (
        !finalContent ||
        finalContent === "<p></p>" ||
        finalContent === "<p><br></p>"
      ) {
        setErrors({ ...errors, content: "Nội dung không được để trống" });
        setIsSubmitting(false);
        return;
      }

      // Tạo đối tượng JSON để gửi đi theo đúng định dạng backend mong đợi
      const postData = {
        title: trimmedTitle,
        content: finalContent,
        privacyLevel: privacy,
        location: location || null,
        feeling: feeling || null,
        backgroundColor:
          selectedBackgroundId !== "default" ? selectedBackgroundId : null,
        attachmentType: fileType || "NONE",
        attachmentUrl: null,
      };

      console.log("Dữ liệu gửi đi:", postData);

      // Nếu có files, sử dụng FormData
      if (selectedFiles.length > 0) {
        const formData = new FormData();

        // Tạo object theo định dạng mà backend mong đợi
        const postRequestData = {
          title: trimmedTitle,
          content: finalContent,
          privacyLevel: privacy,
          location: location || null,
          feeling: feeling || null,
          backgroundColor:
            selectedBackgroundId !== "default" ? selectedBackgroundId : null,
          attachmentType: fileType || "IMAGE",
          attachmentUrl: null,
          hashtags: extractHashtags(finalContent),
        };

        // Thêm dữ liệu JSON vào FormData với key 'post' theo yêu cầu của backend
        formData.append(
          "post",
          new Blob([JSON.stringify(postRequestData)], {
            type: "application/json",
          })
        );

        // Thêm các file với key 'images' theo yêu cầu của backend
        selectedFiles.forEach((file) => {
          formData.append("images", file);
        });

        // Gọi API với FormData
        await onSubmit(formData);
      } else {
        // Không có file, gửi trực tiếp JSON
        await onSubmit(postData);
      }

      // Reset form nếu không phải chế độ chỉnh sửa
      if (!editMode) {
        setTitle("");
        setContent("");
        setSelectedFiles([]);
        setPreviewURLs([]);
        setLocation("");
        setFeeling("");
        setPrivacy("PUBLIC");
        setBackgroundCssClass("bg-white text-black");
        setSelectedBackgroundId("default");
        setFileType("NONE");
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài viết:", error);
      toast.error("Có lỗi xảy ra khi đăng bài viết. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel (edit mode)
  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 max-h-[90vh] overflow-auto">
      <div className="flex items-center gap-3 mb-4">
        <Avatar>
          <AvatarImage src={user.imageUrl || "/placeholder-user.jpg"} />
          <AvatarFallback>{user.userName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{user.userName || "Người dùng"}</p>
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 p-1 flex items-center gap-1 text-xs"
                >
                  <Globe size={12} />
                  <span>Công khai</span>
                  <ChevronDown size={10} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                  >
                    <Globe size={12} className="mr-2" />
                    Công khai
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                  >
                    <Users size={12} className="mr-2" />
                    Bạn bè
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                  >
                    <Lock size={12} className="mr-2" />
                    Chỉ mình tôi
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề bài viết (5-200 ký tự)"
          className={`mb-2 ${errors.title ? "border-red-500" : ""}`}
        />
        {errors.title && (
          <p className="text-sm text-red-500 mb-2">{errors.title}</p>
        )}
      </div>

      <div
        className={`mb-4 rounded-lg ${
          backgroundCssClass !== "bg-white text-black" ? "p-3" : ""
        }`}
      >
        {backgroundCssClass === "bg-white text-black" ? (
          <Editor
            onInit={(evt, editor) => (editorRef.current = editor)}
            value={content}
            onEditorChange={handleEditorChange}
            apiKey="hhl2i2ucsjujs5x82jxlr5p8kwidgqklbk61yxnit36i33kh"
            init={{
              height: 300,
              menubar: false,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | bold italic underline strikethrough | " +
                "link image | alignleft aligncenter alignright alignjustify | " +
                "bullist numlist outdent indent | " +
                "removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              entity_encoding: "raw",
              forced_root_block: "p",
              valid_elements: "*[*]",
              valid_children:
                "+body[style],+div[p|h1|h2|h3|h4|h5|h6|blockquote|div|img|table|ol|ul|li],+li[ol|ul]",
              setup: (editor) => {
                editor.on("init", () => {
                  // Nếu đang trong chế độ chỉnh sửa, set nội dung của editor
                  if (editMode && initialPost?.content) {
                    editor.setContent(initialPost.content);
                  }
                });
              },
            }}
          />
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung bài viết (10-5000 ký tự)"
            className={`min-h-[100px] border-none bg-transparent resize-none focus-visible:ring-0 text-lg ${
              backgroundCssClass.includes("text-white")
                ? "text-white placeholder:text-gray-200"
                : "text-black placeholder:text-gray-500"
            } ${errors.content ? "border-red-500" : ""}`}
          />
        )}

        {errors.content && (
          <p
            className={`text-sm ${
              backgroundCssClass.includes("text-white")
                ? "text-yellow-300"
                : "text-red-500"
            } mt-1`}
          >
            {errors.content}
          </p>
        )}

        {feeling && (
          <div
            className={`text-sm mt-2 ${
              backgroundCssClass.includes("text-white")
                ? "text-white"
                : "text-gray-600"
            }`}
          >
            Đang cảm thấy: {feeling}
          </div>
        )}

        {location && (
          <div
            className={`text-sm mt-1 ${
              backgroundCssClass.includes("text-white")
                ? "text-white"
                : "text-gray-600"
            }`}
          >
            Tại: {location}
          </div>
        )}
      </div>

      {/* Hiển thị preview các ảnh đã chọn */}
      {previewURLs.length > 0 && (
        <div className="relative mb-4 max-h-[160px] overflow-hidden">
          {fileType === "IMAGE" && (
            <div className="rounded-lg overflow-hidden">
              {previewURLs.length === 1 ? (
                <div className="relative">
                  <img
                    src={previewURLs[0]}
                    alt="Preview"
                    className="w-full h-auto max-h-[160px] rounded-lg object-contain bg-gray-50"
                  />
                  <button
                    onClick={() => removeFile(0)}
                    className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 opacity-75 hover:opacity-100"
                    aria-label="Xóa hình ảnh"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : previewURLs.length === 2 ? (
                <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-h-[160px]">
                  {previewURLs.map((url, index) => (
                    <div key={index} className="relative h-[160px]">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 opacity-75 hover:opacity-100"
                        aria-label="Xóa hình ảnh"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              ) : previewURLs.length === 3 ? (
                <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-h-[160px]">
                  <div className="relative h-[158px]">
                    <img
                      src={previewURLs[0]}
                      alt="Preview 1"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(0)}
                      className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 opacity-75 hover:opacity-100"
                      aria-label="Xóa hình ảnh"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="grid grid-rows-2 gap-1">
                    {previewURLs.slice(1, 3).map((url, idx) => (
                      <div key={idx + 1} className="relative h-[78px]">
                        <img
                          src={url}
                          alt={`Preview ${idx + 2}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeFile(idx + 1)}
                          className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 opacity-75 hover:opacity-100"
                          aria-label="Xóa hình ảnh"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-h-[160px]">
                  {previewURLs.slice(0, 4).map((url, index) => (
                    <div key={index} className="relative h-[78px]">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 opacity-75 hover:opacity-100"
                        aria-label="Xóa hình ảnh"
                      >
                        <FaTimes />
                      </button>
                      {index === 3 && previewURLs.length > 4 && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            +{previewURLs.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {fileType === "VIDEO" && (
            <div className="relative">
              <video
                src={previewURLs[0]}
                controls
                className="w-full h-auto max-h-[160px] rounded-lg object-contain bg-gray-50"
              />
              <button
                onClick={() => clearAllFiles()}
                className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 opacity-75 hover:opacity-100"
                aria-label="Xóa video"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {fileType === "DOCUMENT" && (
            <div className="relative flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
              <span>Tệp đính kèm: {selectedFiles[0]?.name}</span>
              <button
                onClick={() => clearAllFiles()}
                className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 opacity-75 hover:opacity-100"
                aria-label="Xóa tệp"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {previewURLs.length > 1 && (
            <div className="flex justify-between mt-2">
              <div className="text-sm text-gray-500">
                {previewURLs.length}/10 ảnh
              </div>
              <button
                onClick={clearAllFiles}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Xóa tất cả ảnh
              </button>
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="media" className="mb-2">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="feeling">Cảm xúc</TabsTrigger>
          <TabsTrigger value="background">Nền</TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="pt-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current.click()}
              className="gap-2"
            >
              <FaImage className="text-green-500" />
              <span>{selectedFiles.length > 0 ? "Đổi ảnh" : "Ảnh/Video"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addMoreFileInputRef.current.click()}
              className="w-10 h-10 rounded-full bg-green-50 hover:bg-green-100"
              title="Thêm nhiều ảnh"
              disabled={selectedFiles.length >= 10}
            >
              <span className="text-green-600 font-bold text-lg">+</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*,application/pdf"
              className="hidden"
              multiple
            />
            <input
              type="file"
              ref={addMoreFileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*,application/pdf"
              className="hidden"
              multiple
            />

            <Button variant="outline" size="sm" className="gap-2">
              <FaVideo className="text-blue-500" />
              <span>Phát trực tiếp</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLocationInput(location ? "" : "Vĩnh Long")}
              className={`gap-2 ${location ? "bg-blue-50" : ""}`}
            >
              <FaMapMarkerAlt className="text-red-500" />
              <span>{location ? "Đã đánh dấu" : "Vị trí"}</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="feeling" className="pt-2">
          <div>
            <p className="text-sm text-gray-500 mb-2">Chọn cảm xúc của bạn:</p>
            <div className="grid grid-cols-5 gap-2">
              {emoji.map((e, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(e)}
                  className="text-xl p-2 hover:bg-gray-100 rounded"
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <Input
                placeholder="Bạn đang cảm thấy thế nào?"
                value={feeling}
                onChange={(e) => handleFeelingInput(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="background" className="pt-2">
          <div className="grid grid-cols-3 gap-2">
            {backgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => handleBackgroundSelect(bg.color, bg.id)}
                className={`h-12 rounded-lg ${
                  bg.color
                } flex items-center justify-center ${
                  backgroundCssClass === bg.color ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 justify-end mt-2">
        {editMode && onCancel && (
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitting ? "Đang xử lý..." : editMode ? "Cập nhật" : "Đăng bài"}
        </Button>
      </div>
    </div>
  );
};

// Định nghĩa PropTypes
CreatePostForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
  initialPost: PropTypes.object,
  onCancel: PropTypes.func,
};

export default CreatePostForm;
