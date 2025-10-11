import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const UserAuthContext = createContext();

// Custom hook to use the UserAuthContext
const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        // Verify token is still valid
        const response = await axios.get(`${API_BASE_URL}/api/user-auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear storage
          clearAuth();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      if (error.response?.status === 401) {
        // Try to refresh token
        await refreshToken();
      } else {
        clearAuth();
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('userRefreshToken');
      if (!refreshToken) {
        clearAuth();
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/user-auth/refresh`, {
        refreshToken
      });

      if (response.data.success) {
        const newToken = response.data.data.accessToken;
        localStorage.setItem('userToken', newToken);
        
        // Retry getting user data
        const userResponse = await axios.get(`${API_BASE_URL}/api/user-auth/me`, {
          headers: {
            Authorization: `Bearer ${newToken}`
          }
        });

        if (userResponse.data.success) {
          setUser(userResponse.data.data.user);
          setIsAuthenticated(true);
        }
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuth();
    }
  };

  const signin = async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user-auth/signin`, {
        email,
        password,
        rememberMe
      });

      if (response.data.success) {
        const { user: userData, accessToken, refreshToken, rememberMe: isRemembered } = response.data.data;
        
        // Store tokens and user data
        localStorage.setItem('userToken', accessToken);
        localStorage.setItem('userRefreshToken', refreshToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('rememberMe', (isRemembered || rememberMe).toString());
        
        // Update context state immediately
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData, rememberMe: isRemembered || rememberMe };
      }
    } catch (error) {
      console.error('Signin error:', error);
      
      // Handle disabled account specifically
      if (error.response?.status === 403 && error.response?.data?.data?.status === 'disabled') {
        return {
          success: false,
          disabled: true,
          message: error.response.data.message,
          disabledData: error.response.data.data
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Signin failed'
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user-auth/signup`, userData);

      if (response.data.success) {
        const { user: newUser, accessToken, refreshToken } = response.data.data;
        
        // Store tokens and user data
        localStorage.setItem('userToken', accessToken);
        localStorage.setItem('userRefreshToken', refreshToken);
        localStorage.setItem('userData', JSON.stringify(newUser));
        
        setUser(newUser);
        setIsAuthenticated(true);
        
        return { success: true, user: newUser };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
        errors: error.response?.data?.errors
      };
    }
  };

  const signout = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (token) {
        await axios.post(`${API_BASE_URL}/api/user-auth/signout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      clearAuth();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.put(`${API_BASE_URL}/api/user-auth/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed',
        errors: error.response?.data?.errors
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post(`${API_BASE_URL}/api/user-auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        return { success: true, message: 'Password changed successfully' };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Password change failed'
      };
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRefreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('rememberMe');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signin,
    signup,
    signout,
    updateProfile,
    changePassword,
    refreshToken,
    checkAuthStatus
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { useUserAuth };
export default UserAuthContext;
