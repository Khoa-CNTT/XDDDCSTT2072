package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.domain.entity.MarketPlace;
import com.agricultural.agricultural.domain.entity.User;
import com.agricultural.agricultural.dto.MarketPlaceDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-01T16:21:07+0700",
    comments = "version: 1.5.5.Final, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.12.1.jar, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class MarketPlaceMapperImpl implements MarketPlaceMapper {

    @Override
    public MarketPlaceDTO toDTO(MarketPlace marketPlace) {
        if ( marketPlace == null ) {
            return null;
        }

        MarketPlaceDTO.MarketPlaceDTOBuilder marketPlaceDTO = MarketPlaceDTO.builder();

        marketPlaceDTO.userId( marketPlaceUserId( marketPlace ) );
        marketPlaceDTO.sellerName( marketPlaceUserUsername( marketPlace ) );
        marketPlaceDTO.id( marketPlace.getId() );
        marketPlaceDTO.productName( marketPlace.getProductName() );
        marketPlaceDTO.description( marketPlace.getDescription() );
        if ( marketPlace.getQuantity() != null ) {
            marketPlaceDTO.quantity( marketPlace.getQuantity() );
        }
        marketPlaceDTO.price( marketPlace.getPrice() );

        return marketPlaceDTO.build();
    }

    @Override
    public MarketPlace toEntity(MarketPlaceDTO marketPlaceDTO) {
        if ( marketPlaceDTO == null ) {
            return null;
        }

        MarketPlace.MarketPlaceBuilder marketPlace = MarketPlace.builder();

        marketPlace.id( marketPlaceDTO.getId() );
        marketPlace.productName( marketPlaceDTO.getProductName() );
        marketPlace.description( marketPlaceDTO.getDescription() );
        marketPlace.quantity( marketPlaceDTO.getQuantity() );
        marketPlace.price( marketPlaceDTO.getPrice() );

        return marketPlace.build();
    }

    @Override
    public void updateEntityFromDTO(MarketPlaceDTO marketPlaceDTO, MarketPlace marketPlace) {
        if ( marketPlaceDTO == null ) {
            return;
        }

        if ( marketPlaceDTO.getProductName() != null ) {
            marketPlace.setProductName( marketPlaceDTO.getProductName() );
        }
        if ( marketPlaceDTO.getDescription() != null ) {
            marketPlace.setDescription( marketPlaceDTO.getDescription() );
        }
        marketPlace.setQuantity( marketPlaceDTO.getQuantity() );
        if ( marketPlaceDTO.getPrice() != null ) {
            marketPlace.setPrice( marketPlaceDTO.getPrice() );
        }
    }

    private Integer marketPlaceUserId(MarketPlace marketPlace) {
        if ( marketPlace == null ) {
            return null;
        }
        User user = marketPlace.getUser();
        if ( user == null ) {
            return null;
        }
        int id = user.getId();
        return id;
    }

    private String marketPlaceUserUsername(MarketPlace marketPlace) {
        if ( marketPlace == null ) {
            return null;
        }
        User user = marketPlace.getUser();
        if ( user == null ) {
            return null;
        }
        String username = user.getUsername();
        if ( username == null ) {
            return null;
        }
        return username;
    }
}
