package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.Event;
import com.campus.EventInClubs.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EventCleanupService {

    private final EventRepository eventRepository;
    private final NotificationService notificationService;

    /**
     * Runs every 15 minutes to check for events that should be hidden
     * (1 hour after their idea submission deadline has passed)
     */
    @Scheduled(fixedRate = 900000) // 15 minutes = 900,000 milliseconds
    public void cleanupExpiredEvents() {
        log.info("Starting cleanup of expired events...");
        
        try {
            // Find events that are 1 hour past their idea submission deadline
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            List<Event> expiredEvents = eventRepository.findExpiredEvents(oneHourAgo);
            
            if (expiredEvents.isEmpty()) {
                log.debug("No expired events found for cleanup");
                return;
            }
            
            log.info("Found {} expired events to clean up", expiredEvents.size());
            
            for (Event event : expiredEvents) {
                try {
                    // Do not auto-close APPROVED/PUBLISHED events based solely on idea deadline.
                    // These should remain visible according to their start/end visibility rules.
                    if (event.getStatus() == Event.EventStatus.PUBLISHED ||
                        event.getStatus() == Event.EventStatus.APPROVED) {
                        log.debug("Skipping cleanup for approved/published event: {} (ID: {})", event.getTitle(), event.getId());
                        continue;
                    }

                    // Set event as inactive instead of deleting to preserve data integrity
                    event.setIsActive(false);
                    event.setStatus(Event.EventStatus.COMPLETED);
                    eventRepository.save(event);
                    
                    // Notify the event organizer
                    notificationService.createNotification(
                        event.getOrganizer().getId(),
                        "Event Expired",
                        "Your event '" + event.getTitle() + "' has been automatically hidden after the idea submission deadline expired.",
                        com.campus.EventInClubs.domain.model.Notification.NotificationType.SYSTEM,
                        event.getId(),
                        "EVENT"
                    );
                    
                    log.info("Successfully closed expired event: {} (ID: {})", 
                            event.getTitle(), event.getId());
                            
                } catch (Exception e) {
                    log.error("Error closing expired event ID {}: {}", event.getId(), e.getMessage(), e);
                }
            }
            
            log.info("Completed cleanup of {} expired events", expiredEvents.size());
            
        } catch (Exception e) {
            log.error("Error during event cleanup process: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Manually trigger cleanup (for testing or admin purposes)
     */
    public void manualCleanup() {
        log.info("Manual cleanup triggered");
        cleanupExpiredEvents();
    }
    
    /**
     * Check if an event is in view-only mode (idea deadline passed but not yet removed)
     */
    public boolean isEventInViewOnlyMode(Event event) {
        if (event.getIdeaSubmissionDeadline() == null) {
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourAfterDeadline = event.getIdeaSubmissionDeadline().plusHours(1);
        
        // View-only mode: deadline passed but not yet 1 hour after deadline
        return now.isAfter(event.getIdeaSubmissionDeadline()) && now.isBefore(oneHourAfterDeadline);
    }
    
    /**
     * Check if an event should be completely hidden (more than 1 hour after idea deadline)
     */
    public boolean isEventExpired(Event event) {
        if (event.getIdeaSubmissionDeadline() == null) {
            return false;
        }
        
        LocalDateTime oneHourAfterDeadline = event.getIdeaSubmissionDeadline().plusHours(1);
        return LocalDateTime.now().isAfter(oneHourAfterDeadline);
    }
}
