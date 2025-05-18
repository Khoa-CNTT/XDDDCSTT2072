package com.agricultural.agricultural.dto.ai.response;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatResponse {
    private String message;
    private String source;
    private boolean success;
    private String error;
    private List<MarketPlaceDTO> products;
} 