import React, { useState } from 'react';
import './EventApprovalModal.css';

const EventApprovalModal = ({ proposal, onClose, onApprove }) => {
  const [formData, setFormData] = useState({
    eventName: proposal?.title || '',
    eventType: proposal?.type || 'WORKSHOP',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    registrationFee: 0,
    description: proposal?.description || '',
    poster: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posterPreview, setPosterPreview] = useState(null);

  const eventTypes = [
    'WORKSHOP',
    'SEMINAR', 
    'HACKATHON',
    'COMPETITION',
    'CONFERENCE',
    'MEETUP',
    'WEBINAR',
    'CULTURAL',
    'SPORTS',
    'OTHER'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          poster: 'Please select a valid image file (JPEG, PNG, GIF)'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          poster: 'File size must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        poster: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      setErrors(prev => ({
        ...prev,
        poster: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.eventName.trim()) {
      newErrors.eventName = 'Event name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    // Validate date logic
    if (formData.startDate && formData.endDate) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime || '00:00'}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime || '23:59'}`);
      
      if (startDateTime >= endDateTime) {
        newErrors.endDate = 'End date/time must be after start date/time';
      }

      // Check if dates are in the future
      const now = new Date();
      if (startDateTime <= now) {
        newErrors.startDate = 'Start date/time must be in the future';
      }
    }


    if (formData.maxParticipants && (isNaN(formData.maxParticipants) || formData.maxParticipants <= 0)) {
      newErrors.maxParticipants = 'Please enter a valid number of participants';
    }

    if (formData.registrationFee && (isNaN(formData.registrationFee) || formData.registrationFee < 0)) {
      newErrors.registrationFee = 'Please enter a valid registration fee';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare event data
      const eventData = {
        ...formData,
        proposalId: proposal.id,
        startDateTime: `${formData.startDate}T${formData.startTime}`,
        endDateTime: `${formData.endDate}T${formData.endTime}`,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        registrationFee: parseFloat(formData.registrationFee) || 0
      };

      await onApprove(eventData);
      onClose();
    } catch (error) {
      console.error('Error approving event:', error);
      setErrors({ submit: 'Failed to approve event. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!proposal) return null;

  return (
    <div className="modal-overlay">
      <div className="event-approval-modal">
        <div className="modal-header">
          <h2>Approve Event Proposal</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="proposal-info">
            <h3>Original Proposal: "{proposal.title}"</h3>
            <p className="proposal-description">{proposal.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="event-approval-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="eventName">Event Name *</label>
                <input
                  type="text"
                  id="eventName"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  className={errors.eventName ? 'error' : ''}
                  placeholder="Enter event name"
                />
                {errors.eventName && <span className="error-text">{errors.eventName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="eventType">Event Type *</label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className={errors.eventType ? 'error' : ''}
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.eventType && <span className="error-text">{errors.eventType}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={errors.startDate ? 'error' : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.startDate && <span className="error-text">{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="startTime">Start Time *</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className={errors.startTime ? 'error' : ''}
                />
                {errors.startTime && <span className="error-text">{errors.startTime}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={errors.endDate ? 'error' : ''}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
                {errors.endDate && <span className="error-text">{errors.endDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endTime">End Time *</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className={errors.endTime ? 'error' : ''}
                />
                {errors.endTime && <span className="error-text">{errors.endTime}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Event location"
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxParticipants">Max Participants</label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  className={errors.maxParticipants ? 'error' : ''}
                  placeholder="Maximum participants"
                  min="1"
                />
                {errors.maxParticipants && <span className="error-text">{errors.maxParticipants}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="registrationFee">Registration Fee (₹)</label>
                <input
                  type="number"
                  id="registrationFee"
                  name="registrationFee"
                  value={formData.registrationFee}
                  onChange={handleInputChange}
                  className={errors.registrationFee ? 'error' : ''}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {errors.registrationFee && <span className="error-text">{errors.registrationFee}</span>}
              </div>

            </div>

            <div className="form-group">
              <label htmlFor="description">Event Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Detailed event description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="poster">Event Poster</label>
              <input
                type="file"
                id="poster"
                name="poster"
                onChange={handleFileChange}
                accept="image/*"
                className={errors.poster ? 'error' : ''}
              />
              {errors.poster && <span className="error-text">{errors.poster}</span>}
              <small className="help-text">Upload event poster (JPEG, PNG, GIF - Max 5MB)</small>
              
              {posterPreview && (
                <div className="poster-preview">
                  <img src={posterPreview} alt="Poster preview" />
                </div>
              )}
            </div>

            {errors.submit && <div className="error-text">{errors.submit}</div>}

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Approving...' : 'Approve Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventApprovalModal;
