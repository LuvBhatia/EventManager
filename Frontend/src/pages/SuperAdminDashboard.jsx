import React, { useState, useEffect } from 'react';
import { clubApi } from '../api/club';
import { eventApi } from '../api/event.js';
import { userApi } from '../api/user';
import { analyticsApi } from '../api/analytics';
import './SuperAdminDashboard.css';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [pendingClubs, setPendingClubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchClubs(),
        fetchEvents(),
        fetchPendingClubs(),
        fetchUsers(),
        fetchAnalytics()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const clubsData = await clubApi.getAllClubs();
      setClubs(clubsData || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setClubs([]);
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsData = await eventApi.getEventsAcceptingIdeas();
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  const fetchPendingClubs = async () => {
    try {
      const response = await clubApi.getPendingClubs();
      setPendingClubs(response);
    } catch (error) {
      console.error('Error fetching pending clubs:', error);
      setPendingClubs([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await userApi.getAllUsers();
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await analyticsApi.getSystemAnalytics();
      setAnalytics(analyticsData || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({});
    }
  };

  const handleApprove = async (clubId) => {
    try {
      await clubApi.approveClub(clubId);
      setPendingClubs(prev => prev.filter(club => club.id !== clubId));
      console.log('Approved club:', clubId);
      // Refresh data to update counts
      fetchAllData();
    } catch (error) {
      console.error('Error approving club:', error);
      alert('Failed to approve club. Please try again.');
    }
  };

  const handleReject = async (clubId) => {
    try {
      await clubApi.rejectClub(clubId);
      setPendingClubs(prev => prev.filter(club => club.id !== clubId));
      console.log('Rejected club:', clubId);
      // Refresh data to update counts
      fetchAllData();
    } catch (error) {
      console.error('Error rejecting club:', error);
      alert('Failed to reject club. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    window.location.href = '/login';
  };

  const renderOverview = () => (
    <div className="overview-section">
      <h2>Super Admin Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>{clubs.length}</h3>
            <p>Active Clubs</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{pendingClubs.length}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{events.length}</h3>
            <p>Active Events</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">📄</div>
            <div className="activity-content">
              <p>New club registration: Coding Ninjas CUIET</p>
              <span>2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">✅</div>
            <div className="activity-content">
              <p>Club approved: Tech Innovation Club</p>
              <span>1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClubApprovals = () => (
    <div className="club-approvals-section">
      <div className="section-header">
        <h2>Club Approval Requests</h2>
        <span className="pending-count">{pendingClubs.length} pending</span>
      </div>

      {pendingClubs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>No Pending Approvals</h3>
          <p>All club registration requests have been processed.</p>
        </div>
      ) : (
        <div className="pending-clubs-grid">
          {pendingClubs.map(club => (
            <div key={club.id} className="pending-club-card">
              <div className="club-header">
                <h3>{club.name}</h3>
                <span className="club-category">{club.category}</span>
              </div>
              
              <div className="club-details">
                <span className="club-name">{club.name}</span>
                <span className="club-category">{club.category}</span>
                <span className="club-admin">Admin: {club.adminUserName || 'Unknown'}</span>
                <span className="club-date">Submitted: {new Date(club.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="club-description">
                <p>{club.description}</p>
              </div>
              
              <div className="approval-actions">
                <button 
                  className="btn-success"
                  onClick={() => handleApprove(club.id)}
                >
                  ✅ Approve
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => handleReject(club.id)}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSystemManagement = () => (
    <div className="system-management-section">
      <h2>System Management</h2>
      
      <div className="management-grid">
        <div className="management-card">
          <h3>🏢 All Clubs</h3>
          <p>{clubs.length} active clubs</p>
          <div className="clubs-list">
            {clubs.slice(0, 5).map(club => (
              <div key={club.id} className="club-item">
                <span>{club.name}</span>
                <span className={`status ${club.isActive ? 'active' : 'inactive'}`}>
                  {club.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="management-card">
          <h3>👥 User Management</h3>
          <p>{users.length} total users</p>
          <div className="users-list">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="user-item">
                <span>{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="management-card">
          <h3>📊 Analytics</h3>
          <div className="analytics-stats">
            <div className="stat-row">
              <span>Active Events:</span>
              <span>{analytics.activeEvents || 0}</span>
            </div>
            <div className="stat-row">
              <span>Club Admins:</span>
              <span>{analytics.clubAdmins || 0}</span>
            </div>
            <div className="stat-row">
              <span>Students:</span>
              <span>{analytics.students || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'approvals':
        return renderClubApprovals();
      case 'system':
        return renderSystemManagement();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="super-admin-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>🔐 Super Admin</h2>
          <p>EventInClubs System</p>
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
            className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('approvals')}
          >
            <span className="nav-icon">⏳</span>
            Club Approvals
            {pendingClubs.length > 0 && (
              <span className="nav-badge">{pendingClubs.length}</span>
            )}
          </button>
          <button
            className={`nav-item ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <span className="nav-icon">⚙️</span>
            System Management
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Super Admin Dashboard</h1>
          <div className="header-actions">
            <div className="admin-info">
              <span>👤 Super Administrator</span>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}
