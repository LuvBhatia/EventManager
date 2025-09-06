package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.dto.UserAchievementDto;
import com.campus.EventInClubs.service.AchievementService;
import com.campus.EventInClubs.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
public class AchievementController {

    private final AchievementService achievementService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<UserAchievementDto>> getUserAchievements(@RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            List<UserAchievementDto> achievements = achievementService.getUserAchievements(userId);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/points")
    public ResponseEntity<Map<String, Object>> getUserPoints(@RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            Long totalPoints = achievementService.getUserTotalPoints(userId);
            return ResponseEntity.ok(Map.of("totalPoints", totalPoints));
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/check")
    public ResponseEntity<Map<String, String>> checkAchievements(@RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }
            
            achievementService.checkAndAwardAchievements(userId);
            return ResponseEntity.ok(Map.of("message", "Achievements checked and updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
