import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert
} from 'react-native';
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
        console.error('Fout bij ophalen bestelling:', err);
        setError('Er is een fout opgetreden bij het laden van de bestelling.');
        Alert.alert('Fout', 'Kan bestelling niet ophalen');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Datum formatteren
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Status vertalen
  const translateOrderStatus = (status) => {
    const translations = {
      'Pending': 'In afwachting',
      'Processing': 'In behandeling',
      'Shipped': 'Verzonden',
      'Delivered': 'Afgeleverd',
      'Cancelled': 'Geannuleerd'
    };
    return translations[status] || status;
  };

  // Status kleur bepalen
  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return '#2ecc71';
      case 'Cancelled': return '#e74c3c';
      case 'Shipped': return '#3498db';
      case 'Processing': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  // Laden of fout
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Bestelling niet gevonden'}</Text>
        <Button
          title="Terug naar home"
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
          <Text 
            style={[
              styles.statusLabel, 
              { color: getStatusColor(order.status) }
            ]}
          >
            {translateOrderStatus(order.status)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leveringsadres</Text>
        <Text style={styles.address}>{order.deliveryAddress}</Text>
        <Text style={styles.address}>
          {order.deliveryPostalCode}, {order.deliveryCity}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bestelde producten</Text>
        {order.orderItems.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.product.name}</Text>
            <View style={styles.itemDetails}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemPrice}>
                €{(item.unitPrice * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Totaal</Text>
          <Text style={styles.totalAmount}>
            €{order.totalAmount.toFixed(2)}
          </Text>
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
    marginBottom: 20,
  },
  homeButton: {
    width: 200,
  },
  confirmationBox: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    textAlign: 'center',
    color: '#666666',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#666666',
  },
  infoValue: {
    fontWeight: 'bold',
  },
  statusLabel: {
    fontWeight: 'bold',
  },
  address: {
    marginBottom: 4,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    marginRight: 16,
    color: '#666666',
  },
  itemPrice: {
    fontWeight: 'bold',
    width: 80,
    textAlign: 'right',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
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
  buttonsContainer: {
    margin: 16,
    marginTop: 0,
  },
  button: {
    marginBottom: 16,
  },
});

export default OrderConfirmationScreen;