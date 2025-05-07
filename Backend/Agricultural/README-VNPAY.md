# Hướng dẫn tích hợp VNPAY trong ứng dụng

## Giới thiệu

Tài liệu này hướng dẫn cách sử dụng tích hợp VNPAY trong ứng dụng Agricultural. VNPAY là cổng thanh toán trực tuyến phổ biến tại Việt Nam, hỗ trợ thanh toán qua nhiều ngân hàng và ví điện tử.

## Cấu hình

Cấu hình VNPAY được đặt trong file `application.YML`:

```yaml
# Cấu hình VNPAY
vnpay:
  tmn-code: T4A9FEAR                 # Mã merchant từ VNPAY cấp
  hash-secret: 98344NMN3SQ9PXJECUJEZG6EMSM8X1F9  # Khóa bí mật để tạo chữ ký
  url: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html  # URL thanh toán (sandbox)
  return-url: ${app.backend-url}/api/v1/payment/vnpay-return  # URL callback khi thanh toán hoàn tất
  ipn-url: ${app.backend-url}/api/v1/payment/vnpay-ipn  # URL nhận thông báo tự động
  version: 2.1.0                     # Phiên bản API VNPAY
  command: pay                       # Lệnh thanh toán
  currency-code: VND                 # Đơn vị tiền tệ
  locale: vn                         # Ngôn ngữ
```

### Môi trường Production

Khi chuyển sang môi trường production, cần thay đổi các thông số sau:
- `tmn-code`: Mã merchant thật được VNPAY cấp
- `hash-secret`: Khóa bí mật thật được VNPAY cấp
- `url`: Đổi thành URL production của VNPAY (`https://pay.vnpay.vn/vpcpay.html`)

## Các API thanh toán VNPAY

### 1. Tạo URL thanh toán

**Endpoint**: `POST /api/v1/payment/create`

**Request Body**:
```json
{
  "orderId": 123,
  "amount": 10000,
  "paymentMethod": "VNPAY",
  "description": "Thanh toán đơn hàng #123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Tạo URL thanh toán thành công",
  "data": {
    "orderId": 123,
    "amount": 10000,
    "transactionId": "PAY123456789",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1000000&vnp_Command=pay&..."
  }
}
```

### 2. Tạo URL thanh toán cho nhiều mặt hàng

**Endpoint**: `POST /api/v1/payment/create-batch`

**Request Body**:
```json
{
  "orderId": 123,
  "amount": 10000,
  "paymentMethod": "VNPAY",
  "description": "Thanh toán đơn hàng #123",
  "items": [
    {
      "name": "Sản phẩm A",
      "quantity": 2,
      "price": 5000
    }
  ]
}
```

### 3. Truy vấn kết quả giao dịch

**Endpoint**: `GET /api/v1/payment/query-dr?transactionId=123456`

**Response**:
```json
{
  "success": true,
  "message": "Truy vấn kết quả giao dịch VNPAY thành công",
  "data": {
    "found": true,
    "payment": {
      "id": 1,
      "orderId": 123,
      "amount": 10000,
      "status": "COMPLETED",
      "transactionId": "PAY123456789",
      "paymentMethod": "VNPAY"
    },
    "vnpayResult": {
      "status": "00",
      "message": "Giao dịch thành công",
      "amount": 10000,
      "transactionNo": "12345678"
    }
  }
}
```

### 4. Kiểm tra trạng thái thanh toán

**Endpoint**: `GET /api/v1/payment/check/{transactionId}`

**Response**:
```json
{
  "success": true,
  "message": "Trạng thái thanh toán: COMPLETED",
  "data": {
    "success": true,
    "message": "Thanh toán thành công",
    "transactionId": "PAY123456789",
    "paymentMethod": "VNPAY",
    "amount": 10000,
    "timestamp": "2023-01-01T12:00:00"
  }
}
```

### 5. API Test

**Endpoint**: `GET /api/v1/payment/test-vnpay`

API này cung cấp thông tin về cấu hình VNPAY và tạo một URL thanh toán test.

**Response**:
```json
{
  "success": true,
  "message": "Kiểm tra cấu hình VNPAY thành công",
  "data": {
    "tmn_code": "T4A9FEAR",
    "version": "2.1.0",
    "command": "pay",
    "url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    "return_url": "http://localhost:8080/api/v1/payment/vnpay-return",
    "ipn_url": "http://localhost:8080/api/v1/payment/vnpay-ipn",
    "server_time": "20230101120000",
    "test_payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
  }
}
```

## Tích hợp với Frontend

### Chuyển hướng đến trang thanh toán

```javascript
async function handlePayment() {
  try {
    const response = await fetch('/api/v1/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId: 123,
        amount: 10000,
        paymentMethod: 'VNPAY',
        description: 'Thanh toán đơn hàng #123'
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.data.paymentUrl) {
      // Chuyển hướng đến trang thanh toán VNPAY
      window.location.href = result.data.paymentUrl;
    } else {
      alert('Không thể tạo URL thanh toán');
    }
  } catch (error) {
    console.error('Lỗi thanh toán:', error);
  }
}
```

## Xử lý Callback và IPN

### Callback URL

VNPAY sẽ chuyển hướng người dùng về URL callback (`return-url`) sau khi thanh toán hoàn tất. URL này đã được cấu hình trong `application.YML` và được triển khai trong `PaymentController`.

### IPN URL

VNPAY sẽ gửi thông báo tự động đến URL IPN (`ipn-url`) khi có cập nhật về trạng thái thanh toán. URL này cũng đã được cấu hình và triển khai.

## Sử dụng ngrok cho Testing

Khi test trên môi trường local, bạn cần sử dụng ngrok để tạo một URL public cho callback và IPN.

1. Tải và cài đặt ngrok từ https://ngrok.com/
2. Chạy lệnh: `ngrok http 8080`
3. Cập nhật cấu hình trong `application-ngrok.YML`:
   ```yaml
   app:
     backend-url: https://your-ngrok-url.ngrok.io
   ```
4. Chạy ứng dụng với profile ngrok:
   ```
   ./gradlew bootRun --args='--spring.profiles.active=ngrok'
   ```

## Tham khảo

- [Tài liệu VNPAY chính thức](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html)
- [Thư viện vnpay.js.org](https://vnpay.js.org/)
- [GitHub: lehuygiang28/vnpay](https://github.com/lehuygiang28/vnpay) 