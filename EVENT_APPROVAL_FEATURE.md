# Event Approval Feature

## Overview
This feature allows club admins to approve event proposals with detailed information including event scheduling, registration details, and poster uploads.

## How It Works

### Frontend Components

#### EventApprovalModal
- **Location**: `/Frontend/src/components/EventApprovalModal.jsx`
- **Purpose**: Detailed form for approving event proposals
- **Features**:
  - Event name and type selection
  - Start/end date and time pickers
  - Location and participant limits
  - Registration fee and external links
  - Event description editing
  - Poster upload with preview
  - Form validation and error handling

### Backend Implementation

#### New API Endpoints

1. **PUT `/api/events/{eventId}/status`**
   - Updates event status (APPROVED/REJECTED)
   - Used for simple rejection

2. **POST `/api/events/approve-proposal`**
   - Comprehensive event approval with detailed information
   - Handles file upload for posters
   - Updates event with all scheduling and registration details

#### Service Methods

1. **EventService.updateEventStatus()**
   - Simple status update for rejections

2. **EventService.approveEventProposal()**
   - Complete event approval with detailed information
   - File upload handling for posters
   - Notification creation for club admin

### User Flow

1. **Club Admin views Event Proposals**
   - Sees list of pending event proposals
   - Each proposal shows basic information (title, description, club, votes)

2. **Clicking "Approve" Button**
   - Opens EventApprovalModal with proposal details pre-filled
   - Admin can modify/add event details:
     - Event name (editable)
     - Event type (WORKSHOP, HACKATHON, etc.)
     - Start and end dates/times
     - Location and capacity
     - Registration fee and link
     - Event description
     - Event poster upload

3. **Form Validation**
   - Required fields: name, type, start/end dates and times
   - Date validation: end must be after start, dates must be in future
   - File validation: image files only, max 5MB
   - URL validation for registration links

4. **Approval Process**
   - Form data sent to backend via FormData (supports file upload)
   - Backend updates original event with detailed information
   - Event status changed to PUBLISHED
   - Poster saved to `/uploads/posters/` directory
   - Notification sent to club admin
   - Event appears in active events list

5. **Rejection Process**
   - Simple confirmation dialog
   - Event status updated to REJECTED
   - Event removed from proposals list

### File Upload Configuration

- **Max file size**: 10MB
- **Supported formats**: JPEG, PNG, GIF
- **Storage location**: `/uploads/posters/`
- **URL serving**: Static files served at `/uploads/**`

### Database Changes

No schema changes required - uses existing Event model fields:
- `title`, `type`, `startDate`, `endDate`
- `location`, `maxParticipants`, `registrationFee`
- `externalLink`, `description`, `imageUrl`
- `status` (updated to PUBLISHED/REJECTED)

### Configuration Files

1. **WebConfig.java**: Static file serving configuration
2. **application.properties**: File upload size limits
3. **EventApprovalModal.css**: Comprehensive styling with responsive design

### Features

✅ **Complete Event Details**: All event information in one form
✅ **File Upload**: Poster upload with preview
✅ **Form Validation**: Client and server-side validation
✅ **Responsive Design**: Works on mobile and desktop
✅ **Error Handling**: Comprehensive error messages
✅ **Notifications**: Admin notified when event approved
✅ **File Management**: Automatic file storage and serving
✅ **Status Management**: Clear approval/rejection workflow

### Testing

To test the feature:

1. Create an event proposal (topic for ideas)
2. Go to Club Admin Dashboard → Event Proposals
3. Click "Approve" on any proposal
4. Fill out the detailed event information
5. Upload a poster (optional)
6. Submit the form
7. Verify event appears in events list with all details
8. Check notification is sent to club admin

### Error Scenarios Handled

- Invalid file types/sizes
- Past dates selected
- Invalid URLs
- Network errors during upload
- Server validation errors
- File upload failures

The feature provides a complete workflow for transforming simple event proposals into fully detailed, published events ready for registration and participation.
