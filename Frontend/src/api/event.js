import { getCurrentUser } from '../services/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Retrieved token from localStorage:', token ? 'Token exists' : 'No token found');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  } catch (error) {
    console.error('Error in getAuthHeaders:', error);
    return { 'Content-Type': 'application/json' };
  }
};

export const eventApi = {
  // Get all events
  getAllEvents: async () => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get upcoming events
  getUpcomingEvents: async () => {
    const response = await fetch(`${API_BASE_URL}/events/upcoming`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch upcoming events: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get ongoing events
  getOngoingEvents: async () => {
    const response = await fetch(`${API_BASE_URL}/events/ongoing`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ongoing events: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get events by club
  getEventsByClub: async (clubId) => {
    const response = await fetch(`${API_BASE_URL}/events/club/${clubId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch club events: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get event by ID
  getEventById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Create new event
  createEvent: async (eventData) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Update event
  updateEvent: async (id, eventData) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Delete event
  deleteEvent: async (id) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.statusText}`);
    }
    
    return true;
  },

  // Publish event
  publishEvent: async (id) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}/publish`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to publish event: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Search events
  searchEvents: async (keyword) => {
    const response = await fetch(`${API_BASE_URL}/events/search?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to search events: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get event count by club
  getEventCountByClub: async (clubId) => {
    const response = await fetch(`${API_BASE_URL}/events/stats/club/${clubId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch event count: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get events accepting ideas
  getEventsAcceptingIdeas: async () => {
    const response = await fetch(`${API_BASE_URL}/events/accepting-ideas`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch events accepting ideas: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get ideas for an event
  getIdeasForEvent: async (eventId) => {
    console.log('=== Starting getIdeasForEvent ===');
    console.log('Event ID:', eventId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/ideas`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error response data:', errorData);
        } catch (e) {
          console.error('Error parsing error response:', e);
          throw new Error(`Failed to fetch ideas: ${response.statusText}`);
        }
        throw new Error(
          errorData.error || errorData.message || `Failed to fetch ideas: ${response.statusText}`
        );
      }
      
      const ideas = await response.json();
      console.log('Fetched ideas:', ideas);
      return ideas;
    } catch (error) {
      console.error('Error in getIdeasForEvent:', error);
      throw error;
    }
  },

  // Submit idea for an event
  submitIdea: async (eventId, ideaData) => {
    console.log('=== Starting submitIdea ===');
    console.log('Event ID:', eventId);
    console.log('Idea data:', ideaData);
    
    const user = getCurrentUser();
    console.log('Current user from getCurrentUser():', user);
    
    if (!user) {
      console.error('No user found in localStorage');
      throw new Error('User not authenticated. Please log in first.');
    }
    
    if (!user.id) {
      console.error('User object exists but has no ID. User object:', user);
      throw new Error('Invalid user data. Please log in again.');
    }

    // Get auth headers
    const headers = getAuthHeaders();
    console.log('Auth headers:', headers);
    
    // Verify token is in headers
    if (!headers.Authorization) {
      console.error('No Authorization header found in request');
      throw new Error('Authentication token is missing. Please log in again.');
    }

    try {
      // Prepare the idea data in the format expected by the backend
      const ideaPayload = {
        title: ideaData.title,
        description: ideaData.description,
        expectedOutcome: ideaData.expectedOutcome || '',
        // Map frontend fields to backend expected fields
        studentId: ideaData.studentId,
        studentName: ideaData.studentName || user.name || user.email.split('@')[0],
        studentEmail: ideaData.studentEmail
      };

      console.log('Sending idea payload:', ideaPayload);

      const response = await fetch(`${API_BASE_URL}/events/${eventId}/ideas?userId=${user.id}`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(ideaPayload),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error response data:', errorData);
        } catch (e) {
          console.error('Error parsing error response:', e);
          throw new Error(`Failed to submit idea: ${response.statusText}`);
        }
        throw new Error(
          errorData.error || errorData.message || `Failed to submit idea: ${response.statusText}`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in submitIdea:', error);
      throw error;
    }
  },
};
