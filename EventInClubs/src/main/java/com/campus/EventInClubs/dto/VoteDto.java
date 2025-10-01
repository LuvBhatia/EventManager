package com.campus.EventInClubs.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteDto {
    private Long id;
    private Long ideaId;
    private String ideaTitle;
    private Long userId;
    private String userName;
    private String voteType; // UPVOTE, DOWNVOTE
    private Instant createdAt;
    private Instant updatedAt;
}
