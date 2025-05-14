package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.UserMentionDTO;
import com.agricultural.agricultural.entity.UserMention;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UserMentionMapper {
    
    UserMentionMapper INSTANCE = Mappers.getMapper(UserMentionMapper.class);
    
    @Mapping(source = "mentionedUser.id", target = "mentionedUserId")
    @Mapping(source = "mentionedUser.username", target = "mentionedUserName")
    @Mapping(source = "mentionedUser.imageUrl", target = "mentionedUserAvatar")
    @Mapping(source = "post.id", target = "postId")
    @Mapping(source = "reply.id", target = "replyId")
    UserMentionDTO toDTO(UserMention entity);
    
    @Mapping(target = "mentionedUser", ignore = true)
    @Mapping(target = "post", ignore = true)
    @Mapping(target = "reply", ignore = true)
    UserMention toEntity(UserMentionDTO dto);
} 