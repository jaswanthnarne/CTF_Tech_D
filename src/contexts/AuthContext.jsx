import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuth } from '../services/admin';
import { authAPI } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null); // 'admin' or 'student'

  useEffect(() => {
    checkAuth();
  }, []);

  const adminLogin = async (credentials) => {
    try {
      const response = await adminAuth.login(credentials);
      console.log(response);
      const { admin, token } = response.data;
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(admin));
      
      setUser(admin);
      setIsAuthenticated(true);
      setUserType('admin');
      
      return { success: true, user: admin };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

const studentLogin = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);
    const { user, token } = response.data;
    
    // Store student token as 'token' (not 'userToken')
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
    setIsAuthenticated(true);
    setUserType('student');
    
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Login failed' 
    };
  }
};

const register = async (data) => {
  try {
    const response = await authAPI.register(data);
    const { user, token } = response.data;
    
    // Store student token as 'token' (not 'userToken')
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
    setIsAuthenticated(true);
    setUserType('student');
    
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Registration failed' 
    };
  }
};

const checkAuth = async () => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token'); // Changed from 'userToken' to 'token'
    
    if (adminToken) {
      const response = await adminAuth.getProfile();
      setUser(response.data.admin);
      setIsAuthenticated(true);
      setUserType('admin');
    } else if (userToken) {
      const response = await authAPI.getProfile();
      setUser(response.data.user);
      setIsAuthenticated(true);
      setUserType('student');
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token'); // Changed from 'userToken' to 'token'
    localStorage.removeItem('adminUser');
    localStorage.removeItem('user'); // Changed from 'userData' to 'user'
  } finally {
    setLoading(false);
  }
};

const logout = async () => {
  try {
    if (userType === 'admin') {
      await adminAuth.logout();
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    } else {
      await authAPI.logout();
      localStorage.removeItem('token'); // Changed from 'userToken' to 'token'
      localStorage.removeItem('user'); // Changed from 'userData' to 'user'
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    setUser(null);
    setIsAuthenticated(false);
    setUserType(null);
  }
};

  const value = {
    user,
    loading,
    isAuthenticated,
    userType,
    adminLogin,
    studentLogin,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};