package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.Hall;
import com.campus.EventInClubs.repository.HallRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HallService {
    
    private final HallRepository hallRepository;
    
    public List<Hall> getAllActiveHalls() {
        return hallRepository.findByIsActiveTrueOrderBySeatingCapacityAsc();
    }
    
    public Optional<Hall> getHallById(Long id) {
        return hallRepository.findById(id);
    }
    
    public List<Hall> getAvailableHalls(Integer requiredCapacity, LocalDateTime startTime, LocalDateTime endTime) {
        log.info("Finding available halls for capacity: {}, start: {}, end: {}", 
                requiredCapacity, startTime, endTime);
        
        if (requiredCapacity == null || startTime == null || endTime == null) {
            log.warn("Invalid parameters for hall availability check");
            return List.of();
        }
        
        if (startTime.isAfter(endTime)) {
            log.warn("Start time is after end time");
            return List.of();
        }
        
        List<Hall> availableHalls = hallRepository.findAvailableHalls(requiredCapacity, startTime, endTime);
        log.info("Found {} available halls for capacity {}", availableHalls.size(), requiredCapacity);
        
        // Debug: Log each hall's capacity
        for (Hall hall : availableHalls) {
            log.info("Hall: {} - Capacity: {} (Required: {})", 
                    hall.getName(), hall.getSeatingCapacity(), requiredCapacity);
        }
        
        return availableHalls;
    }
    
    public List<Hall> getAvailableHallsExcludingEvent(Integer requiredCapacity, LocalDateTime startTime, 
                                                     LocalDateTime endTime, Long excludeEventId) {
        log.info("Finding available halls excluding event: {}", excludeEventId);
        
        if (requiredCapacity == null || startTime == null || endTime == null) {
            return List.of();
        }
        
        if (startTime.isAfter(endTime)) {
            return List.of();
        }
        
        return hallRepository.findAvailableHallsExcludingEvent(requiredCapacity, startTime, endTime, excludeEventId);
    }
    
    public Optional<Hall> getBestFitHall(Integer requiredCapacity, LocalDateTime startTime, LocalDateTime endTime) {
        List<Hall> availableHalls = getAvailableHalls(requiredCapacity, startTime, endTime);
        
        if (availableHalls.isEmpty()) {
            return Optional.empty();
        }
        
        // Return the hall with the smallest capacity that meets the requirement
        // (halls are already sorted by capacity in ascending order)
        return Optional.of(availableHalls.get(0));
    }
    
    public Hall createHall(Hall hall) {
        log.info("Creating new hall: {}", hall.getName());
        return hallRepository.save(hall);
    }
    
    public Hall updateHall(Long id, Hall hallDetails) {
        log.info("Updating hall with id: {}", id);
        
        return hallRepository.findById(id)
                .map(existingHall -> {
                    existingHall.setName(hallDetails.getName());
                    existingHall.setSeatingCapacity(hallDetails.getSeatingCapacity());
                    existingHall.setDescription(hallDetails.getDescription());
                    existingHall.setLocation(hallDetails.getLocation());
                    existingHall.setFacilities(hallDetails.getFacilities());
                    existingHall.setIsActive(hallDetails.getIsActive());
                    return hallRepository.save(existingHall);
                })
                .orElseThrow(() -> new RuntimeException("Hall not found with id: " + id));
    }
    
    public void deleteHall(Long id) {
        log.info("Deleting hall with id: {}", id);
        
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hall not found with id: " + id));
        
        // Soft delete - mark as inactive instead of actual deletion
        hall.setIsActive(false);
        hallRepository.save(hall);
    }
}
