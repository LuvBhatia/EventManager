import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ClubAdminDashboard.css';
import ClubRegistrationModal from '../components/ClubRegistrationModal';
import EventManagementModal from '../components/EventManagementModal';
import EventApprovalModal from '../components/EventApprovalModal';
import RejectedEventsPanel from '../components/RejectedEventsPanel';
import { clubApi } from '../api/club';
import { eventApi } from '../api/event.js';

export default function ClubAdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [clubs, setClubs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  // Handle URL parameters for tab navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'clubs', 'proposals', 'events', 'active-events', 'rejected-events', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Fetch real data from APIs
  useEffect(() => {
    fetchClubs();
    fetchProposals();
    fetchEvents();
    fetchActiveEvents();
    fetchNotifications();
  }, []);
  
  // Fetch rejected events after clubs are loaded
  useEffect(() => {
    if (clubs.length > 0) {
      console.log('Clubs loaded, fetching rejected events for clubs:', clubs);
      fetchRejectedEvents(clubs);
    }
  }, [clubs]);

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
      // Fetch events that accept ideas for proposals section
      const response = await fetch('http://localhost:8080/api/events/club-topics');
      const eventsData = await response.json();
      const proposalsData = eventsData.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        clubName: event.clubName,
        type: event.type || 'WORKSHOP', // Add event type
        date: event.createdAt ? new Date(event.createdAt).toLocaleDateString() : new Date().toLocaleDateString(), // Add creation date
        votes: event.totalVotes || 0, // Add total votes (from ideas)
        submissionDeadline: event.ideaSubmissionDeadline || event.submissionDeadline,
        status: event.status, // Event status (DRAFT, PENDING_APPROVAL, APPROVED, etc.)
        approvalStatus: event.approvalStatus, // Approval status (PENDING, APPROVED, REJECTED)
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
          type: "WORKSHOP",
          date: new Date().toLocaleDateString(),
          votes: 12,
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
          type: "COMPETITION",
          date: new Date().toLocaleDateString(),
          votes: 8,
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

  const handleApproveProposal = (proposal) => {
    setSelectedProposal(proposal);
    setShowApprovalModal(true);
  };

  const handleRejectProposal = async (proposalId) => {
    if (window.confirm('Are you sure you want to reject this proposal?')) {
      try {
        // Call API to reject the proposal
        await eventApi.updateEventStatus(proposalId, 'REJECTED');
        console.log('Proposal rejected:', proposalId);
        
        // Refresh proposals list
        await fetchProposals();
        
        // Show success message
        alert('Proposal rejected successfully');
      } catch (error) {
        console.error('Error rejecting proposal:', error);
        alert('Failed to reject proposal. Please try again.');
      }
    }
  };

  const handleEventApproval = async (eventData) => {
    try {
      // Call API to approve and create the full event
      const approvedEvent = await eventApi.approveEventProposal(eventData);
      console.log('Event approved and created:', approvedEvent);
      
      // Refresh proposals, events, and active events lists
      await fetchProposals();
      await fetchEvents();
      await fetchActiveEvents();
      
      // Show success message
      alert('Event approved and created successfully!');
    } catch (error) {
      console.error('Error approving event:', error);
      throw error; // Re-throw to be handled by the modal
    }
  };

  const fetchEvents = async () => {
    try {
      // Fetch events that accept ideas for the Topics for Ideas section
      const response = await fetch('http://localhost:8080/api/events/club-topics');
      const eventsData = await response.json();
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

  const fetchRejectedEvents = async (userClubs) => {
    try {
      console.log('=== Fetching Rejected Events ===');
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('No userId found');
        return;
      }
      
      if (!userClubs || userClubs.length === 0) {
        console.log('No clubs provided to filter');
        return;
      }
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Fetching all rejected events...');
      
      // Fetch ALL rejected events
      const response = await fetch('http://localhost:8080/api/events/rejected', {
        headers: headers
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const allRejectedEvents = await response.json();
        
        // Filter to show only events from clubs the user manages
        const userClubIds = userClubs.map(club => club.id);
        const userRejectedEvents = allRejectedEvents.filter(event => 
          userClubIds.includes(event.clubId)
        );
        
        console.log('All rejected events:', allRejectedEvents);
        console.log('User club IDs:', userClubIds);
        console.log('User rejected events:', userRejectedEvents);
        
        setRejectedEvents(userRejectedEvents);
      } else {
        console.error('Failed to fetch rejected events');
      }
    } catch (error) {
      console.error('Error fetching rejected events:', error);
      setRejectedEvents([]);
    }
  };

  const fetchActiveEvents = async () => {
    try {
      // Fetch published events for admin dashboard
      const response = await fetch('http://localhost:8080/api/events/admin/published');
      const activeEventsData = await response.json();
      setActiveEvents(activeEventsData || []);
    } catch (error) {
      console.error('Error fetching active events:', error);
      // Fallback to mock active events if API fails
      const mockActiveEvents = [
        {
          id: 1,
          title: "Tech Workshop 2024",
          description: "Learn latest technologies and frameworks",
          clubName: "Coding Ninjas",
          clubId: 1,
          type: "WORKSHOP",
          startDate: "2024-03-15T10:00",
          endDate: "2024-03-15T17:00",
          location: "Tech Hub, Room 101",
          maxParticipants: 50,
          currentParticipants: 25,
          registrationFee: 500,
          imageUrl: "/uploads/posters/tech-workshop.jpg",
          status: 'PUBLISHED',
          createdAt: "2024-02-01T10:00",
          updatedAt: "2024-02-10T15:30"
        },
        {
          id: 2,
          title: "Design Hackathon",
          description: "24-hour design challenge for creative minds",
          clubName: "Design Studio",
          clubId: 2,
          type: "HACKATHON",
          startDate: "2024-03-20T18:00",
          endDate: "2024-03-21T18:00",
          location: "Innovation Center",
          maxParticipants: 100,
          currentParticipants: 75,
          registrationFee: 0,
          imageUrl: "/uploads/posters/design-hackathon.jpg",
          status: 'PUBLISHED',
          createdAt: "2024-02-05T14:00",
          updatedAt: "2024-02-15T09:20"
        }
      ];
      setActiveEvents(mockActiveEvents);
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
    await fetchActiveEvents(); // Also refresh active events
  };

  const handleViewEventDetails = (event) => {
    // Create a detailed view modal or navigate to event details page
    alert(`Event Details:\n\nTitle: ${event.title}\nType: ${event.type}\nClub: ${event.clubName}\nStart: ${event.startDate ? new Date(event.startDate).toLocaleString() : 'Not set'}\nEnd: ${event.endDate ? new Date(event.endDate).toLocaleString() : 'Not set'}\nLocation: ${event.location || 'Not specified'}\nCapacity: ${event.maxParticipants || 'Unlimited'}\nFee: ${event.registrationFee === 0 ? 'Free' : `₹${event.registrationFee}`}`);
  };

  const handleViewRegistrations = async (eventId) => {
    try {
      // Fetch registrations for this event
      const response = await fetch(`http://localhost:8080/api/event-registrations/event/${eventId}`);
      if (response.ok) {
        const registrations = await response.json();
        
        // Create a detailed view of registrations
        let registrationDetails = `Event Registrations:\n\n`;
        registrationDetails += `Total Registrations: ${registrations.length}\n\n`;
        
        if (registrations.length === 0) {
          registrationDetails += 'No registrations yet.';
        } else {
          registrations.forEach((reg, index) => {
            registrationDetails += `${index + 1}. ${reg.userName} (${reg.userEmail})\n`;
            registrationDetails += `   Status: ${reg.status}\n`;
            registrationDetails += `   Registered: ${new Date(reg.registeredAt).toLocaleString()}\n`;
            if (reg.registrationNotes) {
              registrationDetails += `   Notes: ${reg.registrationNotes}\n`;
            }
            registrationDetails += `   Payment: ${reg.paymentStatus}\n\n`;
          });
        }
        
        alert(registrationDetails);
      } else {
        throw new Error('Failed to fetch registrations');
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      alert('Failed to load registrations. Please try again.');
    }
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
            <h3>{activeEvents.length}</h3>
            <p>Active Events</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            💡
          </div>
          <div className="stat-content">
            <h3>{events.length}</h3>
            <p>Topics for Ideas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            📄
          </div>
          <div className="stat-content">
            <h3>{proposals.length}</h3>
            <p>Event Proposals</p>
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
        
        {rejectedEvents.length > 0 && (
          <div className="stat-card rejected-stat" onClick={() => setActiveTab('rejected-events')} style={{cursor: 'pointer'}}>
            <div className="stat-icon">
              ❌
            </div>
            <div className="stat-content">
              <h3>{rejectedEvents.length}</h3>
              <p>Rejected Events</p>
            </div>
          </div>
        )}
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
              <span className={`status ${proposal.status === 'PUBLISHED' && proposal.approvalStatus === 'APPROVED' ? 'APPROVED' : proposal.status}`}>
                {proposal.status === 'PUBLISHED' && proposal.approvalStatus === 'APPROVED' ? 'APPROVED' : proposal.status}
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
              {proposal.description && (
                <p className="proposal-description"><strong>Description:</strong> {proposal.description}</p>
              )}
            </div>
            
            <div className="proposal-actions">
              <button 
                className="btn-primary"
                onClick={() => handleViewIdeas(proposal.id)}
                title="View all submitted ideas for this topic"
              >
                👁️ View Ideas
              </button>
              
              {/* Show status badge if event is in approval workflow */}
              {proposal.status === 'PENDING_APPROVAL' && (
                <span className="status-badge pending" title="Waiting for Super Admin approval">
                  ⏳ Pending Approval
                </span>
              )}
              {proposal.status === 'APPROVED' && (
                <span className="status-badge approved" title="Approved by Super Admin">
                  ✅ Approved
                </span>
              )}
              {proposal.status === 'REJECTED' && (
                <span className="status-badge rejected" title="Rejected by Super Admin">
                  ❌ Rejected
                </span>
              )}
              {/* Only show Approved badge if status is PUBLISHED AND approvalStatus is APPROVED */}
              {proposal.status === 'PUBLISHED' && proposal.approvalStatus === 'APPROVED' && (
                <span className="status-badge approved" title="Approved by Super Admin">
                  ✅ Approved
                </span>
              )}
              
              {/* Only show Approve and Reject buttons if NOT approved by super admin and NOT pending approval */}
              {proposal.approvalStatus !== 'APPROVED' && proposal.status !== 'PENDING_APPROVAL' && (
                <>
                  <button 
                    className="btn-success"
                    onClick={() => handleApproveProposal(proposal)}
                  >
                    ✅ Approve
                  </button>
                  
                  <button 
                    className="btn-danger"
                    onClick={() => handleRejectProposal(proposal.id)}
                  >
                    ❌ Reject
                  </button>
                </>
              )}
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

  const renderRejectedEvents = () => {
    return (
      <div className="rejected-events-section">
        {rejectedEvents.length === 0 ? (
          <div className="no-events">
            <h3>No rejected events</h3>
            <p>All your submitted events are either approved or pending review.</p>
          </div>
        ) : (
          <div className="events-list">
            {rejectedEvents.map(event => (
              <div key={event.id} className="rejected-event-card">
                <div className="event-header">
                  <div className="event-title-section">
                    <h3>{event.title}</h3>
                    <span className="event-type">{event.type}</span>
                  </div>
                  <div className="rejection-date">
                    Rejected on {event.approvalDate ? new Date(event.approvalDate).toLocaleString() : 'N/A'}
                  </div>
                </div>

                <div className="event-details">
                  <div className="detail-row">
                    <span className="label">Club:</span>
                    <span className="value">{event.clubName}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Date & Time:</span>
                    <span className="value">
                      {event.startDate ? new Date(event.startDate).toLocaleString() : 'N/A'} - {event.endDate ? new Date(event.endDate).toLocaleString() : 'N/A'}
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
                </div>

                <div className="rejection-reason">
                  <h4>Rejection Reason:</h4>
                  <div className="reason-text">
                    {event.rejectionReason}
                  </div>
                  <div className="rejected-by">
                    - {event.approvedByName || 'Super Admin'}
                  </div>
                </div>

                <div className="event-actions">
                  <button 
                    className="edit-resubmit-button"
                    onClick={() => {
                      // TODO: Implement edit and resubmit functionality
                      alert('Edit & Resubmit functionality coming soon!\n\nYou will be able to:\n1. Edit event details\n2. Update based on feedback\n3. Resubmit for approval');
                    }}
                  >
                    Edit & Resubmit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderActiveEvents = () => (
    <div className="active-events-section">
      <div className="section-header">
        <h2>Active Events</h2>
        <p>Manage your published events with full details</p>
      </div>
      
      {loading ? (
        <div className="loading-state">Loading active events...</div>
      ) : activeEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎪</div>
          <h3>No Active Events</h3>
          <p>Approved events will appear here with full details</p>
        </div>
      ) : (
        <div className="active-events-grid">
          {activeEvents.map(event => (
            <div key={event.id} className="active-event-card">
              <div className="event-header">
                {event.imageUrl && (
                  <div className="event-poster">
                    <img src={event.imageUrl} alt={event.title} />
                  </div>
                )}
                <div className="event-title-section">
                  <h3>{event.title}</h3>
                  <span className={`event-type ${event.type?.toLowerCase()}`}>
                    {event.type}
                  </span>
                </div>
              </div>
              
              <div className="event-details">
                <div className="detail-row">
                  <span className="detail-label">🏛️ Club:</span>
                  <span className="detail-value">{event.clubName}</span>
                </div>
                
                {event.startDate && (
                  <div className="detail-row">
                    <span className="detail-label">📅 Start:</span>
                    <span className="detail-value">
                      {new Date(event.startDate).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {event.endDate && (
                  <div className="detail-row">
                    <span className="detail-label">🏁 End:</span>
                    <span className="detail-value">
                      {new Date(event.endDate).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {event.location && (
                  <div className="detail-row">
                    <span className="detail-label">📍 Location:</span>
                    <span className="detail-value">{event.location}</span>
                  </div>
                )}
                
                {event.maxParticipants && (
                  <div className="detail-row">
                    <span className="detail-label">👥 Capacity:</span>
                    <span className="detail-value">
                      {event.currentParticipants || 0} / {event.maxParticipants}
                    </span>
                  </div>
                )}
                
                {event.registrationFee !== undefined && (
                  <div className="detail-row">
                    <span className="detail-label">💰 Fee:</span>
                    <span className="detail-value">
                      {event.registrationFee === 0 ? 'Free' : `₹${event.registrationFee}`}
                    </span>
                  </div>
                )}
                
              </div>
              
              {event.description && (
                <div className="event-description">
                  <h4>Description</h4>
                  <p>{event.description}</p>
                </div>
              )}
              
              <div className="event-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleEditEvent(event)}
                  title="Edit event information"
                >
                  ✏️ Edit Event
                </button>
                <button 
                  className="btn-info"
                  onClick={() => handleViewRegistrations(event.id)}
                  title="View and manage event registrations"
                >
                  📋 Registrations ({event.currentParticipants || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
      case 'active-events':
        return renderActiveEvents();
      case 'rejected-events':
        return renderRejectedEvents();
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
            className={`nav-item ${activeTab === 'active-events' ? 'active' : ''}`}
            onClick={() => setActiveTab('active-events')}
          >
            <span className="nav-icon">🎪</span>
            <span>Active Events</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'rejected-events' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected-events')}
          >
            <span className="nav-icon">❌</span>
            <span>Rejected Events</span>
            {rejectedEvents.length > 0 && (
              <span className="badge">{rejectedEvents.length}</span>
            )}
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
            activeTab === 'events' ? 'Topics for Ideas' :
            activeTab === 'active-events' ? 'Active Events' :
            activeTab === 'rejected-events' ? 'Rejected Events' : 'Analytics'
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

      {showApprovalModal && (
        <EventApprovalModal
          proposal={selectedProposal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedProposal(null);
          }}
          onApprove={handleEventApproval}
        />
      )}
    </div>
  );
}
