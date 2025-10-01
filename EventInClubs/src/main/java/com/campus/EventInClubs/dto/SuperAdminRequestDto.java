package com.campus.EventInClubs.dto;

import com.campus.EventInClubs.domain.model.SuperAdminRequest.SuperAdminRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuperAdminRequestDto {
    private Long id;
    private String name;
    private String email;
    private SuperAdminRequestStatus status;
    private Instant requestedAt;
    private Instant approvedAt;
    private Long approvedBy;
    private String rejectionReason;
}
