# Tích Hợp Chat AI

Tài liệu này hướng dẫn về tích hợp và sử dụng API Chat AI trong hệ thống Agricultural.

## Tổng Quan

Hệ thống đã được tích hợp với API Chat AI để hỗ trợ người dùng trong việc hỏi đáp các vấn đề liên quan đến nông nghiệp. Hệ thống hỗ trợ 2 loại AI:
1. API tùy chỉnh từ GitHub repository [Fine_Tuning_AI](https://github.com/VanDungDev291103/Fine_Tuning_AI)
2. Google Gemini API

## Cấu Hình

### Cấu hình trong application.YML

```yaml
# Cấu hình AI Service
ai:
  service:
    baseUrl: http://localhost:8000  # URL của API AI tùy chỉnh
    apiKey: ${AI_SERVICE_API_KEY:}  # API key (nếu cần)
    timeout: 30000  # Timeout cho API call (30 giây)
    gemini:
      api:
        url: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
        key: YOUR_GEMINI_API_KEY
```

### Biến Môi Trường

Bạn có thể cấu hình API key thông qua biến môi trường:

```
AI_SERVICE_API_KEY=your_api_key_here
```

## Giới Hạn Phạm Vi Trả Lời

Hệ thống đã được cấu hình để giới hạn phạm vi trả lời của AI chỉ trong lĩnh vực nông nghiệp và các chủ đề liên quan. Điều này được thực hiện thông qua:

1. Mỗi request gửi đến AI service đều có tham số `domain` được đặt là "agricultural"
2. Hệ thống gửi kèm danh sách từ khóa liên quan đến nông nghiệp từ `KeywordValidatorService`
3. AI service sẽ sử dụng các từ khóa này để giới hạn phạm vi câu trả lời

Khi người dùng hỏi về các chủ đề không liên quan đến nông nghiệp, AI sẽ từ chối trả lời hoặc điều hướng câu trả lời vào lĩnh vực nông nghiệp.

### Quản lý từ khóa với KeywordValidatorService

Danh sách từ khóa được quản lý trong `KeywordValidatorService`. Service này cung cấp:

1. Danh sách từ khóa liên quan đến nông nghiệp (cây trồng, rau củ, trái cây, chăn nuôi, thời tiết...)
2. Phương thức để lấy tất cả từ khóa dưới dạng chuỗi hoặc Set
3. Phương thức để kiểm tra xem một từ khóa có thuộc lĩnh vực nông nghiệp không

Để thêm hoặc sửa từ khóa, bạn cần chỉnh sửa mảng `keywords` trong class `KeywordValidatorService`.

## API Endpoints

### 1. Chat với AI (sử dụng API AI tùy chỉnh)

- **URL**: `/api/v1/ai/chat`
- **Method**: POST
- **Yêu cầu xác thực**: Không
- **Request Body**:

```json
{
  "message": "Làm thế nào để trồng lúa hiệu quả?",
  "userId": "user_123",
  "domain": "agricultural"  
}
```

- **Response**:

```json
{
  "message": "Để trồng lúa hiệu quả, bạn cần...",
  "source": "agricultural_data",
  "success": true,
  "error": null
}
```

### 2. Chat với AI (sử dụng Gemini API)

- **URL**: `/api/v1/gemini/chat`
- **Method**: POST
- **Yêu cầu xác thực**: Không
- **Request Body**:

```json
{
  "message": "Làm thế nào để trồng lúa hiệu quả?",
  "userId": "user_123",
  "domain": "agricultural"  
}
```

- **Response**:

```json
{
  "message": "Để trồng lúa hiệu quả, bạn cần...",
  "source": "gemini",
  "success": true,
  "error": null
}
```

### 3. Chat với AI (sử dụng Chatbot với context)

- **URL**: `/api/v1/ai/chatbot`
- **Method**: POST
- **Yêu cầu xác thực**: Không
- **Request Body**:

```json
{
  "message": "Thời gian trồng lúa là bao lâu?",
  "userId": "user_123",
  "domain": "agricultural", 
  "context": [
    {
      "content": "Làm thế nào để trồng lúa hiệu quả?",
      "role": "user"
    },
    {
      "content": "Để trồng lúa hiệu quả, bạn cần chuẩn bị đất, chọn giống tốt, và đảm bảo nguồn nước đầy đủ.",
      "role": "assistant"
    }
  ]
}
```

- **Response**:

```json
{
  "message": "Thời gian trồng lúa thường kéo dài từ 3-6 tháng tùy thuộc vào giống lúa...",
  "source": "agricultural_data",
  "success": true,
  "error": null
}
```

### 4. Lấy Lịch Sử Chat

- **URL**: `/api/v1/ai/history?userId=user_123&limit=10`
- **Method**: GET
- **Yêu cầu xác thực**: Không
- **Query Parameters**:
  - `userId`: ID của người dùng (bắt buộc)
  - `limit`: Số lượng tin nhắn tối đa muốn lấy (không bắt buộc)

- **Response**:

```json
{
  "messages": [
    {
      "content": "Làm thế nào để trồng lúa hiệu quả?",
      "role": "user",
      "timestamp": "2023-04-01T12:00:00"
    },
    {
      "content": "Để trồng lúa hiệu quả, bạn cần...",
      "role": "assistant",
      "timestamp": "2023-04-01T12:00:10"
    }
  ],
  "success": true,
  "error": null
}
```

## Sử Dụng Gemini API

Hệ thống sử dụng Google Gemini API để cung cấp khả năng chat AI. API này được tích hợp với các từ khóa nông nghiệp để đảm bảo rằng mô hình chỉ trả lời các câu hỏi liên quan đến nông nghiệp.

### Cách hoạt động

1. Khi người dùng gửi một câu hỏi, hệ thống sẽ tạo một prompt bao gồm:
   - Hướng dẫn cho mô hình Gemini chỉ trả lời các câu hỏi liên quan đến nông nghiệp
   - Danh sách các từ khóa nông nghiệp từ `KeywordValidatorService`
   - Câu hỏi của người dùng

2. Nếu câu hỏi liên quan đến nông nghiệp, Gemini sẽ trả lời với thông tin chính xác.

3. Nếu câu hỏi không liên quan đến nông nghiệp, Gemini sẽ từ chối trả lời và gợi ý các chủ đề nông nghiệp.

### Lấy API Key Gemini

Để sử dụng Gemini API, bạn cần:

1. Tạo tài khoản Google Cloud Platform
2. Tạo dự án và kích hoạt API Gemini
3. Tạo API key và cấu hình trong file application.YML

## Sử Dụng Trong Frontend

### Ví dụ gọi API từ JavaScript

```javascript
// Chat với AI tùy chỉnh
async function sendMessage(message, userId) {
  const response = await fetch('/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      userId,
      domain: 'agricultural' // Mặc định là nông nghiệp
    })
  });
  
  return await response.json();
}

// Chat sử dụng Gemini API
async function sendGeminiMessage(message, userId) {
  const response = await fetch('/api/v1/gemini/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      userId,
      domain: 'agricultural' // Mặc định là nông nghiệp
    })
  });
  
  return await response.json();
}

// Chat với AI (có context)
async function sendChatbotMessage(message, userId, context = []) {
  const response = await fetch('/api/v1/ai/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      userId,
      domain: 'agricultural', // Mặc định là nông nghiệp
      context
    })
  });
  
  return await response.json();
}

// Lấy lịch sử chat
async function getChatHistory(userId, limit = 10) {
  const response = await fetch(`/api/v1/ai/history?userId=${userId}&limit=${limit}`);
  return await response.json();
}
```

## Cài Đặt AI Service

Để cài đặt và chạy dịch vụ AI:

1. Clone repository Fine_Tuning_AI:
```bash
git clone https://github.com/VanDungDev291103/Fine_Tuning_AI.git
```

2. Làm theo hướng dẫn trong repository để cài đặt và chạy dịch vụ.

3. Cấu hình `ai.service.baseUrl` trong file application.YML để trỏ đến địa chỉ của dịch vụ AI.

4. Đảm bảo AI service được cấu hình để hỗ trợ tham số `domain` và `domain_keywords`.

## Lỗi Thường Gặp

1. **Không kết nối được đến dịch vụ AI**:
   - Kiểm tra xem dịch vụ AI đã được khởi động chưa
   - Kiểm tra cài đặt baseUrl trong application.YML
   - Kiểm tra kết nối mạng giữa backend và dịch vụ AI

2. **Lỗi xác thực API**:
   - Kiểm tra API key có được cấu hình đúng không
   - Kiểm tra xem dịch vụ AI có yêu cầu xác thực không

3. **Lỗi với Gemini API**:
   - Kiểm tra Gemini API key có hợp lệ không
   - Kiểm tra xem bạn đã đăng ký và kích hoạt API Gemini trong Google Cloud chưa
   - Kiểm tra định dạng request gửi đến Gemini

4. **AI trả lời nội dung không liên quan**:
   - Kiểm tra danh sách từ khóa trong `KeywordValidatorService`
   - Cập nhật danh sách từ khóa nếu không đủ chính xác
   - Kiểm tra xem AI service có hỗ trợ tham số domain_keywords không

## Phát Triển

Để mở rộng chức năng AI, bạn có thể:

1. Thêm các endpoint mới vào `AiChatController` hoặc `GeminiAiController`
2. Mở rộng các model DTO trong package `dto.ai`
3. Thêm các phương thức vào service `AiChatService` hoặc `GeminiAiService`
4. Thêm các từ khóa mới vào `KeywordValidatorService` 