import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';


// Basis URL voor API requests - dynamisch o.b.v. environment
const getApiUrl = () => {
  if (__DEV__) {
    // Gebruik de juiste poort en protocol
    return Platform.OS === 'ios' 
      ? 'http://localhost:54646/api'
      : 'http://10.0.2.2:54646/api'; 
  }
  return 'https://api.yilmazvoeding.com/api'; // Productie URL
};

// Basis URL voor API requests
const API_URL = getApiUrl();

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

// Verbeterde error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Bij 401 (Unauthorized) naar login sturen
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Token verwijderen en naar login navigeren
      await AsyncStorage.removeItem('authToken');
      
      // Hier krijgen we een navigatie-functie van de component die de API aanroept
      if (api.navigateToLogin) {
        api.navigateToLogin();
      }
      
      return Promise.reject(error);
    }

    // Specifiekere foutafhandeling
    if (error.response) {
      // De server antwoordde met een statuscode buiten 2xx
      console.error('Server error:', error.response.status, error.response.data);
      return Promise.reject({
        status: error.response.status,
        data: error.response.data,
        message: error.response.data.message || 'Er is een fout opgetreden bij de server.'
      });
    } else if (error.request) {
      // Het request werd gemaakt maar er kwam geen antwoord
      console.error('Network error:', error.request);
      return Promise.reject({
        status: null,
        data: null,
        message: 'Geen verbinding met de server. Controleer je internetverbinding.'
      });
    } else {
      // Er is iets misgegaan bij het opzetten van het request
      console.error('Request error:', error.message);
      return Promise.reject({
        status: null,
        data: null,
        message: 'Er is een fout opgetreden bij het maken van het verzoek.'
      });
    }
  }
);

// Helper functie om navigatie toe te voegen
api.setNavigator = (navigateFunction) => {
  api.navigateToLogin = navigateFunction;
};

export default api;