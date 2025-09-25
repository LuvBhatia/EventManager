package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.Club;
import com.campus.EventInClubs.domain.model.Event;
import com.campus.EventInClubs.domain.model.Idea;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.dto.EventDto;
import com.campus.EventInClubs.repository.ClubRepository;
import com.campus.EventInClubs.repository.EventRepository;
import com.campus.EventInClubs.repository.EventRegistrationRepository;
import com.campus.EventInClubs.repository.IdeaRepository;
import com.campus.EventInClubs.repository.UserRepository;
import com.campus.EventInClubs.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EventService {
    
    private final EventRepository eventRepository;
    private final IdeaRepository ideaRepository;
    private final VoteRepository voteRepository;
    private final NotificationService notificationService;
    private final EventCleanupService eventCleanupService;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    
    public List<EventDto> getAllEvents() {
        return eventRepository.findAll().stream()
                .filter(event -> event.getIsActive() != null && event.getIsActive()) // Only show active events
                .filter(event -> event.getStatus() != Event.EventStatus.PUBLISHED) // Hide published events from general listing
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<EventDto> getPublishedEventsForAdmin() {
        return eventRepository.findAll().stream()
                .filter(event -> event.getIsActive() == null || event.getIsActive()) // Show events that are active or have null isActive
                .filter(event -> event.getStatus() == Event.EventStatus.PUBLISHED) // Only published events
                .filter(event -> event.getStartDate() != null && event.getEndDate() != null) // Must have dates (properly approved)
                .filter(event -> event.getLocation() != null && !event.getLocation().trim().isEmpty()) // Must have location (properly approved)
                .filter(event -> event.getMaxParticipants() != null) // Must have capacity (properly approved)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<EventDto> getActiveEventsForStudents() {
        return eventRepository.findAll().stream()
                .filter(event -> event.getIsActive() != null && event.getIsActive()) // Only show active events
                .filter(event -> event.getStatus() == Event.EventStatus.PUBLISHED) // Only published events for students
                .filter(event -> event.getStartDate() != null && event.getEndDate() != null) // Must have dates
                .filter(event -> event.getLocation() != null && !event.getLocation().trim().isEmpty()) // Must have location
                .filter(event -> event.getMaxParticipants() != null) // Must have capacity
                .filter(event -> event.getStartDate().isAfter(java.time.LocalDateTime.now())) // Only future events
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<EventDto> getEventsForClubTopics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneDayAgo = now.minusDays(1); // 24 hours ago
        return eventRepository.findAll().stream()
                .filter(event -> event.getIsActive() == null || event.getIsActive()) // Show events that are active or have null isActive
                .filter(event -> event.getStatus() == Event.EventStatus.PUBLISHED) // Only published events
                .filter(event -> event.getIdeaSubmissionDeadline() != null) // Must have deadline for idea submissions
                .filter(event -> event.getIdeaSubmissionDeadline().isAfter(oneDayAgo)) // Show events until 1 day after deadline
                // Note: Removed acceptsIdeas filter - club admins should see all events with deadlines for management
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<EventDto> getEventsForClubTopicsDebug() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneDayAgo = now.minusDays(1);
        
        return eventRepository.findAll().stream()
                .filter(event -> event.getStatus() == Event.EventStatus.PUBLISHED)
                .filter(event -> event.getIdeaSubmissionDeadline() != null) // Only events with deadlines for debugging
                .map(event -> {
                    EventDto dto = convertToDto(event);
                    // Add debug info
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    public List<EventDto> getEventsByClub(Long clubId) {
        return eventRepository.findByClubId(clubId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<EventDto> getUpcomingEvents() {
        return eventRepository.findUpcomingEvents(LocalDateTime.now()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<EventDto> getOngoingEvents() {
        return eventRepository.findOngoingEvents(LocalDateTime.now()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public EventDto getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        return convertToDto(event);
    }
    
    public EventDto createEvent(EventDto eventDto, Long organizerId) {
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found with id: " + organizerId));
        
        Club club = clubRepository.findById(eventDto.getClubId())
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + eventDto.getClubId()));
        
        // Log the received deadline for debugging
        if (eventDto.getIdeaSubmissionDeadline() != null) {
            log.info("Creating event with idea submission deadline: {}", eventDto.getIdeaSubmissionDeadline());
        }
        
        Event event = Event.builder()
                .title(eventDto.getTitle())
                .description(eventDto.getDescription())
                .startDate(eventDto.getStartDate())
                .endDate(eventDto.getEndDate())
                .registrationDeadline(eventDto.getRegistrationDeadline())
                .ideaSubmissionDeadline(eventDto.getIdeaSubmissionDeadline())
                .acceptsIdeas(eventDto.getAcceptsIdeas() != null ? eventDto.getAcceptsIdeas() : true)
                .location(eventDto.getLocation())
                .maxParticipants(eventDto.getMaxParticipants())
                .currentParticipants(0)
                .registrationFee(eventDto.getRegistrationFee() != null ? eventDto.getRegistrationFee() : 0.0)
                .status(eventDto.getStatus() != null ? eventDto.getStatus() : Event.EventStatus.DRAFT)
                .type(eventDto.getType())
                .club(club)
                .organizer(organizer)
                .tags(eventDto.getTags())
                .imageUrl(eventDto.getImageUrl())
                .isActive(true)
                .build();
        
        Event savedEvent = eventRepository.save(event);
        log.info("Created new event: {} by organizer: {}", savedEvent.getTitle(), organizer.getName());
        
        // Send notification to club members
        notificationService.createNotification(
                club.getAdminUser().getId(),
                "New Event Created",
                "A new event '" + savedEvent.getTitle() + "' has been created in " + club.getName(),
                com.campus.EventInClubs.domain.model.Notification.NotificationType.EVENT_ANNOUNCEMENT,
                savedEvent.getId(),
                "EVENT"
        );
        
        return convertToDto(savedEvent);
    }
    
    public EventDto updateEvent(Long id, EventDto eventDto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        Event.EventStatus oldStatus = event.getStatus();
        
        event.setTitle(eventDto.getTitle());
        event.setDescription(eventDto.getDescription());
        event.setStartDate(eventDto.getStartDate());
        event.setEndDate(eventDto.getEndDate());
        event.setRegistrationDeadline(eventDto.getRegistrationDeadline());
        event.setIdeaSubmissionDeadline(eventDto.getIdeaSubmissionDeadline());
        event.setAcceptsIdeas(eventDto.getAcceptsIdeas());
        event.setLocation(eventDto.getLocation());
        event.setMaxParticipants(eventDto.getMaxParticipants());
        event.setRegistrationFee(eventDto.getRegistrationFee());
        event.setStatus(eventDto.getStatus());
        event.setType(eventDto.getType());
        event.setTags(eventDto.getTags());
        event.setImageUrl(eventDto.getImageUrl());
        
        Event savedEvent = eventRepository.save(event);
        log.info("Updated event: {}", savedEvent.getTitle());
        
        // Send notification if status changed to published
        if (oldStatus != Event.EventStatus.PUBLISHED && eventDto.getStatus() == Event.EventStatus.PUBLISHED) {
            notificationService.createNotification(
                    event.getClub().getAdminUser().getId(),
                    "Event Published",
                    "Event '" + savedEvent.getTitle() + "' is now open for registration!",
                    com.campus.EventInClubs.domain.model.Notification.NotificationType.EVENT_ANNOUNCEMENT,
                    savedEvent.getId(),
                    "EVENT"
            );
        }
        
        return convertToDto(savedEvent);
    }
    
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        // Send cancellation notification
        notificationService.createNotification(
                event.getClub().getAdminUser().getId(),
                "Event Cancelled",
                "Event '" + event.getTitle() + "' has been cancelled",
                com.campus.EventInClubs.domain.model.Notification.NotificationType.EVENT_ANNOUNCEMENT,
                event.getId(),
                "EVENT"
        );
        
        eventRepository.delete(event);
        log.info("Deleted event: {}", event.getTitle());
    }
    
    public EventDto publishEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        event.setStatus(Event.EventStatus.PUBLISHED);
        Event savedEvent = eventRepository.save(event);
        
        // Send notification
        notificationService.createNotification(
                event.getClub().getAdminUser().getId(),
                "Event Published",
                "Event '" + savedEvent.getTitle() + "' is now live and accepting registrations!",
                com.campus.EventInClubs.domain.model.Notification.NotificationType.EVENT_ANNOUNCEMENT,
                savedEvent.getId(),
                "EVENT"
        );
        
        log.info("Published event: {}", savedEvent.getTitle());
        return convertToDto(savedEvent);
    }
    
    public List<EventDto> searchEvents(String keyword) {
        return eventRepository.searchEvents(keyword).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Long getEventCountByClub(Long clubId) {
        return eventRepository.countByClubId(clubId);
    }
    
    public List<EventDto> getEventsAcceptingIdeas() {
        return eventRepository.findEventsAcceptingIdeas(LocalDateTime.now()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public java.util.List<java.util.Map<String, Object>> getIdeasForEvent(Long eventId) {
        // Verify event exists
        eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Fetch ideas from database and convert to map
        return ideaRepository.findByEventIdAndIsActiveTrueOrderByCreatedAtDesc(eventId).stream()
                .map(idea -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", idea.getId());
                    map.put("title", idea.getTitle());
                    map.put("description", idea.getDescription());
                    map.put("expectedOutcome", idea.getExpectedOutcome());
                    map.put("submittedBy", idea.getSubmittedBy().getName());
                    map.put("submittedByEmail", idea.getSubmittedBy().getEmail());
                    map.put("submittedById", idea.getSubmittedBy().getId());
                    map.put("submittedAt", idea.getCreatedAt().toString());
                    map.put("eventId", eventId);
                    map.put("status", idea.getStatus().name());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public java.util.Map<String, Object> submitIdeaForEvent(Long eventId, java.util.Map<String, Object> ideaData, Long userId) {
        // Verify event exists and accepts ideas
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        if (!event.getAcceptsIdeas()) {
            throw new RuntimeException("This event is not accepting ideas");
        }
        
        // Check if idea submission deadline has passed
        if (event.getIdeaSubmissionDeadline() != null && 
            LocalDateTime.now().isAfter(event.getIdeaSubmissionDeadline())) {
            throw new RuntimeException("Idea submission deadline has passed");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has already submitted 2 ideas for this event
        Long existingIdeasCount = ideaRepository.countByEventIdAndSubmittedByIdAndIsActiveTrue(eventId, userId);
        if (existingIdeasCount >= 2) {
            throw new RuntimeException("You can only submit a maximum of 2 ideas per event. You have already submitted " + existingIdeasCount + " ideas for this event.");
        }
        
        // Create and save the idea
        Idea idea = Idea.builder()
                .title((String) ideaData.get("title"))
                .description((String) ideaData.get("description"))
                .expectedOutcome((String) ideaData.get("expectedOutcome"))
                .status(Idea.IdeaStatus.SUBMITTED)
                .problem(null) // Set to null or find appropriate problem if needed
                .event(event)
                .submittedBy(user)
                .isActive(true)
                .build();
        
        Idea savedIdea = ideaRepository.save(idea);
        
        log.info("Idea submitted for event '{}' by user '{}': {}", 
                event.getTitle(), user.getName(), ideaData.get("title"));
        
        // Send notification to event organizer
        if (!event.getOrganizer().getId().equals(userId)) {
            notificationService.notifyNewEventIdea(
                event.getOrganizer().getId(), 
                (String) ideaData.get("title"), 
                eventId
            );
        }
        
        return java.util.Map.of(
            "message", "Idea submitted successfully",
            "eventId", eventId,
            "ideaId", savedIdea.getId(),
            "ideaTitle", savedIdea.getTitle(),
            "submittedBy", user.getName(),
            "submittedAt", LocalDateTime.now().toString()
        );
    }

    public java.util.Map<String, Object> getUserIdeaSubmissionStatus(Long eventId, Long userId) {
        // Verify event exists
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Count existing ideas by user for this event
        Long existingIdeasCount = ideaRepository.countByEventIdAndSubmittedByIdAndIsActiveTrue(eventId, userId);
        Long remainingSubmissions = Math.max(0, 2 - existingIdeasCount);
        
        return java.util.Map.of(
            "eventId", eventId,
            "userId", userId,
            "submittedIdeas", existingIdeasCount,
            "remainingSubmissions", remainingSubmissions,
            "maxIdeasPerEvent", 2,
            "canSubmitMore", remainingSubmissions > 0
        );
    }
    
    private EventDto convertToDto(Event event) {
        // Calculate total votes from all ideas submitted to this event
        int totalVotes = 0;
        
        // Get all ideas for this event directly from repository to avoid lazy loading issues
        List<Idea> eventIdeas = ideaRepository.findByEventIdAndIsActiveTrueOrderByCreatedAtDesc(event.getId());
        
        if (!eventIdeas.isEmpty()) {
            totalVotes = eventIdeas.stream()
                    .mapToInt(idea -> {
                        // Count both upvotes and downvotes for each idea
                        Long voteCount = voteRepository.countTotalVotesByIdeaId(idea.getId());
                        return voteCount != null ? voteCount.intValue() : 0;
                    })
                    .sum();
        }
        
        log.debug("Event {} has {} ideas with {} total votes", event.getId(), eventIdeas.size(), totalVotes);
        
        // Get actual registration count
        Long registrationCount = eventRegistrationRepository.countRegisteredByEventId(event.getId());
        int currentParticipants = registrationCount != null ? registrationCount.intValue() : 0;
        
        return EventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .registrationDeadline(event.getRegistrationDeadline())
                .ideaSubmissionDeadline(event.getIdeaSubmissionDeadline())
                .acceptsIdeas(event.getAcceptsIdeas())
                .location(event.getLocation())
                .maxParticipants(event.getMaxParticipants())
                .currentParticipants(currentParticipants)
                .registrationFee(event.getRegistrationFee())
                .status(event.getStatus())
                .type(event.getType())
                .clubId(event.getClub().getId())
                .clubName(event.getClub().getName())
                .organizerId(event.getOrganizer().getId())
                .organizerName(event.getOrganizer().getName())
                .tags(event.getTags())
                .imageUrl(event.getImageUrl())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .totalVotes(totalVotes)
                .isExpired(eventCleanupService.isEventExpired(event))
                .isViewOnly(eventCleanupService.isEventInViewOnlyMode(event))
                .build();
    }
    
    public EventDto updateEventStatus(Long eventId, String status) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));
        
        try {
            Event.EventStatus eventStatus = Event.EventStatus.valueOf(status.toUpperCase());
            event.setStatus(eventStatus);
            Event savedEvent = eventRepository.save(event);
            
            log.info("Updated event {} status to {}", eventId, status);
            return convertToDto(savedEvent);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid event status: " + status);
        }
    }
    
    @Transactional
    public EventDto approveEventProposal(Long proposalId, String eventName, String eventType, 
                                       String startDateTime, String endDateTime, String location,
                                       Integer maxParticipants, Double registrationFee, 
                                       String description,
                                       org.springframework.web.multipart.MultipartFile poster) {
        
        // Get the original proposal/event
        Event originalEvent = eventRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Event proposal not found with id: " + proposalId));
        
        try {
            // Parse date-time strings
            java.time.LocalDateTime startDate = java.time.LocalDateTime.parse(startDateTime);
            java.time.LocalDateTime endDate = java.time.LocalDateTime.parse(endDateTime);
            
            // Update the event with detailed information
            originalEvent.setTitle(eventName);
            originalEvent.setType(Event.EventType.valueOf(eventType.toUpperCase()));
            originalEvent.setStartDate(startDate);
            originalEvent.setEndDate(endDate);
            originalEvent.setLocation(location);
            originalEvent.setMaxParticipants(maxParticipants);
            originalEvent.setRegistrationFee(registrationFee);
            originalEvent.setDescription(description);
            originalEvent.setStatus(Event.EventStatus.PUBLISHED);
            originalEvent.setUpdatedAt(java.time.LocalDateTime.now());
            
            // Handle poster upload if provided
            if (poster != null && !poster.isEmpty()) {
                try {
                    String posterUrl = handlePosterUpload(poster);
                    originalEvent.setImageUrl(posterUrl);
                } catch (Exception e) {
                    log.warn("Failed to upload poster, continuing without poster: {}", e.getMessage());
                    // Continue without poster - don't fail the entire approval
                }
            }
            
            Event savedEvent = eventRepository.save(originalEvent);
            
            // Send notification to club admin about the approved event
            notificationService.createNotification(
                originalEvent.getClub().getAdminUser().getId(),
                "Event Approved",
                String.format("Event '%s' has been approved and is now live!", eventName),
                com.campus.EventInClubs.domain.model.Notification.NotificationType.SYSTEM,
                originalEvent.getId(),
                "EVENT"
            );
            
            log.info("Approved and updated event proposal: {} -> {}", proposalId, eventName);
            return convertToDto(savedEvent);
            
        } catch (java.time.format.DateTimeParseException e) {
            throw new RuntimeException("Invalid date-time format. Please use ISO format (YYYY-MM-DDTHH:MM)");
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid event type: " + eventType);
        } catch (Exception e) {
            log.error("Error approving event proposal: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to approve event proposal: " + e.getMessage());
        }
    }
    
    private String handlePosterUpload(org.springframework.web.multipart.MultipartFile poster) {
        try {
            // Create uploads directory in the project root
            String uploadDir = System.getProperty("user.dir") + "/uploads/posters/";
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = poster.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = java.util.UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            java.nio.file.Path filePath = uploadPath.resolve(uniqueFilename);
            poster.transferTo(filePath.toFile());
            
            // Return relative URL
            return "/uploads/posters/" + uniqueFilename;
            
        } catch (Exception e) {
            log.error("Error uploading poster: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload poster: " + e.getMessage());
        }
    }
    
    @Transactional
    public void deleteApprovedEvents() {
        // Mark all events with PUBLISHED status as inactive instead of deleting
        List<Event> publishedEvents = eventRepository.findAll().stream()
                .filter(event -> event.getStatus() == Event.EventStatus.PUBLISHED)
                .collect(java.util.stream.Collectors.toList());
        
        for (Event event : publishedEvents) {
            log.info("Marking approved event as inactive: {} (ID: {})", event.getTitle(), event.getId());
            event.setIsActive(false);
            event.setStatus(Event.EventStatus.CANCELLED);
            eventRepository.save(event);
        }
        
        log.info("Marked {} approved events as inactive", publishedEvents.size());
    }
}
