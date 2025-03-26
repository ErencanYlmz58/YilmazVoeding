import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import authService from '../services/authService';
import cartService from '../services/cartService';
import orderService from '../services/orderService';

const CheckoutScreen = ({ navigation }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Leveringsgegevens
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Winkelwagen ophalen
        const cartData = await cartService.getCart();
        setCart(cartData);

        // Ingelogde gebruiker ophalen
        const userData = await authService.getCurrentUser();
        setUser(userData);

        // Adresgegevens invullen als gebruiker is ingelogd
        if (userData) {
          setAddress(userData.address || '');
          setPostalCode(userData.postalCode || '');
          setCity(userData.city || '');
        }

        setError(null);
      } catch (err) {
        setError('Er is een fout opgetreden bij het laden van de gegevens.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlaceOrder = async () => {
    // Valideer invoer
    if (!address || !postalCode || !city) {
      Alert.alert('Fout', 'Vul a.u.b. alle verplichte adresgegevens in.');
      return;
    }

    if (!user) {
      Alert.alert('Fout', 'Je moet ingelogd zijn om een bestelling te plaatsen.');
      navigation.navigate('Login');
      return;
    }

    try {
      setSubmitting(true);

      // Bestelling voorbereiden
      const orderData = {
        customerId: user.id,
        orderItems: cart.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price
        })),
        totalAmount: cart.totalAmount,
        deliveryAddress: address,
        deliveryPostalCode: postalCode,
        deliveryCity: city,
        notes: notes,
      };

      // Bestelling plaatsen
      const order = await orderService.createOrder(orderData);

      // Winkelwagen leegmaken
      await cartService.clearCart();

      // Naar bevestigingspagina
      navigation.navigate('OrderConfirmation', { orderId: order.id });
    } catch (err) {
      Alert.alert(
        'Bestelling mislukt',
        'Er is een fout opgetreden bij het plaatsen van je bestelling. Probeer het opnieuw.'
      );
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Ga terug"
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        />
      </View>
    );
  }

  if (cart.items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Je winkelwagen is leeg</Text>
        <Button
          title="Verder winkelen"
          onPress={() => navigation.navigate('Home')}
          style={styles.shopButton}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bestelling overzicht</Text>
          {cart.items.map(item => (
            <View key={item.product.id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemPrice}>€{(item.product.price * item.quantity).toFixed(2)}</Text>
              </View>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Totaal</Text>
            <Text style={styles.totalAmount}>€{cart.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leveringsgegevens</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Adres *</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Straat en huisnummer"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Postcode *</Text>
              <TextInput
                style={styles.input}
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="Postcode"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Plaats *</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Plaats"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Opmerkingen</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Speciale instructies voor bezorging"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.requiredText}>* Verplichte velden</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Bestelling plaatsen"
            onPress={handlePlaceOrder}
            loading={submitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  errorButton: {
    width: 200,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
  },
  shopButton: {
    width: 200,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
  },
  itemDetails: {
    flexDirection: 'row',
  },
  itemQuantity: {
    fontSize: 16,
    color: '#666666',
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 16,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  requiredText: {
    color: '#666666',
    fontSize: 12,
  },
  buttonContainer: {
    margin: 16,
    marginTop: 0,
  },
});

export default CheckoutScreen;