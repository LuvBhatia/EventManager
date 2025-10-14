import React, { useState, useEffect } from 'react';
import { eventApi } from '../api/event';
import { hallApi } from '../api/hall';
import './EventManagementModal.css';

export default function EventManagementModal({ 
  isOpen, 
  onClose, 
  event = null, 
  onEventSaved,
  clubs = [] 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    ideaSubmissionDeadline: '',
    acceptsIdeas: true,
    location: '',
    maxParticipants: '',
    registrationFee: '0',
    type: 'WORKSHOP',
    clubId: '',
    tags: '',
    imageUrl: '',
    externalLink: '',
    status: 'DRAFT',
    hallId: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [halls, setHalls] = useState([]);

  const eventTypes = [
    'WORKSHOP', 'SEMINAR', 'COMPETITION', 'HACKATHON', 
    'CONFERENCE', 'NETWORKING', 'SOCIAL', 'SPORTS', 
    'CULTURAL', 'TECHNICAL', 'OTHER'
  ];

  const eventStatuses = [
    'DRAFT', 'PUBLISHED', 'REGISTRATION_CLOSED', 
    'ONGOING', 'COMPLETED', 'CANCELLED'
  ];


  // Fetch halls on component mount
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const hallsData = await hallApi.getAllHalls();
        setHalls(hallsData || []);
      } catch (error) {
        console.error('Error fetching halls:', error);
      }
    };
    fetchHalls();
  }, []);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : '',
        ideaSubmissionDeadline: event.ideaSubmissionDeadline ? new Date(event.ideaSubmissionDeadline).toISOString().slice(0, 16) : '',
        acceptsIdeas: event.acceptsIdeas !== undefined ? event.acceptsIdeas : true,
        location: event.location || '',
        maxParticipants: event.maxParticipants?.toString() || '',
        registrationFee: event.registrationFee?.toString() || '0',
        type: event.type || 'WORKSHOP',
        clubId: event.clubId?.toString() || '',
        tags: event.tags || '',
        imageUrl: event.imageUrl || '',
        externalLink: event.externalLink || '',
        status: event.status || 'DRAFT',
        hallId: event.hallId?.toString() || ''
      });
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        ideaSubmissionDeadline: '',
        acceptsIdeas: true,
        location: '',
        maxParticipants: '',
        registrationFee: '0',
        type: 'WORKSHOP',
        clubId: clubs.length > 0 ? clubs[0].id.toString() : '',
        tags: '',
        imageUrl: '',
        externalLink: '',
        status: 'DRAFT',
        hallId: ''
      });
    }
    setErrors({});
  }, [event, clubs, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation for deadline
    if (name === 'ideaSubmissionDeadline' && value) {
      const selectedDateTime = new Date(value);
      const currentDateTime = new Date();
      
      if (selectedDateTime <= currentDateTime) {
        setErrors(prev => ({
          ...prev,
          ideaSubmissionDeadline: 'Deadline must be in the future'
        }));
      }
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Topic title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Topic description is required';
    }

    if (!formData.clubId) {
      newErrors.clubId = 'Club selection is required';
    }

    // If acceptsIdeas is true, validate deadline
    if (formData.acceptsIdeas && formData.ideaSubmissionDeadline) {
      const selectedDateTime = new Date(formData.ideaSubmissionDeadline);
      const currentDateTime = new Date();
      
      if (selectedDateTime <= currentDateTime) {
        newErrors.ideaSubmissionDeadline = 'Deadline must be in the future';
      }
    }

    // If acceptsIdeas is false, validate event details
    if (!formData.acceptsIdeas) {
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      }
      if (formData.startDate && formData.endDate) {
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
      }
      if (!formData.maxParticipants || formData.maxParticipants <= 0) {
        newErrors.maxParticipants = 'Max participants is required';
      }
      if (!formData.hallId) {
        newErrors.hallId = 'Hall selection is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required fields before sending
      if (!formData.title || !formData.title.trim()) {
        setErrors({ title: 'Title is required' });
        return;
      }
      
      if (!formData.clubId) {
        setErrors({ clubId: 'Club selection is required' });
        return;
      }

      let imageUrl = formData.imageUrl;

      const eventData = {
        title: formData.title.trim(),
        description: formData.description ? formData.description.trim() : null,
        type: formData.type || 'WORKSHOP',
        clubId: parseInt(formData.clubId),
        startDate: formData.acceptsIdeas ? null : formData.startDate,
        endDate: formData.acceptsIdeas ? null : formData.endDate,
        registrationDeadline: null,
        location: formData.acceptsIdeas ? null : formData.location,
        maxParticipants: formData.acceptsIdeas ? null : (formData.maxParticipants ? parseInt(formData.maxParticipants) : null),
        registrationFee: 0.0,
        ideaSubmissionDeadline: formData.acceptsIdeas ? (formData.ideaSubmissionDeadline || null) : null,
        acceptsIdeas: formData.acceptsIdeas,
        // Backend will set status based on acceptsIdeas:
        // - Direct events (acceptsIdeas=false): APPROVED and auto-approved
        // - Idea events (acceptsIdeas=true): PUBLISHED
        status: null,
        tags: null,
        imageUrl: imageUrl,
        hallId: formData.acceptsIdeas ? null : (formData.hallId ? parseInt(formData.hallId) : null)
      };

      console.log('Sending event data:', eventData);

      let savedEvent;
      if (event) {
        savedEvent = await eventApi.updateEvent(event.id, eventData);
      } else {
        savedEvent = await eventApi.createEvent(eventData);
      }

      onEventSaved(savedEvent);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      setErrors({ submit: 'Failed to save event. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    return new Date(dateTimeString).toLocaleString();
  };

  // Get current datetime in datetime-local format (YYYY-MM-DDTHH:MM)
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content event-modal">
        <div className="modal-header">
          <h2>{event ? 'Edit Topic' : 'Create New Topic'}</h2>
          <div className="header-actions">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="btn-preview"
            >
              {showPreview ? '👁️‍🗨️' : '👁️'}
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={onClose} className="modal-close">
              ✕
            </button>
          </div>
        </div>

        {showPreview ? (
          <div className="event-preview">
            <div className="preview-header">
              <h3>{formData.title || 'Event Title'}</h3>
              <span className={`status ${formData.status.toLowerCase()}`}>
                {formData.status}
              </span>
            </div>
            
            <div className="preview-details">
              <div className="detail-item">
                📅
                <span>
                  {formData.startDate ? formatDateTime(formData.startDate) : 'Start date not set'}
                  {formData.endDate && ` - ${formatDateTime(formData.endDate)}`}
                </span>
              </div>
              
              <div className="detail-item">
📍
                <span>{formData.location || 'Location not set'}</span>
              </div>
              
              {formData.maxParticipants && (
                <div className="detail-item">
                  👥
                  <span>Max {formData.maxParticipants} participants</span>
                </div>
              )}
              
              {formData.registrationFee > 0 && (
                <div className="detail-item">
                  💰
                  <span>${formData.registrationFee}</span>
                </div>
              )}
              
              {formData.registrationDeadline && (
                <div className="detail-item">
                  🕒
                  <span>Register by {formatDateTime(formData.registrationDeadline)}</span>
                </div>
              )}
              
              {formData.acceptsIdeas && (
                <div className="detail-item">
                  🏷️
                  <span>
                    Accepts Ideas
                    {formData.ideaSubmissionDeadline && ` until ${formatDateTime(formData.ideaSubmissionDeadline)}`}
                  </span>
                </div>
              )}
            </div>
            
            {formData.description && (
              <div className="preview-description">
                <h4>Description</h4>
                <p>{formData.description}</p>
              </div>
            )}
            
            {formData.tags && (
              <div className="preview-tags">
                <h4>Tags</h4>
                <div className="tag-list">
                  {formData.tags.split(',').map((tag, index) => (
                    <span key={index} className="tag">{tag.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="event-form">
            {errors.submit && (
              <div className="error-message">
                {errors.submit}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Topic Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={errors.title ? 'error' : ''}
                  placeholder="Enter topic title (e.g., AI Workshop Ideas, Hackathon Themes)"
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="type">Event Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Topic Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe what kind of ideas you're looking for. Be specific about the topic scope, goals, and any requirements..."
              />
              <small className="help-text">This helps students understand what types of ideas to propose</small>
            </div>


            <div className="form-group">
              <label htmlFor="clubId">Organizing Club *</label>
              <select
                id="clubId"
                name="clubId"
                value={formData.clubId}
                onChange={handleInputChange}
                className={errors.clubId ? 'error' : ''}
              >
                <option value="">Select a club</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
              {errors.clubId && <span className="error-text">{errors.clubId}</span>}
            </div>



            {/* Toggle for Open/Not Open for Ideas */}
            <div className="form-group toggle-section">
              <label className="toggle-label">
                <span className="toggle-title">Event Type</span>
              </label>
              <div className="toggle-options">
                <label className={`toggle-option ${formData.acceptsIdeas ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="acceptsIdeas"
                    checked={formData.acceptsIdeas}
                    onChange={() => setFormData(prev => ({ ...prev, acceptsIdeas: true }))}
                  />
                  <span className="toggle-icon">💡</span>
                  <span className="toggle-text">
                    <strong>Open for Ideas</strong>
                    <small>Collect idea submissions from students</small>
                  </span>
                </label>
                <label className={`toggle-option ${!formData.acceptsIdeas ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="acceptsIdeas"
                    checked={!formData.acceptsIdeas}
                    onChange={() => setFormData(prev => ({ ...prev, acceptsIdeas: false }))}
                  />
                  <span className="toggle-icon">🎪</span>
                  <span className="toggle-text">
                    <strong>Direct Event</strong>
                    <small>Create event without idea submissions</small>
                  </span>
                </label>
              </div>
            </div>

            {/* Conditional Fields Based on Toggle */}
            {formData.acceptsIdeas ? (
              // Show idea submission deadline for "Open for Ideas"
              <div className="form-group">
                <label htmlFor="ideaSubmissionDeadline">Idea Submission Deadline</label>
                <input
                  type="datetime-local"
                  id="ideaSubmissionDeadline"
                  name="ideaSubmissionDeadline"
                  value={formData.ideaSubmissionDeadline}
                  min={getCurrentDateTime()}
                  onChange={handleInputChange}
                  className={errors.ideaSubmissionDeadline ? 'error' : ''}
                />
                {errors.ideaSubmissionDeadline && <span className="error-text">{errors.ideaSubmissionDeadline}</span>}
                <small className="help-text">Leave empty for no deadline. Only future dates and times are allowed.</small>
              </div>
            ) : (
              // Show event details for "Not Open for Ideas"
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startDate">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      min={getCurrentDateTime()}
                      onChange={handleInputChange}
                      className={errors.startDate ? 'error' : ''}
                    />
                    {errors.startDate && <span className="error-text">{errors.startDate}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="endDate">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      min={formData.startDate || getCurrentDateTime()}
                      onChange={handleInputChange}
                      className={errors.endDate ? 'error' : ''}
                    />
                    {errors.endDate && <span className="error-text">{errors.endDate}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="maxParticipants">Max Participants *</label>
                    <input
                      type="number"
                      id="maxParticipants"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="Enter maximum number of participants"
                      className={errors.maxParticipants ? 'error' : ''}
                    />
                    {errors.maxParticipants && <span className="error-text">{errors.maxParticipants}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="hallId">Hall *</label>
                    <select
                      id="hallId"
                      name="hallId"
                      value={formData.hallId}
                      onChange={handleInputChange}
                      className={errors.hallId ? 'error' : ''}
                    >
                      <option value="">Select a hall</option>
                      {halls.map(hall => (
                        <option key={hall.id} value={hall.id}>
                          {hall.name} (Capacity: {hall.capacity})
                        </option>
                      ))}
                    </select>
                    {errors.hallId && <span className="error-text">{errors.hallId}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter event location (optional)"
                  />
                  <small className="help-text">Additional location details if needed</small>
                </div>
              </>
            )}


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
                💾
                {isSubmitting ? 'Saving...' : (event ? 'Update Topic' : 'Create Topic')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
