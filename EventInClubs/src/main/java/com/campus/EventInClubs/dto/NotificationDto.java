package com.campus.EventInClubs.dto;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Long userId;
    private Long relatedEntityId;
    private String relatedEntityType;
    private Boolean isRead;
    private Instant readAt;
    private Instant createdAt;
    private Instant updatedAt;
}
