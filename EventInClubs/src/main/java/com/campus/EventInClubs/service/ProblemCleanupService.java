package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.Problem;
import com.campus.EventInClubs.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProblemCleanupService {

    private final ProblemRepository problemRepository;
    private final NotificationService notificationService;

    /**
     * Runs every 15 minutes to check for problems that should be removed
     * (1 hour after their deadline has passed)
     */
    @Scheduled(fixedRate = 900000) // 15 minutes = 900,000 milliseconds
    public void cleanupExpiredProblems() {
        log.info("Starting cleanup of expired problems...");
        
        try {
            // Find problems that are 1 hour past their deadline
            Instant oneHourAgo = Instant.now().minus(1, ChronoUnit.HOURS);
            List<Problem> expiredProblems = problemRepository.findExpiredProblems(oneHourAgo);
            
            if (expiredProblems.isEmpty()) {
                log.debug("No expired problems found for cleanup");
                return;
            }
            
            log.info("Found {} expired problems to clean up", expiredProblems.size());
            
            for (Problem problem : expiredProblems) {
                try {
                    // Set problem as inactive instead of deleting to preserve data integrity
                    problem.setIsActive(false);
                    problem.setStatus(Problem.ProblemStatus.CLOSED);
                    problemRepository.save(problem);
                    
                    // Notify the problem owner
                    notificationService.createNotification(
                        problem.getPostedBy().getId(),
                        "Topic Expired",
                        "Your topic '" + problem.getTitle() + "' has been automatically closed after the deadline expired.",
                        com.campus.EventInClubs.domain.model.Notification.NotificationType.SYSTEM,
                        problem.getId(),
                        "PROBLEM"
                    );
                    
                    log.info("Successfully closed expired problem: {} (ID: {})", 
                            problem.getTitle(), problem.getId());
                            
                } catch (Exception e) {
                    log.error("Error closing expired problem ID {}: {}", problem.getId(), e.getMessage(), e);
                }
            }
            
            log.info("Completed cleanup of {} expired problems", expiredProblems.size());
            
        } catch (Exception e) {
            log.error("Error during problem cleanup process: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Manually trigger cleanup (for testing or admin purposes)
     */
    public void manualCleanup() {
        log.info("Manual cleanup triggered");
        cleanupExpiredProblems();
    }
    
    /**
     * Check if a problem is in view-only mode (deadline passed but not yet removed)
     */
    public boolean isProblemInViewOnlyMode(Problem problem) {
        if (problem.getDeadline() == null) {
            return false;
        }
        
        Instant now = Instant.now();
        Instant oneHourAfterDeadline = problem.getDeadline().plus(1, ChronoUnit.HOURS);
        
        // View-only mode: deadline passed but not yet 1 hour after deadline
        return now.isAfter(problem.getDeadline()) && now.isBefore(oneHourAfterDeadline);
    }
    
    /**
     * Check if a problem should be completely hidden (more than 1 hour after deadline)
     */
    public boolean isProblemExpired(Problem problem) {
        if (problem.getDeadline() == null) {
            return false;
        }
        
        Instant oneHourAfterDeadline = problem.getDeadline().plus(1, ChronoUnit.HOURS);
        return Instant.now().isAfter(oneHourAfterDeadline);
    }
}
