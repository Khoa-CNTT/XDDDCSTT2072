package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.OrderDetailDTO;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.OrderDetail;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-03T11:58:08+0700",
    comments = "version: 1.5.5.Final, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.12.1.jar, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class OrderDetailMapperImpl implements OrderDetailMapper {

    @Override
    public OrderDetailDTO toDTO(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }

        OrderDetailDTO orderDetailDTO = new OrderDetailDTO();

        orderDetailDTO.setProductName( orderDetailProductProductName( orderDetail ) );
        orderDetailDTO.setPrice( orderDetail.getPrice() );
        orderDetailDTO.setQuantity( orderDetail.getQuantity() );
        orderDetailDTO.setId( orderDetail.getId() );
        orderDetailDTO.setOrderId( orderDetail.getOrderId() );
        orderDetailDTO.setProductId( orderDetail.getProductId() );

        orderDetailDTO.setSubtotal( orderDetail.getPrice().multiply(new java.math.BigDecimal(orderDetail.getQuantity())) );

        return orderDetailDTO;
    }

    @Override
    public OrderDetail toEntity(OrderDetailDTO orderDetailDTO) {
        if ( orderDetailDTO == null ) {
            return null;
        }

        OrderDetail orderDetail = new OrderDetail();

        orderDetail.setId( orderDetailDTO.getId() );
        orderDetail.setOrderId( orderDetailDTO.getOrderId() );
        orderDetail.setProductId( orderDetailDTO.getProductId() );
        orderDetail.setQuantity( orderDetailDTO.getQuantity() );
        orderDetail.setPrice( orderDetailDTO.getPrice() );

        return orderDetail;
    }

    private String orderDetailProductProductName(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }
        MarketPlace product = orderDetail.getProduct();
        if ( product == null ) {
            return null;
        }
        String productName = product.getProductName();
        if ( productName == null ) {
            return null;
        }
        return productName;
    }
}
