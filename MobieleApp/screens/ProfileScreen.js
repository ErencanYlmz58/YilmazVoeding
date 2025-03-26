import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity
} from 'react-native';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import authService from '../services/authService';
import orderService from '../services/orderService';
import { AuthContext } from '../navigation/AppNavigator';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const { logout } = useContext(AuthContext);

  // Fetch user data and orders
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await authService.getCurrentUser();
        
        if (userData) {
          setUser(userData);
          setEditedUser({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phoneNumber: userData.phoneNumber || '',
            address: userData.address || '',
            postalCode: userData.postalCode || '',
            city: userData.city || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Fout', 'Kan gebruikersgegevens niet ophalen.');
      } finally {
        setLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const userOrders = await orderService.getOrdersByCustomerId(user.id);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserData();
    if (user) {
      fetchOrders();
    }
  }, []);

  // Handle profile update
  const handleUpdateProfile = async () => {
    // Validatie
    if (!editedUser.firstName || !editedUser.lastName || !editedUser.email) {
      Alert.alert('Fout', 'Vul alle verplichte velden in.');
      return;
    }

    try {
      setLoading(true);
      await authService.updateProfile(editedUser);
      
      // Update lokale state
      setUser(prevUser => ({
        ...prevUser,
        ...editedUser
      }));
      
      setIsEditing(false);
      Alert.alert('Succes', 'Je profiel is bijgewerkt.');
    } catch (error) {
      console.error('Profiel update fout:', error);
      Alert.alert('Fout', error.message || 'Kon profiel niet bijwerken.');
    } finally {
      setLoading(false);
    }
  };

  // Uitloggen
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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

  // Render loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Render profile screen
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.screenTitle}>Mijn Profiel</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editButton}>Bewerken</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(false)}>
            <Text style={styles.editButton}>Annuleren</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.profileSection}>
        {isEditing ? (
          // Bewerkbare profielvelden
          <>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Voornaam *</Text>
                <TextInput
                  style={styles.input}
                  value={editedUser.firstName}
                  onChangeText={(text) => setEditedUser(prev => ({...prev, firstName: text}))}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Achternaam *</Text>
                <TextInput
                  style={styles.input}
                  value={editedUser.lastName}
                  onChangeText={(text) => setEditedUser(prev => ({...prev, lastName: text}))}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail *</Text>
              <TextInput
                style={styles.input}
                value={editedUser.email}
                onChangeText={(text) => setEditedUser(prev => ({...prev, email: text}))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Telefoonnummer</Text>
              <TextInput
                style={styles.input}
                value={editedUser.phoneNumber}
                onChangeText={(text) => setEditedUser(prev => ({...prev, phoneNumber: text}))}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Adres</Text>
              <TextInput
                style={styles.input}
                value={editedUser.address}
                onChangeText={(text) => setEditedUser(prev => ({...prev, address: text}))}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Postcode</Text>
                <TextInput
                  style={styles.input}
                  value={editedUser.postalCode}
                  onChangeText={(text) => setEditedUser(prev => ({...prev, postalCode: text}))}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Plaats</Text>
                <TextInput
                  style={styles.input}
                  value={editedUser.city}
                  onChangeText={(text) => setEditedUser(prev => ({...prev, city: text}))}
                />
              </View>
            </View>

            <Button 
              title="Profiel Bijwerken" 
              onPress={handleUpdateProfile}
              style={styles.updateButton}
            />
          </>
        ) : (
          // Weergave profielgegevens
          <>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>

            <View style={styles.contactInfo}>
              <Text style={styles.infoLabel}>Contact Informatie</Text>
              <Text>{user.phoneNumber || 'Geen telefoonnummer'}</Text>
              <Text>{user.address || 'Geen adres'}</Text>
              <Text>{user.postalCode} {user.city}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recente Bestellingen</Text>
        {ordersLoading ? (
          <LoadingSpinner size="small" />
        ) : orders.length === 0 ? (
          <Text style={styles.noOrdersText}>Je hebt nog geen bestellingen geplaatst.</Text>
        ) : (
          orders.slice(0, 3).map(order => (
            <TouchableOpacity 
              key={order.id} 
              style={styles.orderItem}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>Bestelling #{order.id}</Text>
                <Text 
                  style={[
                    styles.orderStatus, 
                    { color: order.status === 'Delivered' ? '#2ecc71' : 
                              order.status === 'Cancelled' ? '#e74c3c' : '#f39c12' }
                  ]}
                >
                  {translateOrderStatus(order.status)}
                </Text>
              </View>
              <View style={styles.orderDetails}>
                <Text>Datum: {new Date(order.orderDate).toLocaleDateString()}</Text>
                <Text>Totaal: €{order.totalAmount.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        {orders.length > 0 && (
          <TouchableOpacity 
            style={styles.viewAllOrders}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Text style={styles.viewAllOrdersText}>Bekijk alle bestellingen</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.logoutSection}>
        <Button 
          title="Uitloggen" 
          onPress={handleLogout}
          style={styles.logoutButton}
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
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    color: '#E63946',
    fontWeight: '600',
  },
  profileSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  inputContainer: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
    color: '#666666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    color: '#666666',
    marginTop: 4,
  },
  contactInfo: {
    marginTop: 16,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  updateButton: {
    marginTop: 16,
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
  noOrdersText: {
    textAlign: 'center',
    color: '#666666',
  },
  orderItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontWeight: 'bold',
  },
  orderStatus: {
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewAllOrders: {
    marginTop: 16,
    alignItems: 'center',
  },
  viewAllOrdersText: {
    color: '#E63946',
    fontWeight: '600',
  },
  logoutSection: {
    margin: 16,
  },
  logoutButton: {
    borderColor: '#E63946',
  },
});

export default ProfileScreen;