package com.campus.EventInClubs.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDto {
    private Long id;
    private String content;
    private Long ideaId;
    private String ideaTitle;
    private Long userId;
    private String userName;
    private Long parentCommentId;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
