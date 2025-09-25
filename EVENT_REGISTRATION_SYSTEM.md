# Event Registration Tracking System

## Overview
The Event Registration System provides comprehensive tracking and management of user registrations for events. This system is designed specifically for club admins to monitor and manage event participation while keeping registration links private from the admin interface.

## Key Features Implemented

### 🎯 **Club Admin Interface Changes**
- **Registration Link Display**: Changed from clickable link to plain text display
- **Removed View Details**: Eliminated redundant "View Details" button
- **Registration Counter**: Shows live registration count in button text
- **Streamlined Actions**: Clean two-button layout (Edit Event + Registrations)

### 📊 **Registration Tracking**
- **Real-time Count**: Displays current registrations vs. maximum capacity
- **Detailed Registration View**: Shows complete registration information
- **Status Tracking**: Monitors registration, waitlist, and cancellation status
- **Payment Tracking**: Tracks payment status for paid events

## Technical Implementation

### 🗄️ **Database Schema**

#### **EventRegistration Entity**
```java
@Entity
@Table(name = "event_registrations")
public class EventRegistration {
    private Long id;
    private Event event;
    private User user;
    private RegistrationStatus status; // REGISTERED, WAITLISTED, CANCELLED, ATTENDED, NO_SHOW
    private String registrationNotes;
    private PaymentStatus paymentStatus; // PENDING, PAID, REFUNDED, NOT_REQUIRED
    private LocalDateTime registeredAt;
}
```

#### **Registration Status Enum**
- `REGISTERED`: Active registration
- `WAITLISTED`: On waiting list (when capacity full)
- `CANCELLED`: User cancelled registration
- `ATTENDED`: Marked as attended by admin
- `NO_SHOW`: Registered but didn't attend

#### **Payment Status Enum**
- `PENDING`: Payment required but not completed
- `PAID`: Payment completed
- `REFUNDED`: Payment refunded
- `NOT_REQUIRED`: Free event, no payment needed

### 🔧 **Backend Services**

#### **EventRegistrationRepository**
```java
// Key methods for registration tracking
Long countRegisteredByEventId(Long eventId);
List<EventRegistration> findByEventIdOrderByRegisteredAtDesc(Long eventId);
boolean existsByEventIdAndUserIdAndStatus(Long eventId, Long userId, RegistrationStatus status);
```

#### **EventRegistrationService**
```java
// Core registration management
EventRegistrationDto registerForEvent(Long eventId, Long userId, String notes);
List<EventRegistrationDto> getEventRegistrations(Long eventId);
Long getRegistrationCount(Long eventId);
EventRegistrationDto updateRegistrationStatus(Long registrationId, RegistrationStatus newStatus);
void cancelRegistration(Long eventId, Long userId);
```

#### **EventRegistrationController**
```java
// REST API endpoints
POST /api/event-registrations/register
GET /api/event-registrations/event/{eventId}
GET /api/event-registrations/user/{userId}
GET /api/event-registrations/event/{eventId}/count
PUT /api/event-registrations/{registrationId}/status
DELETE /api/event-registrations/cancel
```

### 🎨 **Frontend Updates**

#### **Active Events Display Changes**
```javascript
// Registration link as text (not clickable for admins)
{event.externalLink && (
  <div className="detail-row">
    <span className="detail-label">🔗 Registration Link:</span>
    <span className="detail-value">{event.externalLink}</span>
  </div>
)}

// Registration button with live count
<button 
  className="btn-info"
  onClick={() => handleViewRegistrations(event.id)}
  title="View and manage event registrations"
>
  📋 Registrations ({event.currentParticipants || 0})
</button>
```

#### **Registration Management**
```javascript
const handleViewRegistrations = async (eventId) => {
  // Fetches and displays detailed registration information
  // Shows: Name, Email, Status, Registration Date, Notes, Payment Status
};
```

## Registration Workflow

### 📝 **For Students (Registration Process)**
1. **View Event**: Students see events with clickable registration links
2. **External Registration**: Click registration link → redirected to external form
3. **Backend Tracking**: Registration recorded via API when completed
4. **Confirmation**: User receives notification of successful registration
5. **Status Updates**: Admin can update registration status as needed

### 👨‍💼 **For Club Admins (Management Process)**
1. **View Active Events**: See all published events with registration counts
2. **Monitor Registrations**: Click "📋 Registrations (X)" to view details
3. **Registration Details**: See complete list with:
   - Participant name and email
   - Registration status and date
   - Payment status
   - Any registration notes
4. **Status Management**: Update registration status (attended, no-show, etc.)
5. **Capacity Tracking**: Monitor current vs. maximum participants

## Registration Data Tracking

### 📈 **Metrics Available**
- **Total Registrations**: Count of all registered users
- **Waitlist Count**: Number of users on waiting list
- **Attendance Tracking**: Who attended vs. registered
- **Payment Status**: Financial tracking for paid events
- **Registration Timeline**: When users registered

### 📊 **Registration Display Format**
```
Event Registrations:

Total Registrations: 25

1. John Doe (john@example.com)
   Status: REGISTERED
   Registered: 2024-03-10 14:30:00
   Payment: PAID

2. Jane Smith (jane@example.com)
   Status: WAITLISTED
   Registered: 2024-03-10 15:45:00
   Notes: Dietary restrictions - vegetarian
   Payment: PENDING
```

## Capacity Management

### 🎯 **Automatic Waitlisting**
- When event reaches maximum capacity
- New registrations automatically waitlisted
- Admin can promote waitlisted users to registered
- Notifications sent for status changes

### 📧 **Notification System**
- **User Notifications**: Registration confirmation, status updates
- **Admin Notifications**: New registrations, cancellations
- **Automatic Alerts**: Capacity reached, payment pending

## Security & Privacy

### 🔒 **Access Control**
- **Club Admins**: Can view registrations for their events only
- **Students**: Can only see their own registration status
- **Registration Links**: Visible to students, text-only for admins

### 🛡️ **Data Protection**
- User email and personal information protected
- Registration notes kept confidential
- Payment status tracking secure

## API Integration

### 🔌 **External Registration Systems**
The system supports integration with external registration platforms:
- **Webhook Support**: Receive registration data from external forms
- **API Endpoints**: Allow external systems to create registrations
- **Data Synchronization**: Keep internal tracking in sync

### 📱 **Mobile Compatibility**
- Responsive design for mobile admin interface
- Touch-friendly registration management
- Optimized for various screen sizes

## Future Enhancements

### 🚀 **Planned Features**
1. **Registration Analytics**: Charts and graphs for registration trends
2. **Bulk Operations**: Mass status updates, bulk communications
3. **Export Functionality**: CSV/Excel export of registration data
4. **QR Code Check-in**: Generate QR codes for event check-in
5. **Automated Reminders**: Email reminders before events
6. **Registration Forms**: Built-in registration form builder
7. **Payment Integration**: Direct payment processing
8. **Certificate Generation**: Automatic attendance certificates

### 📊 **Advanced Analytics**
- Registration conversion rates
- Peak registration times
- User engagement patterns
- Event popularity metrics

The Event Registration System provides club admins with powerful tools to track and manage event participation while maintaining a clean, professional interface that separates administrative functions from student-facing features.
