import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
        
        // Set default headers for API calls
        if (user && user.username) {
          axios.defaults.headers.common['Username'] = user.username;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password
      });

      if (response.data.success) {
        const userData = response.data.user;
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        axios.defaults.headers.common['Username'] = username;
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Network error. Please try again.'
      };
    }
  };

  const register = async (username, password, email) => {
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        username,
        password,
        email
      });

      if (response.data.success) {
        const userData = response.data.user;
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        axios.defaults.headers.common['Username'] = username;
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.error || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Network error. Please try again.'
      };
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      if (!user) return { success: false, error: 'No user found' };
      
      const updatedUser = { ...user, preferences };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update preferences'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userData');
    delete axios.defaults.headers.common['Username'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    updatePreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}