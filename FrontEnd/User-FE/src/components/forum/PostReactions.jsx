import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaThumbsUp,
  FaHeart,
  FaLaughBeam,
  FaLightbulb,
  FaHandsHelping,
  FaGlassCheers,
} from "react-icons/fa";

const reactions = [
  { type: "LIKE", icon: <FaThumbsUp />, color: "bg-blue-500", label: "Thích" },
  { type: "LOVE", icon: <FaHeart />, color: "bg-red-500", label: "Yêu thích" },
  {
    type: "FUNNY",
    icon: <FaLaughBeam />,
    color: "bg-yellow-500",
    label: "Buồn cười",
  },
  {
    type: "INSIGHTFUL",
    icon: <FaLightbulb />,
    color: "bg-green-500",
    label: "Hữu ích",
  },
  {
    type: "SUPPORT",
    icon: <FaHandsHelping />,
    color: "bg-purple-500",
    label: "Ủng hộ",
  },
  {
    type: "CELEBRATE",
    icon: <FaGlassCheers />,
    color: "bg-orange-500",
    label: "Chúc mừng",
  },
];

const PostReactions = ({
  postId,
  reactionCounts,
  userReaction,
  onReact,
  showLabel = true,
  size = "md",
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(
    userReaction || null
  );
  const containerRef = useRef(null);

  // Sizes variant
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Find the selected reaction display info
  const selectedReactionInfo = selectedReaction
    ? reactions.find((r) => r.type === selectedReaction)
    : reactions[0];

  // Close reactions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowReactions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle reaction click
  const handleReactionClick = (reaction) => {
    setSelectedReaction(reaction.type);
    setShowReactions(false);
    onReact(postId, reaction.type);
  };

  // Toggle main button (like if no reaction or remove reaction if already reacted)
  const handleMainButtonClick = () => {
    if (selectedReaction) {
      // If already reacted, remove reaction
      setSelectedReaction(null);
      onReact(postId, null); // Remove reaction
    } else {
      // If not reacted, add default (LIKE) reaction
      setSelectedReaction("LIKE");
      onReact(postId, "LIKE");
    }
  };

  // Calculate total reactions
  const totalReactions = reactionCounts
    ? Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <div className="relative" ref={containerRef}>
      {/* Reactions popup */}
      {showReactions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-full left-0 mb-2 flex bg-white rounded-full shadow-lg p-1 z-10"
        >
          {reactions.map((reaction) => (
            <button
              key={reaction.type}
              className={`hover:scale-125 transition-transform duration-150 p-1.5 rounded-full ${reaction.color} text-white mx-0.5`}
              onClick={() => handleReactionClick(reaction)}
              title={reaction.label}
            >
              <div className={sizes[size]}>{reaction.icon}</div>
            </button>
          ))}
        </motion.div>
      )}

      {/* Main reaction button */}
      <button
        className={`flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-gray-100 
          ${selectedReaction ? "text-blue-600 font-medium" : "text-gray-600"}`}
        onMouseEnter={() => setShowReactions(true)}
        onClick={handleMainButtonClick}
      >
        <span
          className={`${selectedReaction ? "text-blue-600" : ""} ${
            sizes[size]
          }`}
        >
          {selectedReactionInfo.icon}
        </span>
        {showLabel && <span>{selectedReactionInfo.label}</span>}
      </button>

      {/* Reaction count */}
      {totalReactions > 0 && (
        <span className="ml-1 text-xs text-gray-500">{totalReactions}</span>
      )}
    </div>
  );
};

export default PostReactions;
