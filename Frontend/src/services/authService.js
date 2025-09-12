/**
 * Authentication service for handling user authentication state and user information
 */

/**
 * Get the currently authenticated user from local storage
 * @returns {Object|null} The current user object or null if not authenticated
 */
export const getCurrentUser = () => {
  try {
    console.log('getCurrentUser called');
    const userJson = localStorage.getItem('user');
    console.log('Raw user from localStorage:', userJson);
    
    if (!userJson) {
      console.log('No user found in localStorage');
      return null;
    }
    
    const user = JSON.parse(userJson);
    console.log('Parsed user object:', user);
    
    // If no ID but we have an email, use email as a fallback ID
    if (!user.id && user.email) {
      console.warn('User object has no ID, using email as fallback ID');
      user.id = user.email.toLowerCase().trim();
    }
    
    // If still no ID, we can't proceed
    if (!user.id) {
      console.error('User object has no ID or email to use as ID:', user);
      return null;
    }
    
    return user;
    
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

/**
 * Check if a user is authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get the authentication token
 * @returns {string|null} The authentication token or null if not authenticated
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Set the user authentication data
 * @param {string} token - The authentication token
 * @param {Object} user - The user data
 */
export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Clear the authentication data (logout)
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get the user's role
 * @returns {string|null} The user's role or null if not authenticated
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

/**
 * Check if the current user has a specific role
 * @param {string} role - The role to check
 * @returns {boolean} True if the user has the specified role, false otherwise
 */
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

/**
 * Check if the current user has any of the specified roles
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} True if the user has any of the specified roles, false otherwise
 */
export const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};
