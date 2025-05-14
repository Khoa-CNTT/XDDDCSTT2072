-- Cập nhật bảng forum_posts để thêm các trường cần thiết
ALTER TABLE forum_posts 
    ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ADD COLUMN view_count INT DEFAULT 0,
    ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE,
    ADD COLUMN privacy_level ENUM('PUBLIC', 'CONNECTIONS', 'PRIVATE') DEFAULT 'PUBLIC';

-- Tạo bảng reactions cho cảm xúc giống LinkedIn (Like, Celebrate, Support, Love, Insightful, Funny)
CREATE TABLE forum_reactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    reply_id INT,
    user_id INT NOT NULL,
    reaction_type ENUM('LIKE', 'CELEBRATE', 'SUPPORT', 'LOVE', 'INSIGHTFUL', 'FUNNY') NOT NULL DEFAULT 'LIKE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE,
    CONSTRAINT unique_post_reaction UNIQUE (post_id, user_id, reaction_type),
    CONSTRAINT unique_reply_reaction UNIQUE (reply_id, user_id, reaction_type),
    CONSTRAINT check_post_or_reply CHECK ((post_id IS NULL) != (reply_id IS NULL))
);

-- Thêm bảng hashtags
CREATE TABLE hashtags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    post_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng liên kết posts và hashtags
CREATE TABLE post_hashtags (
    post_id INT NOT NULL,
    hashtag_id INT NOT NULL,
    PRIMARY KEY (post_id, hashtag_id),
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE
);

-- Bảng mentions để lưu đề cập đến người dùng trong bài đăng
CREATE TABLE post_mentions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    reply_id INT,
    mentioned_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE,
    FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT check_post_or_reply_mention CHECK ((post_id IS NULL) != (reply_id IS NULL))
);

-- Tạo chỉ mục để tối ưu hiệu suất
CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags(hashtag_id);
CREATE INDEX idx_forum_reactions_post ON forum_reactions(post_id);
CREATE INDEX idx_forum_reactions_reply ON forum_reactions(reply_id);
CREATE INDEX idx_forum_reactions_user ON forum_reactions(user_id);
CREATE INDEX idx_post_mentions_mentioned ON post_mentions(mentioned_user_id);

-- Trigger để cập nhật số lượng post khi thêm/xóa hashtag
DELIMITER //
CREATE TRIGGER after_post_hashtag_insert
AFTER INSERT ON post_hashtags
FOR EACH ROW
BEGIN
    UPDATE hashtags 
    SET post_count = post_count + 1
    WHERE id = NEW.hashtag_id;
END//

CREATE TRIGGER after_post_hashtag_delete
AFTER DELETE ON post_hashtags
FOR EACH ROW
BEGIN
    UPDATE hashtags 
    SET post_count = post_count - 1
    WHERE id = OLD.hashtag_id;
END//
DELIMITER ;

-- Cập nhật bảng forum_posts để thêm các trường bổ sung cho giao diện giống LinkedIn
ALTER TABLE forum_posts
    ADD COLUMN attachment_type ENUM('NONE', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LINK') DEFAULT 'NONE',
    ADD COLUMN attachment_url VARCHAR(500),
    ADD COLUMN location VARCHAR(255),
    ADD COLUMN feeling VARCHAR(100),
    ADD COLUMN background_color VARCHAR(20),
    ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE,
    ADD COLUMN is_edited BOOLEAN DEFAULT FALSE,
    ADD COLUMN edited_at TIMESTAMP NULL,
    ADD COLUMN is_shared BOOLEAN DEFAULT FALSE,
    ADD COLUMN original_post_id INT NULL,
    ADD CONSTRAINT fk_original_post FOREIGN KEY (original_post_id) REFERENCES forum_posts(id);

-- Tạo bảng kết nối giữa người dùng (tương tự connections của LinkedIn)
CREATE TABLE user_connections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    connected_user_id INT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (connected_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_connection (user_id, connected_user_id)
);

-- Bảng lưu lượt xem bài đăng
CREATE TABLE post_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_post_view (post_id, user_id)
);

-- Trigger để cập nhật số lượt xem khi có view mới
DELIMITER //
CREATE TRIGGER after_post_view_insert
AFTER INSERT ON post_views
FOR EACH ROW
BEGIN
    UPDATE forum_posts 
    SET view_count = view_count + 1
    WHERE id = NEW.post_id;
END//
DELIMITER ; 