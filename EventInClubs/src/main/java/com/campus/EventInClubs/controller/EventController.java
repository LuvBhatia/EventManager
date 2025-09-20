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
}
