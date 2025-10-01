package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.dto.ProblemDto;
import com.campus.EventInClubs.service.ProblemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ProblemController {
    
    private final ProblemService problemService;
    
    @GetMapping
    public ResponseEntity<List<ProblemDto>> getAllActiveProblems() {
        try {
            List<ProblemDto> problems = problemService.getAllActiveProblems();
            return ResponseEntity.ok(problems);
        } catch (Exception e) {
            log.error("Error fetching all problems", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/trending")
    public ResponseEntity<List<ProblemDto>> getTrendingProblems() {
        try {
            List<ProblemDto> problems = problemService.getTrendingProblems();
            return ResponseEntity.ok(problems);
        } catch (Exception e) {
            log.error("Error fetching trending problems", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<ProblemDto>> getProblemsByClub(@PathVariable Long clubId) {
        try {
            List<ProblemDto> problems = problemService.getProblemsByClub(clubId);
            return ResponseEntity.ok(problems);
        } catch (Exception e) {
            log.error("Error fetching problems for club: {}", clubId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProblemDto>> getProblemsByCategory(@PathVariable String category) {
        try {
            List<ProblemDto> problems = problemService.getProblemsByCategory(category);
            return ResponseEntity.ok(problems);
        } catch (Exception e) {
            log.error("Error fetching problems by category: {}", category, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ProblemDto>> searchProblems(@RequestParam String q) {
        try {
            if (q == null || q.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            List<ProblemDto> problems = problemService.searchProblems(q.trim());
            return ResponseEntity.ok(problems);
        } catch (Exception e) {
            log.error("Error searching problems with query: {}", q, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProblemDto> getProblemById(@PathVariable Long id) {
        try {
            return problemService.getProblemById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching problem with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createProblem(@RequestBody ProblemDto problemDto, 
                                         @RequestParam Long clubId, 
                                         @RequestParam Long userId) {
        try {
            if (problemDto.getTitle() == null || problemDto.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Problem title is required"));
            }
            
            ProblemDto createdProblem = problemService.createProblem(problemDto, clubId, userId);
            return ResponseEntity.ok(createdProblem);
        } catch (RuntimeException e) {
            log.error("Error creating problem: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating problem", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProblem(@PathVariable Long id, 
                                         @RequestBody ProblemDto problemDto, 
                                         @RequestParam Long userId) {
        try {
            ProblemDto updatedProblem = problemService.updateProblem(id, problemDto, userId);
            return ResponseEntity.ok(updatedProblem);
        } catch (RuntimeException e) {
            log.error("Error updating problem: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating problem with id: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProblem(@PathVariable Long id, @RequestParam Long userId) {
        try {
            problemService.deleteProblem(id, userId);
            return ResponseEntity.ok(Map.of("message", "Problem deleted successfully"));
        } catch (RuntimeException e) {
            log.error("Error deleting problem: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting problem with id: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
}
