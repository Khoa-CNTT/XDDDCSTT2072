package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.domain.entity.Order;
import com.agricultural.agricultural.domain.entity.OrderDetail;
import com.agricultural.agricultural.domain.entity.User;
import com.agricultural.agricultural.dto.OrderDTO;
import com.agricultural.agricultural.dto.OrderDetailDTO;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-03-24T15:32:38+0700",
    comments = "version: 1.5.5.Final, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.12.1.jar, environment: Java 23 (Oracle Corporation)"
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

        OrderDTO orderDTO = new OrderDTO();

        orderDTO.setBuyerName( orderBuyerUsername( order ) );
        orderDTO.setSellerName( orderSellerUsername( order ) );
        orderDTO.setOrderDetails( orderDetailListToOrderDetailDTOList( order.getOrderDetails() ) );
        orderDTO.setId( order.getId() );
        orderDTO.setBuyerId( order.getBuyerId() );
        orderDTO.setSellerId( order.getSellerId() );
        orderDTO.setOrderDate( order.getOrderDate() );
        orderDTO.setStatus( order.getStatus() );

        return orderDTO;
    }

    @Override
    public Order toEntity(OrderDTO orderDTO) {
        if ( orderDTO == null ) {
            return null;
        }

        Order order = new Order();

        order.setId( orderDTO.getId() );
        order.setBuyerId( orderDTO.getBuyerId() );
        order.setSellerId( orderDTO.getSellerId() );
        order.setOrderDate( orderDTO.getOrderDate() );
        order.setStatus( orderDTO.getStatus() );

        return order;
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

    protected List<OrderDetailDTO> orderDetailListToOrderDetailDTOList(List<OrderDetail> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderDetailDTO> list1 = new ArrayList<OrderDetailDTO>( list.size() );
        for ( OrderDetail orderDetail : list ) {
            list1.add( orderDetailMapper.toDTO( orderDetail ) );
        }

        return list1;
    }
}
