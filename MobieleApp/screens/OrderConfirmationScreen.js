import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import orderService from '../services/orderService';

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
        setError(null);
      } catch (err) {
        setError('Er is een fout opgetreden bij het laden van de bestelling.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || 'Bestelling niet gevonden'}
        </Text>
        <Button
          title="Naar home"
          onPress={() => navigation.navigate('Home')}
          style={styles.homeButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.confirmationBox}>
        <Text style={styles.title}>Bedankt voor uw bestelling!</Text>
        <Text style={styles.message}>
          Uw bestelling is succesvol geplaatst en wordt zo snel mogelijk verwerkt.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bestelgegevens</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bestelnummer:</Text>
          <Text style={styles.infoValue}>{order.id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Datum:</Text>
          <Text style={styles.infoValue}>{formatDate(order.orderDate)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={styles.statusLabel}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leveringsadres</Text>
        <Text style={styles.address}>{order.deliveryAddress}</Text>
        <Text style={styles.address}>{order.deliveryPostalCode}, {order.deliveryCity}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bestelde producten</Text>
        {order.orderItems.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.product.name}</Text>
            <View style={styles.itemDetails}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemPrice}>€{(item.unitPrice * item.quantity).toFixed(2)}</Text>
            </View>
          </View>
        ))}
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Totaal</Text>
          <Text style={styles.totalAmount}>€{order.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <Button
          title="Naar mijn bestellingen"
          onPress={() => navigation.navigate('OrderHistory')}
          style={styles.button}
        />
        <Button
          title="Verder winkelen"
          onPress={() => navigation.navigate('Home')}
          style={styles.button}
          outline
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F