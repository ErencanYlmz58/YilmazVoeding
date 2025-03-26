import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CategoryItem = ({ category }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('ProductList', { categoryId: category.id, categoryName: category.name });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image 
        source={{ uri: category.imageUrl || 'https://via.placeholder.com/100' }}
        style={styles.image} 
      />
      <Text style={styles.name}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  name: {
    textAlign: 'center',
    fontSize: 14,
  },
});

export default CategoryItem;