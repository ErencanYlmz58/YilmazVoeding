import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // Let op: dit is een gesimplificeerde implementatie
      // In productie zou je eigenlijk een echte authentication API gebruiken
      const response = await api.get(`/customers/email/${email}`);
      
      if (response.data && response.data.password === password) {
        // Simuleer een token - in productie zou je dit van je auth server krijgen
        const token = `dummy-token-${Math.random()}`;
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userId', response.data.id.toString());
        return response.data;
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
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userId');
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // Huidige gebruiker ophalen
  getCurrentUser: async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return null;

      const response = await api.get(`/customers/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
};

export default authService;