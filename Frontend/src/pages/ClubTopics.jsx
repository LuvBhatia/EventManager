import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventApi } from "../api/event";
import { clubApi } from "../api/club";
import "./ClubTopics.css";

export default function ClubTopics() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState('all');
  const [expandedEvent, setExpandedEvent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsData, clubsData] = await Promise.all([
        eventApi.getEventsForClubTopics(),
        clubApi.getAllClubs()
      ]);
      
      console.log('Fetched events for club topics:', eventsData);
      setEvents(eventsData);
      setClubs(clubsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load club events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesClub = selectedClub === 'all' || 
      (event.clubId && event.clubId.toString() === selectedClub);
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.clubName && event.clubName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesClub && matchesSearch;
  });



  if (loading) {
    return (
      <div className="club-topics-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="club-topics-container">
      <div className="topics-header">
        <h1>Club Topics</h1>
        <p>Explore topics from different clubs where you can submit your ideas</p>
      </div>

      <div className="topics-filters">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search topics, clubs, or ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

  
        <div className="club-filter">
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="club-select"
          >
            <option value="all">All Clubs</option>
            {Array.from(new Set(events.map(e => e.clubId))).map(clubId => {
              const club = events.find(e => e.clubId === clubId);
              return club ? (
                <option key={clubId} value={clubId}>
                  {club.clubName}
                </option>
              ) : null;
            })}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchData}>Try Again</button>
        </div>
      )}

      <div className="topics-list">
        {filteredEvents.map((event) => (
          <div key={event.id} className="topic-card">
            <div className="topic-header">
              <div className="topic-priority">
                <span className="priority-icon">
                  {event.acceptsIdeas ? '💡' : '📅'}
                </span>
                <span className="priority-text" style={{ color: event.acceptsIdeas ? '#10b981' : '#3b82f6' }}>
                  {event.acceptsIdeas ? 'Accepting Ideas' : 'Event'}
                </span>
              </div>
              <div className="topic-category">
                {event.clubName || 'No Club'}
              </div>
            </div>

            <h3 className="topic-title">{event.title}</h3>
            <p className="topic-description">{event.description}</p>

            <div className="topic-meta">
              <div className="topic-club">
                <span className="club-icon">🏛️</span>
                <span>{event.clubName || 'No Club'}</span>
              </div>
              <div className="topic-stats">
                {event.ideaSubmissionDeadline && (
                  <span className="deadline">
                    ⏰ {new Date(event.ideaSubmissionDeadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="topic-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
              >
                {expandedEvent === event.id ? 'Hide Details' : 'View Details'}
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/events/${event.id}/ideas`)}
              >
                View Ideas
              </button>
            </div>

            {/* Event Details Section */}
            {expandedEvent === event.id && (
              <div className="event-details">
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                    {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                  </span>
                </div>
                {event.location && (
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{event.location}</span>
                  </div>
                )}
                {event.registrationDeadline && (
                  <div className="detail-row">
                    <span className="detail-label">Registration Deadline:</span>
                    <span className="detail-value">
                      {new Date(event.registrationDeadline).toLocaleString()}
                    </span>
                  </div>
                )}
                {event.acceptsIdeas && event.ideaSubmissionDeadline && (
                  <div className="detail-row">
                    <span className="detail-label">Idea Submission Deadline:</span>
                    <span className="detail-value">
                      {new Date(event.ideaSubmissionDeadline).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && filteredEvents.length === 0 && (
        <div className="no-results">
          <h3>No topics found</h3>
          <p>There are currently no topics accepting ideas. Try adjusting your search or check back later!</p>
        </div>
      )}
    </div>
  );
}
