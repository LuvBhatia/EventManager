import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clubApi } from '../api/club';
import { eventApi } from '../api/event.js';
import { ideaApi } from '../api/idea.js';
import ClubRegistrationModal from '../components/ClubRegistrationModal';
import EventManagementModal from '../components/EventManagementModal';
import './ClubAdminDashboard.css';

export default function ClubAdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [clubs, setClubs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  // Handle URL parameters for tab navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'clubs', 'proposals', 'events', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Fetch real data from APIs
  useEffect(() => {
    fetchClubs();
    fetchProposals();
    fetchEvents();
    fetchNotifications();
  }, []);

  // Set up periodic refresh to check for expired proposals
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh proposals if we're on the proposals tab
      if (activeTab === 'proposals') {
        console.log('Periodic refresh: Checking for expired proposals...');
        fetchProposals();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [activeTab]);

  // Utility function to check if a proposal is still active based on deadline
  const isProposalActive = (submissionDeadline) => {
    if (!submissionDeadline) {
      console.log('No deadline found, keeping proposal active');
      return true; // Keep proposals without deadline
    }
    
    // Handle different date formats
    let deadline;
    if (submissionDeadline instanceof Date) {
      deadline = submissionDeadline;
    } else if (typeof submissionDeadline === 'string') {
      // Try parsing the date string
      deadline = new Date(submissionDeadline);
      // If invalid, try parsing DD/MM/YYYY format
      if (isNaN(deadline.getTime()) && submissionDeadline.includes('/')) {
        const parts = submissionDeadline.split('/');
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format
          deadline = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      }
    } else {
      deadline = new Date(submissionDeadline);
    }
    
    if (isNaN(deadline.getTime())) {
      console.log(`Invalid date format: ${submissionDeadline}, keeping proposal active`);
      return true; // Keep proposals with invalid dates
    }
    
    const now = new Date();
    const gracePeriodEnd = new Date(deadline);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 1); // Add 1 day grace period
    
    const isActive = now <= gracePeriodEnd;
    
    // Debug logging
    console.log(`Checking proposal deadline: ${submissionDeadline}`);
    console.log(`Parsed deadline: ${deadline.toLocaleDateString()}`);
    console.log(`Grace period ends: ${gracePeriodEnd.toLocaleDateString()}`);
    console.log(`Current time: ${now.toLocaleDateString()}`);
    console.log(`Is active: ${isActive}`);
    
    return isActive;
  };

  const fetchClubs = async () => {
    try {
      console.log('Fetching clubs from API...');
      const clubsData = await clubApi.getAllClubs();
      console.log('Clubs fetched:', clubsData);
      
      setClubs(clubsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      // Fallback to mock data if API fails
      const mockClubs = [
        {
          id: 1,
          name: "Coding Ninjas",
          category: "Technology",
          memberCount: 45,
          eventCount: 3,
          rating: 4.5,
          description: "Programming and coding club for tech enthusiasts",
          isActive: true
        }
      ];
      setClubs(mockClubs);
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const eventsData = await eventApi.getEventsAcceptingIdeas();
      const proposalsData = eventsData.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        clubName: event.clubName,
        submissionDeadline: event.ideaSubmissionDeadline || event.submissionDeadline,
        status: 'active',
        upvotes: 0,
        ideas: []
      }));
      
      // Filter out proposals where deadline has passed (with 1 day grace period)
      console.log('All proposals before filtering:', proposalsData);
      const activeProposals = proposalsData.filter(proposal => {
        const isActive = isProposalActive(proposal.submissionDeadline);
        console.log(`Proposal "${proposal.title}" - Active: ${isActive}`);
        return isActive;
      });
      console.log('Active proposals after filtering:', activeProposals);
      
      setProposals(activeProposals || []);
      
    } catch (error) {
      console.error('Error fetching proposals:', error);
      // Fallback to mock proposals if API fails
      const mockProposals = [
        {
          id: 1,
          title: "Tech Workshop Ideas",
          description: "Submit ideas for upcoming technology workshops",
          clubName: "Coding Ninjas",
          submissionDeadline: "2024-02-15",
          status: 'active',
          upvotes: 12,
          ideas: []
        },
        {
          id: 2,
          title: "Design Challenge",
          description: "Creative design challenge for UI/UX projects",
          clubName: "Design Studio",
          submissionDeadline: "2024-02-20",
          status: 'active',
          upvotes: 8,
          ideas: []
        }
      ];
      
      // Apply same filtering logic to mock proposals
      const activeMockProposals = mockProposals.filter(proposal => 
        isProposalActive(proposal.submissionDeadline)
      );
      
      setProposals(activeMockProposals);
    }
  };

  const handleViewIdeas = (proposalId) => {
    // Navigate to the ViewIdeas page for this event/proposal
    navigate(`/events/${proposalId}/ideas`);
  };

  const fetchEvents = async () => {
    try {
      const eventsData = await eventApi.getAllEvents();
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to mock events if API fails
      const mockEvents = [
        {
          id: 1,
          title: "Tech Workshop",
          description: "Learn latest technologies",
          clubName: "Coding Ninjas",
          eventDate: "2024-02-15",
          status: 'active'
        },
        {
          id: 2,
          title: "Design Meetup",
          description: "UI/UX design discussion",
          clubName: "Design Studio", 
          eventDate: "2024-02-20",
          status: 'active'
        }
      ];
      setEvents(mockEvents);
    }
  };

  const fetchNotifications = async () => {
    // Mock data for now - replace with real API call
    setNotifications([
      { id: 1, message: 'New proposal submitted for AI Workshop', time: '2 hours ago', type: 'proposal' },
      { id: 2, message: 'Deadline approaching for Mobile App Contest', time: '1 day ago', type: 'deadline' }
    ]);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };


  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventApi.deleteEvent(eventId);
        await fetchEvents(); // Refresh events list
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleCreateTopic = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleProposeIdea = (event) => {
    // Navigate to idea proposal page with topic context
    console.log('Proposing idea for topic:', event.title);
    // Pass topic information to the idea creation system
    const topicContext = {
      eventId: event.id,
      topicTitle: event.title,
      topicDescription: event.description,
      clubName: event.clubName,
      ideaDeadline: event.ideaSubmissionDeadline
    };
    console.log('Topic context:', topicContext);
    // This will integrate with your existing Idea system
    // You can navigate to /ideas/new with topic context or open a modal
  };

  const handleEventSaved = async (savedEvent) => {
    console.log('Event saved:', savedEvent);
    await fetchEvents(); // Refresh events list immediately
  };

  const toggleDropdown = (eventId) => {
    setActiveDropdown(activeDropdown === eventId ? null : eventId);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
    setActiveDropdown(null);
  };

  const handleRemoveEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to remove this topic? This action cannot be undone.')) {
      try {
        await eventApi.deleteEvent(eventId);
        await fetchEvents(); // Refresh events list
        setActiveDropdown(null);
      } catch (error) {
        console.error('Error removing event:', error);
        alert('Failed to remove topic. Please try again.');
      }
    }
  };


  const handleRegisterClub = async (clubData) => {
    try {
      const userId = localStorage.getItem('userId') || 1; // Get current user ID
      console.log('Registering club with data:', clubData);
      
      // Format data to match ClubDto structure
      const clubPayload = {
        name: clubData.name,
        description: clubData.description,
        category: clubData.category,
        shortName: clubData.shortName,
        memberCount: parseInt(clubData.memberCount) || 0,
        eventCount: 0,
        rating: 0.0,
        isActive: false // New clubs start as inactive (pending)
      };
      
      console.log('Sending club payload:', clubPayload);
      
      const newClub = await clubApi.createClub(clubPayload, userId);
      console.log('Club created successfully:', newClub);
      
      // Refresh clubs list immediately
      await fetchClubs();
      setShowRegistrationModal(false);
      
      // Show success message
      alert('Club registered successfully! Status: Pending approval');
    } catch (error) {
      console.error('Error registering club:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to register club: ' + (error.response?.data?.error || error.message));
    }
  };

  const renderOverview = () => (
    <div className="overview-section">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            👥
          </div>
          <div className="stat-content">
            <h3>{clubs.length}</h3>
            <p>Clubs Managed</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            📅
          </div>
          <div className="stat-content">
            <h3>{events.length}</h3>
            <p>Active Events</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            📄
          </div>
          <div className="stat-content">
            <h3>{proposals.length}</h3>
            <p>Total Proposals</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            📈
          </div>
          <div className="stat-content">
            <h3>85%</h3>
            <p>Engagement Rate</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {notifications.map(notification => (
            <div key={notification.id} className="activity-item">
              <div className="activity-icon">
                {notification.type === 'proposal' ? '📄' : '🕐'}
              </div>
              <div className="activity-content">
                <p>{notification.message}</p>
                <span>{notification.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClubManagement = () => (
    <div className="club-management-section">
      <div className="section-header">
        <h2>Club Management</h2>
        <button className="btn-primary" onClick={() => setShowRegistrationModal(true)}>
          ➕
          Register New Club
        </button>
      </div>

      {loading ? (
        <div className="loading-message">Loading clubs...</div>
      ) : clubs.length === 0 ? (
        <div className="empty-state">
          <p>No clubs found. Register your first club to get started!</p>
        </div>
      ) : (
        <div className="clubs-grid">
          {clubs.map(club => (
            <div key={club.id} className="club-card">
              <div className="club-header">
                <h3>{club.name}</h3>
                <span className={`status ${club.isActive ? 'active' : 'pending'}`}>
                  {club.isActive ? 'active' : 'pending'}
                </span>
              </div>
              <div className="club-stats">
                <div className="stat">
                  <span>{club.memberCount || 0}</span>
                  <label>Members</label>
                </div>
                <div className="stat">
                  <span>{club.eventCount || 0}</span>
                  <label>Events</label>
                </div>
              </div>
              <div className="club-actions">
                <button className="btn-secondary">
                  ✏️
                  Edit
                </button>
                <button className="btn-secondary">
                  👁️
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEventManagement = () => (
    <div className="event-management-section">
      <div className="section-header">
        <h2>Topic-Based Idea Proposals</h2>
        <div className="header-controls">
          <button 
            className="btn-primary" 
            onClick={handleCreateTopic}
          >
            ➕
            Create New Topic
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No Topics Available</h3>
          <p>There are currently no topics where you can propose ideas. Check back later!</p>
        </div>
      ) : (
        <div className="events-table">
          <table>
                    <thead>
                      <tr>
                        <th>Topic</th>
                        <th>Organizing Club</th>
                        <th>Idea Submission Deadline</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(event => (
                        <tr key={event.id}>
                          <td>
                            <div className="topic-info">
                              <strong className="topic-title">{event.title}</strong>
                              {event.description && (
                                <p className="topic-description">{event.description}</p>
                              )}
                              <span className="event-type">{event.type}</span>
                            </div>
                          </td>
                          <td>
                            <div className="club-info">
                              <strong>{event.clubName}</strong>
                            </div>
                          </td>
                          <td>
                            <div className="deadline-info">
                              {event.ideaSubmissionDeadline ? (
                                <>
                                  <strong>{new Date(event.ideaSubmissionDeadline).toLocaleDateString()}</strong>
                                  <span className="deadline-time">
                                    {new Date(event.ideaSubmissionDeadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                </>
                              ) : (
                                <span className="no-deadline">No deadline</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="table-actions">
                              <div className="actions-dropdown">
                                <button 
                                  className="btn-secondary btn-sm dropdown-toggle" 
                                  onClick={() => toggleDropdown(event.id)}
                                  title="Actions"
                                >
                                  ⚙️ Actions
                                </button>
                                {activeDropdown === event.id && (
                                  <div className="dropdown-menu">
                                    <button 
                                      className="dropdown-item"
                                      onClick={() => handleEditEvent(event)}
                                    >
                                      ✏️ Edit Details
                                    </button>
                                    <button 
                                      className="dropdown-item remove"
                                      onClick={() => handleRemoveEvent(event.id)}
                                    >
                                      🗑️ Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
    </div>
  );

  const renderProposalManagement = () => (
    <div className="proposal-management-section">
      <div className="section-header">
        <h2>Proposal Management</h2>
        <div className="filters">
          <select>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <div className="proposals-grid">
        {proposals.map(proposal => (
          <div key={proposal.id} className="proposal-card">
            <div className="proposal-header">
              <div className="proposal-title-section">
                <h3>{proposal.title}</h3>
              </div>
              <span className={`status ${proposal.status}`}>
                {proposal.status}
              </span>
            </div>
            <div className="proposal-meta">
              <p>Organizing Club: {proposal.clubName}</p>
              <p>Topic Type: {proposal.type}</p>
              <p>Created: {proposal.date}</p>
              <p>Total Votes: {proposal.votes}</p>
              {proposal.submissionDeadline && (
                <div className="deadline-info">
                  <p>Submission Deadline: {new Date(proposal.submissionDeadline).toLocaleDateString()}</p>
                  {(() => {
                    const deadline = new Date(proposal.submissionDeadline);
                    const now = new Date();
                    const timeDiff = deadline.getTime() - now.getTime();
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    
                    if (daysDiff < 0) {
                      return <span className="deadline-status expired">⚠️ Expired (Grace period active)</span>;
                    } else if (daysDiff === 0) {
                      return <span className="deadline-status today">🔥 Deadline Today!</span>;
                    } else if (daysDiff === 1) {
                      return <span className="deadline-status tomorrow">⏰ Deadline Tomorrow</span>;
                    } else if (daysDiff <= 3) {
                      return <span className="deadline-status soon">📅 {daysDiff} days remaining</span>;
                    } else {
                      return <span className="deadline-status normal">📅 {daysDiff} days remaining</span>;
                    }
                  })()}
                </div>
              )}
            </div>
            {proposal.description && (
              <div className="proposal-description">
                <p>{proposal.description}</p>
              </div>
            )}
            
            <div className="proposal-actions">
              <button 
                className="btn-primary"
                onClick={() => handleViewIdeas(proposal.id)}
                title="View all submitted ideas for this topic"
              >
                👁️ View Ideas
              </button>
              <button className="btn-success">
                ✅ Approve
              </button>
              <button className="btn-danger">
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );


  const renderAnalytics = () => (
    <div className="analytics-section">
      <div className="section-header">
        <h2>Analytics & Reports</h2>
      </div>
      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Event Participation Trends</h3>
          <p>Chart placeholder - Event participation over time</p>
        </div>
        <div className="chart-card">
          <h3>Club Growth</h3>
          <p>Chart placeholder - Club membership growth</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'clubs':
        return renderClubManagement();
      case 'events':
        return renderEventManagement();
      case 'proposals':
        return renderProposalManagement();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="club-admin-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Club Admin</h2>
        </div>
        <div className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📊</span>
            <span>Overview</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'clubs' ? 'active' : ''}`}
            onClick={() => setActiveTab('clubs')}
          >
            <span className="nav-icon">🏛️</span>
            <span>My Clubs</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'proposals' ? 'active' : ''}`}
            onClick={() => setActiveTab('proposals')}
          >
            <span className="nav-icon">📝</span>
            <span>Event Proposals</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <span className="nav-icon">🎯</span>
            <span>Topics for Ideas</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="nav-icon">📈</span>
            <span>Analytics</span>
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>{
            activeTab === 'overview' ? 'Dashboard Overview' :
            activeTab === 'clubs' ? 'My Clubs' :
            activeTab === 'proposals' ? 'Event Proposals' :
            activeTab === 'events' ? 'Topics for Ideas' : 'Analytics'
          }</h1>
          <div className="header-actions">
            {activeTab === 'clubs' && (
              <button 
                className="btn-primary" 
                onClick={() => setShowRegistrationModal(true)}
              >
                <span className="btn-icon">+</span>
                Register New Club
              </button>
            )}
            {activeTab === 'events' && (
              <button 
                className="btn-primary" 
                onClick={handleCreateTopic}
              >
                <span className="btn-icon">+</span>
                Create New Topic
              </button>
            )}
          </div>
        </div>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>

      {showRegistrationModal && (
        <ClubRegistrationModal
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onSubmit={handleRegisterClub}
        />
      )}
      
      {showEventModal && (
        <EventManagementModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          event={selectedEvent}
          onEventSaved={handleEventSaved}
          clubs={clubs}
        />
      )}
    </div>
  );
}
