package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.Club;
import com.campus.EventInClubs.domain.model.Problem;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.dto.ProblemDto;
import com.campus.EventInClubs.repository.ClubRepository;
import com.campus.EventInClubs.repository.ProblemRepository;
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
public class ProblemService {
    
    private final ProblemRepository problemRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    
    public List<ProblemDto> getAllActiveProblems() {
        List<Problem> problems = problemRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        return problems.stream()
                .map(this::convertToDto)
                .filter(problemDto -> !problemDto.getIsExpired()) // Filter out expired problems
                .collect(Collectors.toList());
    }
    
    public List<ProblemDto> getProblemsByClub(Long clubId) {
        List<Problem> problems = problemRepository.findByClubIdAndIsActiveTrueOrderByCreatedAtDesc(clubId);
        return problems.stream()
                .map(this::convertToDto)
                .filter(problemDto -> !problemDto.getIsExpired()) // Filter out expired problems
                .collect(Collectors.toList());
    }
    
    public List<ProblemDto> getTrendingProblems() {
        List<Problem> problems = problemRepository.findTrendingProblems();
        return problems.stream()
                .map(this::convertToDto)
                .filter(problemDto -> !problemDto.getIsExpired()) // Filter out expired problems
                .collect(Collectors.toList());
    }
    
    public List<ProblemDto> getProblemsByCategory(String category) {
        List<Problem> problems = problemRepository.findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(category);
        return problems.stream()
                .map(this::convertToDto)
                .filter(problemDto -> !problemDto.getIsExpired()) // Filter out expired problems
                .collect(Collectors.toList());
    }
    
    public List<ProblemDto> searchProblems(String searchTerm) {
        List<Problem> problems = problemRepository.searchActiveProblems(searchTerm);
        return problems.stream()
                .map(this::convertToDto)
                .filter(problemDto -> !problemDto.getIsExpired()) // Filter out expired problems
                .collect(Collectors.toList());
    }
    
    public Optional<ProblemDto> getProblemById(Long id) {
        return problemRepository.findById(id)
                .map(this::convertToDto);
    }
    
    public ProblemDto createProblem(ProblemDto problemDto, Long clubId, Long userId) {
        // Verify club exists and user is admin
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is admin of this specific club or super admin
        boolean isSuperAdmin = user.getRole().name().equals("SUPER_ADMIN");
        boolean isClubAdmin = club.getAdminUser().getId().equals(userId);
        
        if (!isSuperAdmin && !isClubAdmin) {
            throw new RuntimeException("Only club admins can post problems for their clubs");
        }
        
        Problem problem = Problem.builder()
                .title(problemDto.getTitle())
                .description(problemDto.getDescription())
                .category(problemDto.getCategory())
                .priority(problemDto.getPriority())
                .deadline(problemDto.getDeadline())
                .club(club)
                .postedBy(user)
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        
        Problem savedProblem = problemRepository.save(problem);
        log.info("Created new problem: {} for club: {}", savedProblem.getTitle(), club.getName());
        
        return convertToDto(savedProblem);
    }
    
    public ProblemDto updateProblem(Long id, ProblemDto problemDto, Long userId) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is the original poster or super admin
        if (!problem.getPostedBy().getId().equals(userId) && !user.getRole().name().equals("SUPER_ADMIN")) {
            throw new RuntimeException("You can only update your own problems");
        }
        
        problem.setTitle(problemDto.getTitle());
        problem.setDescription(problemDto.getDescription());
        problem.setCategory(problemDto.getCategory());
        problem.setPriority(problemDto.getPriority());
        problem.setUpdatedAt(Instant.now());
        
        Problem savedProblem = problemRepository.save(problem);
        log.info("Updated problem: {}", savedProblem.getTitle());
        
        return convertToDto(savedProblem);
    }
    
    public void deleteProblem(Long id, Long userId) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is the original poster or super admin
        if (!problem.getPostedBy().getId().equals(userId) && !user.getRole().name().equals("SUPER_ADMIN")) {
            throw new RuntimeException("You can only delete your own problems");
        }
        
        problem.setIsActive(false);
        problem.setUpdatedAt(Instant.now());
        problemRepository.save(problem);
        log.info("Deactivated problem: {}", problem.getTitle());
    }
    
    private ProblemDto convertToDto(Problem problem) {
        // Calculate deadline status
        boolean isExpired = false;
        boolean isViewOnly = false;
        
        if (problem.getDeadline() != null) {
            Instant now = Instant.now();
            Instant oneHourAfterDeadline = problem.getDeadline().plusSeconds(3600); // 1 hour = 3600 seconds
            
            isExpired = now.isAfter(oneHourAfterDeadline);
            isViewOnly = now.isAfter(problem.getDeadline()) && now.isBefore(oneHourAfterDeadline);
        }
        
        return ProblemDto.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .description(problem.getDescription())
                .category(problem.getCategory())
                .priority(problem.getPriority())
                .clubId(problem.getClub().getId())
                .clubName(problem.getClub().getName())
                .postedById(problem.getPostedBy().getId())
                .postedByName(problem.getPostedBy().getName())
                .isActive(problem.getIsActive())
                .deadline(problem.getDeadline())
                .isExpired(isExpired)
                .isViewOnly(isViewOnly)
                .createdAt(problem.getCreatedAt())
                .updatedAt(problem.getUpdatedAt())
                .build();
    }
}
