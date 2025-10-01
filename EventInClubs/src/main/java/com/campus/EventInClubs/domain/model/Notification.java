package com.campus.EventInClubs.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Size(max = 1000)
    @Column(length = 1000, nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private NotificationType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "related_entity_type", length = 50)
    private String relatedEntityType; // IDEA, PROBLEM, CLUB, VOTE, COMMENT

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        if (isRead && readAt == null) {
            readAt = Instant.now();
        }
    }

    public enum NotificationType {
        NEW_IDEA,           // New idea submitted to your problem
        IDEA_VOTED,         // Your idea received a vote
        IDEA_COMMENTED,     // Your idea received a comment
        IDEA_STATUS_CHANGED, // Status of your idea changed
        PROBLEM_UPDATED,    // Problem you're following was updated
        CLUB_ANNOUNCEMENT,  // Club announcement
        EVENT_ANNOUNCEMENT, // Event/Topic announcement
        ACHIEVEMENT,        // User achievement/reward
        SYSTEM             // System notifications
    }
}
