import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import Button from '../components/Button';
import CartItem from '../components/CartItem';
import LoadingSpinner from '../components/LoadingSpinner';
import cartService from '../services/cartService';
import { useNavigation } from '@react-navigation/native';

const CartScreen = () => {
  const navigation = useNavigation();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const cartData = await cartService.getCart();
        setCart(cartData);
        setError(null);
      } catch (err) {
        setError('Er is een fout opgetreden bij het ophalen van de winkelwagen.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      const updatedCart = await cartService.updateQuantity(productId, quantity);
      setCart(updatedCart);
    } catch (err) {
      console.error('Fout bij bijwerken van hoeveelheid:', err);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const updatedCart = await cartService.removeFromCart(productId);
      setCart(updatedCart);
    } catch (err) {
      console.error('Fout bij verwijderen van item:', err);
    }
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Je winkelwagen is leeg</Text>
        <Button 
          title="Verder winkelen" 
          onPress={() => navigation.navigate('Home')}
          style={styles.shopButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.product.id.toString()}
        renderItem={({ item }) => (
          <CartItem 
            item={item} 
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
          />
        )}
      />
      <View style={styles.summaryContainer}>
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Totaal</Text>
          <Text style={styles.totalAmount}>€{cart.totalAmount.toFixed(2)}</Text>
        </View>
        <Button 
          title="Afrekenen" 
          onPress={handleCheckout}
          style={styles.checkoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#E63946',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
  },
  shopButton: {
    width: 200,
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E63946',
  },
  checkoutButton: {
    width: '100%',
  },
});

export default CartScreen;