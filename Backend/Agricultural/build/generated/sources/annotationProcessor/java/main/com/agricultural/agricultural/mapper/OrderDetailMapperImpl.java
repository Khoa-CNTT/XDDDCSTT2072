package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.OrderDetailDTO;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.Order;
import com.agricultural.agricultural.entity.OrderDetail;
import com.agricultural.agricultural.entity.ProductVariant;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-05T01:54:30+0700",
    comments = "version: 1.5.5.Final, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.12.1.jar, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class OrderDetailMapperImpl implements OrderDetailMapper {

    @Override
    public OrderDetailDTO toDto(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }

        OrderDetailDTO.OrderDetailDTOBuilder orderDetailDTO = OrderDetailDTO.builder();

        orderDetailDTO.orderId( orderDetailOrderId( orderDetail ) );
        orderDetailDTO.productId( orderDetailProductId( orderDetail ) );
        orderDetailDTO.productName( orderDetailProductProductName( orderDetail ) );
        orderDetailDTO.productImage( orderDetailProductImageUrl( orderDetail ) );
        orderDetailDTO.variantId( orderDetailVariantId( orderDetail ) );
        orderDetailDTO.variantName( orderDetailVariantName( orderDetail ) );
        orderDetailDTO.id( orderDetail.getId() );
        orderDetailDTO.quantity( orderDetail.getQuantity() );
        orderDetailDTO.price( orderDetail.getPrice() );
        orderDetailDTO.originalPrice( orderDetail.getOriginalPrice() );
        orderDetailDTO.discountAmount( orderDetail.getDiscountAmount() );
        orderDetailDTO.status( orderDetail.getStatus() );
        orderDetailDTO.reviewStatus( orderDetail.getReviewStatus() );

        return orderDetailDTO.build();
    }

    @Override
    public List<OrderDetailDTO> toDtoList(List<OrderDetail> orderDetails) {
        if ( orderDetails == null ) {
            return null;
        }

        List<OrderDetailDTO> list = new ArrayList<OrderDetailDTO>( orderDetails.size() );
        for ( OrderDetail orderDetail : orderDetails ) {
            list.add( toDto( orderDetail ) );
        }

        return list;
    }

    @Override
    public OrderDetail toEntity(OrderDetailDTO orderDetailDTO) {
        if ( orderDetailDTO == null ) {
            return null;
        }

        OrderDetail.OrderDetailBuilder orderDetail = OrderDetail.builder();

        orderDetail.id( orderDetailDTO.getId() );
        orderDetail.orderId( orderDetailDTO.getOrderId() );
        orderDetail.productId( orderDetailDTO.getProductId() );
        orderDetail.productName( orderDetailDTO.getProductName() );
        orderDetail.productImage( orderDetailDTO.getProductImage() );
        orderDetail.variantId( orderDetailDTO.getVariantId() );
        orderDetail.variantName( orderDetailDTO.getVariantName() );
        orderDetail.originalPrice( orderDetailDTO.getOriginalPrice() );
        orderDetail.price( orderDetailDTO.getPrice() );
        orderDetail.discountAmount( orderDetailDTO.getDiscountAmount() );
        orderDetail.quantity( orderDetailDTO.getQuantity() );
        orderDetail.status( orderDetailDTO.getStatus() );
        orderDetail.reviewStatus( orderDetailDTO.getReviewStatus() );

        return orderDetail.build();
    }

    @Override
    public void updateEntityFromDto(OrderDetailDTO dto, OrderDetail entity) {
        if ( dto == null ) {
            return;
        }

        entity.setId( dto.getId() );
        entity.setOrderId( dto.getOrderId() );
        entity.setProductId( dto.getProductId() );
        entity.setProductName( dto.getProductName() );
        entity.setProductImage( dto.getProductImage() );
        entity.setVariantId( dto.getVariantId() );
        entity.setVariantName( dto.getVariantName() );
        entity.setOriginalPrice( dto.getOriginalPrice() );
        entity.setPrice( dto.getPrice() );
        entity.setDiscountAmount( dto.getDiscountAmount() );
        entity.setQuantity( dto.getQuantity() );
        entity.setStatus( dto.getStatus() );
        entity.setReviewStatus( dto.getReviewStatus() );
    }

    private Integer orderDetailOrderId(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }
        Order order = orderDetail.getOrder();
        if ( order == null ) {
            return null;
        }
        Integer id = order.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Integer orderDetailProductId(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }
        MarketPlace product = orderDetail.getProduct();
        if ( product == null ) {
            return null;
        }
        Integer id = product.getId();
        if ( id == null ) {
            return null;
        }
        return id;
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

    private String orderDetailProductImageUrl(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }
        MarketPlace product = orderDetail.getProduct();
        if ( product == null ) {
            return null;
        }
        String imageUrl = product.getImageUrl();
        if ( imageUrl == null ) {
            return null;
        }
        return imageUrl;
    }

    private Integer orderDetailVariantId(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }
        ProductVariant variant = orderDetail.getVariant();
        if ( variant == null ) {
            return null;
        }
        Integer id = variant.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String orderDetailVariantName(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }
        ProductVariant variant = orderDetail.getVariant();
        if ( variant == null ) {
            return null;
        }
        String name = variant.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
