package com.campus.EventInClubs.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Event title is required")
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "start_date", nullable = true)
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "registration_deadline")
    private LocalDateTime registrationDeadline;
    
    @Column(name = "idea_submission_deadline")
    private LocalDateTime ideaSubmissionDeadline;
    
    @Column(name = "accepts_ideas")
    @Builder.Default
    private Boolean acceptsIdeas = true;
    
    @Column(nullable = true)
    private String location;
    
    @Column(name = "max_participants")
    private Integer maxParticipants;
    
    @Column(name = "current_participants")
    @Builder.Default
    private Integer currentParticipants = 0;
    
    @Column(name = "registration_fee")
    @Builder.Default
    private Double registrationFee = 0.0;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EventType type = EventType.WORKSHOP;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EventRegistration> registrations;
    
    @Column(name = "tags")
    private String tags; // Comma-separated tags
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "external_link")
    private String externalLink;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum EventStatus {
        DRAFT,          // Event is being planned
        PUBLISHED,      // Event is published and accepting registrations
        REGISTRATION_CLOSED, // Registration deadline passed
        ONGOING,        // Event is currently happening
        COMPLETED,      // Event finished successfully
        CANCELLED       // Event was cancelled
    }
    
    public enum EventType {
        WORKSHOP,
        SEMINAR,
        COMPETITION,
        HACKATHON,
        CONFERENCE,
        NETWORKING,
        SOCIAL,
        SPORTS,
        CULTURAL,
        TECHNICAL,
        OTHER
    }
}
