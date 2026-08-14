import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/auth';
import { getProfile } from '../api/users';

export const AuthContext = createContext(null);

// Client-side permission mappings corresponding to backend
const ROLE_PERMISSIONS = {
  'Administrator': [
    'user:manage',
    'survey:create', 'survey:read', 'survey:update', 'survey:delete',
    'site:create', 'site:read', 'site:update', 'site:delete',
    'device:create', 'device:read', 'device:update', 'device:delete',
    'observation:create', 'observation:read', 'observation:update', 'observation:delete'
  ],
  'Wildlife Researcher': [
    'survey:create', 'survey:read', 'survey:update',
    'site:create', 'site:read', 'site:update',
    'device:create', 'device:read', 'device:update',
    'observation:create', 'observation:read', 'observation:update'
  ],
  'Conservation Officer': [
    'survey:read',
    'site:read',
    'device:read',
    'observation:read', 'observation:update'
  ],
  'Forest Department Officer': [
    'survey:read',
    'site:read',
    'device:read',
    'observation:create', 'observation:read'
  ]
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Refresh profile info silently
        try {
          const profile = await getProfile();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (err) {
          console.error('Silent token validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName, role) => {
    setLoading(true);
    try {
      const data = await registerUser(email, password, fullName, role);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        hasRole,
        hasPermission,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
