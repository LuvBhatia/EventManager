import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import './SuperAdminLogin.css';

export default function SuperAdminLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Super Admin Credentials
  const SUPER_ADMIN_CREDENTIALS = {
    email: 'superadmin@eventinclubs.com',
    password: 'SuperAdmin@2024'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call backend login to obtain real JWT
      const res = await loginUser({ email: credentials.email, password: credentials.password });
      const { token, email, role } = res.data || {};

      if (!token || !email) {
        throw new Error('Invalid login response');
      }

      // Store token and role
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role || 'USER');
      localStorage.setItem('email', email);

      // Decode token to get userId if present
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) {
          localStorage.setItem('userId', payload.userId.toString());
        }
      } catch {}

      navigate('/superadmin/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="super-admin-login">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🔐</span>
            <h1>Super Admin Portal</h1>
          </div>
          <p className="subtitle">EventInClubs Management System</p>
        </div>

        <div className="credentials-info">
          <div className="info-card">
            <h3>🔑 Super Admin Credentials</h3>
            <div className="credential-item">
              <strong>Email:</strong> superadmin@eventinclubs.com
            </div>
            <div className="credential-item">
              <strong>Password:</strong> SuperAdmin@2024
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter super admin email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter super admin password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In as Super Admin'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Super Admin access only. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
}
