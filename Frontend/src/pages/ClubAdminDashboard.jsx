import React, { useState, useEffect } from 'react';
import { clubApi } from '../api/club';
import { eventApi } from '../api/event.js';
import { ideaApi } from '../api/idea.js';
import ClubRegistrationModal from '../components/ClubRegistrationModal';
import EventManagementModal from '../components/EventManagementModal';
import './ClubAdminDashboard.css';

export default function ClubAdminDashboard() {
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
  const [expandedProposals, setExpandedProposals] = useState({});
  const [proposalIdeas, setProposalIdeas] = useState({});
  // Fetch real data from APIs
  useEffect(() => {
    fetchClubs();
    fetchProposals();
    fetchEvents();
    fetchNotifications();
  }, []);

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
        submissionDeadline: event.submissionDeadline,
        status: 'active',
        upvotes: 0,
        ideas: []
      }));
      
      setProposals(proposalsData || []);
      
      // Fetch ideas for each proposal
      for (const proposal of proposalsData) {
        await fetchIdeasForProposal(proposal.id);
      }
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
      setProposals(mockProposals);
    }
  };

  const fetchIdeasForProposal = async (proposalId) => {
    try {
      // Use real API to fetch ideas for the event/topic
      const ideas = await ideaApi.getIdeasByProblem(proposalId);
      
      // Sort by upvotes (highest first)
      const sortedIdeas = ideas.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      
      // Calculate total votes for the proposal
      const totalVotes = sortedIdeas.reduce((sum, idea) => sum + (idea.upvotes || 0), 0);
      
      // Update proposal votes count
      setProposals(prev => prev.map(proposal => 
        proposal.id === proposalId 
          ? { ...proposal, votes: totalVotes }
          : proposal
      ));
      
      setProposalIdeas(prev => ({
        ...prev,
        [proposalId]: sortedIdeas
      }));
    } catch (error) {
      console.error('Error fetching ideas for proposal:', error);
      // Fallback to empty array if API fails
      setProposalIdeas(prev => ({
        ...prev,
        [proposalId]: []
      }));
    }
  };

  const toggleProposal = async (proposalId) => {
    const isExpanded = expandedProposals[proposalId];
    
    setExpandedProposals(prev => ({
      ...prev,
      [proposalId]: !isExpanded
    }));

    // Fetch ideas if expanding and not already loaded
    if (!isExpanded && !proposalIdeas[proposalId]) {
      await fetchIdeasForProposal(proposalId);
    }
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
          <div key={proposal.id} className="proposal-card expandable">
            <div className="proposal-header" onClick={() => toggleProposal(proposal.id)}>
              <div className="proposal-title-section">
                <h3>{proposal.title}</h3>
                <span className="expand-icon">
                  {expandedProposals[proposal.id] ? '🔽' : '▶️'}
                </span>
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
              {proposal.ideaSubmissionDeadline && (
                <p>Idea Deadline: {new Date(proposal.ideaSubmissionDeadline).toLocaleDateString()}</p>
              )}
            </div>
            {proposal.description && (
              <div className="proposal-description">
                <p>{proposal.description}</p>
              </div>
            )}
            
            {expandedProposals[proposal.id] && (
              <div className="proposal-ideas-section">
                <div className="ideas-header">
                  <h4>💡 Student Ideas (Sorted by Upvotes)</h4>
                  <span className="ideas-count">
                    {proposalIdeas[proposal.id]?.length || 0} ideas
                  </span>
                </div>
                
                {proposalIdeas[proposal.id] ? (
                  <div className="ideas-list">
                    {proposalIdeas[proposal.id].map(idea => (
                      <div key={idea.id} className="idea-card">
                        <div className="idea-header">
                          <div className="idea-title-section">
                            <h5>{idea.title}</h5>
                            <span className={`idea-status ${idea.status.toLowerCase()}`}>
                              {idea.status}
                            </span>
                          </div>
                          <div className="idea-votes">
                            <span className="upvotes">👍 {idea.upvotes}</span>
                            <span className="downvotes">👎 {idea.downvotes}</span>
                          </div>
                        </div>
                        <p className="idea-description">{idea.description}</p>
                        <div className="idea-meta">
                          <span className="idea-author">By: {idea.submittedByName}</span>
                          <span className="idea-date">
                            {new Date(idea.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="idea-actions">
                          <button className="btn-success btn-sm">
                            ✅ Approve
                          </button>
                          <button className="btn-warning btn-sm">
                            📝 Review
                          </button>
                          <button className="btn-danger btn-sm">
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="loading-ideas">
                    <p>Loading ideas...</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="proposal-actions">
              <button className="btn-success">
                ✅
                Approve
              </button>
              <button className="btn-danger">
                ❌
                Reject
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
          <h2>Club Administration Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📊</span>
            Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'clubs' ? 'active' : ''}`}
            onClick={() => setActiveTab('clubs')}
          >
            <span className="nav-icon">👥</span>
            Club Management
          </button>
          <button
            className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <span className="nav-icon">📅</span>
            Event Management
          </button>
          <button
            className={`nav-item ${activeTab === 'proposals' ? 'active' : ''}`}
            onClick={() => setActiveTab('proposals')}
          >
            <span className="nav-icon">📄</span>
            Proposals
          </button>
          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="nav-icon">📈</span>
            Analytics
          </button>
        </nav>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Club Administration Dashboard</h1>
          <div className="header-actions">
            <div className="notification-badge">
              🔔
              {notifications.length > 0 && (
                <span className="badge">{notifications.length}</span>
              )}
            </div>
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
