package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.dto.CommentDto;
import com.campus.EventInClubs.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CommentController {
    
    private final CommentService commentService;
    
    @GetMapping("/idea/{ideaId}")
    public ResponseEntity<List<CommentDto>> getCommentsByIdea(@PathVariable Long ideaId) {
        try {
            List<CommentDto> comments = commentService.getCommentsByIdea(ideaId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            log.error("Error fetching comments for idea: {}", ideaId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CommentDto>> getCommentsByUser(@PathVariable Long userId) {
        try {
            List<CommentDto> comments = commentService.getCommentsByUser(userId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            log.error("Error fetching comments for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/reply/{parentCommentId}")
    public ResponseEntity<List<CommentDto>> getRepliesToComment(@PathVariable Long parentCommentId) {
        try {
            List<CommentDto> comments = commentService.getRepliesToComment(parentCommentId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            log.error("Error fetching replies for comment: {}", parentCommentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CommentDto> getCommentById(@PathVariable Long id) {
        try {
            return commentService.getCommentById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching comment with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody CommentDto commentDto, 
                                        @RequestParam Long ideaId, 
                                        @RequestParam Long userId,
                                        @RequestParam(required = false) Long parentCommentId) {
        try {
            if (commentDto.getContent() == null || commentDto.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Comment content is required"));
            }
            
            CommentDto createdComment = commentService.createComment(commentDto, ideaId, userId, parentCommentId);
            return ResponseEntity.ok(createdComment);
        } catch (RuntimeException e) {
            log.error("Error creating comment: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating comment", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id, 
                                        @RequestBody CommentDto commentDto, 
                                        @RequestParam Long userId) {
        try {
            CommentDto updatedComment = commentService.updateComment(id, commentDto, userId);
            return ResponseEntity.ok(updatedComment);
        } catch (RuntimeException e) {
            log.error("Error updating comment: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating comment with id: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id, @RequestParam Long userId) {
        try {
            commentService.deleteComment(id, userId);
            return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
        } catch (RuntimeException e) {
            log.error("Error deleting comment: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting comment with id: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
}
