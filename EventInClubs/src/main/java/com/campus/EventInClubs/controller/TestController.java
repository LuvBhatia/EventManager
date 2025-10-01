package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.domain.model.Role;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final UserService userService;

    @PostMapping("/create-club")
    public ResponseEntity<?> testCreateClub(@RequestParam String userEmail) {
        try {
            // Find user by email
            User user = userService.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user has permission to create clubs
            if (user.getRole() != Role.CLUB_ADMIN && user.getRole() != Role.SUPER_ADMIN) {
                return ResponseEntity.status(403)
                        .body(Map.of(
                                "error", "Access Denied",
                                "message", "Only CLUB_ADMIN and SUPER_ADMIN users can create clubs",
                                "userRole", user.getRole().name(),
                                "userEmail", user.getEmail()
                        ));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "User has permission to create clubs",
                    "userRole", user.getRole().name(),
                "userEmail", user.getEmail()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }
}
