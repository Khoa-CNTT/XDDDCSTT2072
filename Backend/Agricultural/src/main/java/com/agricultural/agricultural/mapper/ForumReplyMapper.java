package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.ForumReplyDTO;
import com.agricultural.agricultural.entity.ForumReply;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ForumReplyMapper {
    
    @Mapping(source = "post.id", target = "postId")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "userName")
    @Mapping(source = "user.imageUrl", target = "userImageUrl")
    @Mapping(source = "parent.id", target = "parentId")
    @Mapping(source = "isInappropriate", target = "isInappropriate")
    @Mapping(source = "replies", target = "replies", qualifiedByName = "mapReplies")
    ForumReplyDTO toDTO(ForumReply entity);
    
    @Named("mapReplies")
    default List<ForumReplyDTO> mapReplies(List<ForumReply> replies) {
        if (replies == null || replies.isEmpty()) {
            return List.of();
        }
        
        return replies.stream()
                .filter(reply -> !Boolean.TRUE.equals(reply.getIsDeleted()))
                .map(reply -> ForumReplyDTO.builder()
                        .id(reply.getId())
                        .content(reply.getContent())
                        .createdAt(reply.getCreatedAt())
                        .updatedAt(reply.getUpdatedAt())
                        .postId(reply.getPost().getId())
                        .userId(reply.getUser().getId())
                        .userName(reply.getUser().getUsername())
                        .userImageUrl(reply.getUser().getImageUrl())
                        .parentId(reply.getParent() != null ? reply.getParent().getId() : null)
                        .likeCount(reply.getLikeCount())
                        .isInappropriate(reply.getIsInappropriate())
                        .build())
                .toList();
    }
} 