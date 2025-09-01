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
@Table(name = "ideas")
public class Idea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Size(max = 2000)
    @Column(length = 2000, nullable = false)
    private String description;

    @Size(max = 1000)
    @Column(length = 1000)
    private String implementation;

    @Size(max = 500)
    @Column(length = 500)
    private String resources;

    @Column(name = "estimated_cost")
    private Double estimatedCost;

    @Column(name = "estimated_duration")
    private String estimatedDuration;

    @Column(name = "expected_outcome")
    private String expectedOutcome;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private IdeaStatus status = IdeaStatus.SUBMITTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by", nullable = false)
    private User submittedBy;

    @Column(name = "vote_count")
    private Integer voteCount = 0;

    @Column(name = "comment_count")
    private Integer commentCount = 0;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum IdeaStatus {
        SUBMITTED,      // Just submitted, awaiting review
        UNDER_REVIEW,   // Club is reviewing the idea
        APPROVED,       // Idea approved by club
        IMPLEMENTING,   // Idea selected for implementation
        COMPLETED,      // Idea successfully implemented
        REJECTED        // Idea not selected
    }
}
