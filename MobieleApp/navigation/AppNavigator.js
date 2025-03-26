import React, { useState, useEffect, createContext, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import AuthNavigator from './AuthNavigator';
import ShopNavigator from './ShopNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/CartScreen';
import LoadingSpinner from '../components/LoadingSpinner';
import authService from '../services/authService';
import api from '../services/api';

const Tab = createBottomTabNavigator();

// Maak de authenticatie context met meer robuuste standaardwaarden
export const AuthContext = createContext({
  isLoggedIn: false,
  login: async () => {},
  logout: async () => {},
  user: null
});

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Navigatie referentie voor globale toegang
  const navigationRef = React.useRef();

  // Setup navigatie naar login voor API error handling
  useEffect(() => {
    api.setNavigator(() => {
      handleLogout();
    });
  }, []);

  // Check login status bij initialisatie
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setLoading(true);
        const isAuth = await authService.isAuthenticated();
        
        if (isAuth) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Login handler
  const handleLogin = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Login error:", err);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // Memoize de context waarde om onnodige renders te voorkomen
  const authContext = useMemo(() => ({
    isLoggedIn,
    user,
    login: handleLogin,
    logout: handleLogout
  }), [isLoggedIn, user]);

  // Toon laadscherm tijdens initialisatie
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer ref={navigationRef}>
        {isLoggedIn ? (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                switch (route.name) {
                  case 'Shop':
                    iconName = focused ? 'home' : 'home-outline';
                    break;
                  case 'Cart':
                    iconName = focused ? 'cart' : 'cart-outline';
                    break;
                  case 'Profile':
                    iconName = focused ? 'person' : 'person-outline';
                    break;
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#E63946',
              tabBarInactiveTintColor: '#666666',
              headerShown: false,
            })}
          >
            <Tab.Screen 
              name="Shop" 
              component={ShopNavigator} 
              options={{ title: 'Home' }} 
            />
            <Tab.Screen 
              name="Cart" 
              component={CartScreen} 
              options={{ title: 'Winkelwagen' }} 
            />
            <Tab.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ title: 'Profiel' }} 
            />
          </Tab.Navigator>
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default AppNavigator;