import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Basis URL voor API requests
const API_URL = 'https://api.yilmazvoeding.com/api';

// Creëer een axios instance met standaard configuratie
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor voor auth tokens toevoegen aan requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor voor error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Bij 401 (Unauthorized) naar login sturen
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Token verwijderen en naar login navigeren
      await AsyncStorage.removeItem('authToken');
      // Hier zou je naar de login pagina kunnen navigeren
      
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;