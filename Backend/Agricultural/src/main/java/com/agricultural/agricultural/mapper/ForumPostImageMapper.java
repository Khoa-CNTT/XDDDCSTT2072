package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.ForumPostImageDTO;
import com.agricultural.agricultural.entity.ForumPostImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface ForumPostImageMapper {

    ForumPostImageMapper INSTANCE = Mappers.getMapper(ForumPostImageMapper.class);

    // Map từ entity sang DTO
    @Mapping(source = "post.id", target = "postId")
    ForumPostImageDTO toDTO(ForumPostImage forumPostImage);

    // Map từ DTO sang entity
    @Mapping(target = "post", ignore = true)
    ForumPostImage toEntity(ForumPostImageDTO forumPostImageDTO);

    // Map danh sách entity thành danh sách DTO
    List<ForumPostImageDTO> toDTOList(List<ForumPostImage> forumPostImages);

    // Cập nhật entity từ DTO
    @Mapping(target = "post", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDTO(ForumPostImageDTO dto, @MappingTarget ForumPostImage entity);
} 