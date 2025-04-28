package com.agricultural.agricultural.utils;//package com.agricultural.agricultural.utils;
//
///**
// * Hướng dẫn sử dụng hệ thống thông báo realtime
// *
// * 1. GIỚI THIỆU VỀ HỆ THỐNG THÔNG BÁO
// * ----------------------------------
// * Hệ thống thông báo realtime sử dụng WebSocket (STOMP protocol) để gửi thông báo tức thì đến người dùng
// * mà không cần tải lại trang. Có 2 loại thông báo:
// * - Thông báo cá nhân: Gửi riêng cho từng người dùng
// * - Thông báo broadcast: Gửi cho tất cả người dùng đang kết nối
// *
// * 2. TÍCH HỢP VÀO BACKEND
// * ----------------------
// * a) Thêm thông báo vào OrderService khi cập nhật trạng thái đơn hàng:
// *
// * ```java
// * // Trong OrderServiceImpl
// * @Autowired
// * private NotificationService notificationService;
// *
// * public OrderDTO updateOrderStatus(Integer orderId, OrderStatus newStatus) {
// *     // ... xử lý cập nhật trạng thái ...
// *
// *     // Gửi thông báo realtime cho người dùng
// *     NotificationDTO notification = NotificationDTO.builder()
// *             .userId(order.getBuyerId())
// *             .title("Cập nhật đơn hàng #" + order.getOrderNumber())
// *             .message("Đơn hàng #" + order.getOrderNumber() + " của bạn đã được cập nhật sang trạng thái: " + newStatus.name())
// *             .type("ORDER_STATUS")
// *             .redirectUrl("/orders/" + order.getId())
// *             .build();
// *
// *     notificationService.sendRealTimeNotification(notification);
// *
// *     return orderMapper.toDTO(updatedOrder);
// * }
// * ```
// *
// * b) Thêm thông báo vào PaymentService khi thanh toán thành công/thất bại:
// *
// * ```java
// * // Trong PaymentServiceImpl
// * @Autowired
// * private NotificationService notificationService;
// *
// * public void handlePaymentCallback(PaymentCallbackRequest request) {
// *     // ... xử lý callback từ cổng thanh toán ...
// *
// *     String title = paymentSuccessful ? "Thanh toán thành công" : "Thanh toán thất bại";
// *     String message = paymentSuccessful
// *         ? "Đơn hàng #" + orderNumber + " đã được thanh toán thành công"
// *         : "Thanh toán cho đơn hàng #" + orderNumber + " không thành công. Vui lòng thử lại";
// *
// *     NotificationDTO notification = NotificationDTO.builder()
// *             .userId(userId)
// *             .title(title)
// *             .message(message)
// *             .type("PAYMENT_STATUS")
// *             .redirectUrl("/orders/" + orderId)
// *             .build();
// *
// *     notificationService.sendRealTimeNotification(notification);
// * }
// * ```
// *
// * c) Thêm thông báo cho FlashSale sắp diễn ra (broadcast):
// *
// * ```java
// * // Trong FlashSaleScheduler
// * @Autowired
// * private NotificationService notificationService;
// *
// * @Scheduled(fixedRate = 600000) // 10 phút kiểm tra một lần
// * public void checkUpcomingFlashSales() {
// *     List<FlashSale> upcomingFlashSales = flashSaleRepository.findUpcomingFlashSales();
// *
// *     for (FlashSale flashSale : upcomingFlashSales) {
// *         if (flashSale.getStartTime().minusMinutes(30).isBefore(LocalDateTime.now())) {
// *             // Thông báo cho tất cả người dùng về flash sale sắp diễn ra
// *             NotificationDTO notification = NotificationDTO.builder()
// *                     .title("Flash Sale sắp diễn ra!")
// *                     .message("Flash Sale " + flashSale.getName() + " sẽ bắt đầu trong vòng 30 phút nữa. Chuẩn bị săn sale!")
// *                     .type("FLASH_SALE_UPCOMING")
// *                     .redirectUrl("/flash-sales/" + flashSale.getId())
// *                     .build();
// *
// *             notificationService.sendRealTimeNotificationToAll(notification);
// *         }
// *     }
// * }
// * ```
// *
// * d) Thêm thông báo cho cảnh báo thời tiết:
// *
// * ```java
// * // Trong WeatherAlertServiceImpl
// * @Autowired
// * private NotificationService notificationService;
// *
// * public void processWeatherAlert(WeatherData weatherData) {
// *     // Kiểm tra và xử lý cảnh báo thời tiết
// *     if (isExtremeTempOrRain(weatherData)) {
// *         // Tìm người dùng đã đăng ký nhận thông báo thời tiết cho vùng này
// *         List<UserWeatherSubscription> subscriptions = subscriptionRepository.findByLocationId(weatherData.getLocationId());
// *
// *         for (UserWeatherSubscription subscription : subscriptions) {
// *             NotificationDTO notification = NotificationDTO.builder()
// *                     .userId(subscription.getUserId())
// *                     .title("Cảnh báo thời tiết!")
// *                     .message("Khu vực " + weatherData.getLocationName() + " có " + getWeatherAlertMessage(weatherData))
// *                     .type("WEATHER_ALERT")
// *                     .redirectUrl("/weather/" + weatherData.getLocationId())
// *                     .build();
// *
// *             notificationService.sendRealTimeNotification(notification);
// *         }
// *     }
// * }
// * ```
// *
// * e) Thêm thông báo cho forum - khi có người reply:
// *
// * ```java
// * // Trong ForumReplyServiceImpl
// * @Autowired
// * private NotificationService notificationService;
// *
// * public ForumReplyDTO createReply(ForumReplyDTO replyDTO) {
// *     // ... logic lưu reply ...
// *
// *     // Gửi thông báo cho người tạo bài viết
// *     ForumPost post = forumPostRepository.findById(replyDTO.getPostId())
// *             .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết"));
// *
// *     if (!Objects.equals(post.getUserId(), replyDTO.getUserId())) {
// *         NotificationDTO notification = NotificationDTO.builder()
// *                 .userId(post.getUserId())
// *                 .title("Có phản hồi mới trên bài viết của bạn")
// *                 .message(user.getUsername() + " đã phản hồi bài viết của bạn: " + post.getTitle())
// *                 .type("FORUM_REPLY")
// *                 .redirectUrl("/forum/posts/" + post.getId())
// *                 .build();
// *
// *         notificationService.sendRealTimeNotification(notification);
// *     }
// *
// *     return savedReplyDTO;
// * }
// * ```
// *
// * 3. TÍCH HỢP VÀO FRONTEND (React/JavaScript)
// * ----------------------------------------
// * // Cài đặt thư viện
// * npm install sockjs-client stompjs
// *
// * // Kết nối tới WebSocket server và thiết lập thông báo
// *
// * ```jsx
// * // src/services/websocket.js
// * import SockJS from 'sockjs-client';
// * import Stomp from 'stompjs';
// *
// * let stompClient = null;
// *
// * export const connectWebSocket = (token, onNotificationReceived) => {
// *   if (stompClient) {
// *     return;
// *   }
// *
// *   const socket = new SockJS('http://your-backend-url/ws');
// *   stompClient = Stomp.over(socket);
// *
// *   // Thêm token vào header để xác thực
// *   const headers = {
// *     'Authorization': `Bearer ${token}`
// *   };
// *
// *   stompClient.connect(headers, () => {
// *     console.log('WebSocket Connected');
// *
// *     // Đăng ký nhận thông báo riêng cho user (thông báo cá nhân)
// *     stompClient.subscribe('/user/queue/notifications', (notification) => {
// *       const notificationData = JSON.parse(notification.body);
// *       console.log('Notification received:', notificationData);
// *
// *       // Chuyển dữ liệu thông báo cho callback
// *       if (onNotificationReceived) {
// *         onNotificationReceived(notificationData);
// *       }
// *     });
// *
// *     // Đăng ký nhận thông báo chung (thông báo broadcast)
// *     stompClient.subscribe('/topic/notifications', (notification) => {
// *       const notificationData = JSON.parse(notification.body);
// *       console.log('Broadcast notification received:', notificationData);
// *
// *       // Chuyển dữ liệu thông báo cho callback
// *       if (onNotificationReceived) {
// *         onNotificationReceived(notificationData);
// *       }
// *     });
// *   }, (error) => {
// *     console.error('WebSocket Connection Error:', error);
// *   });
// *
// *   return () => {
// *     if (stompClient) {
// *       stompClient.disconnect();
// *       stompClient = null;
// *     }
// *   };
// * };
// *
// * // Hàm gửi thông báo (nếu cần)
// * export const sendPrivateNotification = (notification) => {
// *   if (stompClient && stompClient.connected) {
// *     stompClient.send('/app/notification.private', {}, JSON.stringify(notification));
// *   }
// * };
// *
// * export const sendBroadcastNotification = (notification) => {
// *   if (stompClient && stompClient.connected) {
// *     stompClient.send('/app/notification.broadcast', {}, JSON.stringify(notification));
// *   }
// * };
// * ```
// *
// * ```jsx
// * // Component hiển thị thông báo
// * // src/components/NotificationSystem.jsx
// * import React, { useEffect, useState } from 'react';
// * import { connectWebSocket } from '../services/websocket';
// * import { useAuth } from '../contexts/AuthContext';
// * import { toast, ToastContainer } from 'react-toastify';
// * import 'react-toastify/dist/ReactToastify.css';
// *
// * const NotificationSystem = () => {
// *   const { token, user } = useAuth();
// *   const [notifications, setNotifications] = useState([]);
// *
// *   // Xử lý khi nhận được thông báo mới
// *   const handleNotification = (notification) => {
// *     // Thêm vào danh sách thông báo
// *     setNotifications(prev => [notification, ...prev]);
// *
// *     // Hiển thị toast thông báo
// *     toast.info(
// *       <div onClick={() => handleNotificationClick(notification)}>
// *         <h4>{notification.title}</h4>
// *         <p>{notification.message}</p>
// *       </div>,
// *       {
// *         position: "top-right",
// *         autoClose: 5000,
// *         closeOnClick: true,
// *         pauseOnHover: true,
// *         draggable: true,
// *       }
// *     );
// *   };
// *
// *   // Xử lý khi click vào thông báo
// *   const handleNotificationClick = (notification) => {
// *     if (notification.redirectUrl) {
// *       window.location.href = notification.redirectUrl;
// *     }
// *
// *     // Đánh dấu đã đọc
// *     fetch(`/api/v1/notifications/${notification.id}/mark-read`, {
// *       method: 'PUT',
// *       headers: {
// *         'Authorization': `Bearer ${token}`,
// *         'Content-Type': 'application/json',
// *       },
// *     });
// *   };
// *
// *   useEffect(() => {
// *     if (token && user) {
// *       // Kết nối WebSocket khi người dùng đã đăng nhập
// *       const disconnect = connectWebSocket(token, handleNotification);
// *
// *       // Lấy thông báo chưa đọc
// *       fetch(`/api/v1/notifications/${user.id}/unread`, {
// *         headers: {
// *           'Authorization': `Bearer ${token}`,
// *         },
// *       })
// *         .then(response => response.json())
// *         .then(data => {
// *           setNotifications(data);
// *         });
// *
// *       return disconnect;
// *     }
// *   }, [token, user]);
// *
// *   return (
// *     <>
// *       <ToastContainer />
// *       {/* Có thể thêm biểu tượng thông báo ở đây với badge hiển thị số lượng */}
// *     </>
// *   );
// * };
// *
// * export default NotificationSystem;
// * ```
// *
// * 4. TÍCH HỢP VÀO APP CHÍNH
// * ------------------------
// * ```jsx
// * // src/App.js
// * import React from 'react';
// * import { BrowserRouter as Router } from 'react-router-dom';
// * import NotificationSystem from './components/NotificationSystem';
// * import { AuthProvider } from './contexts/AuthContext';
// * // Các import khác...
// *
// * function App() {
// *   return (
// *     <AuthProvider>
// *       <Router>
// *         <NotificationSystem />
// *         {/* Các route và component khác */}
// *       </Router>
// *     </AuthProvider>
// *   );
// * }
// *
// * export default App;
// * ```
// *
// * 5. CÁC TRƯỜNG HỢP SỬ DỤNG THÔNG BÁO REALTIME
// * ------------------------------------------
// * - Thông báo trạng thái đơn hàng (đã xác nhận, đang giao, đã giao)
// * - Thông báo thanh toán (thành công, thất bại)
// * - Thông báo flash sale sắp diễn ra hoặc đang diễn ra
// * - Cảnh báo thời tiết cho người dùng đã đăng ký
// * - Thông báo có phản hồi mới trên bài viết forum
// * - Thông báo có người mua sản phẩm đang bán
// * - Thông báo giá sản phẩm thay đổi (nếu người dùng theo dõi sản phẩm)
// * - Thông báo cảnh báo hết hàng cho người bán
// * - Thông báo hệ thống (bảo trì, nâng cấp)
// * - Thông báo khuyến nghị sản phẩm dựa theo thời tiết
// *
// * 6. GHI CHÚ QUAN TRỌNG
// * -------------------
// * - Đảm bảo không gửi quá nhiều thông báo sẽ làm phiền người dùng
// * - Cho phép người dùng tùy chỉnh loại thông báo muốn nhận
// * - Lưu thông báo vào DB để hiển thị lịch sử thông báo
// * - Xử lý kết nối lại nếu WebSocket bị ngắt kết nối
// * - Thêm cơ chế retry cho các thông báo quan trọng khi kết nối bị lỗi
// */
//public class NotificationExample {
//    // Lớp này chỉ dùng để hướng dẫn
//}