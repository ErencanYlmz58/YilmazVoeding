// Basis API URL - dit zou je later moeten aanpassen naar de echte URL van je backend
const API_BASE_URL = 'https://api.yilmazvoeding.com/api';
// Voor lokale ontwikkeling:
// const API_BASE_URL = 'http://localhost:5000/api';

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
        
        const responseData = await response.json();
        return responseData;
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
        // Voor een echte implementatie zou je een aparte inlog endpoint hebben
        // Deze code is een simulatie voor het prototype
        try {
            const response = await apiRequest(`customers/email/${email}`);
            
            if (response && response.password === password) {
                // Simulatie van een token (in productie zou je een echte JWT token krijgen)
                const token = `dummy-token-${Math.random()}`;
                localStorage.setItem('authToken', token);
                localStorage.setItem('userId', response.id);
                
                // Verwijder wachtwoord voordat we het user object teruggeven
                const { password, ...userWithoutPassword } = response;
                return userWithoutPassword;
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
            if (error.message.includes('401')) {
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
    }
};

// API objecten beschikbaar maken in global scope
window.api = {
    category: categoryApi,
    product: productApi,
    customer: customerApi,
    order: orderApi
};