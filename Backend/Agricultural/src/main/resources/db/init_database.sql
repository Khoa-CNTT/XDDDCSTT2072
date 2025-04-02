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

// Dùng để reset password
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






