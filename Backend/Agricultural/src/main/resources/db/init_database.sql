CREATE TABLE roles
(
    id        INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL
);


CREATE TABLE users
(
    id        INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(255)        NOT NULL,
    password  VARCHAR(255)        NOT NULL,
    email     VARCHAR(255) UNIQUE NOT NULL,
    phone     VARCHAR(20),
    role_id   INT                 NOT NULL,
    image_url VARCHAR(255),
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
);

CREATE TABLE users_addresses
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT  NOT NULL,
    address     TEXT NOT NULL,
    city        VARCHAR(100),
    country     VARCHAR(100),
    postal_code VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE notifications
(
    id                INT PRIMARY KEY AUTO_INCREMENT,
    user_id           INT NOT NULL,
    notification_type VARCHAR(100),
    message           TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE cart
(
    id      INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE cart_items
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    cart_id    INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES cart (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES market_place (id) ON DELETE CASCADE -- Thêm ràng buộc này
);



CREATE TABLE market_place
(
    id           INT PRIMARY KEY AUTO_INCREMENT,
    user_id      INT            NOT NULL,
    product_name VARCHAR(255)   NOT NULL,
    description  TEXT,
    quantity     INT            NOT NULL,
    price        DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);


CREATE TABLE feedback
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT NOT NULL,
    product_id  INT NULL,                                                    -- Cho phép NULL khi sản phẩm bị xóa
    rating      INT CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_url   VARCHAR(255),
    status      ENUM('approved', 'pending', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES market_place (id) ON DELETE SET NULL -- Không mất review khi sản phẩm bị xóa
);



CREATE TABLE orders
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id   INT NOT NULL,
    seller_id  INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status     ENUM('pending', 'shipped', 'delivered', 'cancelled') NOT NULL,
    FOREIGN KEY (buyer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE
);


CREATE TABLE order_details
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    order_id   INT            NOT NULL,
    product_id INT            NOT NULL,
    quantity   INT            NOT NULL,
    price      DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES market_place (id) ON DELETE CASCADE
);


CREATE TABLE weather
(
    id              INT PRIMARY KEY AUTO_INCREMENT,
    location        VARCHAR(255) NOT NULL,
    date            DATE         NOT NULL,
    weather_details TEXT         NOT NULL
);


CREATE TABLE news
(
    id       INT PRIMARY KEY AUTO_INCREMENT,
    title    VARCHAR(255) NOT NULL,
    content  TEXT         NOT NULL,
    category VARCHAR(100) NOT NULL
);


CREATE TABLE forum_posts
(
    id      INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT          NOT NULL,
    title   VARCHAR(255) NOT NULL,
    content TEXT         NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);


CREATE TABLE forum_replies
(
    id      INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT  NOT NULL,
    user_id INT  NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES forum_posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);


CREATE TABLE delete_posts
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    post_id    INT  NOT NULL,
    deleted_by INT  NOT NULL, -- Đổi tên cột
    reason     TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES forum_posts (id) ON DELETE CASCADE,
    FOREIGN KEY (deleted_by) REFERENCES users (id) ON DELETE CASCADE
);



CREATE TABLE favorites
(
    id      INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES forum_posts (id) ON DELETE CASCADE,
    CONSTRAINT unique_favorite UNIQUE (user_id, post_id) -- Đảm bảo user không thể thích một bài viết nhiều lần
);



CREATE TABLE shares
(
    id        INT PRIMARY KEY AUTO_INCREMENT,
    user_id   INT NOT NULL,
    post_id   INT NOT NULL,
    shareDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES forum_posts (id) ON DELETE CASCADE
);

CREATE TABLE payment
(
    id             INT PRIMARY KEY AUTO_INCREMENT,
    order_id       INT            NOT NULL,
    user_id        INT            NOT NULL,
    amount         DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('credit_card', 'paypal', 'bank_transfer', 'cod') NOT NULL,
    status         ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL,
    payment_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE coupons
(
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    code                VARCHAR(50) UNIQUE NOT NULL, -- Mã giảm giá
    discount_percentage DECIMAL(5, 2)      NOT NULL, -- Giảm theo phần trăm
    max_discount        DECIMAL(10, 2),              -- Giảm tối đa
    min_order_value     DECIMAL(10, 2)     NOT NULL, -- Giá trị tối thiểu để áp dụng
    start_date          TIMESTAMP          NOT NULL,
    end_date            TIMESTAMP          NOT NULL,
    status              ENUM('active', 'expired', 'disabled') NOT NULL DEFAULT 'active'
);

CREATE TABLE order_coupons
(
    id              INT PRIMARY KEY AUTO_INCREMENT,
    order_id        INT            NOT NULL,
    coupon_id       INT            NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL, -- Số tiền giảm giá
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE CASCADE
);

-- Dùng để reset password
CREATE TABLE password_reset_tokens
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    token       VARCHAR(255) UNIQUE NOT NULL,
    user_id     INT                 NOT NULL,
    expiry_date TIMESTAMP           NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Bảng order_tracking để lưu lịch sử trạng thái đơn hàng
CREATE TABLE order_tracking
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    order_id    INT       NOT NULL,
    status      ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL,
    timestamp   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    updated_by  INT,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE shares
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    forum_post_id BIGINT NOT NULL,
    user_id       BIGINT NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (forum_post_id) REFERENCES forum_post (id),
    FOREIGN KEY (user_id) REFERENCES user (id)
);


