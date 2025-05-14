# Hướng dẫn khắc phục lỗi cho trang Forum

## Các lỗi thường gặp và cách khắc phục

### 1. Trang trắng khi mở Forum

Nếu trang forum hiển thị trắng, có thể do một trong các nguyên nhân sau:

#### Lỗi kết nối Backend
- Kiểm tra server backend đã được chạy chưa
- Xác nhận chạy đúng port (8080 hoặc 8088)
- Kiểm tra file `src/services/api/axios.js` để cấu hình đúng port

#### Lỗi xác thực
- Kiểm tra đã đăng nhập chưa
- Nếu token hết hạn, hãy đăng xuất và đăng nhập lại

#### Lỗi React Query
- Đã sửa lỗi "queryKey needs to be an Array" trong code
- Nếu vẫn gặp lỗi, kiểm tra console và báo cáo chi tiết

### 2. Lỗi "Cannot read properties of undefined"

Đã sửa trong các thành phần hiển thị bằng cách:
- Thêm kiểm tra `Array.isArray(data)` trước khi sử dụng .map()
- Thêm kiểm tra dữ liệu null/undefined với optional chaining (?.)
- Cung cấp giá trị mặc định để hiển thị khi không có dữ liệu

### 3. Lỗi khi tải hashtags

- Đã sửa phương thức `getPopularHashtags` để trả về mảng rỗng thay vì throw error
- Thêm xử lý fallback hashtags khi không có dữ liệu

### 4. Lỗi liên quan đến API URLs

- Hệ thống sẽ tự động thử kết nối với các URLs khác nhau (cả port 8080 và 8088)
- Nếu cả hai ports không hoạt động, kiểm tra:
  - Backend đã được chạy chưa
  - Cấu hình CORS trên Backend
  - Không có tường lửa chặn kết nối

## Các bước debug

1. Mở DevTools (F12 hoặc Ctrl+Shift+I)
2. Kiểm tra tab Console để xem lỗi
3. Kiểm tra tab Network để xem các API calls
4. Nếu thấy lỗi CORS, hãy kiểm tra backend đã cấu hình cho phép origin từ frontend

## Kiểm tra API hoạt động

```bash
# Kiểm tra API backend có hoạt động không
curl http://localhost:8080/api/v1/posts
# Hoặc
curl http://localhost:8088/api/v1/posts
```

## Liên hệ hỗ trợ

Nếu vẫn gặp lỗi sau khi thử các biện pháp trên, vui lòng liên hệ team phát triển và cung cấp:
1. Screenshot của lỗi
2. Log từ DevTools Console
3. Mô tả chi tiết các bước tái hiện lỗi 