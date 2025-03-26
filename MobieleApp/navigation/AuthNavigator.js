import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTintColor: '#333333',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Inloggen' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registreren' }} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;