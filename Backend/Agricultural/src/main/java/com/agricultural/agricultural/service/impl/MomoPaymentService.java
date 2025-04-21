package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.config.MomoConfig;
import com.agricultural.agricultural.dto.momo.MomoQRRequest;
import com.agricultural.agricultural.dto.momo.MomoQRResponse;
import com.agricultural.agricultural.dto.request.PaymentRequest;
import com.agricultural.agricultural.dto.response.PaymentQRDTO;
import com.agricultural.agricultural.entity.Order;
import com.agricultural.agricultural.entity.Payment;
import com.agricultural.agricultural.entity.enumeration.PaymentStatus;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.repository.IOrderRepository;
import com.agricultural.agricultural.repository.IPaymentRepository;
import com.agricultural.agricultural.utils.QRCodeUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.HmacUtils;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MomoPaymentService {

    private final MomoConfig momoConfig;
    private final ObjectMapper objectMapper;
    private final IOrderRepository orderRepository;
    private final IPaymentRepository paymentRepository;
    private final QRCodeUtils qrCodeUtils;

    /**
     * Tạo QR code thanh toán Momo
     *
     * @param paymentRequest Thông tin thanh toán
     * @return Thông tin QR code
     */
    public PaymentQRDTO createMomoQRCode(PaymentRequest paymentRequest, Integer currentUserId) {
        log.info("Tạo mã QR Momo cho đơn hàng: {}", paymentRequest.getOrderId());

        try {
            // Kiểm tra cấu hình Momo
            if (momoConfig.getSecretKey() == null || momoConfig.getAccessKey() == null) {
                log.error("Lỗi cấu hình Momo: secretKey={}, accessKey={}",
                        momoConfig.getSecretKey() != null ? "present" : "NULL",
                        momoConfig.getAccessKey() != null ? "present" : "NULL");
                throw new BadRequestException("Lỗi cấu hình Momo: Thiếu secretKey hoặc accessKey");
            }
            
            log.info("Thông tin cấu hình Momo: partnerCode={}, accessKey={}, secretKey={}",
                    momoConfig.getPartnerCode(),
                    momoConfig.getAccessKey(),
                    momoConfig.getSecretKey() != null ? "present" : "NULL");

            // Validate input
            if (paymentRequest.getOrderId() == null) {
                throw new BadRequestException("Mã đơn hàng không được để trống");
            }
            if (paymentRequest.getAmount() == null || paymentRequest.getAmount() <= 0) {
                throw new BadRequestException("Số tiền phải lớn hơn 0");
            }

            // Tìm đơn hàng
            Order order = orderRepository.findById(Math.toIntExact(paymentRequest.getOrderId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

            // Tạo payment record
            String transactionId = UUID.randomUUID().toString();
            Payment payment = new Payment();
            payment.setOrderId(order.getId());
            payment.setAmount(paymentRequest.getAmount());
            payment.setDescription(paymentRequest.getDescription());
            payment.setPaymentMethod("MOMO");
            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransactionId(transactionId);
            payment.setPaymentId("MOMO" + System.currentTimeMillis());
            payment.setUserId(currentUserId);
            payment = paymentRepository.save(payment);

            // Tạo request gửi đến Momo
            String requestId = UUID.randomUUID().toString();
            String orderId = "MM" + System.currentTimeMillis();
            String orderInfo = paymentRequest.getDescription() != null 
                    ? paymentRequest.getDescription() 
                    : "Thanh toán đơn hàng #" + paymentRequest.getOrderId();
            String amount = String.valueOf(paymentRequest.getAmount());
            String extraData = "";
            String requestType = "captureWallet";

            // Cập nhật payment note
            payment.setPaymentNote("MOMO_REQUEST_ID=" + requestId + "|ORDER_ID=" + orderId);
            paymentRepository.save(payment);

            // Tạo signature
            String rawSignature = "accessKey=" + momoConfig.getAccessKey() +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + momoConfig.getIpnUrl() +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + momoConfig.getPartnerCode() +
                    "&redirectUrl=" + momoConfig.getRedirectUrl() +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType;

            log.info("Raw signature string: {}", rawSignature);
            log.info("Secret key for signature: {}", momoConfig.getSecretKey());

            String signature = "";
            try {
                signature = HmacUtils.hmacSha256Hex(momoConfig.getSecretKey(), rawSignature);
                log.info("Generated signature: {}", signature);
            } catch (Exception e) {
                log.error("Lỗi khi tạo chữ ký: {}", e.getMessage(), e);
                throw new BadRequestException("Không thể tạo chữ ký: " + e.getMessage());
            }

            // Tạo request body
            MomoQRRequest momoRequest = MomoQRRequest.builder()
                    .partnerCode(momoConfig.getPartnerCode())
                    .partnerName(momoConfig.getPartnerName())
                    .storeId(momoConfig.getStoreId())
                    .requestId(requestId)
                    .amount(amount)
                    .orderId(orderId)
                    .orderInfo(orderInfo)
                    .redirectUrl(momoConfig.getRedirectUrl())
                    .ipnUrl(momoConfig.getIpnUrl())
                    .requestType(requestType)
                    .extraData(extraData)
                    .lang(momoConfig.getLang())
                    .signature(signature)
                    .build();

            // Gọi API Momo
            MomoQRResponse momoResponse = callMomoAPI(momoRequest);

            if (!"0".equals(momoResponse.getResultCode())) {
                log.error("Lỗi tạo mã QR Momo: {}", momoResponse.getMessage());
                throw new BadRequestException("Không thể tạo mã QR thanh toán: " + momoResponse.getMessage());
            }

            // Tạo mã QR từ qrCodeUrl nếu có, nếu không thì tạo từ payUrl
            String qrSource = momoResponse.getQrCodeUrl() != null ? 
                    momoResponse.getQrCodeUrl() : momoResponse.getPayUrl();
            String qrCodeBase64 = qrCodeUtils.generateQRCode(qrSource, 300, 300, true);

            // Tạo response
            PaymentQRDTO responseDTO = PaymentQRDTO.builder()
                    .qrCodeBase64(qrCodeBase64)
                    .paymentUrl(momoResponse.getPayUrl())
                    .orderInfo(orderInfo)
                    .amount(Double.valueOf(amount))
                    .transactionRef(payment.getTransactionId())
                    .expireTime(LocalDateTime.now().plusMinutes(15))
                    .build();

            log.info("Tạo mã QR Momo thành công cho giao dịch: {}", payment.getTransactionId());
            return responseDTO;

        } catch (Exception e) {
            log.error("Lỗi khi tạo mã QR Momo: {}", e.getMessage());
            throw new BadRequestException("Không thể tạo mã QR thanh toán: " + e.getMessage());
        }
    }

    /**
     * Gọi API Momo để tạo QR code
     *
     * @param request Thông tin request
     * @return Thông tin response từ Momo
     */
    private MomoQRResponse callMomoAPI(MomoQRRequest request) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(momoConfig.getApiEndpoint());
            httpPost.setHeader("Content-Type", "application/json; charset=UTF-8");

            // Convert request to JSON
            String requestBody = objectMapper.writeValueAsString(request);
            log.debug("Request gửi đến Momo: {}", requestBody);
            
            StringEntity entity = new StringEntity(requestBody, StandardCharsets.UTF_8);
            httpPost.setEntity(entity);

            // Gọi API
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                String responseBody = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                log.debug("Response từ Momo: {}", responseBody);
                
                // Parse response
                MomoQRResponse momoResponse = objectMapper.readValue(responseBody, MomoQRResponse.class);
                return momoResponse;
            }
        } catch (Exception e) {
            log.error("Lỗi khi gọi API Momo: {}", e.getMessage());
            throw new BadRequestException("Không thể kết nối đến Momo: " + e.getMessage());
        }
    }
} 