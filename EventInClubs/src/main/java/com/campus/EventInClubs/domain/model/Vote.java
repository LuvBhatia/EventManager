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
@Table(name = "votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "idea_id"})
})
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idea_id", nullable = false)
    private Idea idea;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    private VoteType voteType;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public enum VoteType {
        UP,     // Upvote - positive feedback
        DOWN    // Downvote - negative feedback
    }
}
