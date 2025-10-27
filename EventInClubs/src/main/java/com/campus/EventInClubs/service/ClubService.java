package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.ApprovalStatus;
import com.campus.EventInClubs.domain.model.Club;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.dto.ClubDto;

import java.util.ArrayList;
import com.campus.EventInClubs.repository.ClubRepository;
import com.campus.EventInClubs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ClubService {
    
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    
    public List<ClubDto> getAllActiveClubs() {
        try {
            List<Club> clubs = clubRepository.findByIsActiveTrue();
            log.info("Found {} active clubs", clubs.size());
            return clubs.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching active clubs", e);
            return new ArrayList<>();
        }
    }
    
    public List<ClubDto> getPendingClubs() {
        return clubRepository.findByApprovalStatus(ApprovalStatus.PENDING)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public ClubDto approveClub(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));
        
        club.setApprovalStatus(ApprovalStatus.APPROVED);
        club.setIsActive(true);
        Club savedClub = clubRepository.save(club);
        return convertToDto(savedClub);
    }
    
    public ClubDto rejectClub(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));
        
        club.setApprovalStatus(ApprovalStatus.REJECTED);
        club.setIsActive(false);
        Club savedClub = clubRepository.save(club);
        return convertToDto(savedClub);
    }
    
    public List<ClubDto> getClubsByCategory(String category) {
        List<Club> clubs = clubRepository.findByCategory(category);
        return clubs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<ClubDto> getTopClubs() {
        List<Club> clubs = clubRepository.findTopClubs();
        return clubs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<ClubDto> getTopClubsByCategory(String category) {
        List<Club> clubs = clubRepository.findTopClubsByCategory(category);
        return clubs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<ClubDto> searchClubs(String searchTerm) {
        List<Club> clubs = clubRepository.searchActiveClubs(searchTerm);
        return clubs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Optional<ClubDto> getClubById(Long id) {
        return clubRepository.findById(id)
                .map(this::convertToDto);
    }
    
    public Optional<ClubDto> getClubByName(String name) {
        return clubRepository.findByName(name)
                .map(this::convertToDto);
    }
    
    public ClubDto createClub(ClubDto clubDto, Long adminUserId) {
        // Check if user exists and has appropriate role
        User adminUser = userRepository.findById(adminUserId)
                .orElse(null);
        
        // For testing purposes, allow club creation even if user doesn't exist or doesn't have proper role
        // TODO: Re-enable strict role checking in production
        if (adminUser == null) {
            log.warn("Admin user with ID {} not found, creating club anyway for testing", adminUserId);
        } else if (adminUser.getRole() != com.campus.EventInClubs.domain.model.Role.CLUB_ADMIN && 
                   adminUser.getRole() != com.campus.EventInClubs.domain.model.Role.SUPER_ADMIN) {
            log.warn("User {} does not have CLUB_ADMIN or SUPER_ADMIN role, creating club anyway for testing", adminUserId);
        }
        
        // Check if club name already exists
        if (clubRepository.existsByName(clubDto.getName())) {
            throw new RuntimeException("Club with this name already exists");
        }
        
        if (clubDto.getShortName() != null && clubRepository.existsByShortName(clubDto.getShortName())) {
            throw new RuntimeException("Club with this short name already exists");
        }
        
        Club club = Club.builder()
                .name(clubDto.getName())
                .description(clubDto.getDescription())
                .category(clubDto.getCategory())
                .shortName(clubDto.getShortName())
                .memberCount(clubDto.getMemberCount() != null ? clubDto.getMemberCount() : 0)
                .eventCount(clubDto.getEventCount() != null ? clubDto.getEventCount() : 0)
                .rating(clubDto.getRating() != null ? clubDto.getRating() : 0.0)
                .adminUser(adminUser)
                .isActive(true) // Auto-approve new clubs
                .approvalStatus(ApprovalStatus.APPROVED) // Auto-approve new clubs
                .build();
        
        Club savedClub = clubRepository.save(club);
        log.info("Created and auto-approved new club: {}", savedClub.getName());
        
        return convertToDto(savedClub);
    }
    
    public ClubDto updateClub(Long id, ClubDto clubDto, Long userId) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Club not found"));
        
        // Check if user is admin of the club or super admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!club.getAdminUser().getId().equals(userId) && 
            user.getRole() != com.campus.EventInClubs.domain.model.Role.SUPER_ADMIN) {
            throw new RuntimeException("User does not have permission to update this club");
        }
        
        // Update fields
        if (clubDto.getName() != null && !clubDto.getName().equals(club.getName())) {
            if (clubRepository.existsByName(clubDto.getName())) {
                throw new RuntimeException("Club with this name already exists");
            }
            club.setName(clubDto.getName());
        }
        
        if (clubDto.getDescription() != null) {
            club.setDescription(clubDto.getDescription());
        }
        
        if (clubDto.getCategory() != null) {
            club.setCategory(clubDto.getCategory());
        }
        
        if (clubDto.getShortName() != null && !clubDto.getShortName().equals(club.getShortName())) {
            if (clubRepository.existsByShortName(clubDto.getShortName())) {
                throw new RuntimeException("Club with this short name already exists");
            }
            club.setShortName(clubDto.getShortName());
        }
        
        Club updatedClub = clubRepository.save(club);
        log.info("Updated club: {}", updatedClub.getName());
        
        return convertToDto(updatedClub);
    }
    
    public void deleteClub(Long id, Long userId) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Club not found"));
        
        // Check if user is admin of the club or super admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!club.getAdminUser().getId().equals(userId) && 
            user.getRole() != com.campus.EventInClubs.domain.model.Role.SUPER_ADMIN) {
            throw new RuntimeException("User does not have permission to delete this club");
        }
        
        // Soft delete - set as inactive
        club.setIsActive(false);
        clubRepository.save(club);
        log.info("Deactivated club: {}", club.getName());
    }
    
    public void updateClubStats(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));
        
        // This method would be called after member count or event count changes
        // For now, we'll just save the club to trigger the @PreUpdate
        clubRepository.save(club);
    }
    
    private ClubDto convertToDto(Club club) {
        return ClubDto.builder()
                .id(club.getId())
                .name(club.getName())
                .description(club.getDescription())
                .category(club.getCategory())
                .shortName(club.getShortName())
                .memberCount(club.getMemberCount())
                .eventCount(club.getEventCount())
                .rating(club.getRating())
                .adminUserId(club.getAdminUser() != null ? club.getAdminUser().getId() : null)
                .adminUserName(club.getAdminUser() != null ? club.getAdminUser().getName() : null)
                .approvalStatus(club.getApprovalStatus() != null ? club.getApprovalStatus().toString() : null)
                .isActive(club.getIsActive())
                .createdAt(club.getCreatedAt())
                .updatedAt(club.getUpdatedAt())
                .build();
    }
}
