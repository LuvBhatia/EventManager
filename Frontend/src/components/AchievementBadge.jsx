import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star } from 'lucide-react';
import './AchievementBadge.css';

const AchievementBadge = () => {
  const [achievements, setAchievements] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAchievements();
    fetchTotalPoints();
  }, []);

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/achievements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchTotalPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/achievements/points`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTotalPoints(data.totalPoints || 0);
      }
    } catch (error) {
      console.error('Error fetching total points:', error);
    }
  };

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'IDEA_CONTRIBUTOR': return '💡';
      case 'VOTE_ENTHUSIAST': return '👍';
      case 'COMMENT_MASTER': return '💬';
      case 'IMPLEMENTATION_CHAMPION': return '🚀';
      default: return '🏆';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 1: return '#cd7f32'; // Bronze
      case 2: return '#c0c0c0'; // Silver
      case 3: return '#ffd700'; // Gold
      case 4: return '#e6e6fa'; // Platinum
      case 5: return '#b9f2ff'; // Diamond
      default: return '#6b7280';
    }
  };

  const getLevelName = (level) => {
    switch (level) {
      case 1: return 'Bronze';
      case 2: return 'Silver';
      case 3: return 'Gold';
      case 4: return 'Platinum';
      case 5: return 'Diamond';
      default: return 'Novice';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const recentAchievements = achievements
    .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
    .slice(0, 3);

  return (
    <div className="achievement-badge">
      <button 
        className="achievement-button"
        onClick={() => setShowModal(true)}
        title={`${totalPoints} points earned`}
      >
        <Trophy size={20} />
        <span className="points-text">{totalPoints}</span>
      </button>

      {showModal && (
        <div className="achievement-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="achievement-modal" onClick={(e) => e.stopPropagation()}>
            <div className="achievement-modal-header">
              <h2>Your Achievements</h2>
              <button 
                className="close-modal"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="achievement-stats">
              <div className="stat-item">
                <Trophy className="stat-icon" />
                <div>
                  <div className="stat-value">{achievements.length}</div>
                  <div className="stat-label">Achievements</div>
                </div>
              </div>
              <div className="stat-item">
                <Star className="stat-icon" />
                <div>
                  <div className="stat-value">{totalPoints}</div>
                  <div className="stat-label">Total Points</div>
                </div>
              </div>
            </div>

            <div className="achievement-content">
              {achievements.length === 0 ? (
                <div className="no-achievements">
                  <Award size={48} className="no-achievements-icon" />
                  <h3>No achievements yet</h3>
                  <p>Start contributing ideas, voting, and commenting to earn your first achievement!</p>
                </div>
              ) : (
                <div className="achievement-grid">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className="achievement-card">
                      <div className="achievement-card-header">
                        <div className="achievement-icon">
                          {getAchievementIcon(achievement.type)}
                        </div>
                        <div 
                          className="achievement-level"
                          style={{ backgroundColor: getLevelColor(achievement.level) }}
                        >
                          {getLevelName(achievement.level)}
                        </div>
                      </div>
                      <div className="achievement-card-body">
                        <h4 className="achievement-title">{achievement.title}</h4>
                        <p className="achievement-description">{achievement.description}</p>
                        <div className="achievement-meta">
                          <span className="achievement-points">+{achievement.points} points</span>
                          <span className="achievement-date">
                            {formatDate(achievement.earnedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
