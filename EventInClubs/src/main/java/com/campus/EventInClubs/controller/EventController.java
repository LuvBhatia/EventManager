package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.dto.EventDto;
import com.campus.EventInClubs.service.EventService;
import com.campus.EventInClubs.security.JwtUtil;
import com.campus.EventInClubs.domain.model.Club;
import com.campus.EventInClubs.repository.ClubRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class EventController {
    
    private final EventService eventService;
    private final JwtUtil jwtUtil;
    private final ClubRepository clubRepository;
    
    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents() {
        List<EventDto> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }
    
    
    @GetMapping("/club-topics")
    public ResponseEntity<List<EventDto>> getEventsForClubTopics() {
        List<EventDto> events = eventService.getEventsForClubTopics();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/admin/published")
    public ResponseEntity<List<EventDto>> getPublishedEventsForAdmin() {
        List<EventDto> events = eventService.getPublishedEventsForAdmin();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<EventDto>> getActiveEventsForStudents() {
        List<EventDto> events = eventService.getActiveEventsForStudents();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<EventDto>> getUpcomingEvents() {
        List<EventDto> events = eventService.getUpcomingEvents();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/ongoing")
    public ResponseEntity<List<EventDto>> getOngoingEvents() {
        List<EventDto> events = eventService.getOngoingEvents();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<EventDto>> getEventsByClub(@PathVariable Long clubId) {
        List<EventDto> events = eventService.getEventsByClub(clubId);
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        EventDto event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }
    
    @PostMapping
    public ResponseEntity<EventDto> createEvent(
            @RequestBody EventDto eventDto,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            log.info("Received event creation request: {}", eventDto);
            
            Long userId = null;
            if (token != null && !token.isEmpty()) {
                String jwt = token.replace("Bearer ", "");
                userId = jwtUtil.extractUserId(jwt);
            } else {
                // For testing purposes, use the club admin user ID when no token is provided
                Club club = clubRepository.findById(eventDto.getClubId())
                        .orElseThrow(() -> new RuntimeException("Club not found with id: " + eventDto.getClubId()));
                userId = club.getAdminUser().getId();
            }
            
            // Validate required fields
            if (eventDto.getTitle() == null || eventDto.getTitle().trim().isEmpty()) {
                log.error("Event title is required");
                return ResponseEntity.badRequest().build();
            }
            
            if (eventDto.getClubId() == null) {
                log.error("Club ID is required");
                return ResponseEntity.badRequest().build();
            }
            
            EventDto createdEvent = eventService.createEvent(eventDto, userId);
            log.info("Event created successfully: {}", createdEvent.getTitle());
            
            return ResponseEntity.ok(createdEvent);
        } catch (Exception e) {
            log.error("Error creating event: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(
            @PathVariable Long id,
            @RequestBody EventDto eventDto,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            Long userId = null;
            if (token != null && !token.isEmpty()) {
                String jwt = token.replace("Bearer ", "");
                userId = jwtUtil.extractUserId(jwt);
            } else {
                userId = 1L; // Default user for testing
            }
            
            EventDto updatedEvent = eventService.updateEvent(id, eventDto);
            log.info("Event updated successfully: {}", updatedEvent.getTitle());
            
            return ResponseEntity.ok(updatedEvent);
        } catch (Exception e) {
            log.error("Error updating event: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        
        try {
            String jwt = token.replace("Bearer ", "");
            Long userId = jwtUtil.extractUserId(jwt);
            
            eventService.deleteEvent(id);
            log.info("Event deleted successfully with id: {}", id);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting event: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/publish")
    public ResponseEntity<EventDto> publishEvent(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        
        try {
            String jwt = token.replace("Bearer ", "");
            Long userId = jwtUtil.extractUserId(jwt);
            
            EventDto publishedEvent = eventService.publishEvent(id);
            log.info("Event published successfully: {}", publishedEvent.getTitle());
            
            return ResponseEntity.ok(publishedEvent);
        } catch (Exception e) {
            log.error("Error publishing event: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<EventDto>> searchEvents(@RequestParam String keyword) {
        List<EventDto> events = eventService.searchEvents(keyword);
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/stats/club/{clubId}")
    public ResponseEntity<Long> getEventCountByClub(@PathVariable Long clubId) {
        Long count = eventService.getEventCountByClub(clubId);
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/accepting-ideas")
    public ResponseEntity<List<EventDto>> getEventsAcceptingIdeas() {
        List<EventDto> events = eventService.getEventsAcceptingIdeas();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/{eventId}/ideas")
    public ResponseEntity<?> getIdeasForEvent(@PathVariable Long eventId) {
        try {
            log.info("Fetching ideas for event: {}", eventId);
            
            java.util.List<java.util.Map<String, Object>> ideas = eventService.getIdeasForEvent(eventId);
            return ResponseEntity.ok(ideas);
            
        } catch (RuntimeException e) {
            log.error("Error fetching ideas for event: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching ideas for event", e);
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Internal server error"));
        }
    }

    @PostMapping("/{eventId}/ideas")
    public ResponseEntity<?> submitIdeaForEvent(
            @PathVariable Long eventId,
            @RequestBody java.util.Map<String, Object> ideaData,
            @RequestParam Long userId) {
        try {
            log.info("Submitting idea for event: {} by user: {}, title: {}", eventId, userId, ideaData.get("title"));
            
            // Validate required fields
            String title = (String) ideaData.get("title");
            String description = (String) ideaData.get("description");
            
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("error", "Idea title is required"));
            }
            
            if (description == null || description.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("error", "Idea description is required"));
            }
            
            // Submit idea through event service
            java.util.Map<String, Object> result = eventService.submitIdeaForEvent(eventId, ideaData, userId);
            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            log.error("Error submitting idea for event: {} by user: {}: {}", eventId, userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error submitting idea for event: {} by user: {}", eventId, userId, e);
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Internal server error"));
        }
    }
    
    @GetMapping("/{eventId}/ideas/status")
    public ResponseEntity<?> getUserIdeaSubmissionStatus(
            @PathVariable Long eventId,
            @RequestParam Long userId) {
        try {
            log.info("Checking idea submission status for event: {} and user: {}", eventId, userId);
            
            java.util.Map<String, Object> status = eventService.getUserIdeaSubmissionStatus(eventId, userId);
            return ResponseEntity.ok(status);
            
        } catch (RuntimeException e) {
            log.error("Error checking idea submission status: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error checking idea submission status for event: {} and user: {}", eventId, userId, e);
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Internal server error"));
        }
    }
    
    @PutMapping("/{eventId}/status")
    public ResponseEntity<?> updateEventStatus(@PathVariable Long eventId, @RequestBody java.util.Map<String, String> statusUpdate) {
        try {
            String status = statusUpdate.get("status");
            EventDto updatedEvent = eventService.updateEventStatus(eventId, status);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            log.error("Error updating event status: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating event status for event: {}", eventId, e);
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Internal server error"));
        }
    }

    @PutMapping("/{eventId}/activate")
    public ResponseEntity<?> activateEvent(@PathVariable Long eventId) {
        try {
            EventDto updated = eventService.activateEvent(eventId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            log.error("Error activating event: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error activating event: {}", eventId, e);
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Internal server error"));
        }
    }
    
    @PostMapping("/approve-proposal")
    public ResponseEntity<?> approveEventProposal(
            @RequestParam("proposalId") Long proposalId,
            @RequestParam("eventName") String eventName,
            @RequestParam("eventType") String eventType,
            @RequestParam("startDateTime") String startDateTime,
            @RequestParam("endDateTime") String endDateTime,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "maxParticipants", required = false) Integer maxParticipants,
            @RequestParam(value = "registrationFee", required = false, defaultValue = "0") Double registrationFee,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "poster", required = false) org.springframework.web.multipart.MultipartFile poster,
            @RequestParam(value = "pptFileUrl", required = false) String pptFileUrl,
            @RequestParam(value = "hallId", required = false) Long hallId) {
        
        try {
            log.info("Approving event proposal with parameters:");
            log.info("proposalId: {}", proposalId);
            log.info("eventName: {}", eventName);
            log.info("eventType: {}", eventType);
            log.info("startDateTime: {}", startDateTime);
            log.info("endDateTime: {}", endDateTime);
            log.info("location: {}", location);
            log.info("maxParticipants: {}", maxParticipants);
            log.info("registrationFee: {}", registrationFee);
            log.info("description: {}", description);
            log.info("poster: {}", poster != null ? poster.getOriginalFilename() : "null");
            log.info("hallId: {}", hallId);
            
            EventDto approvedEvent = eventService.approveEventProposal(
                proposalId, eventName, eventType, startDateTime, endDateTime,
                location, maxParticipants, registrationFee, 
                description, poster, pptFileUrl, hallId
            );
            return ResponseEntity.ok(approvedEvent);
        } catch (RuntimeException e) {
            log.error("Error approving event proposal: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error approving event proposal: {}", proposalId, e);
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Internal server error"));
        }
    }
    
    @DeleteMapping("/approved-events")
    public ResponseEntity<?> deleteApprovedEvents() {
        try {
            eventService.deleteApprovedEvents();
            return ResponseEntity.ok(java.util.Map.of("message", "All approved events marked as inactive successfully"));
        } catch (Exception e) {
            log.error("Error marking approved events as inactive: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/by-title/{title}")
    public ResponseEntity<?> deleteEventByTitle(@PathVariable String title) {
        try {
            eventService.deleteEventByTitle(title);
            return ResponseEntity.ok(java.util.Map.of("message", "Event deleted successfully: " + title));
        } catch (Exception e) {
            log.error("Error deleting event by title: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Error deleting event: " + e.getMessage()));
        }
    }
    
    // New approval workflow endpoints
    
    @PostMapping("/submit-for-approval")
    public ResponseEntity<?> submitEventForApproval(
            @RequestParam("eventId") Long eventId,
            @RequestParam(value = "hallId", required = false) Long hallId) {
        
        try {
            log.info("Submitting event {} for approval with hall {}", eventId, hallId);
            
            EventDto submittedEvent = eventService.submitEventForApproval(eventId, hallId);
            return ResponseEntity.ok(submittedEvent);
            
        } catch (RuntimeException e) {
            log.error("Error submitting event for approval: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error submitting event for approval: {}", eventId, e);
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Internal server error"));
        }
    }
    
    @PostMapping("/approve/{eventId}")
    public ResponseEntity<?> approveEvent(
            @PathVariable Long eventId,
            @RequestParam("superAdminId") Long superAdminId) {
        
        try {
            log.info("Super Admin {} approving event {}", superAdminId, eventId);
            
            EventDto approvedEvent = eventService.approveEvent(eventId, superAdminId);
            return ResponseEntity.ok(approvedEvent);
            
        } catch (RuntimeException e) {
            log.error("Error approving event: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error approving event: {}", eventId, e);
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Internal server error"));
        }
    }
    
    @PostMapping("/reject/{eventId}")
    public ResponseEntity<?> rejectEvent(
            @PathVariable Long eventId,
            @RequestParam("superAdminId") Long superAdminId,
            @RequestParam("rejectionReason") String rejectionReason) {
        
        try {
            log.info("Super Admin {} rejecting event {} with reason: {}", 
                    superAdminId, eventId, rejectionReason);
            
            EventDto rejectedEvent = eventService.rejectEvent(eventId, superAdminId, rejectionReason);
            return ResponseEntity.ok(rejectedEvent);
            
        } catch (RuntimeException e) {
            log.error("Error rejecting event: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error rejecting event: {}", eventId, e);
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Internal server error"));
        }
    }
    
    @GetMapping("/pending-approval")
    public ResponseEntity<List<EventDto>> getPendingApprovalEvents() {
        try {
            List<EventDto> pendingEvents = eventService.getPendingApprovalEvents();
            return ResponseEntity.ok(pendingEvents);
        } catch (Exception e) {
            log.error("Error getting pending approval events", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/approved-for-students")
    public ResponseEntity<List<EventDto>> getApprovedEventsForStudents() {
        try {
            List<EventDto> approvedEvents = eventService.getApprovedEventsForStudents();
            return ResponseEntity.ok(approvedEvents);
        } catch (Exception e) {
            log.error("Error getting approved events for students", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/approved")
    public ResponseEntity<List<EventDto>> getApprovedEvents() {
        try {
            List<EventDto> approvedEvents = eventService.getApprovedEvents();
            return ResponseEntity.ok(approvedEvents);
        } catch (Exception e) {
            log.error("Error getting approved events", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/rejected")
    public ResponseEntity<List<EventDto>> getRejectedEvents() {
        try {
            List<EventDto> rejectedEvents = eventService.getRejectedEvents();
            return ResponseEntity.ok(rejectedEvents);
        } catch (Exception e) {
            log.error("Error getting rejected events", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/rejected/{clubId}")
    public ResponseEntity<List<EventDto>> getRejectedEventsForClubAdmin(@PathVariable Long clubId) {
        try {
            List<EventDto> rejectedEvents = eventService.getRejectedEventsForClubAdmin(clubId);
            return ResponseEntity.ok(rejectedEvents);
        } catch (Exception e) {
            log.error("Error getting rejected events for club {}", clubId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/resubmit-rejected")
    public ResponseEntity<?> resubmitRejectedEvent(
            @RequestParam("eventId") Long eventId,
            @RequestParam("eventName") String eventName,
            @RequestParam("eventType") String eventType,
            @RequestParam("startDateTime") String startDateTime,
            @RequestParam("endDateTime") String endDateTime,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "maxParticipants", required = false) Integer maxParticipants,
            @RequestParam(value = "registrationFee", required = false, defaultValue = "0") Double registrationFee,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "hallId", required = false) Long hallId) {
        
        try {
            log.info("Resubmitting rejected event {} with updates", eventId);
            
            EventDto resubmittedEvent = eventService.resubmitRejectedEvent(
                eventId, eventName, eventType, startDateTime, endDateTime,
                location, maxParticipants, registrationFee, description, hallId
            );
            
            return ResponseEntity.ok(resubmittedEvent);
            
        } catch (RuntimeException e) {
            log.error("Error resubmitting rejected event: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error resubmitting rejected event: {}", eventId, e);
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Internal server error"));
        }
    }
}
