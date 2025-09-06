package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.domain.model.ClubMembership;
import com.campus.EventInClubs.dto.ClubMembershipDto;
import com.campus.EventInClubs.service.ClubMembershipService;
import com.campus.EventInClubs.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clubs/{clubId}/members")
@RequiredArgsConstructor
public class ClubMembershipController {

    private final ClubMembershipService membershipService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<ClubMembershipDto>> getClubMembers(@PathVariable Long clubId) {
        List<ClubMembershipDto> members = membershipService.getClubMembers(clubId);
        return ResponseEntity.ok(members);
    }

    @PostMapping("/join")
    public ResponseEntity<ClubMembershipDto> joinClub(@PathVariable Long clubId, 
                                                     @RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            ClubMembershipDto membership = membershipService.joinClub(clubId, userId);
            return ResponseEntity.ok(membership);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/leave")
    public ResponseEntity<Map<String, String>> leaveClub(@PathVariable Long clubId, 
                                                        @RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }
            
            membershipService.leaveClub(clubId, userId);
            return ResponseEntity.ok(Map.of("message", "Successfully left the club"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{membershipId}/role")
    public ResponseEntity<ClubMembershipDto> updateMemberRole(@PathVariable Long clubId,
                                                             @PathVariable Long membershipId,
                                                             @RequestBody Map<String, String> request,
                                                             @RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            String roleStr = request.get("role");
            ClubMembership.MembershipRole role = ClubMembership.MembershipRole.valueOf(roleStr);
            
            ClubMembershipDto membership = membershipService.updateMemberRole(membershipId, role, userId);
            return ResponseEntity.ok(membership);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{membershipId}")
    public ResponseEntity<Map<String, String>> removeMember(@PathVariable Long clubId,
                                                           @PathVariable Long membershipId,
                                                           @RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }
            
            membershipService.removeMember(membershipId, userId);
            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

@RestController
@RequestMapping("/api/users/memberships")
@RequiredArgsConstructor
class UserMembershipController {

    private final ClubMembershipService membershipService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<ClubMembershipDto>> getUserMemberships(@RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            List<ClubMembershipDto> memberships = membershipService.getUserMemberships(userId);
            return ResponseEntity.ok(memberships);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
