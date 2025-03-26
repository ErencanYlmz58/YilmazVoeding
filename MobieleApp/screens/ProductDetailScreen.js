import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import Button from '../components/Button';
import QuantitySelector from '../components/QuantitySelector';
import LoadingSpinner from '../components/LoadingSpinner';
import productService from '../services/productService';
import cartService from '../services/cartService';

const ProductDetailScreen = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(productId);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError('Er is een fout opgetreden bij het ophalen van het product.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
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

  if (error || !product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || 'Product niet gevonden'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.imageUrl || 'https://via.placeholder.com/400' }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>€{product.price.toFixed(2)}</Text>
        <Text style={styles.category}>Categorie: {product.category?.name}</Text>
        
        <Text style={styles.description}>{product.description}</Text>
        
        <View style={styles.actionContainer}>
          <Text style={styles.quantityLabel}>Aantal:</Text>
          <QuantitySelector 
            quantity={quantity}
            onIncrease={() => setQuantity(quantity + 1)}
            onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
          />
          <Button 
            title="Toevoegen aan winkelwagen" 
            onPress={handleAddToCart}
            style={styles.addButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  image: {
    width: '100%',
    height: 300,
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E63946',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  actionContainer: {
    marginTop: 16,
  },
  quantityLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  addButton: {
    marginTop: 16,
  },
});

export default ProductDetailScreen;