ALTER TABLE notifications
    ADD COLUMN title VARCHAR(255) NOT NULL,
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE,
MODIFY COLUMN message TEXT NOT NULL;


CREATE INDEX idx_feedback_product ON feedback (product_id);
CREATE INDEX idx_feedback_user ON feedback (user_id);
CREATE INDEX idx_payment_user ON payment (user_id);
CREATE INDEX idx_payment_order ON payment (order_id);
CREATE INDEX idx_cartitems_product ON cart_items (product_id);

ALTER TABLE orders
    MODIFY COLUMN status ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL;

-- Tạo các indexes để tối ưu hiệu suất
CREATE INDEX idx_order_tracking_order ON order_tracking (order_id);
CREATE INDEX idx_order_tracking_status ON order_tracking (status);
CREATE INDEX idx_payment_status ON payment (status);
CREATE INDEX idx_payment_method ON payment (payment_method);
CREATE INDEX idx_notifications_user ON notifications (user_id, is_read);

ALTER TABLE payment
    ADD COLUMN payment_id VARCHAR(255) UNIQUE NOT NULL,
ADD COLUMN transaction_id VARCHAR(255),
ADD COLUMN payment_note TEXT,
MODIFY COLUMN payment_method ENUM(
    'CASH_ON_DELIVERY',
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'E_WALLET',
    'MOMO',
    'ZALOPAY',
    'VNPAY'
) NOT NULL,
MODIFY COLUMN status ENUM(
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED',
    'CANCELLED'
) NOT NULL;

-- UPDATE LẦN 1

ALTER TABLE users
    ADD COLUMN image_url VARCHAR(255) NOT NULL DEFAULT 'default_profile.png';


ALTER TABLE market_place
    ADD COLUMN image_url VARCHAR(255) NOT NULL;

ALTER TABLE feedback
    ADD COLUMN image_url VARCHAR(255);

ALTER TABLE forum_posts
    ADD COLUMN image_url VARCHAR(255);

ALTER TABLE news
    ADD COLUMN cover_image_url VARCHAR(255);

ALTER TABLE notifications
    ADD COLUMN image_url VARCHAR(255);

-- Bảng lưu trữ dữ liệu thời tiết chi tiết
CREATE TABLE weather_data
(
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    city                VARCHAR(255) NOT NULL,
    country             VARCHAR(100) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    temperature DOUBLE NOT NULL,
    humidity            INT          NOT NULL,
    wind_speed DOUBLE NOT NULL,
    weather_description TEXT         NOT NULL,
    icon_code           VARCHAR(20),
    request_time        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_time           TIMESTAMP    NOT NULL,
    created_at          TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP             DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX               idx_weather_city (city),
    INDEX               idx_weather_coordinates (latitude, longitude),
    INDEX               idx_weather_data_time (data_time)
);

-- Bảng lưu trữ lời khuyên nông nghiệp dựa trên thời tiết
CREATE TABLE agricultural_advice
(
    id                         INT PRIMARY KEY AUTO_INCREMENT,
    weather_data_id            INT       NOT NULL,
    weather_summary            TEXT      NOT NULL,
    farming_advice             TEXT,
    crop_advice                TEXT,
    warnings                   TEXT,
    is_rainy_season            BOOLEAN            DEFAULT FALSE,
    is_dry_season              BOOLEAN            DEFAULT FALSE,
    is_suitable_for_planting   BOOLEAN            DEFAULT FALSE,
    is_suitable_for_harvesting BOOLEAN            DEFAULT FALSE,
    recommended_activities     TEXT,
    created_at                 TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                 TIMESTAMP          DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (weather_data_id) REFERENCES weather_data (id) ON DELETE CASCADE,
    INDEX                      idx_advice_weather_data (weather_data_id),
    INDEX                      idx_advice_created (created_at),
    INDEX                      idx_advice_planting (is_suitable_for_planting),
    INDEX                      idx_advice_harvesting (is_suitable_for_harvesting)
);

-- Bảng cấu hình theo dõi thời tiết tự động
CREATE TABLE weather_monitored_locations
(
    id                   INT PRIMARY KEY AUTO_INCREMENT,
    name                 VARCHAR(255) NOT NULL,
    city                 VARCHAR(255) NOT NULL,
    country              VARCHAR(100) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    is_active            BOOLEAN   DEFAULT TRUE,
    monitoring_frequency INT       DEFAULT 180, -- Tần suất theo dõi tính bằng phút
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_monitored_city (city, country),
    INDEX                idx_monitored_active (is_active)
);

