package com.campus.EventInClubs.dto;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubMembershipDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long clubId;
    private String clubName;
    private String role;
    private String status;
    private Instant joinedAt;
    private Instant leftAt;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
