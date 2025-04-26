package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.OrderDTO;
import com.agricultural.agricultural.dto.OrderDetailDTO;
import com.agricultural.agricultural.entity.Order;
import com.agricultural.agricultural.entity.OrderDetail;
import com.agricultural.agricultural.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-27T03:03:00+0700",
    comments = "version: 1.5.5.Final, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.12.1.jar, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Autowired
    private OrderDetailMapper orderDetailMapper;

    @Override
    public OrderDTO toDTO(Order order) {
        if ( order == null ) {
            return null;
        }

        OrderDTO.OrderDTOBuilder orderDTO = OrderDTO.builder();

        orderDTO.buyerName( orderBuyerUsername( order ) );
        orderDTO.sellerName( orderSellerUsername( order ) );
        orderDTO.orderDetails( orderDetailMapper.toDtoList( order.getOrderDetails() ) );
        orderDTO.id( order.getId() );
        orderDTO.orderNumber( order.getOrderNumber() );
        orderDTO.totalQuantity( order.getTotalQuantity() );
        orderDTO.subtotal( order.getSubtotal() );
        orderDTO.shippingFee( order.getShippingFee() );
        orderDTO.taxAmount( order.getTaxAmount() );
        orderDTO.discountAmount( order.getDiscountAmount() );
        orderDTO.totalAmount( order.getTotalAmount() );
        orderDTO.buyerId( order.getBuyerId() );
        orderDTO.sellerId( order.getSellerId() );
        orderDTO.paymentMethod( order.getPaymentMethod() );
        orderDTO.paymentStatus( order.getPaymentStatus() );
        orderDTO.shippingName( order.getShippingName() );
        orderDTO.shippingPhone( order.getShippingPhone() );
        orderDTO.shippingAddress( order.getShippingAddress() );
        orderDTO.shippingCity( order.getShippingCity() );
        orderDTO.shippingCountry( order.getShippingCountry() );
        orderDTO.shippingPostalCode( order.getShippingPostalCode() );
        orderDTO.notes( order.getNotes() );
        orderDTO.invoiceNumber( order.getInvoiceNumber() );
        orderDTO.invoiceDate( order.getInvoiceDate() );
        orderDTO.orderDate( order.getOrderDate() );
        orderDTO.completedDate( order.getCompletedDate() );
        orderDTO.cancelledDate( order.getCancelledDate() );
        orderDTO.cancellationReason( order.getCancellationReason() );
        orderDTO.updatedAt( order.getUpdatedAt() );
        orderDTO.status( order.getStatus() );

        return orderDTO.build();
    }

    @Override
    public List<OrderDTO> toDTOList(List<Order> orders) {
        if ( orders == null ) {
            return null;
        }

        List<OrderDTO> list = new ArrayList<OrderDTO>( orders.size() );
        for ( Order order : orders ) {
            list.add( toDTO( order ) );
        }

        return list;
    }

    @Override
    public Order toEntity(OrderDTO orderDTO) {
        if ( orderDTO == null ) {
            return null;
        }

        Order.OrderBuilder order = Order.builder();

        order.id( orderDTO.getId() );
        order.orderNumber( orderDTO.getOrderNumber() );
        order.totalQuantity( orderDTO.getTotalQuantity() );
        order.subtotal( orderDTO.getSubtotal() );
        order.shippingFee( orderDTO.getShippingFee() );
        order.taxAmount( orderDTO.getTaxAmount() );
        order.discountAmount( orderDTO.getDiscountAmount() );
        order.totalAmount( orderDTO.getTotalAmount() );
        order.buyerId( orderDTO.getBuyerId() );
        order.sellerId( orderDTO.getSellerId() );
        order.paymentMethod( orderDTO.getPaymentMethod() );
        order.paymentStatus( orderDTO.getPaymentStatus() );
        order.shippingName( orderDTO.getShippingName() );
        order.shippingPhone( orderDTO.getShippingPhone() );
        order.shippingAddress( orderDTO.getShippingAddress() );
        order.shippingCity( orderDTO.getShippingCity() );
        order.shippingCountry( orderDTO.getShippingCountry() );
        order.shippingPostalCode( orderDTO.getShippingPostalCode() );
        order.notes( orderDTO.getNotes() );
        order.invoiceNumber( orderDTO.getInvoiceNumber() );
        order.invoiceDate( orderDTO.getInvoiceDate() );
        order.orderDate( orderDTO.getOrderDate() );
        order.completedDate( orderDTO.getCompletedDate() );
        order.cancelledDate( orderDTO.getCancelledDate() );
        order.cancellationReason( orderDTO.getCancellationReason() );
        order.updatedAt( orderDTO.getUpdatedAt() );
        order.status( orderDTO.getStatus() );

        return order.build();
    }

    @Override
    public void updateEntityFromDto(OrderDTO dto, Order entity) {
        if ( dto == null ) {
            return;
        }

        entity.setId( dto.getId() );
        entity.setOrderNumber( dto.getOrderNumber() );
        entity.setTotalQuantity( dto.getTotalQuantity() );
        entity.setSubtotal( dto.getSubtotal() );
        entity.setShippingFee( dto.getShippingFee() );
        entity.setTaxAmount( dto.getTaxAmount() );
        entity.setDiscountAmount( dto.getDiscountAmount() );
        entity.setTotalAmount( dto.getTotalAmount() );
        entity.setBuyerId( dto.getBuyerId() );
        entity.setSellerId( dto.getSellerId() );
        entity.setPaymentMethod( dto.getPaymentMethod() );
        entity.setPaymentStatus( dto.getPaymentStatus() );
        entity.setShippingName( dto.getShippingName() );
        entity.setShippingPhone( dto.getShippingPhone() );
        entity.setShippingAddress( dto.getShippingAddress() );
        entity.setShippingCity( dto.getShippingCity() );
        entity.setShippingCountry( dto.getShippingCountry() );
        entity.setShippingPostalCode( dto.getShippingPostalCode() );
        entity.setNotes( dto.getNotes() );
        entity.setInvoiceNumber( dto.getInvoiceNumber() );
        entity.setInvoiceDate( dto.getInvoiceDate() );
        entity.setOrderDate( dto.getOrderDate() );
        entity.setCompletedDate( dto.getCompletedDate() );
        entity.setCancelledDate( dto.getCancelledDate() );
        entity.setCancellationReason( dto.getCancellationReason() );
        entity.setUpdatedAt( dto.getUpdatedAt() );
        entity.setStatus( dto.getStatus() );
        if ( entity.getOrderDetails() != null ) {
            List<OrderDetail> list = orderDetailDTOListToOrderDetailList( dto.getOrderDetails() );
            if ( list != null ) {
                entity.getOrderDetails().clear();
                entity.getOrderDetails().addAll( list );
            }
            else {
                entity.setOrderDetails( null );
            }
        }
        else {
            List<OrderDetail> list = orderDetailDTOListToOrderDetailList( dto.getOrderDetails() );
            if ( list != null ) {
                entity.setOrderDetails( list );
            }
        }
    }

    private String orderBuyerUsername(Order order) {
        if ( order == null ) {
            return null;
        }
        User buyer = order.getBuyer();
        if ( buyer == null ) {
            return null;
        }
        String username = buyer.getUsername();
        if ( username == null ) {
            return null;
        }
        return username;
    }

    private String orderSellerUsername(Order order) {
        if ( order == null ) {
            return null;
        }
        User seller = order.getSeller();
        if ( seller == null ) {
            return null;
        }
        String username = seller.getUsername();
        if ( username == null ) {
            return null;
        }
        return username;
    }

    protected List<OrderDetail> orderDetailDTOListToOrderDetailList(List<OrderDetailDTO> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderDetail> list1 = new ArrayList<OrderDetail>( list.size() );
        for ( OrderDetailDTO orderDetailDTO : list ) {
            list1.add( orderDetailMapper.toEntity( orderDetailDTO ) );
        }

        return list1;
    }
}
