package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.dto.IdeaDto;
import com.campus.EventInClubs.service.IdeaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class IdeaController {
    
    private final IdeaService ideaService;
    
    @GetMapping
    public ResponseEntity<List<IdeaDto>> getAllActiveIdeas() {
        try {
            List<IdeaDto> ideas = ideaService.getAllActiveIdeas();
            return ResponseEntity.ok(ideas);
        } catch (Exception e) {
            log.error("Error fetching all ideas", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/top")
    public ResponseEntity<List<IdeaDto>> getTopIdeas() {
        try {
            List<IdeaDto> ideas = ideaService.getTopIdeas();
            return ResponseEntity.ok(ideas);
        } catch (Exception e) {
            log.error("Error fetching top ideas", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/featured")
    public ResponseEntity<List<IdeaDto>> getFeaturedIdeas() {
        try {
            List<IdeaDto> ideas = ideaService.getFeaturedIdeas();
            return ResponseEntity.ok(ideas);
        } catch (Exception e) {
            log.error("Error fetching featured ideas", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/problem/{problemId}")
    public ResponseEntity<List<IdeaDto>> getIdeasByProblem(@PathVariable Long problemId) {
        try {
            List<IdeaDto> ideas = ideaService.getIdeasByProblem(problemId);
            return ResponseEntity.ok(ideas);
        } catch (Exception e) {
            log.error("Error fetching ideas for problem: {}", problemId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<IdeaDto>> getIdeasByUser(@PathVariable Long userId) {
        try {
            List<IdeaDto> ideas = ideaService.getIdeasByUser(userId);
            return ResponseEntity.ok(ideas);
        } catch (Exception e) {
            log.error("Error fetching ideas for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<IdeaDto>> getIdeasByStatus(@PathVariable String status) {
        try {
            List<IdeaDto> ideas = ideaService.getIdeasByStatus(status);
            return ResponseEntity.ok(ideas);
        } catch (Exception e) {
            log.error("Error fetching ideas by status: {}", status, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<IdeaDto>> searchIdeas(@RequestParam String q) {
        try {
            if (q == null || q.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            List<IdeaDto> ideas = ideaService.searchIdeas(q.trim());
            return ResponseEntity.ok(ideas);
        } catch (Exception e) {
            log.error("Error searching ideas with query: {}", q, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<IdeaDto> getIdeaById(@PathVariable Long id) {
        try {
            return ideaService.getIdeaById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching idea with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createIdea(@RequestBody IdeaDto ideaDto, 
                                     @RequestParam Long problemId, 
                                     @RequestParam Long userId) {
        try {
            if (ideaDto.getTitle() == null || ideaDto.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Idea title is required"));
            }
            
            IdeaDto createdIdea = ideaService.createIdea(ideaDto, problemId, userId);
            return ResponseEntity.ok(createdIdea);
        } catch (RuntimeException e) {
            log.error("Error creating idea: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating idea", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateIdea(@PathVariable Long id, 
                                     @RequestBody IdeaDto ideaDto, 
                                     @RequestParam Long userId) {
        try {
            IdeaDto updatedIdea = ideaService.updateIdea(id, ideaDto, userId);
            return ResponseEntity.ok(updatedIdea);
        } catch (RuntimeException e) {
            log.error("Error updating idea: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating idea with id: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateIdeaStatus(@PathVariable Long id, 
                                           @RequestParam String status, 
                                           @RequestParam Long userId) {
        try {
            IdeaDto updatedIdea = ideaService.updateIdeaStatus(id, status, userId);
            return ResponseEntity.ok(updatedIdea);
        } catch (RuntimeException e) {
            log.error("Error updating idea status: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating idea status with id: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIdea(@PathVariable Long id, @RequestParam Long userId) {
        try {
            ideaService.deleteIdea(id, userId);
            return ResponseEntity.ok(Map.of("message", "Idea deleted successfully"));
        } catch (RuntimeException e) {
            log.error("Error deleting idea: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting idea with id: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
}
