package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.domain.entity.ForumPost;
import com.agricultural.agricultural.domain.entity.ForumReply;
import com.agricultural.agricultural.domain.entity.User;
import com.agricultural.agricultural.dto.ForumReplyDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-01T16:21:07+0700",
    comments = "version: 1.5.5.Final, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.12.1.jar, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class ForumReplyMapperImpl implements ForumReplyMapper {

    @Override
    public ForumReplyDTO toDto(ForumReply reply) {
        if ( reply == null ) {
            return null;
        }

        ForumReplyDTO forumReplyDTO = new ForumReplyDTO();

        forumReplyDTO.setPostId( replyForumPostId( reply ) );
        forumReplyDTO.setUserId( replyUserId( reply ) );
        forumReplyDTO.setId( reply.getId() );
        forumReplyDTO.setContent( reply.getContent() );
        forumReplyDTO.setCreatedAt( reply.getCreatedAt() );

        return forumReplyDTO;
    }

    private Integer replyForumPostId(ForumReply forumReply) {
        if ( forumReply == null ) {
            return null;
        }
        ForumPost forumPost = forumReply.getForumPost();
        if ( forumPost == null ) {
            return null;
        }
        int id = forumPost.getId();
        return id;
    }

    private Integer replyUserId(ForumReply forumReply) {
        if ( forumReply == null ) {
            return null;
        }
        User user = forumReply.getUser();
        if ( user == null ) {
            return null;
        }
        int id = user.getId();
        return id;
    }
}
