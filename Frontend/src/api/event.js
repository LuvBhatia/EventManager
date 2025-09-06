const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
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
  }
};
