package com.agricultural.agricultural.repository;

import com.agricultural.agricultural.entity.ForumReaction;
import com.agricultural.agricultural.entity.enumeration.ReactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IForumReactionRepository extends JpaRepository<ForumReaction, Integer> {
    

    Optional<ForumReaction> findByPostIdAndUserIdAndReactionType(Integer postId, Integer userId, ReactionType reactionType);
    

    Optional<ForumReaction> findByReplyIdAndUserIdAndReactionType(Integer replyId, Integer userId, ReactionType reactionType);
    

    List<ForumReaction> findAllByPostId(Integer postId);
    

    List<ForumReaction> findAllByReplyId(Integer replyId);
    

    List<ForumReaction> findAllByPostIdAndReactionType(Integer postId, ReactionType reactionType);
    

    List<ForumReaction> findAllByReplyIdAndReactionType(Integer replyId, ReactionType reactionType);
    

    @Query("SELECT r.reactionType, COUNT(r) FROM ForumReaction r WHERE r.post.id = :postId GROUP BY r.reactionType")
    List<Object[]> countReactionsByPostIdGroupByType(@Param("postId") Integer postId);
    

    @Query("SELECT r.reactionType, COUNT(r) FROM ForumReaction r WHERE r.reply.id = :replyId GROUP BY r.reactionType")
    List<Object[]> countReactionsByReplyIdGroupByType(@Param("replyId") Integer replyId);
    

    List<ForumReaction> findAllByPostIdAndUserId(Integer postId, Integer userId);
    

    List<ForumReaction> findAllByReplyIdAndUserId(Integer replyId, Integer userId);
    

    @Query("SELECT r FROM ForumReaction r JOIN FETCH r.user WHERE r.post.id = :postId AND r.reactionType = :reactionType")
    Page<ForumReaction> findAllByPostIdAndReactionTypeWithUser(
            @Param("postId") Integer postId, 
            @Param("reactionType") ReactionType reactionType, 
            Pageable pageable);
} 