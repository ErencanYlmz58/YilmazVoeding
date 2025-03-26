import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const QuantitySelector = ({ quantity, onIncrease, onDecrease }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={onDecrease}
        disabled={quantity <= 1}
      >
        <Text style={[styles.buttonText, quantity <= 1 && styles.disabledText]}>−</Text>
      </TouchableOpacity>
      <Text style={styles.quantity}>{quantity}</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={onIncrease}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
  },
  button: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#CCCCCC',
  },
  quantity: {
    fontSize: 14,
    paddingHorizontal: 8,
  },
});

export default QuantitySelector;