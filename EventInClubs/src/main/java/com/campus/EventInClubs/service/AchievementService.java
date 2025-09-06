package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.domain.model.UserAchievement;
import com.campus.EventInClubs.dto.UserAchievementDto;
import com.campus.EventInClubs.repository.UserAchievementRepository;
import com.campus.EventInClubs.repository.UserRepository;
import com.campus.EventInClubs.repository.IdeaRepository;
import com.campus.EventInClubs.repository.VoteRepository;
import com.campus.EventInClubs.repository.CommentRepository;
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
public class AchievementService {
    
    private final UserAchievementRepository achievementRepository;
    private final UserRepository userRepository;
    private final IdeaRepository ideaRepository;
    private final VoteRepository voteRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    
    public List<UserAchievementDto> getUserAchievements(Long userId) {
        List<UserAchievement> achievements = achievementRepository.findByUserIdOrderByEarnedAtDesc(userId);
        return achievements.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Long getUserTotalPoints(Long userId) {
        Long points = achievementRepository.getTotalPointsByUserId(userId);
        return points != null ? points : 0L;
    }
    
    public void checkAndAwardAchievements(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check for idea-related achievements
        checkIdeaAchievements(user);
        
        // Check for voting achievements
        checkVotingAchievements(user);
        
        // Check for commenting achievements
        checkCommentingAchievements(user);
        
        // Check for implementation achievements
        checkImplementationAchievements(user);
    }
    
    private void checkIdeaAchievements(User user) {
        long ideaCount = ideaRepository.countBySubmittedByIdAndIsActiveTrue(user.getId());
        
        // First idea achievement
        if (ideaCount >= 1 && !hasAchievement(user.getId(), UserAchievement.AchievementType.FIRST_IDEA)) {
            awardAchievement(user, UserAchievement.AchievementType.FIRST_IDEA, 1, 10, 
                "Congratulations on submitting your first idea!");
        }
        
        // Idea master achievements (multiple levels)
        checkLeveledAchievement(user, UserAchievement.AchievementType.IDEA_MASTER, ideaCount,
                new int[]{5, 10, 25, 50}, new int[]{25, 50, 100, 200});
    }
    
    private void checkVotingAchievements(User user) {
        long voteCount = voteRepository.countByUserId(user.getId());
        
        // Helpful voter achievements
        checkLeveledAchievement(user, UserAchievement.AchievementType.HELPFUL_VOTER, voteCount,
                new int[]{10, 50, 100, 250}, new int[]{15, 50, 100, 250});
    }
    
    private void checkCommentingAchievements(User user) {
        long commentCount = commentRepository.countByUserIdAndIsActiveTrue(user.getId());
        
        // Engaged commenter achievements
        checkLeveledAchievement(user, UserAchievement.AchievementType.ENGAGED_COMMENTER, commentCount,
                new int[]{5, 20, 50, 100}, new int[]{20, 75, 150, 300});
    }
    
    private void checkImplementationAchievements(User user) {
        long implementedCount = ideaRepository.countBySubmittedByIdAndStatusAndIsActiveTrue(
                user.getId(), "IMPLEMENTING") + 
                ideaRepository.countBySubmittedByIdAndStatusAndIsActiveTrue(
                user.getId(), "COMPLETED");
        
        // Problem solver achievements
        checkLeveledAchievement(user, UserAchievement.AchievementType.PROBLEM_SOLVER, implementedCount,
                new int[]{1, 3, 5, 10}, new int[]{50, 150, 300, 500});
    }
    
    private void checkLeveledAchievement(User user, UserAchievement.AchievementType type, 
                                       long currentCount, int[] thresholds, int[] points) {
        for (int i = 0; i < thresholds.length; i++) {
            int level = i + 1;
            if (currentCount >= thresholds[i] && 
                !hasAchievementAtLevel(user.getId(), type, level)) {
                
                String description = getAchievementDescription(type, level, thresholds[i]);
                awardAchievement(user, type, level, points[i], description);
            }
        }
    }
    
    private boolean hasAchievement(Long userId, UserAchievement.AchievementType type) {
        return achievementRepository.findByUserIdAndAchievementType(userId, type).isPresent();
    }
    
    private boolean hasAchievementAtLevel(Long userId, UserAchievement.AchievementType type, int level) {
        return achievementRepository.findByUserIdAndTypeAndLevel(userId, type, level).isPresent();
    }
    
    private void awardAchievement(User user, UserAchievement.AchievementType type, 
                                int level, int points, String description) {
        UserAchievement achievement = UserAchievement.builder()
                .user(user)
                .achievementType(type)
                .level(level)
                .pointsEarned(points)
                .description(description)
                .earnedAt(Instant.now())
                .build();
        
        achievementRepository.save(achievement);
        
        // Send notification
        notificationService.createNotification(
            user.getId(),
            "Achievement Unlocked!",
            "You've earned the '" + getAchievementTitle(type, level) + "' achievement! +" + points + " points",
            com.campus.EventInClubs.domain.model.Notification.NotificationType.ACHIEVEMENT,
            achievement.getId(),
            "ACHIEVEMENT"
        );
        
        log.info("Awarded achievement {} level {} to user {}", type, level, user.getName());
    }
    
    private String getAchievementTitle(UserAchievement.AchievementType type, int level) {
        switch (type) {
            case FIRST_IDEA: return "First Steps";
            case IDEA_MASTER: return "Idea Master " + getRomanNumeral(level);
            case HELPFUL_VOTER: return "Helpful Voter " + getRomanNumeral(level);
            case ENGAGED_COMMENTER: return "Engaged Commenter " + getRomanNumeral(level);
            case PROBLEM_SOLVER: return "Problem Solver " + getRomanNumeral(level);
            default: return type.name() + " " + getRomanNumeral(level);
        }
    }
    
    private String getAchievementDescription(UserAchievement.AchievementType type, int level, int threshold) {
        switch (type) {
            case FIRST_IDEA: return "Submitted your first idea to the marketplace";
            case IDEA_MASTER: return "Submitted " + threshold + " ideas to help solve problems";
            case HELPFUL_VOTER: return "Cast " + threshold + " votes to help evaluate ideas";
            case ENGAGED_COMMENTER: return "Posted " + threshold + " comments to engage with the community";
            case PROBLEM_SOLVER: return "Had " + threshold + " ideas selected for implementation";
            default: return "Achieved level " + level + " in " + type.name();
        }
    }
    
    private String getRomanNumeral(int level) {
        switch (level) {
            case 1: return "I";
            case 2: return "II";
            case 3: return "III";
            case 4: return "IV";
            case 5: return "V";
            default: return String.valueOf(level);
        }
    }
    
    private UserAchievementDto convertToDto(UserAchievement achievement) {
        return UserAchievementDto.builder()
                .id(achievement.getId())
                .userId(achievement.getUser().getId())
                .achievementType(achievement.getAchievementType().name())
                .level(achievement.getLevel())
                .pointsEarned(achievement.getPointsEarned())
                .description(achievement.getDescription())
                .title(getAchievementTitle(achievement.getAchievementType(), achievement.getLevel()))
                .earnedAt(achievement.getEarnedAt())
                .build();
    }
}
