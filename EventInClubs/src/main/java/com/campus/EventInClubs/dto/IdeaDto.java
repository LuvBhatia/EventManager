package com.campus.EventInClubs.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdeaDto {
    
    private Long id;
    private String title;
    private String description;
    private String implementationPlan;
    private String expectedOutcome;
    private String status; // SUBMITTED, UNDER_REVIEW, APPROVED, IMPLEMENTED, REJECTED
    private Long problemId;
    private String problemTitle;
    private Long submittedById;
    private String submittedByName;
    private Boolean isActive;
    private Boolean isFeatured;
    private Long upvotes;
    private Long downvotes;
    private Instant createdAt;
    private Instant updatedAt;
}
