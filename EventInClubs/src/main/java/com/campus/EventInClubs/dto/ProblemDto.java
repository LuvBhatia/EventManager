package com.campus.EventInClubs.dto;

import com.campus.EventInClubs.domain.model.Problem.ProblemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemDto {
    
    private Long id;
    private String title;
    private String description;
    private String requirements;
    private String category;
    private Instant deadline;
    private String budgetRange;
    private Integer expectedParticipants;
    private ProblemStatus status;
    private Long clubId;
    private String clubName;
    private Long postedById;
    private String postedByName;
    private Integer viewCount;
    private Integer ideaCount;
    private Instant createdAt;
    private Instant updatedAt;
}
