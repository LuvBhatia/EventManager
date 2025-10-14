package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.domain.model.Role;
import com.campus.EventInClubs.dto.LoginRequest;
import com.campus.EventInClubs.dto.GoogleLoginRequest;
import com.campus.EventInClubs.dto.RegisterRequest;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.service.UserService;
import com.campus.EventInClubs.service.SuperAdminRequestService;
import com.campus.EventInClubs.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final SuperAdminRequestService superAdminRequestService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate = new RestTemplate();

    // ---------------- REGISTER ----------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            Role role;
            try {
                role = Role.valueOf(req.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "role must be one of STUDENT, CLUB_ADMIN, SUPER_ADMIN"));
            }

            // SUPER_ADMIN functionality disabled - reject super admin registration attempts
            if (role == Role.SUPER_ADMIN) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Super admin registration is currently disabled"));
                // try {
                //     superAdminRequestService.createSuperAdminRequest(req.getName(), req.getEmail(), req.getPassword());
                //     return ResponseEntity.ok(Map.of(
                //             "message", "Super admin request submitted successfully. Please wait for approval from an existing super admin.",
                //             "type", "super_admin_request"
                //     ));
                // } catch (IllegalArgumentException e) {
                //     return ResponseEntity.badRequest()
                //             .body(Map.of("error", e.getMessage()));
                // }
            } else {
                // Regular registration for students and club admins
                userService.register(req.getName(), req.getEmail(), req.getPassword(), role);
                return ResponseEntity.ok(Map.of("message", "user registered successfully"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    // ---------------- LOGIN ----------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        User user = userService.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        // SUPER_ADMIN functionality disabled - prevent super admin login
        if (user.getRole() == Role.SUPER_ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Super admin access is currently disabled"));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "email", user.getEmail(),
                "role", user.getRole().name()
        ));
    }

    // ---------------- GOOGLE LOGIN ----------------
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest req) {
        try {
            if (req.getIdToken() == null || req.getIdToken().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "idToken is required"));
            }

            // Verify id_token using Google's tokeninfo endpoint
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + req.getIdToken();
            Map<?,?> googleResponse = restTemplate.getForObject(url, Map.class);

            if (googleResponse == null || googleResponse.get("email") == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid Google token"));
            }

            String email = googleResponse.get("email").toString();
            Object nameObj = googleResponse.get("name");
            String name = nameObj != null ? nameObj.toString() : "Google User";

            // Ensure user exists; if not, create a STUDENT by default
            User user = userService.findByEmail(email).orElseGet(() -> {
                // UserService encodes the raw password; pass raw placeholder
                userService.register(name, email, "google-oauth", Role.STUDENT);
                return userService.findByEmail(email).orElseThrow();
            });

            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "email", user.getEmail(),
                    "role", user.getRole().name()
            ));
        } catch (RestClientException ex) {
            return ResponseEntity.status(401).body(Map.of("error", "Failed to verify Google token"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Google login failed"));
        }
    }
}
