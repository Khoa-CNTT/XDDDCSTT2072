package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.domain.entity.ForumPost;
import com.agricultural.agricultural.domain.entity.User;
import com.agricultural.agricultural.dto.ForumPostDTO;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-01T16:21:07+0700",
    comments = "version: 1.5.5.Final, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.12.1.jar, environment: Java 23.0.2 (Oracle Corporation)"
)
public class ForumPostMapperImpl implements ForumPostMapper {

    @Override
    public ForumPostDTO toDTO(ForumPost forumPost) {
        if ( forumPost == null ) {
            return null;
        }

        ForumPostDTO forumPostDTO = new ForumPostDTO();

        forumPostDTO.setUserId( forumPostUserId( forumPost ) );
        forumPostDTO.setId( forumPost.getId() );
        forumPostDTO.setTitle( forumPost.getTitle() );
        forumPostDTO.setContent( forumPost.getContent() );
        forumPostDTO.setCreatedAt( forumPost.getCreatedAt() );

        return forumPostDTO;
    }

    @Override
    public ForumPost toEntity(ForumPostDTO forumPostDTO) {
        if ( forumPostDTO == null ) {
            return null;
        }

        ForumPost forumPost = new ForumPost();

        forumPost.setId( forumPostDTO.getId() );
        forumPost.setTitle( forumPostDTO.getTitle() );
        forumPost.setContent( forumPostDTO.getContent() );
        forumPost.setCreatedAt( forumPostDTO.getCreatedAt() );

        return forumPost;
    }

    private int forumPostUserId(ForumPost forumPost) {
        if ( forumPost == null ) {
            return 0;
        }
        User user = forumPost.getUser();
        if ( user == null ) {
            return 0;
        }
        int id = user.getId();
        return id;
    }
}
