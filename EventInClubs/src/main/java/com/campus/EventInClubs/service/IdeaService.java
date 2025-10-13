package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.Idea;
import com.campus.EventInClubs.domain.model.Problem;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.dto.IdeaDto;
import com.campus.EventInClubs.repository.IdeaRepository;
import com.campus.EventInClubs.repository.ProblemRepository;
import com.campus.EventInClubs.repository.UserRepository;
import com.campus.EventInClubs.repository.VoteRepository;
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
public class IdeaService {
    
    private final IdeaRepository ideaRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final NotificationService notificationService;
    private final AchievementService achievementService;
    
    public List<IdeaDto> getAllActiveIdeas() {
        List<Idea> ideas = ideaRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        return ideas.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<IdeaDto> getIdeasByProblem(Long problemId) {
        List<Idea> ideas = ideaRepository.findByProblemIdAndIsActiveTrueOrderByCreatedAtDesc(problemId);
        return ideas.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<IdeaDto> getIdeasByUser(Long userId) {
        List<Idea> ideas = ideaRepository.findBySubmittedByIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
        return ideas.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<IdeaDto> getTopIdeas() {
        List<Idea> ideas = ideaRepository.findTopIdeas();
        return ideas.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<IdeaDto> getFeaturedIdeas() {
        List<Idea> ideas = ideaRepository.findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc();
        return ideas.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<IdeaDto> getIdeasByStatus(String status) {
        List<Idea> ideas = ideaRepository.findByStatusAndIsActiveTrueOrderByCreatedAtDesc(status);
        return ideas.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<IdeaDto> searchIdeas(String searchTerm) {
        List<Idea> ideas = ideaRepository.searchActiveIdeas(searchTerm);
        return ideas.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Optional<IdeaDto> getIdeaById(Long id) {
        return ideaRepository.findById(id)
                .map(this::convertToDto);
    }
    
    public IdeaDto createIdea(IdeaDto ideaDto, Long problemId, Long userId) {
        // Verify problem exists and is active
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        
        if (!problem.getIsActive()) {
            throw new RuntimeException("Cannot submit ideas for inactive problems");
        }
        
        // Check if deadline has passed
        if (problem.getDeadline() != null && Instant.now().isAfter(problem.getDeadline())) {
            throw new RuntimeException("Cannot submit ideas after the deadline has passed");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Idea idea = Idea.builder()
                .title(ideaDto.getTitle())
                .description(ideaDto.getDescription())
                .implementationPlan(ideaDto.getImplementationPlan())
                .expectedOutcome(ideaDto.getExpectedOutcome())
                .problem(problem)
                .submittedBy(user)
                .status(Idea.IdeaStatus.SUBMITTED)
                .isActive(true)
                .isFeatured(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        
        Idea savedIdea = ideaRepository.save(idea);
        log.info("Created new idea: {} for problem: {}", savedIdea.getTitle(), problem.getTitle());
        
        // Send notification to problem owner
        if (problem.getPostedBy() != null && !problem.getPostedBy().getId().equals(userId)) {
            notificationService.notifyNewIdea(problem.getPostedBy().getId(), savedIdea.getTitle(), savedIdea.getId());
        }
        
        // Check for achievements
        achievementService.checkAndAwardAchievements(userId);
        
        return convertToDto(savedIdea);
    }
    
    public IdeaDto updateIdea(Long id, IdeaDto ideaDto, Long userId) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is the original submitter or super admin
        if (!idea.getSubmittedBy().getId().equals(userId) && !user.getRole().name().equals("SUPER_ADMIN")) {
            throw new RuntimeException("You can only update your own ideas");
        }
        
        // Don't allow updates if idea is already implemented or rejected
        if (idea.getStatus().equals("IMPLEMENTED") || idea.getStatus().equals("REJECTED")) {
            throw new RuntimeException("Cannot update ideas that are already implemented or rejected");
        }
        
        idea.setTitle(ideaDto.getTitle());
        idea.setDescription(ideaDto.getDescription());
        idea.setImplementationPlan(ideaDto.getImplementationPlan());
        idea.setExpectedOutcome(ideaDto.getExpectedOutcome());
        idea.setUpdatedAt(Instant.now());
        
        Idea savedIdea = ideaRepository.save(idea);
        log.info("Updated idea: {}", savedIdea.getTitle());
        
        return convertToDto(savedIdea);
    }
    
    public IdeaDto updateIdeaStatus(Long id, String status, Long userId) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only club admins and super admins can change status
        if (!user.getRole().name().equals("CLUB_ADMIN") && !user.getRole().name().equals("SUPER_ADMIN")) {
            throw new RuntimeException("Only club admins can change idea status");
        }
        
        // Check if user is admin of the club that owns the problem
        if (!idea.getProblem().getClub().getAdminUser().getId().equals(userId) && !user.getRole().name().equals("SUPER_ADMIN")) {
            throw new RuntimeException("You can only change status of ideas for your own club's problems");
        }
        
        idea.setStatus(Idea.IdeaStatus.valueOf(status));
        idea.setUpdatedAt(Instant.now());
        
        Idea savedIdea = ideaRepository.save(idea);
        log.info("Updated idea status: {} to {}", savedIdea.getTitle(), status);
        
        // Send notification to idea owner
        if (!savedIdea.getSubmittedBy().getId().equals(userId)) {
            notificationService.notifyIdeaStatusChanged(savedIdea.getSubmittedBy().getId(), status, savedIdea.getId());
        }
        
        // Check for achievements if idea was implemented
        if (status.equals("IMPLEMENTING") || status.equals("COMPLETED")) {
            achievementService.checkAndAwardAchievements(savedIdea.getSubmittedBy().getId());
        }
        
        return convertToDto(savedIdea);
    }
    
    public IdeaDto updateIdeaStatusWithPpt(Long id, String status, Long userId, String pptFileUrl) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only club admins and super admins can change status
        if (!user.getRole().name().equals("CLUB_ADMIN") && !user.getRole().name().equals("SUPER_ADMIN")) {
            throw new RuntimeException("Only club admins can change idea status");
        }
        
        // Check if user is admin of the club that owns the problem
        if (!idea.getProblem().getClub().getAdminUser().getId().equals(userId) && !user.getRole().name().equals("SUPER_ADMIN")) {
            throw new RuntimeException("You can only change status of ideas for your own club's problems");
        }
        
        idea.setStatus(Idea.IdeaStatus.valueOf(status));
        idea.setUpdatedAt(Instant.now());
        
        // Set PPT file URL if provided
        if (pptFileUrl != null && !pptFileUrl.trim().isEmpty()) {
            idea.setPptFileUrl(pptFileUrl.trim());
        }
        
        Idea savedIdea = ideaRepository.save(idea);
        log.info("Updated idea status: {} to {} with PPT: {}", savedIdea.getTitle(), status, pptFileUrl);
        
        // Send notification to idea owner
        if (!savedIdea.getSubmittedBy().getId().equals(userId)) {
            notificationService.notifyIdeaStatusChanged(savedIdea.getSubmittedBy().getId(), status, savedIdea.getId());
        }
        
        // Check for achievements if idea was implemented
        if (status.equals("IMPLEMENTING") || status.equals("COMPLETED")) {
            achievementService.checkAndAwardAchievements(savedIdea.getSubmittedBy().getId());
        }
        
        return convertToDto(savedIdea);
    }
    
    public void deleteIdea(Long id, Long userId) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is the original submitter or super admin
        if (!idea.getSubmittedBy().getId().equals(userId) && !user.getRole().name().equals("SUPER_ADMIN")) {
            throw new RuntimeException("You can only delete your own ideas");
        }
        
        idea.setIsActive(false);
        idea.setUpdatedAt(Instant.now());
        ideaRepository.save(idea);
        log.info("Deactivated idea: {}", idea.getTitle());
    }
    
    private IdeaDto convertToDto(Idea idea) {
        // Calculate vote counts
        long upvotes = voteRepository.countByIdeaIdAndVoteType(idea.getId(), com.campus.EventInClubs.domain.model.Vote.VoteType.UP);
        long downvotes = voteRepository.countByIdeaIdAndVoteType(idea.getId(), com.campus.EventInClubs.domain.model.Vote.VoteType.DOWN);
        
        return IdeaDto.builder()
                .id(idea.getId())
                .title(idea.getTitle())
                .description(idea.getDescription())
                .implementationPlan(idea.getImplementationPlan())
                .expectedOutcome(idea.getExpectedOutcome())
                .pptFileUrl(idea.getPptFileUrl())
                .problemId(idea.getProblem().getId())
                .problemTitle(idea.getProblem().getTitle())
                .submittedById(idea.getSubmittedBy().getId())
                .submittedByName(idea.getSubmittedBy().getName())
                .status(idea.getStatus().name())
                .isActive(idea.getIsActive())
                .isFeatured(idea.getIsFeatured())
                .upvotes(upvotes)
                .downvotes(downvotes)
                .createdAt(idea.getCreatedAt())
                .updatedAt(idea.getUpdatedAt())
                .build();
    }
}
