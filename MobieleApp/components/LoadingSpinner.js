import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

const LoadingSpinner = ({ size = 'large', color = '#E63946' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingSpinner;

