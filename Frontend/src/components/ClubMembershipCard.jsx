import React, { useState, useEffect } from 'react';
import { Users, Crown, Shield, User, Settings, UserMinus, UserPlus } from 'lucide-react';
import './ClubMembershipCard.css';

const ClubMembershipCard = ({ clubId, isAdmin = false }) => {
  const [members, setMembers] = useState([]);
  const [userMembership, setUserMembership] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  useEffect(() => {
    if (clubId) {
      fetchMembers();
      checkUserMembership();
    }
  }, [clubId]);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clubs/${clubId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const checkUserMembership = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/memberships`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const memberships = await response.json();
        const membership = memberships.find(m => m.clubId === clubId && m.isActive);
        setUserMembership(membership);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const joinClub = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clubs/${clubId}/members/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchMembers();
        await checkUserMembership();
      } else {
        const error = await response.text();
        alert('Failed to join club: ' + error);
      }
    } catch (error) {
      console.error('Error joining club:', error);
      alert('Failed to join club');
    } finally {
      setLoading(false);
    }
  };

  const leaveClub = async () => {
    if (!confirm('Are you sure you want to leave this club?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clubs/${clubId}/members/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchMembers();
        await checkUserMembership();
      } else {
        const error = await response.text();
        alert('Failed to leave club: ' + error);
      }
    } catch (error) {
      console.error('Error leaving club:', error);
      alert('Failed to leave club');
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (membershipId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clubs/${clubId}/members/${membershipId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        await fetchMembers();
      } else {
        const error = await response.text();
        alert('Failed to update role: ' + error);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const removeMember = async (membershipId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clubs/${clubId}/members/${membershipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchMembers();
      } else {
        const error = await response.text();
        alert('Failed to remove member: ' + error);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'OWNER': return <Crown size={16} className="role-icon owner" />;
      case 'ADMIN': return <Shield size={16} className="role-icon admin" />;
      case 'MODERATOR': return <Settings size={16} className="role-icon moderator" />;
      default: return <User size={16} className="role-icon member" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'OWNER': return '#fbbf24';
      case 'ADMIN': return '#ef4444';
      case 'MODERATOR': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const canManageMembers = userMembership && 
    (userMembership.role === 'OWNER' || userMembership.role === 'ADMIN');

  return (
    <div className="club-membership-card">
      <div className="membership-header">
        <div className="membership-info">
          <Users size={20} />
          <span>{members.length} members</span>
        </div>
        
        {userMembership ? (
          <div className="membership-actions">
            <span className="user-role" style={{ color: getRoleColor(userMembership.role) }}>
              {getRoleIcon(userMembership.role)}
              {userMembership.role}
            </span>
            <button 
              className="btn-secondary btn-sm"
              onClick={() => setShowMemberModal(true)}
            >
              View Members
            </button>
            {userMembership.role !== 'OWNER' && (
              <button 
                className="btn-danger btn-sm"
                onClick={leaveClub}
                disabled={loading}
              >
                <UserMinus size={16} />
                Leave
              </button>
            )}
          </div>
        ) : (
          <button 
            className="btn-primary btn-sm"
            onClick={joinClub}
            disabled={loading}
          >
            <UserPlus size={16} />
            Join Club
          </button>
        )}
      </div>

      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Club Members ({members.length})</h3>
              <button 
                className="close-modal"
                onClick={() => setShowMemberModal(false)}
              >
                ×
              </button>
            </div>

            <div className="member-list">
              {members.map(member => (
                <div key={member.id} className="member-item">
                  <div className="member-info">
                    <div className="member-avatar">
                      {member.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-details">
                      <div className="member-name">{member.userName}</div>
                      <div className="member-email">{member.userEmail}</div>
                      <div className="member-joined">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="member-role-section">
                    <div 
                      className="member-role"
                      style={{ color: getRoleColor(member.role) }}
                    >
                      {getRoleIcon(member.role)}
                      {member.role}
                    </div>

                    {canManageMembers && member.role !== 'OWNER' && (
                      <div className="member-actions">
                        <select
                          value={member.role}
                          onChange={(e) => updateMemberRole(member.id, e.target.value)}
                          className="role-select"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="MODERATOR">Moderator</option>
                          {userMembership.role === 'OWNER' && (
                            <option value="ADMIN">Admin</option>
                          )}
                        </select>
                        <button
                          className="btn-danger btn-xs"
                          onClick={() => removeMember(member.id)}
                          title="Remove member"
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubMembershipCard;
