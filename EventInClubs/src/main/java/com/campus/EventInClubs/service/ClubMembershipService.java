package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.Club;
import com.campus.EventInClubs.domain.model.ClubMembership;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.dto.ClubMembershipDto;
import com.campus.EventInClubs.repository.ClubMembershipRepository;
import com.campus.EventInClubs.repository.ClubRepository;
import com.campus.EventInClubs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ClubMembershipService {
    
    private final ClubMembershipRepository membershipRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    public List<ClubMembershipDto> getClubMembers(Long clubId) {
        List<ClubMembership> memberships = membershipRepository.findByClubIdAndIsActiveTrue(clubId);
        return memberships.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<ClubMembershipDto> getUserMemberships(Long userId) {
        List<ClubMembership> memberships = membershipRepository.findByUserIdAndIsActiveTrue(userId);
        return memberships.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public ClubMembershipDto joinClub(Long clubId, Long userId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!club.getIsActive()) {
            throw new RuntimeException("Cannot join inactive club");
        }
        
        // Check if user is already a member
        if (membershipRepository.existsByUserIdAndClubIdAndIsActiveTrue(userId, clubId)) {
            throw new RuntimeException("User is already a member of this club");
        }
        
        ClubMembership membership = ClubMembership.builder()
                .user(user)
                .club(club)
                .role(ClubMembership.MembershipRole.MEMBER)
                .status(ClubMembership.MembershipStatus.ACTIVE)
                .joinedAt(Instant.now())
                .isActive(true)
                .build();
        
        ClubMembership saved = membershipRepository.save(membership);
        
        // Update club member count
        club.setMemberCount(club.getMemberCount() + 1);
        clubRepository.save(club);
        
        // Send notification to club admin
        if (club.getAdminUser() != null && !club.getAdminUser().getId().equals(userId)) {
            notificationService.createNotification(
                club.getAdminUser().getId(),
                "New Club Member",
                user.getName() + " has joined " + club.getName(),
                com.campus.EventInClubs.domain.model.Notification.NotificationType.CLUB_ANNOUNCEMENT,
                clubId,
                "CLUB"
            );
        }
        
        log.info("User {} joined club {}", user.getName(), club.getName());
        return convertToDto(saved);
    }
    
    public void leaveClub(Long clubId, Long userId) {
        ClubMembership membership = membershipRepository.findByUserIdAndClubIdAndIsActiveTrue(userId, clubId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));
        
        // Prevent club owner from leaving
        if (membership.getRole() == ClubMembership.MembershipRole.OWNER) {
            throw new RuntimeException("Club owner cannot leave the club. Transfer ownership first.");
        }
        
        membership.setIsActive(false);
        membership.setLeftAt(Instant.now());
        membership.setStatus(ClubMembership.MembershipStatus.INACTIVE);
        membershipRepository.save(membership);
        
        // Update club member count
        Club club = membership.getClub();
        club.setMemberCount(Math.max(0, club.getMemberCount() - 1));
        clubRepository.save(club);
        
        log.info("User {} left club {}", membership.getUser().getName(), club.getName());
    }
    
    public ClubMembershipDto updateMemberRole(Long membershipId, ClubMembership.MembershipRole newRole, Long requesterId) {
        ClubMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));
        
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        
        // Check permissions
        Optional<ClubMembership> requesterMembership = membershipRepository
                .findByUserIdAndClubIdAndIsActiveTrue(requesterId, membership.getClub().getId());
        
        if (requesterMembership.isEmpty() || 
            (!hasPermissionToChangeRole(requesterMembership.get().getRole(), newRole) && 
             !requester.getRole().name().equals("SUPER_ADMIN"))) {
            throw new RuntimeException("Insufficient permissions to change member role");
        }
        
        ClubMembership.MembershipRole oldRole = membership.getRole();
        membership.setRole(newRole);
        membership.setUpdatedAt(Instant.now());
        
        ClubMembership saved = membershipRepository.save(membership);
        
        // Send notification to the member
        notificationService.createNotification(
            membership.getUser().getId(),
            "Role Updated",
            "Your role in " + membership.getClub().getName() + " has been changed from " + 
            oldRole + " to " + newRole,
            com.campus.EventInClubs.domain.model.Notification.NotificationType.CLUB_ANNOUNCEMENT,
            membership.getClub().getId(),
            "CLUB"
        );
        
        log.info("Updated role for user {} in club {} from {} to {}", 
                membership.getUser().getName(), membership.getClub().getName(), oldRole, newRole);
        
        return convertToDto(saved);
    }
    
    public void removeMember(Long membershipId, Long requesterId) {
        ClubMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));
        
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        
        // Check permissions
        Optional<ClubMembership> requesterMembership = membershipRepository
                .findByUserIdAndClubIdAndIsActiveTrue(requesterId, membership.getClub().getId());
        
        if (requesterMembership.isEmpty() || 
            (!canRemoveMember(requesterMembership.get().getRole(), membership.getRole()) && 
             !requester.getRole().name().equals("SUPER_ADMIN"))) {
            throw new RuntimeException("Insufficient permissions to remove member");
        }
        
        // Cannot remove club owner
        if (membership.getRole() == ClubMembership.MembershipRole.OWNER) {
            throw new RuntimeException("Cannot remove club owner");
        }
        
        membership.setIsActive(false);
        membership.setLeftAt(Instant.now());
        membership.setStatus(ClubMembership.MembershipStatus.SUSPENDED);
        membershipRepository.save(membership);
        
        // Update club member count
        Club club = membership.getClub();
        club.setMemberCount(Math.max(0, club.getMemberCount() - 1));
        clubRepository.save(club);
        
        // Send notification to the removed member
        notificationService.createNotification(
            membership.getUser().getId(),
            "Removed from Club",
            "You have been removed from " + membership.getClub().getName(),
            com.campus.EventInClubs.domain.model.Notification.NotificationType.CLUB_ANNOUNCEMENT,
            membership.getClub().getId(),
            "CLUB"
        );
        
        log.info("Removed user {} from club {}", membership.getUser().getName(), club.getName());
    }
    
    private boolean hasPermissionToChangeRole(ClubMembership.MembershipRole requesterRole, 
                                            ClubMembership.MembershipRole targetRole) {
        // Only OWNER and ADMIN can change roles
        if (requesterRole != ClubMembership.MembershipRole.OWNER && 
            requesterRole != ClubMembership.MembershipRole.ADMIN) {
            return false;
        }
        
        // OWNER can change any role except to OWNER
        if (requesterRole == ClubMembership.MembershipRole.OWNER) {
            return targetRole != ClubMembership.MembershipRole.OWNER;
        }
        
        // ADMIN can only promote to MODERATOR or demote to MEMBER
        return targetRole == ClubMembership.MembershipRole.MEMBER || 
               targetRole == ClubMembership.MembershipRole.MODERATOR;
    }
    
    private boolean canRemoveMember(ClubMembership.MembershipRole requesterRole, 
                                  ClubMembership.MembershipRole targetRole) {
        // Only OWNER and ADMIN can remove members
        if (requesterRole != ClubMembership.MembershipRole.OWNER && 
            requesterRole != ClubMembership.MembershipRole.ADMIN) {
            return false;
        }
        
        // Cannot remove OWNER
        if (targetRole == ClubMembership.MembershipRole.OWNER) {
            return false;
        }
        
        // OWNER can remove anyone except OWNER
        if (requesterRole == ClubMembership.MembershipRole.OWNER) {
            return true;
        }
        
        // ADMIN can only remove MEMBER and MODERATOR
        return targetRole == ClubMembership.MembershipRole.MEMBER || 
               targetRole == ClubMembership.MembershipRole.MODERATOR;
    }
    
    private ClubMembershipDto convertToDto(ClubMembership membership) {
        return ClubMembershipDto.builder()
                .id(membership.getId())
                .userId(membership.getUser().getId())
                .userName(membership.getUser().getName())
                .userEmail(membership.getUser().getEmail())
                .clubId(membership.getClub().getId())
                .clubName(membership.getClub().getName())
                .role(membership.getRole().name())
                .status(membership.getStatus().name())
                .joinedAt(membership.getJoinedAt())
                .leftAt(membership.getLeftAt())
                .isActive(membership.getIsActive())
                .createdAt(membership.getCreatedAt())
                .updatedAt(membership.getUpdatedAt())
                .build();
    }
}
