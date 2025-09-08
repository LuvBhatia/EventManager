package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        try {
            Map<String, Object> analytics = analyticsService.getDashboardAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/system")
    public ResponseEntity<Map<String, Object>> getSystemAnalytics() {
        try {
            Map<String, Object> analytics = analyticsService.getSystemAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
