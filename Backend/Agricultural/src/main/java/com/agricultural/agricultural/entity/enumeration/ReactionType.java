package com.agricultural.agricultural.entity.enumeration;

/**
 * Enum định nghĩa các loại cảm xúc cho bài đăng và bình luận
 */
public enum ReactionType {
    /**
     * Thích
     */
    LIKE("Thích", "👍"),
    
    /**
     * Chúc mừng
     */
    CELEBRATE("Chúc mừng", "🎉"),
    
    /**
     * Hỗ trợ
     */
    SUPPORT("Hỗ trợ", "🙌"),
    
    /**
     * Yêu thích
     */
    LOVE("Yêu thích", "❤️"),
    
    /**
     * Sâu sắc
     */
    INSIGHTFUL("Sâu sắc", "💡"),
    
    /**
     * Hài hước
     */
    FUNNY("Hài hước", "😄");
    
    private final String displayName;
    private final String emoji;
    
    ReactionType(String displayName, String emoji) {
        this.displayName = displayName;
        this.emoji = emoji;
    }
    
    public String getDisplayName() {
        return this.displayName;
    }
    
    public String getEmoji() {
        return this.emoji;
    }
} 