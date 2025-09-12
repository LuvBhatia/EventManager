package com.campus.EventInClubs.service;

import com.campus.EventInClubs.domain.model.Club;
import com.campus.EventInClubs.domain.model.Event;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.dto.EventDto;
import com.campus.EventInClubs.repository.ClubRepository;
import com.campus.EventInClubs.repository.EventRepository;
import com.campus.EventInClubs.repository.UserRepository;
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
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    public List<EventDto> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::convertToDto)
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
                .externalLink(eventDto.getExternalLink())
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
        event.setExternalLink(eventDto.getExternalLink());
        
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
    
    // In-memory storage for ideas (in a real app, this would be a database table)
    private final java.util.Map<Long, java.util.List<java.util.Map<String, Object>>> eventIdeas = new java.util.concurrent.ConcurrentHashMap<>();
    
    public java.util.List<java.util.Map<String, Object>> getIdeasForEvent(Long eventId) {
        // Verify event exists
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        return eventIdeas.getOrDefault(eventId, new java.util.ArrayList<>());
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
        
        // Create idea object with all details
        java.util.Map<String, Object> idea = new java.util.HashMap<>();
        idea.put("id", System.currentTimeMillis()); // Simple ID generation
        idea.put("title", ideaData.get("title"));
        idea.put("description", ideaData.get("description"));
        idea.put("expectedOutcome", ideaData.get("expectedOutcome"));
        idea.put("submittedBy", user.getName());
        idea.put("submittedByEmail", user.getEmail());
        idea.put("submittedById", userId);
        idea.put("submittedAt", LocalDateTime.now().toString());
        idea.put("eventId", eventId);
        
        // Store the idea
        eventIdeas.computeIfAbsent(eventId, k -> new java.util.ArrayList<>()).add(idea);
        
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
            "ideaTitle", ideaData.get("title"),
            "submittedBy", user.getName(),
            "submittedAt", LocalDateTime.now().toString()
        );
    }

    private EventDto convertToDto(Event event) {
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
                .currentParticipants(event.getCurrentParticipants())
                .registrationFee(event.getRegistrationFee())
                .status(event.getStatus())
                .type(event.getType())
                .clubId(event.getClub().getId())
                .clubName(event.getClub().getName())
                .organizerId(event.getOrganizer().getId())
                .organizerName(event.getOrganizer().getName())
                .tags(event.getTags())
                .imageUrl(event.getImageUrl())
                .externalLink(event.getExternalLink())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
}
