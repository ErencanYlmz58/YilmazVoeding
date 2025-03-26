// Basis API URL configuratie
const getApiUrl = () => {
    const host = window.location.hostname;
    
    // Lokale ontwikkeling
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'https://localhost:54645/api';
    }
    
    // Test omgeving
    if (host === 'staging.yilmazvoeding.com') {
      return 'https://api-staging.yilmazvoeding.com/api';
    }
    
    // Productie
    return 'https://api.yilmazvoeding.com/api';
  };
  
  // Basis API URL
  const API_BASE_URL = getApiUrl();
  
  // Helper functie voor het maken van API requests
  async function apiRequest(endpoint, method = 'GET', data = null) {
      const url = `${API_BASE_URL}/${endpoint}`;
      
      const options = {
          method,
          headers: {
              'Content-Type': 'application/json'
          }
      };
      
      // Token toevoegen als gebruiker is ingelogd
      const token = localStorage.getItem('authToken');
      if (token) {
          options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Body toevoegen voor POST, PUT requests
      if (data && (method === 'POST' || method === 'PUT')) {
          options.body = JSON.stringify(data);
      }
      
      try {
          const response = await fetch(url, options);
          
          // Token verlopen of ongeldig? Uitloggen en naar login pagina
          if (response.status === 401) {
              localStorage.removeItem('authToken');
              localStorage.removeItem('userId');
              window.location.href = '/pages/login.html';
              throw new Error('Je sessie is verlopen. Log opnieuw in.');
          }
          
          // Als response niet OK is (4xx of 5xx)
          if (!response.ok) {
              // Als de server een JSON foutmelding heeft teruggegeven
              if (response.headers.get('content-type')?.includes('application/json')) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Er is een fout opgetreden.');
              } else {
                  throw new Error(`HTTP Error: ${response.status}`);
              }
          }
          
          // Empty response check voor delete requests
          if (response.status === 204) {
              return null;
          }
          
          // Check of er JSON wordt geretourneerd
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
              const responseData = await response.json();
              return responseData;
          } else {
              // Als geen JSON, return plain text
              return await response.text();
          }
      } catch (error) {
          console.error('API Request Error:', error);
          throw error;
      }
  }
  
  // Categorieën API
  const categoryApi = {
      // Alle categorieën ophalen
      getAll: async () => {
          return await apiRequest('categories');
      },
      
      // Categorie op ID ophalen
      getById: async (id) => {
          return await apiRequest(`categories/${id}`);
      }
  };
  
  // Producten API
  const productApi = {
      // Alle producten ophalen
      getAll: async () => {
          return await apiRequest('products');
      },
      
      // Product op ID ophalen
      getById: async (id) => {
          return await apiRequest(`products/${id}`);
      },
      
      // Producten per categorie ophalen
      getByCategory: async (categoryId) => {
          return await apiRequest(`products/category/${categoryId}`);
      }
  };
  
  // Klanten API
  const customerApi = {
      // Registreren
      register: async (userData) => {
          return await apiRequest('customers', 'POST', userData);
      },
      
      // Inloggen
      login: async (email, password) => {
          try {
              const response = await apiRequest('auth/login', 'POST', { email, password });
              
              if (response && response.token) {
                  localStorage.setItem('authToken', response.token);
                  localStorage.setItem('userId', response.userId);
                  
                  return response.user;
              } else {
                  throw new Error('Ongeldige inloggegevens');
              }
          } catch (error) {
              console.error('Login Error:', error);
              throw new Error('Inloggen mislukt. Controleer je gegevens en probeer het opnieuw.');
          }
      },
      
      // Uitloggen
      logout: () => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('cartItems');
      },
      
      // Huidige gebruiker ophalen
      getCurrentUser: async () => {
          const userId = localStorage.getItem('userId');
          if (!userId) return null;
          
          try {
              return await apiRequest(`customers/${userId}`);
          } catch (error) {
              // Als het token niet meer geldig is, log uit
              if (error.message.includes('sessie is verlopen')) {
                  customerApi.logout();
              }
              return null;
          }
      },
      
      // Gebruikersprofiel bijwerken
      updateProfile: async (userData) => {
          const userId = localStorage.getItem('userId');
          if (!userId) throw new Error('Niet ingelogd');
          
          return await apiRequest(`customers/${userId}`, 'PUT', userData);
      }
  };
  
  // Bestellingen API
const orderApi = {
    // Bestelling plaatsen
    create: async (orderData) => {
        return await apiRequest('orders', 'POST', orderData);
    },
    
    // Bestellingen voor een gebruiker ophalen
    getForUser: async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error('Niet ingelogd');
        
        return await apiRequest(`orders/customer/${userId}`);
    },
    
    // Specifieke bestelling ophalen
    getById: async (id) => {
        return await apiRequest(`orders/${id}`);
    },
    
    // Bestelling status bijwerken
    updateStatus: async (id, status) => {
        return await apiRequest(`orders/${id}/status`, 'PUT', status);
    }
};

// API objecten beschikbaar maken in global scope
window.api = {
    category: categoryApi,
    product: productApi,
    customer: customerApi,
    order: orderApi
};