// Main app module
(function() {
    // Helper functies
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    
    // Check login status en update UI
    async function checkLoginStatus() {
        try {
            const user = await window.api.customer.getCurrentUser();
            
            if (user) {
                // Update Login/Register knop naar gebruikersmenu
                const loginButton = document.querySelector('.btn-login');
                if (loginButton) {
                    loginButton.innerHTML = `<i class="fas fa-user"></i> ${user.firstName}`;
                    loginButton.href = 'pages/profile.html';
                    loginButton.classList.add('logged-in');
                }
                
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }
    
    // Initialisatie functie
    async function init() {
        // Check login status
        const isLoggedIn = await checkLoginStatus();
        
        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (mobileMenuToggle && mainNav) {
            mobileMenuToggle.addEventListener('click', function() {
                this.classList.toggle('active');
                mainNav.classList.toggle('active');
            });
        }
        
        // Authenticatie pagina's
        const currentPage = window.location.pathname;
        
        // Login pagina
        if (currentPage.includes('login.html')) {
            if (isLoggedIn) {
                // Redirect naar homepage als gebruiker al is ingelogd
                window.location.href = '../index.html';
                return;
            }
            
            const loginForm = document.getElementById('login-form');
            const errorMessage = document.getElementById('error-message');
            
            if (loginForm) {
                loginForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    
                    try {
                        await window.api.customer.login(email, password);
                        
                        // Successful login - check if there's a redirect
                        const redirect = getUrlParameter('redirect');
                        if (redirect === 'checkout') {
                            window.location.href = 'checkout.html';
                        } else {
                            window.location.href = '../index.html';
                        }
                    } catch (error) {
                        if (errorMessage) {
                            errorMessage.textContent = error.message;
                            errorMessage.style.display = 'block';
                        }
                    }
                });
            }
        }
        
        // Registratie pagina
        if (currentPage.includes('register.html')) {
            if (isLoggedIn) {
                // Redirect naar homepage als gebruiker al is ingelogd
                window.location.href = '../index.html';
                return;
            }
            
            const registerForm = document.getElementById('register-form');
            const errorMessage = document.getElementById('error-message');
            
            if (registerForm) {
                registerForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const userData = {
                        firstName: document.getElementById('first-name').value,
                        lastName: document.getElementById('last-name').value,
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value,
                        phoneNumber: document.getElementById('phone').value || '',
                        address: document.getElementById('address').value || '',
                        postalCode: document.getElementById('postal-code').value || '',
                        city: document.getElementById('city').value || ''
                    };
                    
                    // Valideer gegevens
                    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
                        if (errorMessage) {
                            errorMessage.textContent = 'Vul alle verplichte velden in.';
                            errorMessage.style.display = 'block';
                        }
                        return;
                    }
                    
                    // Valideer email
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(userData.email)) {
                        if (errorMessage) {
                            errorMessage.textContent = 'Vul een geldig e-mailadres in.';
                            errorMessage.style.display = 'block';
                        }
                        return;
                    }
                    
                    // Valideer wachtwoord (minimaal 6 tekens)
                    if (userData.password.length < 6) {
                        if (errorMessage) {
                            errorMessage.textContent = 'Wachtwoord moet minimaal 6 tekens bevatten.';
                            errorMessage.style.display = 'block';
                        }
                        return;
                    }
                    
                    try {
                        await window.api.customer.register(userData);
                        
                        // Toon succes melding en redirect naar login
                        alert('Registratie succesvol! Je kunt nu inloggen.');
                        window.location.href = 'login.html';
                    } catch (error) {
                        if (errorMessage) {
                            errorMessage.textContent = error.message;
                            errorMessage.style.display = 'block';
                        }
                    }
                });
            }
        }
        
        // Profiel pagina
        if (currentPage.includes('profile.html')) {
            if (!isLoggedIn) {
                // Redirect naar login als gebruiker niet is ingelogd
                window.location.href = 'login.html';
                return;
            }
            
            // Laad gebruikersgegevens
            const user = await window.api.customer.getCurrentUser();
            
            // Vul formulier met gebruikersgegevens
            document.getElementById('first-name').value = user.firstName || '';
            document.getElementById('last-name').value = user.lastName || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phoneNumber || '';
            document.getElementById('address').value = user.address || '';
            document.getElementById('postal-code').value = user.postalCode || '';
            document.getElementById('city').value = user.city || '';
            
            // Profiel bijwerken
            const profileForm = document.getElementById('profile-form');
            const errorMessage = document.getElementById('error-message');
            const successMessage = document.getElementById('success-message');
            
            if (profileForm) {
                profileForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const userData = {
                        id: user.id,
                        firstName: document.getElementById('first-name').value,
                        lastName: document.getElementById('last-name').value,
                        email: document.getElementById('email').value,
                        phoneNumber: document.getElementById('phone').value || '',
                        address: document.getElementById('address').value || '',
                        postalCode: document.getElementById('postal-code').value || '',
                        city: document.getElementById('city').value || ''
                    };
                    
                    // Valideer gegevens
                    if (!userData.firstName || !userData.lastName || !userData.email) {
                        if (errorMessage) {
                            errorMessage.textContent = 'Vul alle verplichte velden in.';
                            errorMessage.style.display = 'block';
                            successMessage.style.display = 'none';
                        }
                        return;
                    }
                    
                    try {
                        await window.api.customer.updateProfile(userData);
                        
                        if (successMessage) {
                            successMessage.textContent = 'Je profiel is bijgewerkt!';
                            successMessage.style.display = 'block';
                            errorMessage.style.display = 'none';
                        }
                    } catch (error) {
                        if (errorMessage) {
                            errorMessage.textContent = error.message;
                            errorMessage.style.display = 'block';
                            successMessage.style.display = 'none';
                        }
                    }
                });
            }
            
            // Uitloggen
            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.api.customer.logout();
                    window.location.href = '../index.html';
                });
            }
            
            // Bestellingen laden
            loadOrderHistory();
        }
        
        // Bestellingen pagina
        if (currentPage.includes('orders.html')) {
            if (!isLoggedIn) {
                // Redirect naar login als gebruiker niet is ingelogd
                window.location.href = 'login.html';
                return;
            }
            
            loadOrderHistory();
        }
        
        // Order detail pagina
        if (currentPage.includes('order-detail.html')) {
            if (!isLoggedIn) {
                // Redirect naar login als gebruiker niet is ingelogd
                window.location.href = 'login.html';
                return;
            }
            
            const orderId = getUrlParameter('id');
            if (!orderId) {
                window.location.href = 'orders.html';
                return;
            }
            
            try {
                const orderDetailContainer = document.getElementById('order-detail-container');
                if (!orderDetailContainer) return;
                
                const loadingSpinner = document.createElement('div');
                loadingSpinner.classList.add('loading-spinner');
                loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                orderDetailContainer.innerHTML = '';
                orderDetailContainer.appendChild(loadingSpinner);
                
                const order = await window.api.order.getById(orderId);
                
                // Format date
                const orderDate = new Date(order.orderDate);
                const formattedDate = orderDate.toLocaleDateString('nl-NL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                
                // Status vertaling
                const statusTranslations = {
                    'Pending': 'In afwachting',
                    'Processing': 'In behandeling',
                    'Shipped': 'Verzonden',
                    'Delivered': 'Afgeleverd',
                    'Cancelled': 'Geannuleerd'
                };
                
                const statusText = statusTranslations[order.status] || order.status;
                
                let orderHTML = `
                    <div class="order-detail-header">
                        <h1>Bestelling #${order.id}</h1>
                        <div class="order-meta">
                            <div class="order-date">
                                <span>Datum:</span> ${formattedDate}
                            </div>
                            <div class="order-status status-${order.status.toLowerCase()}">
                                <span>Status:</span> ${statusText}
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-sections">
                        <div class="order-section delivery-address">
                            <h2>Bezorgadres</h2>
                            <p>${order.deliveryAddress}</p>
                            <p>${order.deliveryPostalCode}, ${order.deliveryCity}</p>
                        </div>
                        
                        <div class="order-section order-items">
                            <h2>Bestelde producten</h2>
                            <div class="order-items-list">
                `;
                
                // Order items
                order.orderItems.forEach(item => {
                    orderHTML += `
                        <div class="order-item">
                            <div class="order-item-image">
                                <img src="${item.product.imageUrl || '../assets/images/product-placeholder.jpg'}" alt="${item.product.name}">
                            </div>
                            <div class="order-item-details">
                                <h3>${item.product.name}</h3>
                                <p class="price">€${item.unitPrice.toFixed(2)}</p>
                            </div>
                            <div class="order-item-quantity">
                                <span>${item.quantity}x</span>
                            </div>
                            <div class="order-item-total">
                                <p>€${(item.unitPrice * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    `;
                });
                
                orderHTML += `
                            </div>
                        </div>
                        
                        <div class="order-section order-summary">
                            <h2>Overzicht</h2>
                            <div class="order-totals">
                                <div class="order-total-row">
                                    <span>Subtotaal:</span>
                                    <span>€${order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div class="order-total-row">
                                    <span>Bezorgkosten:</span>
                                    <span>€0.00</span>
                                </div>
                                <div class="order-total-row total">
                                    <span>Totaal:</span>
                                    <span>€${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <a href="orders.html" class="btn-secondary">Terug naar bestellingen</a>
                    </div>
                `;
                
                orderDetailContainer.innerHTML = orderHTML;
                
            } catch (error) {
                console.error('Error loading order details:', error);
                const orderDetailContainer = document.getElementById('order-detail-container');
                if (orderDetailContainer) {
                    orderDetailContainer.innerHTML = `
                        <div class="error-message">
                            <p>Er is een fout opgetreden bij het laden van de bestelgegevens. Probeer het later opnieuw.</p>
                            <a href="orders.html" class="btn-secondary">Terug naar bestellingen</a>
                        </div>
                    `;
                }
            }
        }
        
        // Checkout pagina
        if (currentPage.includes('checkout.html')) {
            if (!isLoggedIn) {
                // Redirect naar login als gebruiker niet is ingelogd
                window.location.href = 'login.html?redirect=checkout';
                return;
            }
            
            // Winkelwagen items ophalen
            const cartItems = window.cart.getItems();
            if (cartItems.length === 0) {
                window.location.href = 'cart.html';
                return;
            }
            
            // Gebruiker ophalen
            const user = await window.api.customer.getCurrentUser();
            
            // Vul adresgegevens in
            document.getElementById('address').value = user.address || '';
            document.getElementById('postal-code').value = user.postalCode || '';
            document.getElementById('city').value = user.city || '';
            
            // Winkelwagen items weergeven
            const cartItems = window.cart.getItems();
            const checkoutItemsContainer = document.getElementById('checkout-items');
            
            let itemsHTML = '';
            cartItems.forEach(item => {
                itemsHTML += `
                    <div class="checkout-item">
                        <div class="checkout-item-name">
                            <span>${item.name}</span>
                            <span class="quantity">x${item.quantity}</span>
                        </div>
                        <div class="checkout-item-price">€${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                `;
            });
            
            checkoutItemsContainer.innerHTML = itemsHTML;
            
            // Totaalbedrag bijwerken
            const subtotalElement = document.getElementById('checkout-subtotal');
            const totalElement = document.getElementById('checkout-total');
            const cartTotal = window.cart.getTotal();
            
            subtotalElement.textContent = `€${cartTotal.toFixed(2)}`;
            totalElement.textContent = `€${cartTotal.toFixed(2)}`;
            
            // Formulier afhandelen
            const checkoutForm = document.getElementById('checkout-form');
            const errorMessage = document.getElementById('error-message');
            
            checkoutForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const address = document.getElementById('address').value;
                const postalCode = document.getElementById('postal-code').value;
                const city = document.getElementById('city').value;
                const notes = document.getElementById('notes').value;
                
                // Valideer adresgegevens
                if (!address || !postalCode || !city) {
                    errorMessage.textContent = 'Vul alle verplichte adresgegevens in.';
                    errorMessage.style.display = 'block';
                    return;
                }
                
                // Bestelgegevens voorbereiden
                const orderData = {
                    customerId: user.id,
                    orderItems: cartItems.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        unitPrice: item.price
                    })),
                    totalAmount: cartTotal,
                    deliveryAddress: address,
                    deliveryPostalCode: postalCode,
                    deliveryCity: city,
                    notes: notes
                };
                
                try {
                    // Plaats bestelling
                    const submitButton = document.getElementById('checkout-submit');
                    submitButton.disabled = true;
                    submitButton.textContent = 'Bestelling wordt geplaatst...';
                    
                    const order = await window.api.order.create(orderData);
                    
                    // Winkelwagen leegmaken
                    window.cart.clearCart();
                    
                    // Redirect naar bevestigingspagina
                    window.location.href = `order-detail.html?id=${order.id}&success=true`;
                } catch (error) {
                    errorMessage.textContent = 'Er is een fout opgetreden bij het plaatsen van je bestelling. Probeer het opnieuw.';
                    errorMessage.style.display = 'block';
                    
                    submitButton.disabled = false;
                    submitButton.textContent = 'Bestelling plaatsen';
                }
            });
        }
        
        // Bestelgeschiedenis laden
        function loadOrderHistory() {
            const ordersContainer = document.getElementById('orders-container');
            if (!ordersContainer) return;
            
            const loadingSpinner = document.createElement('div');
            loadingSpinner.classList.add('loading-spinner');
            loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            ordersContainer.innerHTML = '';
            ordersContainer.appendChild(loadingSpinner);
            
            window.api.order.getForUser()
                .then(orders => {
                    if (orders.length === 0) {
                        ordersContainer.innerHTML = `
                            <div class="no-orders">
                                <p>Je hebt nog geen bestellingen geplaatst.</p>
                                <a href="../index.html" class="btn-primary">Ga winkelen</a>
                            </div>
                        `;
                        return;
                    }
                    
                    let ordersHTML = '';
                    
                    // Status vertaling
                    const statusTranslations = {
                        'Pending': 'In afwachting',
                        'Processing': 'In behandeling',
                        'Shipped': 'Verzonden',
                        'Delivered': 'Afgeleverd',
                        'Cancelled': 'Geannuleerd'
                    };
                    
                    orders.forEach(order => {
                        // Format date
                        const orderDate = new Date(order.orderDate);
                        const formattedDate = orderDate.toLocaleDateString('nl-NL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });
                        
                        const statusText = statusTranslations[order.status] || order.status;
                        
                        ordersHTML += `
                            <div class="order-card">
                                <div class="order-header">
                                    <div class="order-number">
                                        <span>Bestelnummer:</span>
                                        <strong>#${order.id}</strong>
                                    </div>
                                    <div class="order-date">
                                        <span>Datum:</span>
                                        <strong>${formattedDate}</strong>
                                    </div>
                                </div>
                                <div class="order-status status-${order.status.toLowerCase()}">
                                    <span>Status:</span>
                                    <strong>${statusText}</strong>
                                </div>
                                <div class="order-total">
                                    <span>Totaalbedrag:</span>
                                    <strong>€${order.totalAmount.toFixed(2)}</strong>
                                </div>
                                <div class="order-items-count">
                                    <span>Aantal producten:</span>
                                    <strong>${order.orderItems.length}</strong>
                                </div>
                                <div class="order-actions">
                                    <a href="order-detail.html?id=${order.id}" class="btn-outline">Details bekijken</a>
                                </div>
                            </div>
                        `;
                    });
                    
                    ordersContainer.innerHTML = ordersHTML;
                })
                .catch(error => {
                    console.error('Error loading orders:', error);
                    ordersContainer.innerHTML = `
                        <div class="error-message">
                            <p>Er is een fout opgetreden bij het laden van je bestellingen. Probeer het later opnieuw.</p>
                        </div>
                    `;
                });
        }
    }
    
    // Document ready
    document.addEventListener('DOMContentLoaded', init);
})();