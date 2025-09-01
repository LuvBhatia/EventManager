package com.campus.EventInClubs.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "problems")
public class Problem {

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
    private String description;

    @Size(max = 500)
    @Column(length = 500)
    private String requirements;

    @Size(max = 100)
    @Column(length = 100)
    private String category;

    @Column(name = "deadline")
    private Instant deadline;

    @Column(name = "budget_range")
    private String budgetRange;

    @Column(name = "expected_participants")
    private Integer expectedParticipants;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ProblemStatus status = ProblemStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by", nullable = false)
    private User postedBy;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "idea_count")
    private Integer ideaCount = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum ProblemStatus {
        OPEN,           // Accepting new ideas
        REVIEWING,      // Club reviewing submitted ideas
        IMPLEMENTING,   // Idea selected and being implemented
        COMPLETED,      // Event completed successfully
        CLOSED          // No longer accepting ideas
    }
}
