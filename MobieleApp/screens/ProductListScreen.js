import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import productService from '../services/productService';
import cartService from '../services/cartService';

const ProductListScreen = ({ route }) => {
  const { categoryId, categoryName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductsByCategory(categoryId);
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Er is een fout opgetreden bij het ophalen van de producten.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  const handleAddToCart = async (product, quantity) => {
    try {
      await cartService.addToCart(product, quantity);
      // Hier zou je een melding kunnen tonen dat het product is toegevoegd
    } catch (err) {
      console.error('Fout bij toevoegen aan winkelwagen:', err);
    }
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

  if (products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Geen producten gevonden in deze categorie.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={products}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <ProductCard product={item} onAddToCart={handleAddToCart} />
      )}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 8,
  },
  centerContainer: {
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
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

export default ProductListScreen;
