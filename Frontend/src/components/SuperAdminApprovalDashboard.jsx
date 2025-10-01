import React, { useState, useEffect } from 'react';
import { eventApi } from '../api/event';
import './SuperAdminApprovalDashboard.css';

const SuperAdminApprovalDashboard = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const events = await eventApi.getPendingEventsForApproval();
      setPendingEvents(events);
    } catch (error) {
      console.error('Error fetching pending events:', error);
      setPendingEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    setProcessing(true);
    try {
      // Get superAdminId from localStorage or context
      const superAdminId = localStorage.getItem('userId') || 1;
      
      await eventApi.approveEvent(eventId, superAdminId);
      
      // Remove approved event from pending list
      setPendingEvents(prev => prev.filter(event => event.id !== eventId));
      alert('Event approved successfully! The event is now visible to students.');
    } catch (error) {
      console.error('Error approving event:', error);
      alert(`Failed to approve event: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectClick = (event) => {
    setSelectedEvent(event);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      // Get superAdminId from localStorage or context
      const superAdminId = localStorage.getItem('userId') || 1;
      
      await eventApi.rejectEvent(selectedEvent.id, superAdminId, rejectionReason);
      
      // Remove rejected event from pending list
      setPendingEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setShowRejectModal(false);
      setSelectedEvent(null);
      setRejectionReason('');
      alert('Event rejected successfully! The Club Admin will be notified.');
    } catch (error) {
      console.error('Error rejecting event:', error);
      alert(`Failed to reject event: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not specified';
    return new Date(dateTime).toLocaleString();
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="approval-dashboard">
        <div className="loading">Loading pending events...</div>
      </div>
    );
  }

  return (
    <div className="approval-dashboard">
      <div className="dashboard-header">
        <h1>Event Approval Dashboard</h1>
        <p>Review and approve/reject events submitted by Club Admins</p>
      </div>

      {pendingEvents.length === 0 ? (
        <div className="no-events">
          <h3>No events pending approval</h3>
          <p>All submitted events have been processed.</p>
        </div>
      ) : (
        <div className="events-grid">
          {pendingEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <h3>{event.title}</h3>
                <span className="event-type">{event.type}</span>
              </div>

              <div className="event-details">
                <div className="detail-row">
                  <span className="label">Club:</span>
                  <span className="value">{event.clubName}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Organizer:</span>
                  <span className="value">{event.organizerName}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Date & Time:</span>
                  <span className="value">
                    {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="label">Participants:</span>
                  <span className="value">{event.maxParticipants}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Registration Fee:</span>
                  <span className="value">₹{event.registrationFee || 0}</span>
                </div>

                {event.hallName && (
                  <div className="detail-row">
                    <span className="label">Hall:</span>
                    <span className="value">{event.hallName} (Capacity: {event.hallCapacity})</span>
                  </div>
                )}

                {event.description && (
                  <div className="detail-row">
                    <span className="label">Description:</span>
                    <span className="value description">{event.description}</span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="label">Submitted:</span>
                  <span className="value">{formatDateTime(event.submittedForApprovalDate)}</span>
                </div>
              </div>

              <div className="event-actions">
                <button 
                  className="approve-button"
                  onClick={() => handleApprove(event.id)}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Approve'}
                </button>
                <button 
                  className="reject-button"
                  onClick={() => handleRejectClick(event)}
                  disabled={processing}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content reject-modal">
            <div className="modal-header">
              <h3>Reject Event: {selectedEvent?.title}</h3>
              <button 
                className="close-button" 
                onClick={() => setShowRejectModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <label htmlFor="rejectionReason">Rejection Reason *</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejection..."
                rows="4"
                required
              />
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowRejectModal(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className="confirm-reject-button"
                onClick={handleRejectConfirm}
                disabled={processing || !rejectionReason.trim()}
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminApprovalDashboard;
