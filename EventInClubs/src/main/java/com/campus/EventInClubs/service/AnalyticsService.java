package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.ApprovalStatus;
import com.campus.EventInClubs.domain.model.Role;
import com.campus.EventInClubs.repository.ClubRepository;
import com.campus.EventInClubs.repository.EventRepository;
import com.campus.EventInClubs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;

    public Map<String, Object> getDashboardAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // User analytics
        long totalUsers = userRepository.count();
        long students = userRepository.countByRole(Role.STUDENT);
        long clubAdmins = userRepository.countByRole(Role.CLUB_ADMIN);
        long superAdmins = userRepository.countByRole(Role.SUPER_ADMIN);
        
        // Club analytics
        long totalClubs = clubRepository.count();
        long activeClubs = clubRepository.countByIsActiveTrue();
        long pendingClubs = clubRepository.countByApprovalStatus(ApprovalStatus.PENDING);
        
        // Event analytics
        long totalEvents = eventRepository.count();
        long activeEvents = eventRepository.countByIsActiveTrue();
        
        analytics.put("users", Map.of(
            "total", totalUsers,
            "students", students,
            "clubAdmins", clubAdmins,
            "superAdmins", superAdmins
        ));
        
        analytics.put("clubs", Map.of(
            "total", totalClubs,
            "active", activeClubs,
            "pending", pendingClubs
        ));
        
        analytics.put("events", Map.of(
            "total", totalEvents,
            "active", activeEvents
        ));
        
        return analytics;
    }

    public Map<String, Object> getSystemAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Detailed system statistics
        analytics.put("activeEvents", eventRepository.countByIsActiveTrue());
        analytics.put("clubAdmins", userRepository.countByRole(Role.CLUB_ADMIN));
        analytics.put("students", userRepository.countByRole(Role.STUDENT));
        analytics.put("totalUsers", userRepository.count());
        analytics.put("activeClubs", clubRepository.countByIsActiveTrue());
        analytics.put("pendingApprovals", clubRepository.countByApprovalStatus(ApprovalStatus.PENDING));
        
        return analytics;
    }
}
