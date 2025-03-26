import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList } from 'react-native';
import ProductCard from '../components/ProductCard';
import CategoryItem from '../components/CategoryItem';
import LoadingSpinner from '../components/LoadingSpinner';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import cartService from '../services/cartService';

const HomeScreen = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Categorieën en producten ophalen
        const categoriesData = await categoryService.getAllCategories();
        const productsData = await productService.getAllProducts();
        
        setCategories(categoriesData);
        setProducts(productsData);
        setError(null);
      } catch (err) {
        setError('Er is een fout opgetreden bij het ophalen van de gegevens.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorieën</Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <CategoryItem category={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aanbevolen producten</Text>
        <View style={styles.productsGrid}>
          {products.slice(0, 6).map(product => (
            <View style={styles.productItem} key={product.id}>
              <ProductCard 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
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
  errorText: {
    color: '#E63946',
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productItem: {
    width: '50%',
    paddingHorizontal: 8,
  },
});

export default HomeScreen;