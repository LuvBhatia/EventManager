package com.campus.EventInClubs.dto;

import com.campus.EventInClubs.domain.model.EventRegistration;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRegistrationDto {
    
    private Long id;
    private Long eventId;
    private String eventTitle;
    private Long userId;
    private String userName;
    private String userEmail;
    private EventRegistration.RegistrationStatus status;
    private String registrationNotes;
    private EventRegistration.PaymentStatus paymentStatus;
    private LocalDateTime registeredAt;
    
    // Event details for user's registration view
    private String eventDescription;
    private LocalDateTime eventStartDate;
    private LocalDateTime eventEndDate;
    private String eventLocation;
    private Double registrationFee;
}
