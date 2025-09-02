package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.Comment;
import com.campus.EventInClubs.domain.model.Idea;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.dto.CommentDto;
import com.campus.EventInClubs.repository.CommentRepository;
import com.campus.EventInClubs.repository.IdeaRepository;
import com.campus.EventInClubs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final IdeaRepository ideaRepository;
    private final UserRepository userRepository;
    
    public List<CommentDto> getCommentsByIdea(Long ideaId) {
        List<Comment> comments = commentRepository.findByIdeaIdAndIsActiveTrueOrderByCreatedAtAsc(ideaId);
        return comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<CommentDto> getCommentsByUser(Long userId) {
        List<Comment> comments = commentRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
        return comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<CommentDto> getRepliesToComment(Long parentCommentId) {
        List<Comment> comments = commentRepository.findByParentCommentIdAndIsActiveTrueOrderByCreatedAtAsc(parentCommentId);
        return comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Optional<CommentDto> getCommentById(Long id) {
        return commentRepository.findById(id)
                .map(this::convertToDto);
    }
    
    public CommentDto createComment(CommentDto commentDto, Long ideaId, Long userId, Long parentCommentId) {
        // Verify idea exists and is active
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        if (!idea.getIsActive()) {
            throw new RuntimeException("Cannot comment on inactive ideas");
        }
        
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // If parent comment is specified, verify it exists
        Comment parentComment = null;
        if (parentCommentId != null) {
            parentComment = commentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            
            if (!parentComment.getIsActive()) {
                throw new RuntimeException("Cannot reply to inactive comments");
            }
        }
        
        Comment comment = Comment.builder()
                .content(commentDto.getContent())
                .idea(idea)
                .user(user)
                .parentComment(parentComment)
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        
        Comment savedComment = commentRepository.save(comment);
        log.info("Created new comment on idea: {} by user: {}", idea.getTitle(), user.getName());
        
        return convertToDto(savedComment);
    }
    
    public CommentDto updateComment(Long id, CommentDto commentDto, Long userId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is the original commenter or super admin
        if (!comment.getUser().getId().equals(userId) && !user.getRole().name().equals("SUPER_ADMIN")) {
            throw new RuntimeException("You can only update your own comments");
        }
        
        comment.setContent(commentDto.getContent());
        comment.setUpdatedAt(Instant.now());
        
        Comment savedComment = commentRepository.save(comment);
        log.info("Updated comment by user: {}", user.getName());
        
        return convertToDto(savedComment);
    }
    
    public void deleteComment(Long id, Long userId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is the original commenter or super admin
        if (!comment.getUser().getId().equals(userId) && !user.getRole().name().equals("SUPER_ADMIN")) {
            throw new RuntimeException("You can only delete your own comments");
        }
        
        comment.setIsActive(false);
        comment.setUpdatedAt(Instant.now());
        commentRepository.save(comment);
        log.info("Deactivated comment by user: {}", user.getName());
    }
    
    private CommentDto convertToDto(Comment comment) {
        return CommentDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .ideaId(comment.getIdea().getId())
                .ideaTitle(comment.getIdea().getTitle())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getName())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .isActive(comment.getIsActive())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
