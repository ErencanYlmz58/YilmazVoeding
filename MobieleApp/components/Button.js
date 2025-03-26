import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const Button = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  disabled = false, 
  loading = false,
  outline = false,
  ...props 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        outline ? styles.outlineButton : null,
        disabled || loading ? styles.disabledButton : null,
        style
      ]} 
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={outline ? "#E63946" : "white"} />
      ) : (
        <Text style={[
          styles.text, 
          outline ? styles.outlineText : null,
          disabled ? styles.disabledText : null,
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E63946',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E63946',
  },
  disabledButton: {
    backgroundColor: '#DDDDDD',
    borderColor: '#DDDDDD',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#E63946',
  },
  disabledText: {
    color: '#999999',
  },
});

export default Button;