-- Bảng đăng ký theo dõi thời tiết cho người dùng
CREATE TABLE user_weather_subscriptions
(
    id                   INT PRIMARY KEY AUTO_INCREMENT,
    user_id              INT NOT NULL,
    location_id          INT NOT NULL,
    notification_enabled BOOLEAN   DEFAULT TRUE,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES weather_monitored_locations (id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_location (user_id, location_id),
    INDEX                idx_subscription_user (user_id)
);

-- Thêm dữ liệu vào bảng địa điểm theo dõi
INSERT INTO weather_monitored_locations (name, city, country, latitude, longitude)
VALUES ('Hà Nội', 'Hanoi', 'VN', 21.0285, 105.8542),
       ('TP. Hồ Chí Minh', 'Ho Chi Minh City', 'VN', 10.8231, 106.6297),
       ('Đà Nẵng', 'Da Nang', 'VN', 16.0544, 108.2022),
       ('Huế', 'Hue', 'VN', 16.4637, 107.5909),
       ('Cần Thơ', 'Can Tho', 'VN', 10.0341, 105.7881),
       ('Hải Phòng', 'Hai Phong', 'VN', 20.8449, 106.6881),
       ('Nha Trang', 'Nha Trang', 'VN', 12.2388, 109.1968),
       ('Vinh', 'Vinh', 'VN', 18.6734, 105.6822),
       ('Quy Nhơn', 'Quy Nhon', 'VN', 13.7829, 109.2196),
       ('Buôn Ma Thuột', 'Buon Ma Thuot', 'VN', 12.6682, 108.0377);


CREATE TABLE refresh_tokens
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP    NOT NULL,
    user_id     INT          NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Thêm các cột để hỗ trợ bình luận phân cấp giống Facebook

-- Thêm cột parent_id để hỗ trợ bình luận phân cấp (bình luận cha-con)
ALTER TABLE forum_replies
    ADD COLUMN parent_id INT NULL,
ADD CONSTRAINT fk_forum_replies_parent
    FOREIGN KEY (parent_id) REFERENCES forum_replies(id)
    ON
DELETE
CASCADE;

-- Thêm cột created_at và updated_at để theo dõi thời gian
ALTER TABLE forum_replies
    ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
UPDATE CURRENT_TIMESTAMP;

-- Thêm cột like_count để theo dõi số lượt thích cho mỗi bình luận
ALTER TABLE forum_replies
    ADD COLUMN like_count INT NOT NULL DEFAULT 0;

-- Thêm cột is_deleted để hỗ trợ xóa mềm
ALTER TABLE forum_replies
    ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- Tạo chỉ mục để tối ưu hiệu suất
CREATE INDEX idx_forum_replies_post_id ON forum_replies (post_id);
CREATE INDEX idx_forum_replies_user_id ON forum_replies (user_id);
CREATE INDEX idx_forum_replies_parent_id ON forum_replies (parent_id);
CREATE INDEX idx_forum_replies_created_at ON forum_replies (created_at);

-- UPDATE LẦN 2
ALTER TABLE market_place
    ADD COLUMN sku VARCHAR(50) UNIQUE,
ADD COLUMN category_id INT,
ADD COLUMN short_description VARCHAR(500),
ADD COLUMN weight DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN dimensions VARCHAR(50),
ADD COLUMN stock_status ENUM('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK') DEFAULT 'IN_STOCK',
ADD COLUMN visibility ENUM('VISIBLE', 'HIDDEN', 'ARCHIVED') DEFAULT 'VISIBLE',
ADD COLUMN sale_price DECIMAL(10, 2),
ADD COLUMN sale_start_date DATETIME,
ADD COLUMN sale_end_date DATETIME,
ADD COLUMN average_rating DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN review_count INT DEFAULT 0,
ADD COLUMN view_count INT DEFAULT 0,
ADD COLUMN purchase_count INT DEFAULT 0,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
UPDATE CURRENT_TIMESTAMP;

-- Tạo bảng danh mục sản phẩm
CREATE TABLE product_categories
(
    id            INT PRIMARY KEY AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    description   TEXT,
    parent_id     INT,
    image_url     VARCHAR(255),
    is_active     BOOLEAN   DEFAULT TRUE,
    display_order INT       DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories (id) ON DELETE SET NULL
);

-- Tạo bảng biến thể sản phẩm (màu sắc, kích thước, v.v.)
CREATE TABLE product_variants
(
    id               INT PRIMARY KEY AUTO_INCREMENT,
    product_id       INT          NOT NULL,
    name             VARCHAR(100) NOT NULL,
    attributes       JSON         NOT NULL,
    price_adjustment DECIMAL(10, 2)        DEFAULT 0,
    sku              VARCHAR(50),
    quantity         INT          NOT NULL DEFAULT 0,
    image_url        VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES market_place (id) ON DELETE CASCADE
);

-- Tạo bảng cho nhiều hình ảnh sản phẩm
CREATE TABLE product_images
(
    id            INT PRIMARY KEY AUTO_INCREMENT,
    product_id    INT          NOT NULL,
    image_url     VARCHAR(255) NOT NULL,
    is_primary    BOOLEAN DEFAULT FALSE,
    display_order INT     DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES market_place (id) ON DELETE CASCADE
);

-- Cập nhật kết nối giữa bảng market_place và product_categories
ALTER TABLE market_place
    ADD FOREIGN KEY (category_id) REFERENCES product_categories (id);

-- Cải tiến bảng cart
ALTER TABLE cart
    ADD COLUMN total_items INT DEFAULT 0,
ADD COLUMN subtotal DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
UPDATE CURRENT_TIMESTAMP;

-- Cải tiến bảng cart_items
ALTER TABLE cart_items
    ADD COLUMN variant_id INT,
ADD COLUMN unit_price DECIMAL(10, 2) NOT NULL,
ADD COLUMN total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
ADD COLUMN notes TEXT,
ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
UPDATE CURRENT_TIMESTAMP,
    ADD FOREIGN KEY (variant_id) REFERENCES product_variants(id)
ON
DELETE
SET NULL;
-- Trigger để cập nhật tổng số lượng và tổng tiền trong giỏ hàng
DELIMITER
//
CREATE TRIGGER cart_items_after_insert
    AFTER INSERT
    ON cart_items
    FOR EACH ROW
BEGIN
    UPDATE cart
    SET total_items = (SELECT SUM(quantity) FROM cart_items WHERE cart_id = NEW.cart_id),
        subtotal    = (SELECT SUM(quantity * unit_price) FROM cart_items WHERE cart_id = NEW.cart_id),
        updated_at  = NOW()
    WHERE id = NEW.cart_id;
END//

CREATE TRIGGER cart_items_after_update
    AFTER UPDATE
    ON cart_items
    FOR EACH ROW
BEGIN
    UPDATE cart
    SET total_items = (SELECT SUM(quantity) FROM cart_items WHERE cart_id = NEW.cart_id),
        subtotal    = (SELECT SUM(quantity * unit_price) FROM cart_items WHERE cart_id = NEW.cart_id),
        updated_at  = NOW()
    WHERE id = NEW.cart_id;
END//

CREATE TRIGGER cart_items_after_delete
    AFTER DELETE
    ON cart_items
    FOR EACH ROW
BEGIN
    UPDATE cart
    SET total_items = (SELECT SUM(quantity) FROM cart_items WHERE cart_id = OLD.cart_id),
        subtotal    = (SELECT SUM(quantity * unit_price) FROM cart_items WHERE cart_id = OLD.cart_id),
        updated_at  = NOW()
    WHERE id = OLD.cart_id;
END//
DELIMITER;


-- Bước 1: Thêm cột order_number mà không có ràng buộc
ALTER TABLE orders
    ADD COLUMN order_number VARCHAR(20);

-- Bước 3: Thêm ràng buộc NOT NULL và UNIQUE
ALTER TABLE orders
    MODIFY COLUMN order_number VARCHAR (20) UNIQUE;


-- Cải tiến bảng orders
ALTER TABLE orders
    ADD COLUMN total_quantity INT NOT NULL DEFAULT 0,
ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL,
ADD COLUMN shipping_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN tax_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (subtotal + shipping_fee + tax_amount - discount_amount) STORED,
ADD COLUMN payment_method ENUM('COD', 'BANK_TRANSFER', 'CREDIT_CARD', 'E_WALLET', 'MOMO', 'ZALOPAY', 'VNPAY') DEFAULT 'COD',
ADD COLUMN payment_status ENUM('PENDING', 'PAID', 'PARTIAL', 'REFUNDED', 'FAILED') DEFAULT 'PENDING',
ADD COLUMN shipping_name VARCHAR(100) NOT NULL,
ADD COLUMN shipping_phone VARCHAR(20) NOT NULL,
ADD COLUMN shipping_address TEXT NOT NULL,
ADD COLUMN shipping_city VARCHAR(100),
ADD COLUMN shipping_country VARCHAR(100) DEFAULT 'Vietnam',
ADD COLUMN shipping_postal_code VARCHAR(20),
ADD COLUMN notes TEXT,
ADD COLUMN invoice_number VARCHAR(50),
ADD COLUMN invoice_date DATE,
ADD COLUMN completed_date DATETIME,
ADD COLUMN cancelled_date DATETIME,
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
UPDATE CURRENT_TIMESTAMP,
    MODIFY COLUMN status ENUM(
    -- Cải tiến bảng order_details
    ALTER TABLE order_details
    ADD COLUMN product_name VARCHAR (255) NOT NULL,
    ADD COLUMN product_image VARCHAR (255),
    ADD COLUMN variant_id INT,
    ADD COLUMN variant_name VARCHAR (100),
    ADD COLUMN original_price DECIMAL (10, 2) NOT NULL,
    ADD COLUMN discount_amount DECIMAL (10, 2) DEFAULT 0,
    ADD COLUMN final_price DECIMAL (10, 2) GENERATED ALWAYS AS (price - discount_amount) STORED,
    ADD COLUMN total_price DECIMAL (10, 2) GENERATED ALWAYS AS (quantity * price - discount_amount) STORED,
    ADD COLUMN status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED') DEFAULT 'PENDING',
    ADD COLUMN review_status ENUM('NOT_REVIEWED', 'REVIEWED') DEFAULT 'NOT_REVIEWED',
    ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL; 'PENDING', -- Đơn hàng mới tạo
    'CONFIRMED', -- Đã xác nhận
    'PROCESSING', -- Đang xử lý
    'SHIPPED', -- Đã giao cho đơn vị vận chuyển
    'DELIVERED', -- Đã giao hàng
    'COMPLETED', -- Hoàn thành (sau khi được xác nhận)
    'CANCELLED', -- Đã hủy
    'RETURNED', -- Đã trả hàng
    'REFUNDED' -- Đã hoàn tiền
    ) NOT NULL DEFAULT 'PENDING';

-- Cải tiến bảng coupons
ALTER TABLE coupons
    ADD COLUMN type ENUM('PERCENTAGE', 'FIXED', 'FREE_SHIPPING') NOT NULL DEFAULT 'PERCENTAGE',
ADD COLUMN usage_limit INT,
ADD COLUMN usage_count INT DEFAULT 0,
ADD COLUMN user_specific BOOLEAN DEFAULT FALSE,
ADD COLUMN specific_user_id INT,
ADD COLUMN category_specific BOOLEAN DEFAULT FALSE,
ADD COLUMN specific_category_id INT,
ADD COLUMN product_specific BOOLEAN DEFAULT FALSE,
ADD COLUMN specific_product_id INT,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD FOREIGN KEY (specific_user_id) REFERENCES users(id) ON
DELETE
CASCADE,
ADD FOREIGN KEY (specific_category_id) REFERENCES product_categories(id) ON DELETE
CASCADE,
ADD FOREIGN KEY (specific_product_id) REFERENCES market_place(id) ON DELETE
CASCADE;

-- Tạo bảng trạng thái đơn hàng
CREATE TABLE order_status_history
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    order_id   INT         NOT NULL,
    status     VARCHAR(50) NOT NULL,
    notes      TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

-- Trigger để thêm lịch sử trạng thái khi đơn hàng được tạo
DELIMITER
//
CREATE TRIGGER orders_after_insert
    AFTER INSERT
    ON orders
    FOR EACH ROW
BEGIN
    INSERT INTO order_status_history (order_id, status, created_by)
    VALUES (NEW.id, NEW.status, NEW.buyer_id);
END//

-- Trigger để thêm lịch sử trạng thái khi đơn hàng thay đổi trạng thái
CREATE TRIGGER orders_after_status_update
    AFTER UPDATE
    ON orders
    FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO order_status_history (order_id, status, created_by)
        VALUES (NEW.id, NEW.status, NULL);
END IF;
END
//
DELIMITER ;

-- Trigger để tự động giảm số lượng sản phẩm khi đơn hàng được xác nhận
DELIMITER
//
CREATE TRIGGER orders_after_confirm
    AFTER UPDATE
    ON orders
    FOR EACH ROW
BEGIN
    IF NEW.status = 'CONFIRMED' AND OLD.status = 'PENDING' THEN
        -- Giảm số lượng sản phẩm trong kho
    UPDATE market_place mp
        JOIN order_details od
    ON mp.id = od.product_id AND od.order_id = NEW.id
        SET mp.quantity = mp.quantity - od.quantity, mp.purchase_count = mp.purchase_count + od.quantity;

    -- Giảm số lượng biến thể sản phẩm nếu có
    UPDATE product_variants pv
        JOIN order_details od
    ON pv.id = od.variant_id AND od.order_id = NEW.id
        SET pv.quantity = pv.quantity - od.quantity;
END IF;
END
//
DELIMITER ;

-- Tạo bảng danh sách yêu thích
CREATE TABLE wishlists
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT NOT NULL,
    name       VARCHAR(100) DEFAULT 'Favorite Items',
    is_default BOOLEAN      DEFAULT TRUE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE KEY unique_default_wishlist (user_id, is_default)
);

