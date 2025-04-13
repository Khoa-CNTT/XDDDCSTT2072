package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.entity.MarketPlace;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MarketPlaceMapper {

    // Ánh xạ từ entity sang DTO
    @Mapping(source = "user.id", target = "userId") // Lấy user.id và ánh xạ thành userId trong DTO
    @Mapping(source = "user.username", target = "sellerName") // Lấy user.userName và ánh xạ thành sellerName trong DTO
    @Mapping(target = "averageRating", ignore = true) // Không ánh xạ mặc định mà sẽ tính trong service
    @Mapping(target = "totalFeedbacks", ignore = true) // Không ánh xạ mặc định mà sẽ tính trong service
    @Mapping(source = "category.id", target = "categoryId") // Lấy category.id và ánh xạ thành categoryId
    @Mapping(expression = "java(marketPlace.isOnSale())", target = "onSale") // Lấy kết quả từ phương thức isOnSale()
    @Mapping(expression = "java(marketPlace.getCurrentPrice())", target = "currentPrice") // Lấy kết quả từ phương thức getCurrentPrice()
    MarketPlaceDTO toDTO(MarketPlace marketPlace);

    // Ánh xạ từ DTO sang entity
    @Mapping(target = "user", ignore = true) // Không ánh xạ user từ DTO, sẽ thiết lập user trong service
    @Mapping(target = "category", ignore = true) // Không ánh xạ category từ DTO, sẽ thiết lập trong service
    @Mapping(target = "variants", ignore = true) // Không ánh xạ variants từ DTO
    @Mapping(target = "images", ignore = true) // Không ánh xạ images từ DTO
    MarketPlace toEntity(MarketPlaceDTO marketPlaceDTO);

    // Phương thức này dùng để cập nhật entity từ DTO
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true) // Không cập nhật id
    @Mapping(target = "user", ignore = true) // Không cập nhật user từ DTO, sẽ thiết lập user trong service
    @Mapping(target = "category", ignore = true) // Không cập nhật category từ DTO
    @Mapping(target = "variants", ignore = true) // Không cập nhật variants từ DTO
    @Mapping(target = "images", ignore = true) // Không cập nhật images từ DTO
    void updateEntityFromDTO(MarketPlaceDTO marketPlaceDTO, @MappingTarget MarketPlace marketPlace);
}
