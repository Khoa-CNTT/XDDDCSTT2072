package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.dto.ForumPostDTO;
import com.agricultural.agricultural.dto.ForumReactionDTO;
import com.agricultural.agricultural.dto.HashtagDTO;
import com.agricultural.agricultural.dto.UserMentionDTO;
import com.agricultural.agricultural.entity.ForumPost;
import com.agricultural.agricultural.entity.ForumReaction;
import com.agricultural.agricultural.entity.Hashtag;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.UserMention;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-20T02:18:07+0700",
    comments = "version: 1.5.5.Final, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.12.1.jar, environment: Java 23.0.2 (Oracle Corporation)"
)
public class ForumPostMapperImpl implements ForumPostMapper {

    private final ForumPostImageMapper forumPostImageMapper = ForumPostImageMapper.INSTANCE;

    @Override
    public ForumPostDTO toDTO(ForumPost forumPost) {
        if ( forumPost == null ) {
            return null;
        }

        ForumPostDTO.ForumPostDTOBuilder<?, ?> forumPostDTO = ForumPostDTO.builder();

        forumPostDTO.userId( forumPostUserId( forumPost ) );
        forumPostDTO.userName( forumPostUserUsername( forumPost ) );
        forumPostDTO.userAvatar( forumPostUserImageUrl( forumPost ) );
        forumPostDTO.images( forumPostImageMapper.toDTOList( forumPost.getImages() ) );
        forumPostDTO.id( forumPost.getId() );
        forumPostDTO.title( forumPost.getTitle() );
        forumPostDTO.content( forumPost.getContent() );
        forumPostDTO.createdAt( forumPost.getCreatedAt() );
        forumPostDTO.updatedAt( forumPost.getUpdatedAt() );
        forumPostDTO.viewCount( forumPost.getViewCount() );
        forumPostDTO.isDeleted( forumPost.getIsDeleted() );
        forumPostDTO.privacyLevel( forumPost.getPrivacyLevel() );
        forumPostDTO.attachmentType( forumPost.getAttachmentType() );
        forumPostDTO.attachmentUrl( forumPost.getAttachmentUrl() );
        forumPostDTO.location( forumPost.getLocation() );
        forumPostDTO.feeling( forumPost.getFeeling() );
        forumPostDTO.backgroundColor( forumPost.getBackgroundColor() );
        forumPostDTO.isPinned( forumPost.getIsPinned() );
        forumPostDTO.isEdited( forumPost.getIsEdited() );
        forumPostDTO.editedAt( forumPost.getEditedAt() );
        forumPostDTO.isShared( forumPost.getIsShared() );
        forumPostDTO.originalPost( toDTO( forumPost.getOriginalPost() ) );
        forumPostDTO.hashtags( hashtagSetToHashtagDTOList( forumPost.getHashtags() ) );
        forumPostDTO.reactions( forumReactionListToForumReactionDTOList( forumPost.getReactions() ) );
        forumPostDTO.mentions( userMentionListToUserMentionDTOList( forumPost.getMentions() ) );

        return forumPostDTO.build();
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
        forumPost.setUpdatedAt( forumPostDTO.getUpdatedAt() );
        forumPost.setViewCount( forumPostDTO.getViewCount() );
        forumPost.setIsDeleted( forumPostDTO.getIsDeleted() );
        forumPost.setPrivacyLevel( forumPostDTO.getPrivacyLevel() );
        forumPost.setAttachmentType( forumPostDTO.getAttachmentType() );
        forumPost.setAttachmentUrl( forumPostDTO.getAttachmentUrl() );
        forumPost.setLocation( forumPostDTO.getLocation() );
        forumPost.setFeeling( forumPostDTO.getFeeling() );
        forumPost.setBackgroundColor( forumPostDTO.getBackgroundColor() );
        forumPost.setIsPinned( forumPostDTO.getIsPinned() );
        forumPost.setIsEdited( forumPostDTO.getIsEdited() );
        forumPost.setEditedAt( forumPostDTO.getEditedAt() );
        forumPost.setIsShared( forumPostDTO.getIsShared() );
        forumPost.setOriginalPost( toEntity( forumPostDTO.getOriginalPost() ) );
        forumPost.setHashtags( hashtagDTOListToHashtagSet( forumPostDTO.getHashtags() ) );
        forumPost.setReactions( forumReactionDTOListToForumReactionList( forumPostDTO.getReactions() ) );
        forumPost.setMentions( userMentionDTOListToUserMentionList( forumPostDTO.getMentions() ) );

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

    private String forumPostUserUsername(ForumPost forumPost) {
        if ( forumPost == null ) {
            return null;
        }
        User user = forumPost.getUser();
        if ( user == null ) {
            return null;
        }
        String username = user.getUsername();
        if ( username == null ) {
            return null;
        }
        return username;
    }

    private String forumPostUserImageUrl(ForumPost forumPost) {
        if ( forumPost == null ) {
            return null;
        }
        User user = forumPost.getUser();
        if ( user == null ) {
            return null;
        }
        String imageUrl = user.getImageUrl();
        if ( imageUrl == null ) {
            return null;
        }
        return imageUrl;
    }

    protected HashtagDTO hashtagToHashtagDTO(Hashtag hashtag) {
        if ( hashtag == null ) {
            return null;
        }

        HashtagDTO.HashtagDTOBuilder hashtagDTO = HashtagDTO.builder();

        hashtagDTO.id( hashtag.getId() );
        hashtagDTO.name( hashtag.getName() );
        hashtagDTO.postCount( hashtag.getPostCount() );
        hashtagDTO.createdAt( hashtag.getCreatedAt() );

        return hashtagDTO.build();
    }

    protected List<HashtagDTO> hashtagSetToHashtagDTOList(Set<Hashtag> set) {
        if ( set == null ) {
            return null;
        }

        List<HashtagDTO> list = new ArrayList<HashtagDTO>( set.size() );
        for ( Hashtag hashtag : set ) {
            list.add( hashtagToHashtagDTO( hashtag ) );
        }

        return list;
    }

    protected ForumReactionDTO forumReactionToForumReactionDTO(ForumReaction forumReaction) {
        if ( forumReaction == null ) {
            return null;
        }

        ForumReactionDTO.ForumReactionDTOBuilder forumReactionDTO = ForumReactionDTO.builder();

        forumReactionDTO.id( forumReaction.getId() );
        forumReactionDTO.reactionType( forumReaction.getReactionType() );
        forumReactionDTO.createdAt( forumReaction.getCreatedAt() );

        return forumReactionDTO.build();
    }

    protected List<ForumReactionDTO> forumReactionListToForumReactionDTOList(List<ForumReaction> list) {
        if ( list == null ) {
            return null;
        }

        List<ForumReactionDTO> list1 = new ArrayList<ForumReactionDTO>( list.size() );
        for ( ForumReaction forumReaction : list ) {
            list1.add( forumReactionToForumReactionDTO( forumReaction ) );
        }

        return list1;
    }

    protected UserMentionDTO userMentionToUserMentionDTO(UserMention userMention) {
        if ( userMention == null ) {
            return null;
        }

        UserMentionDTO.UserMentionDTOBuilder userMentionDTO = UserMentionDTO.builder();

        userMentionDTO.id( userMention.getId() );
        userMentionDTO.createdAt( userMention.getCreatedAt() );

        return userMentionDTO.build();
    }

    protected List<UserMentionDTO> userMentionListToUserMentionDTOList(List<UserMention> list) {
        if ( list == null ) {
            return null;
        }

        List<UserMentionDTO> list1 = new ArrayList<UserMentionDTO>( list.size() );
        for ( UserMention userMention : list ) {
            list1.add( userMentionToUserMentionDTO( userMention ) );
        }

        return list1;
    }

    protected Hashtag hashtagDTOToHashtag(HashtagDTO hashtagDTO) {
        if ( hashtagDTO == null ) {
            return null;
        }

        Hashtag.HashtagBuilder hashtag = Hashtag.builder();

        hashtag.id( hashtagDTO.getId() );
        hashtag.name( hashtagDTO.getName() );
        hashtag.postCount( hashtagDTO.getPostCount() );
        hashtag.createdAt( hashtagDTO.getCreatedAt() );

        return hashtag.build();
    }

    protected Set<Hashtag> hashtagDTOListToHashtagSet(List<HashtagDTO> list) {
        if ( list == null ) {
            return null;
        }

        Set<Hashtag> set = new LinkedHashSet<Hashtag>( Math.max( (int) ( list.size() / .75f ) + 1, 16 ) );
        for ( HashtagDTO hashtagDTO : list ) {
            set.add( hashtagDTOToHashtag( hashtagDTO ) );
        }

        return set;
    }

    protected ForumReaction forumReactionDTOToForumReaction(ForumReactionDTO forumReactionDTO) {
        if ( forumReactionDTO == null ) {
            return null;
        }

        ForumReaction.ForumReactionBuilder forumReaction = ForumReaction.builder();

        forumReaction.id( forumReactionDTO.getId() );
        forumReaction.reactionType( forumReactionDTO.getReactionType() );
        forumReaction.createdAt( forumReactionDTO.getCreatedAt() );

        return forumReaction.build();
    }

    protected List<ForumReaction> forumReactionDTOListToForumReactionList(List<ForumReactionDTO> list) {
        if ( list == null ) {
            return null;
        }

        List<ForumReaction> list1 = new ArrayList<ForumReaction>( list.size() );
        for ( ForumReactionDTO forumReactionDTO : list ) {
            list1.add( forumReactionDTOToForumReaction( forumReactionDTO ) );
        }

        return list1;
    }

    protected UserMention userMentionDTOToUserMention(UserMentionDTO userMentionDTO) {
        if ( userMentionDTO == null ) {
            return null;
        }

        UserMention.UserMentionBuilder userMention = UserMention.builder();

        userMention.id( userMentionDTO.getId() );
        userMention.createdAt( userMentionDTO.getCreatedAt() );

        return userMention.build();
    }

    protected List<UserMention> userMentionDTOListToUserMentionList(List<UserMentionDTO> list) {
        if ( list == null ) {
            return null;
        }

        List<UserMention> list1 = new ArrayList<UserMention>( list.size() );
        for ( UserMentionDTO userMentionDTO : list ) {
            list1.add( userMentionDTOToUserMention( userMentionDTO ) );
        }

        return list1;
    }
}
