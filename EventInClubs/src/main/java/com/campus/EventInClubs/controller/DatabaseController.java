package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.domain.model.Club;
import com.campus.EventInClubs.repository.ClubRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DatabaseController {
    
    private final ClubRepository clubRepository;
    
    @GetMapping("/clubs/all")
    public ResponseEntity<List<Club>> getAllClubsRaw() {
        try {
            List<Club> clubs = clubRepository.findAll();
            log.info("Found {} clubs in database", clubs.size());
            for (Club club : clubs) {
                log.info("Club: {} - Active: {} - ApprovalStatus: {}", 
                    club.getName(), club.getIsActive(), club.getApprovalStatus());
            }
            return ResponseEntity.ok(clubs);
        } catch (Exception e) {
            log.error("Error fetching all clubs", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/clubs/search/{name}")
    public ResponseEntity<List<Club>> searchClubsByName(@PathVariable String name) {
        try {
            List<Club> clubs = clubRepository.findAll().stream()
                .filter(club -> club.getName().toLowerCase().contains(name.toLowerCase()))
                .toList();
            log.info("Found {} clubs matching '{}'", clubs.size(), name);
            return ResponseEntity.ok(clubs);
        } catch (Exception e) {
            log.error("Error searching clubs by name: {}", name, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/clubs/{id}")
    public ResponseEntity<String> deleteClubById(@PathVariable Long id) {
        try {
            if (clubRepository.existsById(id)) {
                clubRepository.deleteById(id);
                log.info("Deleted club with id: {}", id);
                return ResponseEntity.ok("Club deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error deleting club with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/clubs/fix-approval-status")
    public ResponseEntity<String> fixApprovalStatus() {
        try {
            List<Club> clubs = clubRepository.findAll();
            int updated = 0;
            
            for (Club club : clubs) {
                if (club.getApprovalStatus() == null) {
                    if (club.getIsActive()) {
                        club.setApprovalStatus(com.campus.EventInClubs.domain.model.ApprovalStatus.APPROVED);
                    } else {
                        club.setApprovalStatus(com.campus.EventInClubs.domain.model.ApprovalStatus.REJECTED);
                    }
                    clubRepository.save(club);
                    updated++;
                }
            }
            
            log.info("Updated approval status for {} clubs", updated);
            return ResponseEntity.ok("Updated approval status for " + updated + " clubs");
        } catch (Exception e) {
            log.error("Error fixing approval status", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
