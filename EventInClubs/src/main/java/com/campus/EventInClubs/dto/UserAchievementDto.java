package com.campus.EventInClubs.dto;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAchievementDto {
    private Long id;
    private Long userId;
    private String achievementType;
    private Integer level;
    private Integer pointsEarned;
    private String description;
    private String title;
    private Instant earnedAt;
}
