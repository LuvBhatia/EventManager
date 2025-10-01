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
@Table(name = "user_achievements")
public class UserAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    private AchievementType achievementType;

    @Column(name = "achievement_level")
    @Builder.Default
    private Integer level = 1;

    @Column(name = "points_earned")
    @Builder.Default
    private Integer pointsEarned = 0;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "earned_at", nullable = false)
    @Builder.Default
    private Instant earnedAt = Instant.now();

    public enum AchievementType {
        FIRST_IDEA,         // First idea submitted
        IDEA_MASTER,        // Multiple ideas submitted (levels: 5, 10, 25, 50)
        POPULAR_IDEA,       // Idea with high votes (levels: 10, 25, 50, 100 votes)
        HELPFUL_VOTER,      // Active voter (levels: 10, 50, 100, 250 votes)
        ENGAGED_COMMENTER,  // Active commenter (levels: 5, 20, 50, 100 comments)
        PROBLEM_SOLVER,     // Ideas implemented (levels: 1, 3, 5, 10)
        COMMUNITY_BUILDER,  // High engagement across platform
        INNOVATOR,          // Creative and unique ideas
        COLLABORATOR,       // High interaction with others
        MENTOR             // Helping other users
    }
}
