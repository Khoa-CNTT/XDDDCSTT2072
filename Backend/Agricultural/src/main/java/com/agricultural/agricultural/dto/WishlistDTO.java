package com.agricultural.agricultural.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistDTO {
    private Integer id;
    private Integer userId;
    private String name;
    private Boolean isDefault;
    private Integer itemCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<WishlistItemDTO> items = new ArrayList<>();
} 