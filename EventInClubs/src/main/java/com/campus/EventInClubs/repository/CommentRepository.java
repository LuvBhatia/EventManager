package com.campus.EventInClubs.repository;

import com.campus.EventInClubs.domain.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // Basic queries
    List<Comment> findByIdeaId(Long ideaId);
    List<Comment> findByIdeaIdAndIsActiveTrueOrderByCreatedAtAsc(Long ideaId);
    List<Comment> findByUserId(Long userId);
    List<Comment> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(Long userId);
    List<Comment> findByParentCommentId(Long parentCommentId);
    List<Comment> findByParentCommentIdAndIsActiveTrueOrderByCreatedAtAsc(Long parentCommentId);
    
    List<Comment> findByIdeaIdAndParentCommentIdIsNull(Long ideaId);
    
    @Query("SELECT c FROM Comment c WHERE c.idea.id = :ideaId ORDER BY c.createdAt ASC")
    Page<Comment> findByIdeaIdWithPagination(@Param("ideaId") Long ideaId, Pageable pageable);
    
    @Query("SELECT c FROM Comment c WHERE c.idea.id = :ideaId AND c.parentComment.id IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findTopLevelCommentsByIdeaId(@Param("ideaId") Long ideaId);
    
    @Query("SELECT c FROM Comment c WHERE c.parentComment.id = :parentCommentId ORDER BY c.createdAt ASC")
    List<Comment> findRepliesByParentCommentId(@Param("parentCommentId") Long parentCommentId);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.idea.id = :ideaId")
    Long countByIdeaId(@Param("ideaId") Long ideaId);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT c FROM Comment c WHERE c.idea.id = :ideaId ORDER BY c.likeCount DESC, c.createdAt DESC")
    List<Comment> findTopCommentsByIdeaId(@Param("ideaId") Long ideaId);
    
    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    Page<Comment> findByUserIdWithPagination(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT c FROM Comment c WHERE c.idea.id = :ideaId AND c.content LIKE %:searchTerm% ORDER BY c.createdAt DESC")
    List<Comment> searchCommentsByIdeaId(@Param("ideaId") Long ideaId, @Param("searchTerm") String searchTerm);
}
