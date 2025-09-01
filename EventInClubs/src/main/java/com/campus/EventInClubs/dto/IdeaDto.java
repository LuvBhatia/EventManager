package com.campus.EventInClubs.dto;

import com.campus.EventInClubs.domain.model.Idea.IdeaStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdeaDto {
    
    private Long id;
    private String title;
    private String description;
    private String implementation;
    private String resources;
    private Double estimatedCost;
    private String estimatedDuration;
    private String expectedOutcome;
    private IdeaStatus status;
    private Long problemId;
    private String problemTitle;
    private Long submittedById;
    private String submittedByName;
    private Integer voteCount;
    private Integer commentCount;
    private Boolean isFeatured;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Additional fields for enhanced display
    private Long upvotes;
    private Long downvotes;
    private Boolean userVote; // true for upvote, false for downvote, null for no vote
}
