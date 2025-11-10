package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.Event;
import com.campus.EventInClubs.domain.model.TeamRegistration;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.dto.TeamRegistrationDto;
import com.campus.EventInClubs.repository.EventRepository;
import com.campus.EventInClubs.repository.TeamRegistrationRepository;
import com.campus.EventInClubs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TeamRegistrationService {
    
    private final TeamRegistrationRepository teamRegistrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    
    public TeamRegistrationDto registerTeam(Long eventId, Long userId, String teamName, 
                                           List<String> memberRollNumbers, List<String> memberNames, 
                                           List<String> memberEmails, String notes) {
        // Validate event exists and is a team event
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        if (!event.getIsTeamEvent()) {
            throw new RuntimeException("This event is not a team event");
        }
        
        // Check if user has already registered a team for this event
        if (teamRegistrationRepository.existsByEventIdAndRegisteredById(eventId, userId)) {
            throw new RuntimeException("You have already registered a team for this event");
        }
        
        // Validate team size
        int teamSize = memberRollNumbers.size();
        if (event.getMinTeamMembers() != null && teamSize < event.getMinTeamMembers()) {
            throw new RuntimeException("Team size must be at least " + event.getMinTeamMembers() + " members");
        }
        if (event.getMaxTeamMembers() != null && teamSize > event.getMaxTeamMembers()) {
            throw new RuntimeException("Team size cannot exceed " + event.getMaxTeamMembers() + " members");
        }
        
        // Validate that no roll number is already registered in another team for this event
        for (String rollNumber : memberRollNumbers) {
            List<TeamRegistration> existingRegistrations = 
                teamRegistrationRepository.findByEventIdAndRollNumberContaining(eventId, rollNumber);
            
            if (!existingRegistrations.isEmpty()) {
                throw new RuntimeException("Roll number " + rollNumber + " is already registered in another team");
            }
        }
        
        // Validate that no email is already registered in another team for this event
        if (memberEmails != null && !memberEmails.isEmpty()) {
            for (String email : memberEmails) {
                if (email != null && !email.trim().isEmpty()) {
                    String normalizedEmail = email.trim().toLowerCase();
                    log.debug("Checking if email {} is already registered for event {}", normalizedEmail, eventId);
                    List<TeamRegistration> existingEmailRegistrations = 
                        teamRegistrationRepository.findByEventIdAndEmailContaining(eventId, normalizedEmail);
                    
                    if (!existingEmailRegistrations.isEmpty()) {
                        TeamRegistration existingTeam = existingEmailRegistrations.get(0);
                        log.warn("Duplicate email registration attempt: {} already in team '{}' for event {}", 
                                normalizedEmail, existingTeam.getTeamName(), eventId);
                        throw new RuntimeException("Email " + email + " is already registered in another team for this event");
                    }
                }
            }
        }
        
        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create team registration
        String rollNumbersStr = String.join(",", memberRollNumbers);
        String namesStr = (memberNames != null && !memberNames.isEmpty()) ? String.join(",", memberNames) : null;
        // Store emails in lowercase for consistent validation
        String emailsStr = (memberEmails != null && !memberEmails.isEmpty()) 
            ? String.join(",", memberEmails.stream()
                .map(email -> email != null ? email.trim().toLowerCase() : "")
                .collect(Collectors.toList())) 
            : null;
        
        // Initialize attendance statuses to false for all members
        String attendanceStatuses = memberRollNumbers.stream()
                .map(r -> "false")
                .collect(Collectors.joining(","));
        
        TeamRegistration teamRegistration = TeamRegistration.builder()
                .event(event)
                .teamName(teamName)
                .teamSize(teamSize)
                .memberRollNumbers(rollNumbersStr)
                .memberNames(namesStr)
                .memberEmails(emailsStr)
                .memberAttendanceStatuses(attendanceStatuses)
                .registeredBy(user)
                .status(TeamRegistration.RegistrationStatus.REGISTERED)
                .registrationNotes(notes)
                .paymentStatus(event.getRegistrationFee() == 0 ? 
                    TeamRegistration.PaymentStatus.NOT_REQUIRED : 
                    TeamRegistration.PaymentStatus.PENDING)
                .build();
        
        TeamRegistration saved = teamRegistrationRepository.save(teamRegistration);
        log.info("Team '{}' registered for event '{}' with {} members", 
                teamName, event.getTitle(), teamSize);
        
        // Send notification to user (team leader)
        notificationService.createNotification(
            userId,
            "Team Registration Confirmed",
            String.format("Your team '%s' has been successfully registered for '%s'", teamName, event.getTitle()),
            com.campus.EventInClubs.domain.model.Notification.NotificationType.SYSTEM,
            event.getId(),
            "EVENT"
        );
        
        // Send notification to club admin
        notificationService.createNotification(
            event.getClub().getAdminUser().getId(),
            "New Team Registration",
            String.format("Team '%s' registered for '%s' with %d members", teamName, event.getTitle(), teamSize),
            com.campus.EventInClubs.domain.model.Notification.NotificationType.SYSTEM,
            event.getId(),
            "EVENT"
        );
        
        // Send confirmation emails
        try {
            String clubAdminEmail = event.getClub().getAdminUser().getEmail();
            
            // Send email to team leader with full team details
            log.info("Attempting to send team leader confirmation email to {}", user.getEmail());
            emailService.sendTeamLeaderConfirmation(saved, user, clubAdminEmail);
            
            // Send emails to all team members
            if (memberEmails != null && !memberEmails.isEmpty()) {
                log.info("Sending confirmation emails to {} team members", memberEmails.size());
                for (int i = 0; i < memberEmails.size(); i++) {
                    String memberEmail = memberEmails.get(i);
                    String memberName = (memberNames != null && i < memberNames.size()) ? memberNames.get(i) : "Team Member";
                    
                    if (memberEmail != null && !memberEmail.trim().isEmpty()) {
                        emailService.sendTeamMemberConfirmation(saved, memberName, memberEmail.trim(), clubAdminEmail);
                    }
                }
            }
            
            log.info("✅ Team registration confirmation emails sent successfully for team '{}'", teamName);
        } catch (Exception e) {
            log.error("❌ Failed to send team registration confirmation emails: {}", e.getMessage(), e);
            // Don't fail the registration if email fails
        }
        
        return convertToDto(saved);
    }
    
    public List<TeamRegistrationDto> getTeamsByEvent(Long eventId) {
        return teamRegistrationRepository.findByEventId(eventId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<TeamRegistrationDto> getTeamsByUser(Long userId) {
        return teamRegistrationRepository.findByRegisteredById(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public TeamRegistrationDto getTeamById(Long teamId) {
        TeamRegistration team = teamRegistrationRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team registration not found"));
        return convertToDto(team);
    }
    
    public void cancelTeamRegistration(Long teamId, Long userId) {
        TeamRegistration team = teamRegistrationRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team registration not found"));
        
        // Only the person who registered can cancel
        if (!team.getRegisteredBy().getId().equals(userId)) {
            throw new RuntimeException("Only the team leader can cancel the registration");
        }
        
        team.setStatus(TeamRegistration.RegistrationStatus.CANCELLED);
        teamRegistrationRepository.save(team);
        
        log.info("Team '{}' registration cancelled for event '{}'", 
                team.getTeamName(), team.getEvent().getTitle());
    }
    
    public TeamRegistrationDto updateMemberAttendance(Long teamId, int memberIndex, boolean attended) {
        TeamRegistration team = teamRegistrationRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team registration not found"));
        
        // Parse current attendance statuses
        List<String> statuses = team.getMemberAttendanceStatuses() != null && !team.getMemberAttendanceStatuses().isEmpty()
                ? new java.util.ArrayList<>(Arrays.asList(team.getMemberAttendanceStatuses().split(",")))
                : new java.util.ArrayList<>();
        
        // Ensure the list has enough elements
        int teamSize = Arrays.asList(team.getMemberRollNumbers().split(",")).size();
        while (statuses.size() < teamSize) {
            statuses.add("false");
        }
        
        // Validate member index
        if (memberIndex < 0 || memberIndex >= teamSize) {
            throw new RuntimeException("Invalid member index");
        }
        
        // Update attendance status for the specific member
        statuses.set(memberIndex, String.valueOf(attended));
        
        // Save back to entity
        team.setMemberAttendanceStatuses(String.join(",", statuses));
        TeamRegistration saved = teamRegistrationRepository.save(team);
        
        log.info("Updated attendance for team '{}', member index {}: {}", 
                team.getTeamName(), memberIndex, attended);
        
        return convertToDto(saved);
    }
    
    private TeamRegistrationDto convertToDto(TeamRegistration team) {
        List<String> rollNumbers = Arrays.asList(team.getMemberRollNumbers().split(","));
        List<String> names = (team.getMemberNames() != null && !team.getMemberNames().isEmpty()) 
                ? Arrays.asList(team.getMemberNames().split(",")) 
                : null;
        List<String> emails = (team.getMemberEmails() != null && !team.getMemberEmails().isEmpty()) 
                ? Arrays.asList(team.getMemberEmails().split(",")) 
                : null;
        
        // Parse attendance statuses
        List<Boolean> attendanceStatuses = null;
        if (team.getMemberAttendanceStatuses() != null && !team.getMemberAttendanceStatuses().isEmpty()) {
            attendanceStatuses = Arrays.stream(team.getMemberAttendanceStatuses().split(","))
                    .map(Boolean::parseBoolean)
                    .collect(Collectors.toList());
        }
        
        return TeamRegistrationDto.builder()
                .id(team.getId())
                .eventId(team.getEvent().getId())
                .eventTitle(team.getEvent().getTitle())
                .teamName(team.getTeamName())
                .teamSize(team.getTeamSize())
                .memberRollNumbers(rollNumbers)
                .memberNames(names)
                .memberEmails(emails)
                .memberAttendanceStatuses(attendanceStatuses)
                .registeredById(team.getRegisteredBy().getId())
                .registeredByName(team.getRegisteredBy().getName())
                .registeredByEmail(team.getRegisteredBy().getEmail())
                .status(team.getStatus().name())
                .registrationNotes(team.getRegistrationNotes())
                .paymentStatus(team.getPaymentStatus().name())
                .registeredAt(team.getRegisteredAt())
                .build();
    }
}
