package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.Idea;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.domain.model.Vote;
import com.campus.EventInClubs.repository.IdeaRepository;
import com.campus.EventInClubs.repository.UserRepository;
import com.campus.EventInClubs.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VoteService {
    
    private final VoteRepository voteRepository;
    private final IdeaRepository ideaRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AchievementService achievementService;
    
    public Map<String, Object> voteOnIdea(Long ideaId, Long userId, String voteType) {
        // Validate vote type
        if (!voteType.equals("UPVOTE") && !voteType.equals("DOWNVOTE")) {
            throw new RuntimeException("Vote type must be UPVOTE or DOWNVOTE");
        }
        
        // Verify idea exists and is active
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        if (!idea.getIsActive()) {
            throw new RuntimeException("Cannot vote on inactive ideas");
        }
        
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has already voted on this idea
        Optional<Vote> existingVote = voteRepository.findByIdeaIdAndUserId(ideaId, userId);
        
        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            
            // If same vote type, remove the vote
            if (vote.getVoteType().equals(voteType)) {
                voteRepository.delete(vote);
                log.info("Removed {} vote from idea: {} by user: {}", voteType, idea.getTitle(), user.getName());
                
                return Map.of(
                    "message", "Vote removed",
                    "action", "removed",
                    "voteType", voteType,
                    "ideaId", ideaId,
                    "userId", userId
                );
            } else {
                // If different vote type, update the vote
                vote.setVoteType(Vote.VoteType.valueOf(voteType));
                vote.setUpdatedAt(Instant.now());
                voteRepository.save(vote);
                log.info("Changed vote to {} for idea: {} by user: {}", voteType, idea.getTitle(), user.getName());
                
                return Map.of(
                    "message", "Vote updated",
                    "action", "updated",
                    "voteType", voteType,
                    "ideaId", ideaId,
                    "userId", userId
                );
            }
        } else {
            // Create new vote
            Vote vote = Vote.builder()
                    .idea(idea)
                    .user(user)
                    .voteType(Vote.VoteType.valueOf(voteType))
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            
            voteRepository.save(vote);
            log.info("Added {} vote to idea: {} by user: {}", voteType, idea.getTitle(), user.getName());
            
            // Send notification to idea owner (if not voting on own idea)
            if (!idea.getSubmittedBy().getId().equals(userId)) {
                notificationService.notifyIdeaVoted(idea.getSubmittedBy().getId(), user.getName(), 
                    voteType.equals("UPVOTE") ? "UP" : "DOWN", ideaId);
            }
            
            // Check for voting achievements
            achievementService.checkAndAwardAchievements(userId);
            
            return Map.of(
                "message", "Vote added",
                "action", "added",
                "voteType", voteType,
                "ideaId", ideaId,
                "userId", userId
            );
        }
    }
    
    public Map<String, Object> getVoteStats(Long ideaId) {
        // Verify idea exists
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
        // Calculate vote counts
        long upvotes = voteRepository.countByIdeaIdAndVoteType(idea.getId(), "UP");
        long downvotes = voteRepository.countByIdeaIdAndVoteType(idea.getId(), "DOWN");
        long totalVotes = upvotes + downvotes;
        
        return Map.of(
            "ideaId", ideaId,
            "upvotes", upvotes,
            "downvotes", downvotes,
            "totalVotes", totalVotes,
            "netScore", upvotes - downvotes
        );
    }
    
    public String getUserVote(Long ideaId, Long userId) {
        Optional<Vote> vote = voteRepository.findByIdeaIdAndUserId(ideaId, userId);
        return vote.map(v -> v.getVoteType().name()).orElse(null);
    }
    
    public void removeVote(Long ideaId, Long userId) {
        Optional<Vote> vote = voteRepository.findByIdeaIdAndUserId(ideaId, userId);
        if (vote.isPresent()) {
            voteRepository.delete(vote.get());
            log.info("Removed vote from idea: {} by user: {}", ideaId, userId);
        }
    }
}
