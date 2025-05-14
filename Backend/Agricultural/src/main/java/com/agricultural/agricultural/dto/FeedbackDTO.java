package com.agricultural.agricultural.dto;

import com.agricultural.agricultural.entity.enumeration.FeedbackStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDTO {
    
    private Integer id;
    
    private Integer userId;
    
    @NotNull(message = "ID sản phẩm không được để trống")
    private Integer productId;
    
    @NotNull(message = "Đánh giá sao không được để trống")
    @Min(value = 1, message = "Đánh giá sao tối thiểu là 1")
    @Max(value = 5, message = "Đánh giá sao tối đa là 5")
    private Integer rating;
    
    private String comment;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime reviewDate;
    
    private String imageUrl;
    
    private FeedbackStatus status;
    
    private Boolean isVerifiedPurchase;
    
    private Integer helpfulCount;
    
    private Integer notHelpfulCount;
    
    private String reply;
    
    private Integer repliedBy;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime repliedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime updatedAt;
    
    private UserDTO user;
    
    private String productName;
    
    private String productImage;
    
    @Builder.Default
    private List<FeedbackImageDTO> images = new ArrayList<>();
    
    // Hàm cập nhật FeedbackStatus từ chuỗi String để tương thích với entity
    public void setStatusFromString(String statusStr) {
        this.status = FeedbackStatus.fromString(statusStr);
    }
    
    // Trả về giá trị String của status
    public String getStatusAsString() {
        return (status != null) ? status.name() : null;
    }
} 