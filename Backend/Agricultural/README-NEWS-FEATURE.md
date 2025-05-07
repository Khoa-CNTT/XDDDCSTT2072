# Chức năng tin tức nông nghiệp trong dự án Agricultural

## Giới thiệu

Chức năng tin tức là một tính năng mới được thêm vào dự án Agricultural, cho phép hệ thống tự động thu thập tin tức từ các trang web tin tức nông nghiệp. Tin tức được cập nhật tự động theo chu kỳ và có thể được quản lý thông qua giao diện quản trị.

## Kiến trúc hệ thống

### Thành phần chính:

1. **Entity**:
   - `News`: Lưu trữ thông tin về tin tức
   - `NewsSource`: Lưu trữ thông tin về nguồn tin tức và cách thu thập dữ liệu

2. **DTO**:
   - `NewsDTO`: DTO cho tin tức
   - `NewsSourceDTO`: DTO cho nguồn tin tức

3. **Repository**:
   - `NewsRepository`: Truy vấn dữ liệu tin tức
   - `NewsSourceRepository`: Truy vấn dữ liệu nguồn tin tức

4. **Service**:
   - `NewsService`: Xử lý logic liên quan đến tin tức
   - `NewsSourceService`: Xử lý logic liên quan đến nguồn tin tức

5. **Controller**:
   - `NewsController`: API quản lý tin tức
   - `NewsSourceController`: API quản lý nguồn tin tức

6. **Scheduler**:
   - `NewsScheduler`: Lập lịch tự động thu thập tin tức

7. **Bootstrap**:
   - `NewsSourceDataInitializer`: Khởi tạo dữ liệu mẫu cho nguồn tin tức

## Luồng hoạt động

1. Hệ thống khởi tạo các nguồn tin tức mặc định thông qua `NewsSourceDataInitializer`
2. `NewsScheduler` chạy mỗi 6 giờ để thu thập tin tức từ các nguồn đã được kích hoạt
3. Người dùng truy cập API để xem tin tức
4. Admin có thể quản lý nguồn tin tức, thêm mới, sửa, xóa các nguồn, và chạy thu thập tin tức theo yêu cầu

## API Endpoints

### Tin tức:

- `GET /api/v1/news`: Lấy danh sách tin tức
- `GET /api/v1/news/{id}`: Lấy chi tiết tin tức theo ID
- `GET /api/v1/news/latest`: Lấy 10 tin tức mới nhất
- `GET /api/v1/news/category/{category}`: Lấy tin tức theo danh mục
- `GET /api/v1/news/search?keyword=...`: Tìm kiếm tin tức
- `POST /api/v1/news`: Tạo tin tức mới (chỉ Admin)
- `PUT /api/v1/news/{id}`: Cập nhật tin tức (chỉ Admin)
- `DELETE /api/v1/news/{id}`: Xóa tin tức (chỉ Admin)
- `POST /api/v1/news/fetch`: Thu thập tin tức từ tất cả các nguồn (chỉ Admin)
- `POST /api/v1/news/fetch/{sourceId}`: Thu thập tin tức từ một nguồn cụ thể (chỉ Admin)

### Nguồn tin tức:

- `GET /api/v1/news-sources`: Lấy danh sách nguồn tin tức (chỉ Admin)
- `GET /api/v1/news-sources/active`: Lấy danh sách nguồn tin tức kích hoạt (chỉ Admin)
- `GET /api/v1/news-sources/{id}`: Lấy chi tiết nguồn tin tức theo ID (chỉ Admin)
- `GET /api/v1/news-sources/category/{category}`: Lấy nguồn tin tức theo danh mục (chỉ Admin)
- `POST /api/v1/news-sources`: Tạo nguồn tin tức mới (chỉ Admin)
- `PUT /api/v1/news-sources/{id}`: Cập nhật nguồn tin tức (chỉ Admin)
- `DELETE /api/v1/news-sources/{id}`: Xóa nguồn tin tức (chỉ Admin)
- `PUT /api/v1/news-sources/{id}/activate`: Kích hoạt nguồn tin tức (chỉ Admin)
- `PUT /api/v1/news-sources/{id}/deactivate`: Vô hiệu hóa nguồn tin tức (chỉ Admin)

## Cách thức thu thập tin tức

Hệ thống sử dụng thư viện JSoup để thu thập dữ liệu từ các trang web tin tức nông nghiệp. Quy trình như sau:

1. Lấy danh sách các nguồn tin tức đang kích hoạt
2. Đối với mỗi nguồn tin tức:
   - Tải HTML của trang web nguồn
   - Trích xuất các bài viết theo CSS selector
   - Đối với mỗi bài viết, tải nội dung đầy đủ
   - Trích xuất tiêu đề, tóm tắt, nội dung, hình ảnh, ngày đăng
   - Kiểm tra xem bài viết đã tồn tại trong cơ sở dữ liệu chưa
   - Nếu chưa tồn tại, lưu bài viết vào cơ sở dữ liệu

## Cấu hình nguồn tin tức

Mỗi nguồn tin tức được cấu hình với các thông tin sau:

- **name**: Tên nguồn tin tức
- **url**: URL của trang web nguồn
- **articleSelector**: CSS selector để lấy danh sách bài viết
- **titleSelector**: CSS selector để lấy tiêu đề bài viết
- **summarySelector**: CSS selector để lấy tóm tắt bài viết
- **contentSelector**: CSS selector để lấy nội dung bài viết
- **imageSelector**: CSS selector để lấy hình ảnh bài viết
- **dateSelector**: CSS selector để lấy ngày đăng bài viết
- **dateFormat**: Định dạng ngày tháng
- **category**: Danh mục của nguồn tin tức
- **active**: Trạng thái kích hoạt/vô hiệu hóa

## Cách thêm nguồn tin tức mới

1. Đăng nhập vào hệ thống với quyền Admin
2. Truy cập API quản lý nguồn tin tức
3. Tạo nguồn tin tức mới với các thông tin cấu hình phù hợp
4. Kiểm tra bằng cách gọi API thu thập tin tức từ nguồn mới thêm

## Xử lý lỗi và tính bền vững

- Mỗi nguồn tin tức được xử lý độc lập, nếu một nguồn gặp lỗi, các nguồn khác vẫn tiếp tục hoạt động
- Hệ thống ghi log đầy đủ về quá trình thu thập tin tức
- Kiểm tra trùng lặp bài viết thông qua uniqueId
- Xử lý các trường hợp lỗi khi tải nội dung, phân tích HTML, v.v.

## Phát triển trong tương lai

- Thêm tính năng phân tích nội dung để tự động phân loại tin tức
- Thêm tính năng gửi thông báo khi có tin tức mới
- Tích hợp AI để tóm tắt nội dung tin tức
- Thêm tính năng gợi ý tin tức dựa trên sở thích người dùng 