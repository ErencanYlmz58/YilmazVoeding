import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import orderService from '../services/orderService';

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrdersByCustomerId();
        setOrders(orderData);
        setError(null);
      } catch (err) {
        console.error('Fout bij ophalen bestellingen:', err);
        setError('Er is een fout opgetreden bij het laden van je bestellingen.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Order status vertaling
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

  // Render enkele bestelling
  const renderOrderItem = ({ item }) => {
    const orderDate = new Date(item.orderDate);
    const formattedDate = orderDate.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return (
      <TouchableOpacity 
        style={styles.orderItem}
        onPress={() => navigation.navigate('OrderConfirmation', { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>Bestelling #{item.id}</Text>
          <Text 
            style={[
              styles.orderStatus, 
              { 
                color: item.status === 'Delivered' ? '#2ecc71' : 
                        item.status === 'Cancelled' ? '#e74c3c' : '#f39c12' 
              }
            ]}
          >
            {translateOrderStatus(item.status)}
          </Text>
        </View>
        
        <View style={styles.orderDetails}>
          <View>
            <Text style={styles.detailLabel}>Datum</Text>
            <Text>{formattedDate}</Text>
          </View>
          <View style={styles.alignRight}>
            <Text style={styles.detailLabel}>Totaalbedrag</Text>
            <Text style={styles.totalAmount}>€{item.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render content
  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (orders.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Je hebt nog geen bestellingen geplaatst.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Mijn Bestellingen</Text>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: 'white',
  },
  listContainer: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#666666',
    marginBottom: 4,
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#E63946',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#E63946',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default OrderHistoryScreen;