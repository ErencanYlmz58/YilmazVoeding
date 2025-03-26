import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthNavigator from './AuthNavigator';
import ShopNavigator from './ShopNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/CartScreen';
import LoadingSpinner from '../components/LoadingSpinner';
import authService from '../services/authService';
import api from '../services/api';

const Tab = createBottomTabNavigator();

// Context voor authenticatie status
export const AuthContext = React.createContext();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Navigatie referentie voor globale toegang
  const navigationRef = React.useRef();

  // Setup navigatie naar login voor API error handling
  useEffect(() => {
    api.setNavigator(() => {
      setIsLoggedIn(false);
    });
  }, []);

  useEffect(() => {
    // Check of gebruiker is ingelogd
    const checkLoginStatus = async () => {
      try {
        setLoading(true);
        const isAuth = await authService.isAuthenticated();
        setIsLoggedIn(isAuth);
      } catch (err) {
        console.error("Auth check error:", err);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Auth context waarde
  const authContext = React.useMemo(() => ({
    login: async () => {
      setIsLoggedIn(true);
    },
    logout: async () => {
      await authService.logout();
      setIsLoggedIn(false);
    },
    isLoggedIn
  }), [isLoggedIn]);

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

                if (route.name === 'Shop') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Cart') {
                  iconName = focused ? 'cart' : 'cart-outline';
                } else if (route.name === 'Profile') {
                  iconName = focused ? 'person' : 'person-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#E63946',
              tabBarInactiveTintColor: '#666666',
              headerShown: false,
            })}
          >
            <Tab.Screen name="Shop" component={ShopNavigator} options={{ title: 'Home' }} />
            <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Winkelwagen' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profiel' }} />
          </Tab.Navigator>
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default AppNavigator;