-- Tạo bảng mục yêu thích
CREATE TABLE wishlist_items
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    wishlist_id INT NOT NULL,
    product_id  INT NOT NULL,
    variant_id  INT,
    added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wishlist_id) REFERENCES wishlists (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES market_place (id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE SET NULL,
    UNIQUE KEY unique_wishlist_product (wishlist_id, product_id, variant_id)
);

-- Cải tiến bảng feedback
ALTER TABLE feedback
    ADD COLUMN is_verified_purchase BOOLEAN DEFAULT FALSE,
ADD COLUMN helpful_count INT DEFAULT 0,
ADD COLUMN not_helpful_count INT DEFAULT 0,
ADD COLUMN reply TEXT,
ADD COLUMN replied_by INT,
ADD COLUMN replied_at TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
UPDATE CURRENT_TIMESTAMP,
    ADD FOREIGN KEY (replied_by) REFERENCES users(id)
ON
DELETE
SET NULL;

-- Tạo bảng hình ảnh đánh giá
CREATE TABLE feedback_images
(
    id            INT PRIMARY KEY AUTO_INCREMENT,
    feedback_id   INT          NOT NULL,
    image_url     VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    FOREIGN KEY (feedback_id) REFERENCES feedback (id) ON DELETE CASCADE
);


- Trigger để cập nhật đánh giá trung bình của sản phẩm
DELIMITER //
CREATE TRIGGER feedback_after_change
    AFTER INSERT ON feedback
    FOR EACH ROW
BEGIN
    UPDATE market_place
    SET average_rating = (SELECT AVG(rating) FROM feedback WHERE product_id = NEW.product_id AND status = 'approved'),
        review_count = (SELECT COUNT(*) FROM feedback WHERE product_id = NEW.product_id AND status = 'approved')
    WHERE id = NEW.product_id;
END//

CREATE TRIGGER feedback_after_update
    AFTER UPDATE ON feedback
    FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status OR NEW.rating != OLD.rating THEN
    UPDATE market_place
    SET average_rating = (SELECT AVG(rating) FROM feedback WHERE product_id = NEW.product_id AND status = 'approved'),
        review_count = (SELECT COUNT(*) FROM feedback WHERE product_id = NEW.product_id AND status = 'approved')
    WHERE id = NEW.product_id;
END IF;
END//

CREATE TRIGGER feedback_after_delete
    AFTER DELETE ON feedback
    FOR EACH ROW
BEGIN
    UPDATE market_place
    SET average_rating = (SELECT AVG(rating) FROM feedback WHERE product_id = OLD.product_id AND status = 'approved'),
        review_count = (SELECT COUNT(*) FROM feedback WHERE product_id = OLD.product_id AND status = 'approved')
    WHERE id = OLD.product_id;
END//
DELIMITER ;


-- Thêm cột deleted vào bảng cart
ALTER TABLE cart ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
SET SQL_SAFE_UPDATES = 0;

-- Cập nhật các giỏ hàng hiện tại để đảm bảo chúng không bị xóa
UPDATE cart SET deleted = FALSE WHERE deleted IS NULL;

-- update lần 3

-- Nếu cần, chạy script này để loại bỏ GENERATED COLUMN
ALTER TABLE cart_items
DROP COLUMN total_price;

ALTER TABLE cart_items
    ADD COLUMN total_price DECIMAL(10,2);

-- 1. Sửa đổi cột total_amount không còn là generated column
ALTER TABLE orders MODIFY COLUMN total_amount DECIMAL(10,2) NULL;

-- 2. Tạo trigger để tự động tính total_amount khi thêm mới đơn hàng
DELIMITER //
CREATE TRIGGER before_orders_insert
    BEFORE INSERT ON orders FOR EACH ROW
BEGIN
    SET NEW.total_amount = NEW.subtotal + IFNULL(NEW.shipping_fee, 0) + IFNULL(NEW.tax_amount, 0) - IFNULL(NEW.discount_amount, 0);
END //
DELIMITER ;

-- 3. Tạo trigger để tự động cập nhật total_amount khi sửa đơn hàng
DELIMITER //
CREATE TRIGGER before_orders_update
    BEFORE UPDATE ON orders FOR EACH ROW
BEGIN
    SET NEW.total_amount = NEW.subtotal + IFNULL(NEW.shipping_fee, 0) + IFNULL(NEW.tax_amount, 0) - IFNULL(NEW.discount_amount, 0);
END //
DELIMITER ;

-- 1. Sửa đổi cột total_price không còn là generated column
ALTER TABLE order_details MODIFY COLUMN total_price DECIMAL(10,2) NULL;

-- 2. Tạo trigger để tự động tính total_price khi thêm mới chi tiết đơn hàng
DELIMITER //
CREATE TRIGGER before_order_details_insert
    BEFORE INSERT ON order_details FOR EACH ROW
BEGIN
    SET NEW.total_price = NEW.price * NEW.quantity - IFNULL(NEW.discount_amount, 0);
END //
DELIMITER ;

-- 3. Tạo trigger để tự động cập nhật total_price khi sửa chi tiết đơn hàng
DELIMITER //
CREATE TRIGGER before_order_details_update
    BEFORE UPDATE ON order_details FOR EACH ROW
BEGIN
    SET NEW.total_price = NEW.price * NEW.quantity - IFNULL(NEW.discount_amount, 0);
END //
DELIMITER ;

-- UPDATE lần 4
-- Tạo bảng flash_sales
CREATE TABLE IF NOT EXISTS flash_sales (
                                           id INT AUTO_INCREMENT PRIMARY KEY,
                                           name VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    discount_percentage INT NOT NULL,
    max_discount_amount DECIMAL(15, 2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT check_status CHECK (status IN ('UPCOMING', 'ACTIVE', 'ENDED', 'CANCELLED')),
    CONSTRAINT check_discount_percentage CHECK (discount_percentage BETWEEN 1 AND 100)
    );

-- Tạo bảng flash_sale_items
CREATE TABLE IF NOT EXISTS flash_sale_items (
                                                id INT AUTO_INCREMENT PRIMARY KEY,
                                                flash_sale_id INT NOT NULL,
                                                product_id INT NOT NULL,
                                                stock_quantity INT NOT NULL,
                                                sold_quantity INT NOT NULL DEFAULT 0,
                                                discount_price DECIMAL(15, 2) NOT NULL,
    original_price DECIMAL(15, 2) NOT NULL,
    discount_percentage INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_flash_sale FOREIGN KEY (flash_sale_id) REFERENCES flash_sales(id) ON DELETE CASCADE,
    CONSTRAINT fk_flash_sale_product FOREIGN KEY (product_id) REFERENCES market_place(id) ON DELETE CASCADE,
    CONSTRAINT uq_flash_sale_product UNIQUE (flash_sale_id, product_id),
    CONSTRAINT check_stock_quantity CHECK (stock_quantity > 0),
    CONSTRAINT check_sold_quantity CHECK (sold_quantity >= 0),
    CONSTRAINT check_item_discount_percentage CHECK (discount_percentage BETWEEN 1 AND 100)
    );

-- Tạo index để tăng hiệu suất truy vấn
CREATE INDEX idx_flash_sale_status ON flash_sales(status, start_time, end_time);
CREATE INDEX idx_flash_sale_time ON flash_sales(start_time, end_time);
CREATE INDEX idx_flash_sale_items_product ON flash_sale_items(product_id);
CREATE INDEX idx_flash_sale_items_flash_sale ON flash_sale_items(flash_sale_id);


--UPDATE LAN 5
-- Tạo bảng user_product_interactions để lưu trữ tương tác người dùng-sản phẩm
CREATE TABLE IF NOT EXISTS user_product_interactions (
                                                         id INT AUTO_INCREMENT PRIMARY KEY,
                                                         user_id INT NOT NULL,
                                                         product_id INT NOT NULL,
                                                         type VARCHAR(20) NOT NULL,
    interaction_score INT NOT NULL DEFAULT 1,
    interaction_count INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_interaction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_interaction_product FOREIGN KEY (product_id) REFERENCES market_place(id) ON DELETE CASCADE,
    CONSTRAINT check_interaction_type CHECK (type IN ('VIEW', 'CART', 'WISHLIST', 'PURCHASE', 'REVIEW')),
    INDEX idx_user_product_type (user_id, product_id, type),
    INDEX idx_product_type (product_id, type),
    INDEX idx_updated_at (updated_at)
    );

-- Tạo bảng product_relationships để lưu trữ mối quan hệ giữa các sản phẩm
CREATE TABLE IF NOT EXISTS product_relationships (
                                                     id INT AUTO_INCREMENT PRIMARY KEY,
                                                     source_product_id INT NOT NULL,
                                                     target_product_id INT NOT NULL,
                                                     relationship_type VARCHAR(20) NOT NULL,
    strength_score FLOAT NOT NULL DEFAULT 0.0,
    occurrence_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_relationship_source FOREIGN KEY (source_product_id) REFERENCES market_place(id) ON DELETE CASCADE,
    CONSTRAINT fk_relationship_target FOREIGN KEY (target_product_id) REFERENCES market_place(id) ON DELETE CASCADE,
    CONSTRAINT uq_product_relationship UNIQUE (source_product_id, target_product_id, relationship_type),
    CONSTRAINT check_relationship_type CHECK (relationship_type IN ('SIMILAR', 'BOUGHT_TOGETHER', 'VIEWED_TOGETHER')),
    CONSTRAINT check_different_products CHECK (source_product_id <> target_product_id),
    CONSTRAINT check_strength_score CHECK (strength_score BETWEEN 0 AND 1),
    INDEX idx_source_type (source_product_id, relationship_type),
    INDEX idx_target_product (target_product_id)
    );

SET SQL_SAFE_UPDATES = 0;

UPDATE feedback SET status = 'PENDING' WHERE status = 'pending';
UPDATE feedback SET status = 'APPROVED' WHERE status = 'approved';
UPDATE feedback SET status = 'REJECTED' WHERE status = 'rejected';

ALTER TABLE notifications ADD COLUMN redirect_url VARCHAR(255) NULL;
ALTER TABLE flash_sales ADD COLUMN is_notified BOOLEAN DEFAULT FALSE;
ALTER TABLE flash_sales ADD COLUMN is_start_notified BOOLEAN DEFAULT FALSE;

-- Update Lần 6

-- Cập nhật bảng cart để thêm các trường voucher và giảm giá
ALTER TABLE cart
    ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN shipping_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN shipping_discount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN final_total DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN applied_voucher_code VARCHAR(50),
ADD COLUMN applied_shop_vouchers TEXT;

-- Cập nhật bảng cart_items để thêm các trường mới
ALTER TABLE cart_items
    ADD COLUMN shop_id INT,
ADD COLUMN shop_name VARCHAR(100),
ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN is_selected BOOLEAN DEFAULT true;

-- Cập nhật bảng orders để thêm các trường mới
ALTER TABLE orders
    ADD COLUMN shipping_discount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN voucher_discount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN platform_voucher_code VARCHAR(50),
ADD COLUMN shop_voucher_codes TEXT;

-- Cập nhật bảng order_details để thêm các trường mới
ALTER TABLE order_details
    ADD COLUMN shop_id INT,
ADD COLUMN shop_name VARCHAR(100),
ADD COLUMN voucher_code VARCHAR(50),
ADD COLUMN voucher_discount DECIMAL(10, 2) DEFAULT 0;

-- Tạo bảng vouchers để lưu thông tin mã giảm giá
CREATE TABLE vouchers (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          code VARCHAR(50) NOT NULL UNIQUE,
                          name VARCHAR(100) NOT NULL,
                          description TEXT,
                          type VARCHAR(20) NOT NULL COMMENT 'PLATFORM, SHOP, SHIPPING',
                          discount_amount DECIMAL(10, 2),
                          discount_percent INT,
                          min_order_amount DECIMAL(10, 2),
                          max_discount_amount DECIMAL(10, 2),
                          is_shipping_voucher BOOLEAN DEFAULT false,
                          shipping_discount_amount DECIMAL(10, 2),
                          min_shipping_fee DECIMAL(10, 2),
                          shop_id INT,
                          shop_name VARCHAR(100),
                          start_date DATETIME NOT NULL,
                          end_date DATETIME NOT NULL,
                          usage_limit INT,
                          usage_count INT DEFAULT 0,
                          is_active BOOLEAN DEFAULT true,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          FOREIGN KEY (shop_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Thêm chỉ mục cho các trường mới
CREATE INDEX idx_cart_items_shop ON cart_items (shop_id);
CREATE INDEX idx_order_details_shop ON order_details (shop_id);
CREATE INDEX idx_vouchers_code ON vouchers (code);
CREATE INDEX idx_vouchers_shop ON vouchers (shop_id);
CREATE INDEX idx_vouchers_type ON vouchers (type);
CREATE INDEX idx_vouchers_active ON vouchers (is_active);

-- Thêm dữ liệu mẫu cho bảng vouchers
INSERT INTO vouchers (code, name, description, type, discount_amount, min_order_amount, max_discount_amount, start_date, end_date, is_active, usage_limit)
VALUES ('WELCOME100K', 'Chào mừng mới - Giảm 100K', 'Giảm 100.000đ cho đơn hàng từ 500.000đ', 'PLATFORM', 100000, 500000, 100000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE, 10000);

INSERT INTO vouchers (code, name, description, type, discount_percent, min_order_amount, max_discount_amount, start_date, end_date, is_active, usage_limit)
VALUES ('GIAM15PT', 'Giảm 15% toàn sàn', 'Giảm 15% tối đa 50.000đ cho đơn hàng từ 200.000đ', 'PLATFORM', 15, 200000, 50000, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), TRUE, 5000);

-- Thay đổi shop_id thành user_id (thay 1 bằng ID của user thực tế trong hệ thống)
INSERT INTO vouchers (code, name, description, type, discount_amount, min_order_amount, shop_id, shop_name, start_date, end_date, is_active, usage_limit)
SELECT 'SHOP50K', 'Giảm 50K Shop VIP', 'Giảm 50.000đ cho đơn hàng từ 200.000đ', 'SHOP', 50000, 200000, id, username, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), TRUE, 1000
FROM users
WHERE id = 1 -- Lấy user đầu tiên làm shop
    LIMIT 1;

INSERT INTO vouchers (code, name, description, type, is_shipping_voucher, shipping_discount_amount, min_shipping_fee, min_order_amount, start_date, end_date, is_active)
VALUES ('FREESHIP30K', 'Miễn phí vận chuyển 30K', 'Miễn phí vận chuyển 30.000đ cho đơn hàng từ 150.000đ', 'PLATFORM', TRUE, 30000, 0, 150000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE);

INSERT INTO vouchers (code, name, description, type, is_shipping_voucher, shipping_discount_amount, min_shipping_fee, min_order_amount, start_date, end_date, is_active)
VALUES ('FREESHIP0D', 'Miễn phí vận chuyển 0Đ', 'Miễn phí vận chuyển không giới hạn cho đơn hàng từ 500.000đ', 'PLATFORM', TRUE, 100000, 0, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), TRUE);
