import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, googleLogin } from "../api/auth";
import "./Auth.css";

export default function Login() {
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "" 
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await loginUser(formData);
      const { token, email, role } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.setItem("role", role);
      
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      
      // Show success message before redirecting
      setTimeout(() => {
        navigate("/");
      }, 1000);
      
    } catch (err) {
      const errorMessage = err?.response?.data?.error || "Login failed. Please check your credentials.";
      setErrors({ general: errorMessage });
    } finally { 
      setLoading(false); 
    }
  };

  const handleGoogleClick = () => {
    /* global google */
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!window.google || !clientId) {
      setErrors({ general: "Google login not configured" });
      return;
    }
    setLoading(true);
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (resp) => {
          try {
            const idToken = resp.access_token ? undefined : undefined;
          } catch {}
        }
      });
      const authClient = google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const res = await googleLogin(response.credential);
            const { token, email, role } = res.data;
            localStorage.setItem("token", token);
            localStorage.setItem("email", email);
            localStorage.setItem("role", role);
            navigate("/");
          } catch (e) {
            setErrors({ general: "Google login failed" });
          } finally {
            setLoading(false);
          }
        }
      });
      google.accounts.id.prompt();
    } catch (e) {
      setLoading(false);
      setErrors({ general: "Google login failed to initialize" });
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    // Implement forgot password logic
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-pattern"></div>
      </div>
      
      <div className={`auth-content ${isVisible ? 'fade-in' : ''}`}>
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">🎪</div>
            <h1>Event Idea Marketplace</h1>
          </div>
          <p className="auth-subtitle">Welcome back! Sign in to continue</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button className="auth-tab active">Sign In</button>
            <Link to="/register" className="auth-tab">Create Account</Link>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
              <div className="error-message general">
                <span className="error-icon">⚠️</span>
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  required
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <button 
              className={`auth-button ${loading ? 'loading' : ''}`} 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button
              type="button"
              className="social-button google"
              onClick={handleGoogleClick}
            >
              <span className="social-icon">G</span>
              Continue with Google
            </button>
          </div>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="link">Sign up here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
