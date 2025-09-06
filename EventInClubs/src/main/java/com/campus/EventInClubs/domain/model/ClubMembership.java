package com.campus.EventInClubs.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "club_memberships", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "club_id"})
})
public class ClubMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private MembershipRole role = MembershipRole.MEMBER;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private MembershipStatus status = MembershipStatus.ACTIVE;

    @Column(name = "joined_at", nullable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();

    @Column(name = "left_at")
    private Instant leftAt;

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
        if (!isActive && leftAt == null) {
            leftAt = Instant.now();
        }
    }

    public enum MembershipRole {
        MEMBER,         // Regular club member
        MODERATOR,      // Can moderate discussions
        ADMIN,          // Can manage club settings
        OWNER          // Full control over club
    }

    public enum MembershipStatus {
        ACTIVE,         // Active member
        INACTIVE,       // Temporarily inactive
        SUSPENDED,      // Suspended from club
        BANNED         // Permanently banned
    }
}
