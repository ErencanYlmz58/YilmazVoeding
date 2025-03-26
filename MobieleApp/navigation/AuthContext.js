import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';

// Maak de context
export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {}
});

// Context Provider Component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Login functie
  const login = async (email, password) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      setIsLoggedIn(true);
      return userData;
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
      throw error;
    }
  };

  // Logout functie
  const logout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  // Register functie
  const register = async (userData) => {
    try {
      const registeredUser = await authService.register(userData);
      return registeredUser;
    } catch (error) {
      throw error;
    }
  };

  // Check login status bij initialisatie
  React.useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error('Login status check failed', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      login, 
      logout, 
      register 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook voor gebruik van AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};