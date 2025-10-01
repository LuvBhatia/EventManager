package com.campus.EventInClubs.controller;

import com.campus.EventInClubs.domain.model.SuperAdminRequest;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.dto.ApprovalRequest;
import com.campus.EventInClubs.dto.SuperAdminRequestDto;
import com.campus.EventInClubs.security.JwtUtil;
import com.campus.EventInClubs.service.SuperAdminRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/super-admin-requests")
@RequiredArgsConstructor
public class SuperAdminRequestController {

    private final SuperAdminRequestService superAdminRequestService;
    private final JwtUtil jwtUtil;

    // Get all pending super admin requests (only for super admins)
    @GetMapping("/pending")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<SuperAdminRequestDto>> getPendingRequests() {
        List<SuperAdminRequest> requests = superAdminRequestService.getPendingRequests();
        List<SuperAdminRequestDto> dtos = requests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get all super admin requests (only for super admins)
    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<SuperAdminRequestDto>> getAllRequests() {
        List<SuperAdminRequest> requests = superAdminRequestService.getAllRequests();
        List<SuperAdminRequestDto> dtos = requests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Approve a super admin request
    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> approveRequest(
            @PathVariable Long requestId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            Long approvedBy = jwtUtil.getUserIdFromToken(token);

            User newSuperAdmin = superAdminRequestService.approveSuperAdminRequest(requestId, approvedBy);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Super admin request approved successfully",
                    "newSuperAdmin", Map.of(
                            "id", newSuperAdmin.getId(),
                            "name", newSuperAdmin.getName(),
                            "email", newSuperAdmin.getEmail(),
                            "role", newSuperAdmin.getRole().name()
                    )
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to approve request"));
        }
    }

    // Reject a super admin request
    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long requestId,
            @RequestBody ApprovalRequest approvalRequest,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            Long rejectedBy = jwtUtil.getUserIdFromToken(token);

            String reason = approvalRequest.getReason() != null ? approvalRequest.getReason() : "No reason provided";
            
            SuperAdminRequest rejectedRequest = superAdminRequestService.rejectSuperAdminRequest(requestId, rejectedBy, reason);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Super admin request rejected successfully",
                    "rejectedRequest", convertToDto(rejectedRequest)
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to reject request"));
        }
    }

    // Get pending requests count
    @GetMapping("/count")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Long>> getPendingRequestsCount() {
        long count = superAdminRequestService.getPendingRequestsCount();
        return ResponseEntity.ok(Map.of("pendingRequests", count));
    }

    private SuperAdminRequestDto convertToDto(SuperAdminRequest request) {
        return SuperAdminRequestDto.builder()
                .id(request.getId())
                .name(request.getName())
                .email(request.getEmail())
                .status(request.getStatus())
                .requestedAt(request.getRequestedAt())
                .approvedAt(request.getApprovedAt())
                .approvedBy(request.getApprovedBy())
                .rejectionReason(request.getRejectionReason())
                .build();
    }
}
