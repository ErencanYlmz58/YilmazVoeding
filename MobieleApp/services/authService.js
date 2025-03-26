import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode'; // Voeg deze dependency toe met: npm install jwt-decode

const TOKEN_KEY = 'authToken';
const USER_ID_KEY = 'userId';

const authService = {
  // Registreren
  register: async (userData) => {
    try {
      const response = await api.post('/customers', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Inloggen
  login: async (email, password) => {
    try {
      // In een echte implementatie zou dit naar een /auth/login endpoint gaan
      // die een JWT token teruggeeft
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data && response.data.token) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
        
        // Decodeer token om gebruikers-ID te krijgen
        const decodedToken = jwt_decode(response.data.token);
        await AsyncStorage.setItem(USER_ID_KEY, decodedToken.id.toString());
        
        return response.data.user;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Uitloggen
  logout: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_ID_KEY);
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // Huidige gebruiker ophalen
  getCurrentUser: async () => {
    try {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) return null;

      // Controleer of token nog geldig is
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      // Controleer of token verlopen is
      if (decodedToken.exp < currentTime) {
        // Token is verlopen, log gebruiker uit
        await authService.logout();
        return null;
      }

      const response = await api.get(`/customers/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Bij API errors, log gebruiker uit
      await authService.logout();
      return null;
    }
  },
  
  // Token vernieuwen
  refreshToken: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return false;
      
      const response = await api.post('/auth/refresh-token', { token });
      
      if (response.data && response.data.token) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  },
  
  // Controleer of gebruiker is ingelogd
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return false;
      
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      // Als token nog geldig is, return true
      return decodedToken.exp > currentTime;
    } catch (error) {
      return false;
    }
  }
};

export default authService;