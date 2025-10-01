import React, { useEffect, useRef } from 'react';
import { googleLogin } from '../api/auth';

const GoogleSignIn = ({ onSuccess, onError, loading, setLoading }) => {
  const googleButtonRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!window.google || !clientId || initialized.current) {
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: 350, // Fixed: Changed from '100%' to pixel value
            text: 'continue_with',
            shape: 'rectangular',
          });
        }

        initialized.current = true;
      } catch (error) {
        console.error('Google Sign-In initialization failed:', error);
        onError('Failed to initialize Google Sign-In');
      }
    };

    const handleCredentialResponse = async (response) => {
      if (!response.credential) {
        onError('No credential received from Google');
        return;
      }

      setLoading(true);
      try {
        const res = await googleLogin(response.credential);
        
        // Parse the JWT token to get user info
        const token = res.data.token;
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        
        // Create a complete user object
        const userData = {
          id: tokenPayload.userId,
          email: tokenPayload.sub, // sub contains the email in our JWT
          name: res.data.email?.split('@')[0] || tokenPayload.sub?.split('@')[0] || 'Google User',
          role: tokenPayload.role || res.data.role || 'STUDENT',
          token: token
        };
        
        console.log('Google login - JWT payload:', tokenPayload);
        console.log('Google login - User data created:', userData);
        
        // Pass the complete user data to the success handler
        onSuccess({
          ...res.data,
          user: userData,
          ...userData // Also include user data at the root level for backward compatibility
        });
      } catch (error) {
        console.error('Google login error:', error);
        const errorMessage = error?.response?.data?.error || 'Google login failed. Please try again.';
        onError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Wait for Google script to load
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleLoaded);
          initializeGoogleSignIn();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkGoogleLoaded), 10000);
    }
  }, [onSuccess, onError, setLoading]);

  return (
    <div className="google-signin-container">
      <div ref={googleButtonRef} style={{ width: '100%' }}></div>
      {loading && (
        <div style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>
          Signing in with Google...
        </div>
      )}
    </div>
  );
};

export default GoogleSignIn;
