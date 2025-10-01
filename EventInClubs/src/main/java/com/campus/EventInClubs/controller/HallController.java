package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.domain.model.Hall;
import com.campus.EventInClubs.service.HallService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/halls")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class HallController {
    
    private final HallService hallService;
    
    @GetMapping
    public ResponseEntity<List<Hall>> getAllHalls() {
        List<Hall> halls = hallService.getAllActiveHalls();
        return ResponseEntity.ok(halls);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Hall> getHallById(@PathVariable Long id) {
        Optional<Hall> hall = hallService.getHallById(id);
        return hall.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<Hall>> getAvailableHalls(
            @RequestParam Integer participants,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(required = false) Long excludeEventId) {
        
        log.info("Getting available halls for {} participants from {} to {}", 
                participants, startTime, endTime);
        
        try {
            List<Hall> availableHalls;
            
            if (excludeEventId != null) {
                availableHalls = hallService.getAvailableHallsExcludingEvent(
                    participants, startTime, endTime, excludeEventId);
            } else {
                availableHalls = hallService.getAvailableHalls(participants, startTime, endTime);
            }
            
            log.info("Received {} halls from service before filtering", availableHalls.size());
            
            // Log each hall before filtering
            for (Hall hall : availableHalls) {
                log.info("Hall from DB: {} - Capacity: {} (Required: {})", 
                        hall.getName(), hall.getSeatingCapacity(), participants);
            }
            
            // Additional filtering to ensure only halls with sufficient capacity are returned
            List<Hall> suitableHalls = availableHalls.stream()
                    .filter(hall -> {
                        boolean suitable = hall.getSeatingCapacity() >= participants;
                        log.info("Filtering {} (capacity {}): {}", hall.getName(), hall.getSeatingCapacity(), suitable ? "PASS" : "FAIL");
                        return suitable;
                    })
                    .collect(java.util.stream.Collectors.toList());
            
            log.info("Filtered to {} suitable halls with capacity >= {}", suitableHalls.size(), participants);
            
            // Log final result
            for (Hall hall : suitableHalls) {
                log.info("Final result: {} - Capacity: {}", hall.getName(), hall.getSeatingCapacity());
            }
            
            return ResponseEntity.ok(suitableHalls);
            
        } catch (Exception e) {
            log.error("Error getting available halls", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/best-fit")
    public ResponseEntity<Hall> getBestFitHall(
            @RequestParam Integer participants,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        log.info("Getting best fit hall for {} participants from {} to {}", 
                participants, startTime, endTime);
        
        try {
            Optional<Hall> bestFitHall = hallService.getBestFitHall(participants, startTime, endTime);
            
            return bestFitHall.map(ResponseEntity::ok)
                             .orElse(ResponseEntity.noContent().build());
            
        } catch (Exception e) {
            log.error("Error getting best fit hall", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Hall> createHall(@RequestBody Hall hall) {
        try {
            Hall createdHall = hallService.createHall(hall);
            return ResponseEntity.ok(createdHall);
        } catch (Exception e) {
            log.error("Error creating hall", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Hall> updateHall(@PathVariable Long id, @RequestBody Hall hall) {
        try {
            Hall updatedHall = hallService.updateHall(id, hall);
            return ResponseEntity.ok(updatedHall);
        } catch (RuntimeException e) {
            log.error("Error updating hall", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating hall", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHall(@PathVariable Long id) {
        try {
            hallService.deleteHall(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error deleting hall", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting hall", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
