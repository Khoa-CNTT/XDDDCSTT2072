import React, { useState } from "react";
import Header from "../components/Header";
import PostInput from "../components/PostInput";
import instagramImages from "../assets/images/instagram.jpg";
import fbImages from "../assets/images/fb.jpg";
import twiterImages from "../assets/images/twiter.jpg";
import avatarImages from "../assets/images/avatar.jpg";
import { FaThumbsUp, FaCommentAlt, FaShare } from "react-icons/fa";

const posts = [
  {
    id: 1,
    title: "Title",
    content:
      "Về việc ăn uống trực tiếp khi đến khách tham quan, chị Thị Béo của chúng ta chưa bao giờ giấu về đồ ăn là thích, càng đặc biệt thích tham quan! Rực rỡ, thích quá, toàn là những món mình yêu thích.",
    image: null,
  },
  {
    id: 2,
    title: "Title",
    content: "Rou: Thích quá, toàn những món ăn mình yêu thích",
    image: null,
  },
];

function Home() {
  const [showPostInput, setShowPostInput] = useState(false);

  const handleOpenPostInput = () => setShowPostInput(true);
  const handleClosePostInput = () => setShowPostInput(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex flex-col lg:flex-row px-4 sm:px-6 lg:px-16 py-6 gap-6">
        {/* MAIN FEED */}
        <div className="w-full lg:w-3/4 space-y-4">
          {/* Post Input Box */}
          <div
            className="bg-white shadow-md rounded-xl p-4 cursor-pointer hover:shadow-lg transition"
            onClick={handleOpenPostInput}
          >
            <div className="flex items-center gap-3">
              <img
                src={avatarImages}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm italic text-gray-500 hover:bg-gray-200 transition">
                  What do you want to write?
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={avatarImages}
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <h2 className="font-semibold text-gray-800">{post.title}</h2>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {post.content}
              </p>
              {post.image && (
                <img
                  src={post.image}
                  alt="post"
                  className="w-full rounded-lg mb-4"
                />
              )}
              {!post.image && (
                <div className="bg-gray-100 text-gray-400 text-center py-16 my-4 rounded-lg">
                  IMAGE
                </div>
              )}
              <div className="flex flex-wrap justify-between gap-3 text-gray-600 text-sm font-medium">
                <button className="flex items-center gap-1 hover:text-blue-500 transition">
                  <FaThumbsUp /> Like
                </button>
                <button className="flex items-center gap-1 hover:text-blue-500 transition">
                  <FaCommentAlt /> Comment
                </button>
                <button className="flex items-center gap-1 hover:text-blue-500 transition">
                  <FaShare /> Share
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SIDEBAR */}
        <div className="hidden lg:block w-full lg:w-1/4 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 space-y-4">
            <div className="relative bg-gradient-to-r from-blue-800 to-indigo-700 text-white rounded-xl p-6 h-48 flex items-center justify-center">
              <div className="text-xl font-semibold">CONTENT</div>
              <div className="absolute top-2 left-4 text-sm font-medium">
                Weather
              </div>
            </div>

            <div className="text-center bg-purple-300 rounded-xl py-4">
              <h3 className="font-bold text-gray-800 mb-3">FOLLOW</h3>
              <div className="flex justify-center gap-4">
                {[instagramImages, fbImages, twiterImages].map((img, i) => (
                  <button
                    key={i}
                    className="w-10 h-10 rounded-full overflow-hidden hover:scale-105 transition-transform"
                  >
                    <img
                      src={img}
                      alt="social"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Input Modal */}
      {showPostInput && <PostInput onClose={handleClosePostInput} />}
    </div>
  );
}

export default Home;
