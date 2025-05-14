package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.ForumReactionDTO;
import com.agricultural.agricultural.entity.ForumReaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ForumReactionMapper {
    
    ForumReactionMapper INSTANCE = Mappers.getMapper(ForumReactionMapper.class);
    
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "userName")
    @Mapping(source = "user.imageUrl", target = "userAvatar")
    @Mapping(source = "post.id", target = "postId")
    @Mapping(source = "reply.id", target = "replyId")
    @Mapping(source = "reactionType.emoji", target = "displayEmoji")
    ForumReactionDTO toDTO(ForumReaction entity);
    
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "post", ignore = true)
    @Mapping(target = "reply", ignore = true)
    ForumReaction toEntity(ForumReactionDTO dto);
} 