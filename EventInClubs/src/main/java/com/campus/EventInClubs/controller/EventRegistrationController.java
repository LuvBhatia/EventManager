package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.domain.model.EventRegistration;
import com.campus.EventInClubs.dto.EventRegistrationDto;
import com.campus.EventInClubs.service.EventRegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/event-registrations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class EventRegistrationController {
    
    private final EventRegistrationService registrationService;
    
    @PostMapping("/register")
    public ResponseEntity<?> registerForEvent(
            @RequestParam Long eventId,
            @RequestParam Long userId,
            @RequestParam(required = false) String notes) {
        try {
            EventRegistrationDto registration = registrationService.registerForEvent(eventId, userId, notes);
            return ResponseEntity.ok(registration);
        } catch (RuntimeException e) {
            log.error("Error registering for event: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error registering for event: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<EventRegistrationDto>> getEventRegistrations(@PathVariable Long eventId) {
        try {
            List<EventRegistrationDto> registrations = registrationService.getEventRegistrations(eventId);
            return ResponseEntity.ok(registrations);
        } catch (Exception e) {
            log.error("Error fetching event registrations: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EventRegistrationDto>> getUserRegistrations(@PathVariable Long userId) {
        try {
            List<EventRegistrationDto> registrations = registrationService.getUserRegistrations(userId);
            return ResponseEntity.ok(registrations);
        } catch (Exception e) {
            log.error("Error fetching user registrations: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/event/{eventId}/count")
    public ResponseEntity<Map<String, Long>> getRegistrationCount(@PathVariable Long eventId) {
        try {
            Long count = registrationService.getRegistrationCount(eventId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            log.error("Error fetching registration count: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/{registrationId}/status")
    public ResponseEntity<?> updateRegistrationStatus(
            @PathVariable Long registrationId,
            @RequestParam EventRegistration.RegistrationStatus status) {
        try {
            EventRegistrationDto updated = registrationService.updateRegistrationStatus(registrationId, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            log.error("Error updating registration status: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating registration status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @DeleteMapping("/cancel")
    public ResponseEntity<?> cancelRegistration(
            @RequestParam Long eventId,
            @RequestParam Long userId) {
        try {
            registrationService.cancelRegistration(eventId, userId);
            return ResponseEntity.ok(Map.of("message", "Registration cancelled successfully"));
        } catch (RuntimeException e) {
            log.error("Error cancelling registration: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error cancelling registration: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
}
