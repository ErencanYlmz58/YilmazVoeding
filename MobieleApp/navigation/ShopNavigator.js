import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';

const Stack = createStackNavigator();

const ShopNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 1,
          shadowOpacity: 0.1,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTintColor: '#333333',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Yilmaz Voeding' }} />
      <Stack.Screen 
        name="ProductList" 
        component={ProductListScreen}
        options={({ route }) => ({ title: route.params.categoryName })}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ title: 'Product details' }}
      />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Winkelwagen' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Afrekenen' }} />
      <Stack.Screen 
        name="OrderConfirmation" 
        component={OrderConfirmationScreen}
        options={{ 
          title: 'Bestelling geplaatst',
          // Voorkom dat gebruiker terug kan naar checkout scherm
          headerLeft: null,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen}
        options={{ title: 'Mijn bestellingen' }}
      />
    </Stack.Navigator>
  );
};

export default ShopNavigator;