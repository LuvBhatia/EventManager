import React, { useState, useEffect } from 'react';
import './StudentEventsDashboard.css';

const StudentEventsDashboard = () => {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApprovedEvents();
  }, []);

  const fetchApprovedEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events/approved-for-students', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const events = await response.json();
        setApprovedEvents(events);
      } else {
        console.error('Failed to fetch approved events');
      }
    } catch (error) {
      console.error('Error fetching approved events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      // This would integrate with your existing registration system
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Registration successful!');
        // Refresh events to update participant count
        fetchApprovedEvents();
      } else {
        const error = await response.json();
        alert(`Registration failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Registration failed. Please try again.');
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

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;

    if (endDate < now) return 'completed';
    if (startDate <= now && endDate >= now) return 'ongoing';
    if (registrationDeadline && registrationDeadline < now) return 'registration-closed';
    if (event.currentParticipants >= event.maxParticipants) return 'full';
    return 'open';
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed': return { text: 'Completed', class: 'status-completed' };
      case 'ongoing': return { text: 'Ongoing', class: 'status-ongoing' };
      case 'registration-closed': return { text: 'Registration Closed', class: 'status-closed' };
      case 'full': return { text: 'Full', class: 'status-full' };
      case 'open': return { text: 'Open for Registration', class: 'status-open' };
      default: return { text: 'Unknown', class: 'status-unknown' };
    }
  };

  const filteredEvents = approvedEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const status = getEventStatus(event);
    
    switch (filter) {
      case 'open':
        return status === 'open';
      case 'ongoing':
        return status === 'ongoing';
      case 'upcoming':
        return ['open', 'registration-closed', 'full'].includes(status);
      case 'completed':
        return status === 'completed';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading">Loading approved events...</div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Active Events</h1>
        <p>Discover and register for approved events from various clubs</p>
      </div>

      <div className="dashboard-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search events by title, club, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Events
          </button>
          <button 
            className={filter === 'open' ? 'active' : ''}
            onClick={() => setFilter('open')}
          >
            Open for Registration
          </button>
          <button 
            className={filter === 'upcoming' ? 'active' : ''}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={filter === 'ongoing' ? 'active' : ''}
            onClick={() => setFilter('ongoing')}
          >
            Ongoing
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="no-events">
          <h3>No events found</h3>
          <p>
            {searchTerm ? 
              `No events match your search "${searchTerm}"` : 
              `No ${filter === 'all' ? '' : filter + ' '}events available at the moment`
            }
          </p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => {
            const status = getEventStatus(event);
            const statusDisplay = getStatusDisplay(status);
            
            return (
              <div key={event.id} className="event-card">
                {event.imageUrl && (
                  <div className="event-image">
                    <img src={event.imageUrl} alt={event.title} />
                  </div>
                )}

                <div className="event-content">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <div className="event-meta">
                      <span className="event-type">{event.type}</span>
                      <span className={`event-status ${statusDisplay.class}`}>
                        {statusDisplay.text}
                      </span>
                    </div>
                  </div>

                  <div className="event-details">
                    <div className="detail-item">
                      <span className="icon">🏢</span>
                      <span>{event.clubName}</span>
                    </div>

                    <div className="detail-item">
                      <span className="icon">📅</span>
                      <span>{formatDateTime(event.startDate)}</span>
                    </div>

                    <div className="detail-item">
                      <span className="icon">⏰</span>
                      <span>Until {formatDateTime(event.endDate)}</span>
                    </div>

                    {event.hallName && (
                      <div className="detail-item">
                        <span className="icon">🏛️</span>
                        <span>{event.hallName}</span>
                      </div>
                    )}

                    <div className="detail-item">
                      <span className="icon">👥</span>
                      <span>{event.currentParticipants || 0} / {event.maxParticipants} participants</span>
                    </div>

                    {event.registrationFee > 0 && (
                      <div className="detail-item">
                        <span className="icon">💰</span>
                        <span>₹{event.registrationFee}</span>
                      </div>
                    )}

                    {event.registrationDeadline && (
                      <div className="detail-item">
                        <span className="icon">⏳</span>
                        <span>Register by {formatDateTime(event.registrationDeadline)}</span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <div className="event-description">
                      <p>{event.description}</p>
                    </div>
                  )}

                  <div className="event-actions">
                    {status === 'open' && (
                      <button 
                        className="register-button"
                        onClick={() => handleRegister(event.id)}
                      >
                        Register Now
                      </button>
                    )}
                    
                    <button className="details-button">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentEventsDashboard;
