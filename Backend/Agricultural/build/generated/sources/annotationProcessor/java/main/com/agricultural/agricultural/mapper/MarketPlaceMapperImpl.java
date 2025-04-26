package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.dto.ProductImageDTO;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.ProductCategory;
import com.agricultural.agricultural.entity.ProductImage;
import com.agricultural.agricultural.entity.User;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-27T03:03:00+0700",
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
        marketPlaceDTO.categoryId( marketPlaceCategoryId( marketPlace ) );
        marketPlaceDTO.id( marketPlace.getId() );
        marketPlaceDTO.productName( marketPlace.getProductName() );
        marketPlaceDTO.description( marketPlace.getDescription() );
        marketPlaceDTO.shortDescription( marketPlace.getShortDescription() );
        if ( marketPlace.getQuantity() != null ) {
            marketPlaceDTO.quantity( marketPlace.getQuantity() );
        }
        marketPlaceDTO.price( marketPlace.getPrice() );
        marketPlaceDTO.salePrice( marketPlace.getSalePrice() );
        marketPlaceDTO.saleStartDate( marketPlace.getSaleStartDate() );
        marketPlaceDTO.saleEndDate( marketPlace.getSaleEndDate() );
        marketPlaceDTO.imageUrl( marketPlace.getImageUrl() );
        marketPlaceDTO.sku( marketPlace.getSku() );
        marketPlaceDTO.weight( marketPlace.getWeight() );
        marketPlaceDTO.dimensions( marketPlace.getDimensions() );
        marketPlaceDTO.images( productImageListToProductImageDTOList( marketPlace.getImages() ) );

        marketPlaceDTO.onSale( marketPlace.isOnSale() );
        marketPlaceDTO.currentPrice( marketPlace.getCurrentPrice() );

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
        marketPlace.shortDescription( marketPlaceDTO.getShortDescription() );
        marketPlace.quantity( marketPlaceDTO.getQuantity() );
        marketPlace.price( marketPlaceDTO.getPrice() );
        marketPlace.salePrice( marketPlaceDTO.getSalePrice() );
        marketPlace.saleStartDate( marketPlaceDTO.getSaleStartDate() );
        marketPlace.saleEndDate( marketPlaceDTO.getSaleEndDate() );
        marketPlace.imageUrl( marketPlaceDTO.getImageUrl() );
        marketPlace.sku( marketPlaceDTO.getSku() );
        marketPlace.weight( marketPlaceDTO.getWeight() );
        marketPlace.dimensions( marketPlaceDTO.getDimensions() );
        if ( marketPlaceDTO.getAverageRating() != null ) {
            marketPlace.averageRating( BigDecimal.valueOf( marketPlaceDTO.getAverageRating() ) );
        }

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
        if ( marketPlaceDTO.getShortDescription() != null ) {
            marketPlace.setShortDescription( marketPlaceDTO.getShortDescription() );
        }
        marketPlace.setQuantity( marketPlaceDTO.getQuantity() );
        if ( marketPlaceDTO.getPrice() != null ) {
            marketPlace.setPrice( marketPlaceDTO.getPrice() );
        }
        if ( marketPlaceDTO.getSalePrice() != null ) {
            marketPlace.setSalePrice( marketPlaceDTO.getSalePrice() );
        }
        if ( marketPlaceDTO.getSaleStartDate() != null ) {
            marketPlace.setSaleStartDate( marketPlaceDTO.getSaleStartDate() );
        }
        if ( marketPlaceDTO.getSaleEndDate() != null ) {
            marketPlace.setSaleEndDate( marketPlaceDTO.getSaleEndDate() );
        }
        if ( marketPlaceDTO.getImageUrl() != null ) {
            marketPlace.setImageUrl( marketPlaceDTO.getImageUrl() );
        }
        if ( marketPlaceDTO.getSku() != null ) {
            marketPlace.setSku( marketPlaceDTO.getSku() );
        }
        if ( marketPlaceDTO.getWeight() != null ) {
            marketPlace.setWeight( marketPlaceDTO.getWeight() );
        }
        if ( marketPlaceDTO.getDimensions() != null ) {
            marketPlace.setDimensions( marketPlaceDTO.getDimensions() );
        }
        if ( marketPlaceDTO.getAverageRating() != null ) {
            marketPlace.setAverageRating( BigDecimal.valueOf( marketPlaceDTO.getAverageRating() ) );
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

    private Integer marketPlaceCategoryId(MarketPlace marketPlace) {
        if ( marketPlace == null ) {
            return null;
        }
        ProductCategory category = marketPlace.getCategory();
        if ( category == null ) {
            return null;
        }
        Integer id = category.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    protected ProductImageDTO productImageToProductImageDTO(ProductImage productImage) {
        if ( productImage == null ) {
            return null;
        }

        ProductImageDTO.ProductImageDTOBuilder productImageDTO = ProductImageDTO.builder();

        productImageDTO.id( productImage.getId() );
        productImageDTO.imageUrl( productImage.getImageUrl() );
        if ( productImage.getIsPrimary() != null ) {
            productImageDTO.isPrimary( productImage.getIsPrimary() );
        }
        productImageDTO.displayOrder( productImage.getDisplayOrder() );
        productImageDTO.altText( productImage.getAltText() );
        productImageDTO.title( productImage.getTitle() );
        productImageDTO.createdAt( productImage.getCreatedAt() );

        return productImageDTO.build();
    }

    protected List<ProductImageDTO> productImageListToProductImageDTOList(List<ProductImage> list) {
        if ( list == null ) {
            return null;
        }

        List<ProductImageDTO> list1 = new ArrayList<ProductImageDTO>( list.size() );
        for ( ProductImage productImage : list ) {
            list1.add( productImageToProductImageDTO( productImage ) );
        }

        return list1;
    }
}
