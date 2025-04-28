package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.FeedbackDTO;
import com.agricultural.agricultural.dto.FeedbackImageDTO;
import com.agricultural.agricultural.entity.Feedback;
import com.agricultural.agricultural.entity.FeedbackImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface FeedbackMapper {
    
    @Mapping(target = "status", source = "status", qualifiedByName = "stringToEnum")
    FeedbackDTO toDTO(Feedback feedback);
    
    @Mapping(target = "status", source = "status", qualifiedByName = "enumToString")
    Feedback toEntity(FeedbackDTO feedbackDTO);
    
    FeedbackImageDTO toImageDTO(FeedbackImage feedbackImage);
    
    List<FeedbackImageDTO> toImageDTOList(List<FeedbackImage> images);
    
    @Named("stringToEnum")
    default com.agricultural.agricultural.entity.enumeration.FeedbackStatus stringToEnum(String status) {
        return status != null ? com.agricultural.agricultural.entity.enumeration.FeedbackStatus.fromString(status) : null;
    }
    
    @Named("enumToString")
    default String enumToString(com.agricultural.agricultural.entity.enumeration.FeedbackStatus status) {
        return status != null ? status.name() : null;
    }
} 