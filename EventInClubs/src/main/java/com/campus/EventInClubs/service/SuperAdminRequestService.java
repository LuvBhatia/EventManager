package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.Role;
import com.campus.EventInClubs.domain.model.SuperAdminRequest;
import com.campus.EventInClubs.domain.model.SuperAdminRequest.SuperAdminRequestStatus;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.repository.SuperAdminRequestRepository;
import com.campus.EventInClubs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SuperAdminRequestService {

    private final SuperAdminRequestRepository superAdminRequestRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Create a new super admin request
    public SuperAdminRequest createSuperAdminRequest(String name, String email, String rawPassword) {
        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }

        // Check if there's already a pending request for this email
        if (superAdminRequestRepository.existsByEmail(email)) {
            Optional<SuperAdminRequest> existingRequest = superAdminRequestRepository.findByEmail(email);
            if (existingRequest.isPresent() && existingRequest.get().getStatus() == SuperAdminRequestStatus.PENDING) {
                throw new IllegalArgumentException("Super admin request already pending for this email");
            }
        }

        SuperAdminRequest request = SuperAdminRequest.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .status(SuperAdminRequestStatus.PENDING)
                .requestedAt(Instant.now())
                .build();

        return superAdminRequestRepository.save(request);
    }

    // Get all pending requests
    public List<SuperAdminRequest> getPendingRequests() {
        return superAdminRequestRepository.findByStatusOrderByRequestedAtDesc(SuperAdminRequestStatus.PENDING);
    }

    // Get all requests (for admin view)
    public List<SuperAdminRequest> getAllRequests() {
        return superAdminRequestRepository.findAll();
    }

    // Approve a super admin request
    @Transactional
    public User approveSuperAdminRequest(Long requestId, Long approvedBy) {
        SuperAdminRequest request = superAdminRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Super admin request not found"));

        if (request.getStatus() != SuperAdminRequestStatus.PENDING) {
            throw new IllegalArgumentException("Request is not pending");
        }

        // Check if user with this email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Create the user as super admin
        User newSuperAdmin = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(request.getPasswordHash()) // Already encoded
                .role(Role.SUPER_ADMIN)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        User savedUser = userRepository.save(newSuperAdmin);

        // Update the request status
        request.setStatus(SuperAdminRequestStatus.APPROVED);
        request.setApprovedAt(Instant.now());
        request.setApprovedBy(approvedBy);
        superAdminRequestRepository.save(request);

        return savedUser;
    }

    // Reject a super admin request
    public SuperAdminRequest rejectSuperAdminRequest(Long requestId, Long rejectedBy, String reason) {
        SuperAdminRequest request = superAdminRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Super admin request not found"));

        if (request.getStatus() != SuperAdminRequestStatus.PENDING) {
            throw new IllegalArgumentException("Request is not pending");
        }

        request.setStatus(SuperAdminRequestStatus.REJECTED);
        request.setApprovedBy(rejectedBy);
        request.setRejectionReason(reason);
        request.setApprovedAt(Instant.now()); // Using same field for rejection timestamp

        return superAdminRequestRepository.save(request);
    }

    // Get request by ID
    public Optional<SuperAdminRequest> getRequestById(Long id) {
        return superAdminRequestRepository.findById(id);
    }

    // Get counts for dashboard
    public long getPendingRequestsCount() {
        return superAdminRequestRepository.countByStatus(SuperAdminRequestStatus.PENDING);
    }
}
