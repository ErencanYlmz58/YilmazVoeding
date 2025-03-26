import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import QuantitySelector from './QuantitySelector';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity } = item;

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: product.imageUrl || 'https://via.placeholder.com/60' }}
        style={styles.image} 
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>€{product.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <QuantitySelector 
          quantity={quantity} 
          onIncrease={() => onUpdateQuantity(product.id, quantity + 1)}
          onDecrease={() => onUpdateQuantity(product.id, quantity - 1)}
        />
        <TouchableOpacity 
          style={styles.removeButton} 
          onPress={() => onRemove(product.id)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: 'white',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E63946',
  },
  quantityContainer: {
    alignItems: 'center',
  },
  removeButton: {
    marginTop: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
});

export default CartItem;