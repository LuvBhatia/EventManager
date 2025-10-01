package com.campus.EventInClubs.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemDto {
    
    private Long id;
    private String title;
    private String description;
    private String category;
    private String priority; // HIGH, MEDIUM, LOW
    private Long clubId;
    private String clubName;
    private Long postedById;
    private String postedByName;
    private Boolean isActive;
    private Instant deadline;
    private Boolean isExpired;
    private Boolean isViewOnly; // deadline passed but not yet removed
    private Instant createdAt;
    private Instant updatedAt;
}
