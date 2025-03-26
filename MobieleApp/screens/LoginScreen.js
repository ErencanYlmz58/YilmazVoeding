import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Button from '../components/Button';
import authService from '../services/authService';
import { AuthContext } from '../navigation/AppNavigator';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Gebruik AuthContext voor login status
  const { login } = useContext(AuthContext);

  const validateForm = () => {
    if (!email || !password) {
      setErrorMessage('Vul a.u.b. je e-mailadres en wachtwoord in.');
      return false;
    }
    
    // Eenvoudige e-mail validatie
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Voer een geldig e-mailadres in.');
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    // Reset error message
    setErrorMessage('');
    
    // Valideer invoer
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await authService.login(email, password);
      
      // Update de globale auth state
      await login();
    } catch (error) {
      // Toon duidelijke foutmelding
      if (error.status === 401) {
        setErrorMessage('Ongeldige inloggegevens. Controleer je e-mailadres en wachtwoord.');
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Er is een fout opgetreden tijdens het inloggen. Probeer het later opnieuw.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Inloggen</Text>
          <Text style={styles.subtitle}>
            Log in bij je Yilmaz Voeding account
          </Text>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mailadres</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-mailadres"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCompleteType="email"
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Wachtwoord</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Wachtwoord"
              secureTextEntry
              autoCompleteType="password"
              textContentType="password"
            />
          </View>

          <Button
            title="Inloggen"
            onPress={handleLogin}
            style={styles.loginButton}
            loading={loading}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Nog geen account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Registreren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#E63946',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
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
  },
  loginButton: {
    marginTop: 24,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#666666',
    marginRight: 4,
  },
  registerLink: {
    color: '#E63946',
    fontWeight: 'bold',
  },
});

export default LoginScreen;