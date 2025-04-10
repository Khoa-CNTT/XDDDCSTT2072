import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FaImage, FaVideo, FaPalette } from "react-icons/fa";
import avatarImages from "../assets/images/avatar.jpg";

const backgroundColors = [
  "#ffffff", "#fef3c7", "#fce7f3", "#d1fae5", "#e0f2fe", "#f3f4f6", "#ede9fe",
];

const PostInput = ({ onClose }) => {
  const [content, setContent] = useState("");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [media, setMedia] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setMedia(file);
  };

  const handleSubmit = () => {
    const newPost = { content, bgColor, media };
    console.log("Post created:", newPost);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 border-b bg-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Create Post</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">
              <IoMdClose />
            </button>
          </div>

          <div
            className="p-4 space-y-4 transition-all duration-300"
            style={{ backgroundColor: bgColor }}
          >
            <div className="flex items-center gap-3">
              <img
                src={avatarImages}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="font-semibold text-gray-800">Bạn</div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="w-full bg-transparent text-gray-800 placeholder-gray-500 text-lg resize-none focus:outline-none"
              style={{ minHeight: "100px" }}
            />

            {media && (
              <div className="relative mt-2 rounded-xl overflow-hidden border shadow-md">
                {media.type.startsWith("image") ? (
                  <img
                    src={URL.createObjectURL(media)}
                    alt="Preview"
                    className="rounded-lg max-h-64 w-full object-cover"
                  />
                ) : (
                  <video controls className="rounded-lg max-h-64 w-full object-cover">
                    <source src={URL.createObjectURL(media)} />
                    Trình duyệt không hỗ trợ video.
                  </video>
                )}
              </div>
            )}

            <div className="flex justify-between items-center border-t pt-4">
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FaImage /> Thêm ảnh / video
                </button>
                <input
                  type="file"
                  accept="image/*,video/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="flex items-center gap-2">
                  <FaPalette className="text-purple-500" />
                  <div className="flex gap-1">
                    {backgroundColors.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 ${
                          bgColor === color ? "ring-2 ring-blue-500" : ""
                        } hover:scale-110 transition`}
                        style={{ backgroundColor: color }}
                        onClick={() => setBgColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-md"
              >
                Đăng bài
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostInput;
