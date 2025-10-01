package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.service.VoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class VoteController {
    
    private final VoteService voteService;
    
    @PostMapping("/idea/{ideaId}")
    public ResponseEntity<?> voteOnIdea(@PathVariable Long ideaId, 
                                     @RequestParam Long userId, 
                                     @RequestParam String voteType) {
        try {
            Map<String, Object> result = voteService.voteOnIdea(ideaId, userId, voteType);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("Error voting on idea: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error voting on idea with id: {}", ideaId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @GetMapping("/idea/{ideaId}/stats")
    public ResponseEntity<?> getVoteStats(@PathVariable Long ideaId) {
        try {
            Map<String, Object> stats = voteService.getVoteStats(ideaId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            log.error("Error getting vote stats: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting vote stats for idea: {}", ideaId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @GetMapping("/idea/{ideaId}/user/{userId}")
    public ResponseEntity<?> getUserVote(@PathVariable Long ideaId, @PathVariable Long userId) {
        try {
            String voteType = voteService.getUserVote(ideaId, userId);
            return ResponseEntity.ok(Map.of(
                "ideaId", ideaId,
                "userId", userId,
                "voteType", voteType != null ? voteType : "NONE"
            ));
        } catch (Exception e) {
            log.error("Error getting user vote for idea: {} and user: {}", ideaId, userId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @DeleteMapping("/idea/{ideaId}/user/{userId}")
    public ResponseEntity<?> removeVote(@PathVariable Long ideaId, @PathVariable Long userId) {
        try {
            voteService.removeVote(ideaId, userId);
            return ResponseEntity.ok(Map.of("message", "Vote removed successfully"));
        } catch (Exception e) {
            log.error("Error removing vote for idea: {} and user: {}", ideaId, userId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
}
