// Cart module voor het beheren van de winkelwagen
const cart = (function() {
    // Private variabelen en functies
    const CART_STORAGE_KEY = 'yilmaz_cart';
    let cartItems = [];
    let cartTotal = 0;
    
    // Cart uit local storage ophalen
    function loadCart() {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                cartItems = parsedCart.items || [];
                cartTotal = parsedCart.total || 0;
                
                // Valideer cart items
                cartItems = cartItems.filter(item => validateCartItem(item));
                
                // Bereken total opnieuw om zeker te zijn dat het klopt
                calculateTotal();
            } catch (e) {
                console.error('Error parsing cart from localStorage:', e);
                cartItems = [];
                cartTotal = 0;
            }
        }
    }
    
    // Valideer cart item
    function validateCartItem(item) {
        return (
            item &&
            typeof item === 'object' &&
            typeof item.id === 'number' &&
            typeof item.name === 'string' &&
            typeof item.price === 'number' &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
        );
    }
    
    // Cart opslaan in local storage
    function saveCart() {
        const cartData = {
            items: cartItems,
            total: cartTotal
        };
        
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
            updateCartBadge();
        } catch (e) {
            console.error('Error saving cart to localStorage:', e);
            
            // Toon foutmelding als localStorage vol is
            if (e.name === 'QuotaExceededError') {
                showNotification('De winkelwagen kon niet worden opgeslagen. Probeer enkele items te verwijderen.', 'error');
            }
        }
    }
    
    // Totaalbedrag van de winkelwagen berekenen
    function calculateTotal() {
        cartTotal = cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        return cartTotal;
    }
    
    // Winkelwagen badge bijwerken in de header
    function updateCartBadge() {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
            cartCountElement.textContent = itemCount;
            
            // Toon of verberg badge op basis van aantal items
            if (itemCount > 0) {
                cartCountElement.style.display = 'flex';
            } else {
                cartCountElement.style.display = 'none';
            }
        }
    }
    
    // Winkelwagen items weergeven op de winkelwagen pagina
    function displayCartItems() {
        const cartContainer = document.getElementById('cart-items-container');
        if (!cartContainer) return;
        
        if (cartItems.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Je winkelwagen is leeg</p>
                    <a href="products.html" class="btn-primary">Producten bekijken</a>
                </div>
            `;
            
            // Verberg totalen en checkout knop
            const cartTotals = document.getElementById('cart-totals');
            const checkoutButton = document.getElementById('checkout-button');
            
            if (cartTotals) cartTotals.style.display = 'none';
            if (checkoutButton) checkoutButton.style.display = 'none';
            
            return;
        }
        
        let cartHTML = '';
        
        cartItems.forEach(item => {
            cartHTML += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.imageUrl || '../assets/images/product-placeholder.jpg'}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p class="price">€${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="btn-decrease" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-increase">+</button>
                    </div>
                    <div class="cart-item-total">
                        <p>€${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button class="btn-remove" aria-label="Verwijder item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
        
        cartContainer.innerHTML = cartHTML;
        
        // Totaalbedrag bijwerken
        const subtotalElement = document.getElementById('cart-subtotal');
        const totalElement = document.getElementById('cart-total');
        
        if (subtotalElement) subtotalElement.textContent = `€${cartTotal.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `€${cartTotal.toFixed(2)}`;
        
        // Event listeners toevoegen
        addCartEventListeners();
        
        // Checkout sectie tonen
        const cartTotals = document.getElementById('cart-totals');
        const checkoutButton = document.getElementById('checkout-button');
        
        if (cartTotals) cartTotals.style.display = 'block';
        if (checkoutButton) checkoutButton.style.display = 'block';
    }
    
    // Event listeners toevoegen aan de winkelwagen items
    function addCartEventListeners() {
        // Event listener voor hoeveelheid verminderen
        document.querySelectorAll('.btn-decrease').forEach(button => {
            if (button.hasAttribute('disabled')) {
                button.classList.add('disabled');
            } else {
                button.addEventListener('click', function() {
                    const cartItem = this.closest('.cart-item');
                    const productId = parseInt(cartItem.dataset.id);
                    cart.decreaseQuantity(productId);
                    displayCartItems();
                });
            }
        });
        
        // Event listener voor hoeveelheid verhogen
        document.querySelectorAll('.btn-increase').forEach(button => {
            button.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                const productId = parseInt(cartItem.dataset.id);
                cart.increaseQuantity(productId);
                displayCartItems();
            });
        });
        
        // Event listener voor product verwijderen
        document.querySelectorAll('.btn-remove').forEach(button => {
            button.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                const productId = parseInt(cartItem.dataset.id);
                
                // Bevestiging vragen voor verwijderen
                if (confirm('Weet je zeker dat je dit product wilt verwijderen?')) {
                    cart.removeFromCart(productId);
                    displayCartItems();
                }
            });
        });
    }
    
    // Notificatie tonen
    function showNotification(message, type = 'success') {
        // Check of notificatie container bestaat, zo niet, maak deze aan
        let notificationContainer = document.querySelector('.notification-container');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.classList.add('notification-container');
            document.body.appendChild(notificationContainer);
        }
        
        // Creëer notificatie element
        const notification = document.createElement('div');
        notification.classList.add('notification');
        
        // Voeg type klasse toe voor verschillende stijlen
        if (type === 'error') {
            notification.classList.add('notification-error');
        } else if (type === 'warning') {
            notification.classList.add('notification-warning');
        } else {
            notification.classList.add('notification-success');
        }
        
        notification.innerHTML = `
            <p>${message}</p>
            <button class="notification-close" aria-label="Sluiten"><i class="fas fa-times"></i></button>
        `;
        
        // Voeg notificatie toe aan container
        notificationContainer.appendChild(notification);
        
        // Toon notificatie met een fade-in effect
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Verwijder notificatie na 3 seconden
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
        
        // Event listener voor sluit knop
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    // Public API
    return {
        // Winkelwagen initialiseren
        init: function() {
            loadCart();
            updateCartBadge();
            
            // Als we op de cart pagina zijn, toon de winkelwagen items
            if (window.location.pathname.includes('cart.html')) {
                displayCartItems();
            }
        },
        
        // Product toevoegen aan winkelwagen
        addToCart: function(product, quantity = 1) {
            // Valideer product
            if (!product || typeof product !== 'object' || !product.id) {
                console.error('Invalid product:', product);
                return cartItems;
            }
            
            // Valideer quantity
            quantity = parseInt(quantity);
            if (isNaN(quantity) || quantity <= 0) {
                quantity = 1;
            }
            
            // Standaard maximale hoeveelheid
            const maxQuantity = 99;
            
            // Check of het product al in de winkelwagen zit
            const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
            
            if (existingItemIndex !== -1) {
                // Update hoeveelheid als product al bestaat
                cartItems[existingItemIndex].quantity = Math.min(
                    cartItems[existingItemIndex].quantity + quantity,
                    maxQuantity
                );
                
                // Toon melding als maximum is bereikt
                if (cartItems[existingItemIndex].quantity === maxQuantity) {
                    showNotification(`Maximum aantal van ${maxQuantity} bereikt voor dit product.`, 'warning');
                }
            } else {
                // Voeg nieuw product toe
                cartItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    quantity: Math.min(quantity, maxQuantity)
                });
            }
            
            calculateTotal();
            saveCart();
            
            // Toon bevestiging
            showNotification(`${product.name} is toegevoegd aan je winkelwagen.`);
            
            return cartItems;
        },
        
        // Hoeveelheid verminderen van product in winkelwagen
        decreaseQuantity: function(productId) {
            const itemIndex = cartItems.findIndex(item => item.id === productId);
            
            if (itemIndex !== -1) {
                cartItems[itemIndex].quantity--;
                
                // Verwijder het item als de hoeveelheid 0 is
                if (cartItems[itemIndex].quantity <= 0) {
                    cartItems.splice(itemIndex, 1);
                }
                
                calculateTotal();
                saveCart();
            }
            
            return cartItems;
        },
        
        // Hoeveelheid verhogen van product in winkelwagen
        increaseQuantity: function(productId) {
            const itemIndex = cartItems.findIndex(item => item.id === productId);
            
            if (itemIndex !== -1) {
                // Maximale hoeveelheid
                const maxQuantity = 99;
                
                if (cartItems[itemIndex].quantity < maxQuantity) {
                    cartItems[itemIndex].quantity++;
                    calculateTotal();
                    saveCart();
                } else {
                    // Toon melding als maximum is bereikt
                    showNotification(`Maximum aantal van ${maxQuantity} bereikt voor dit product.`, 'warning');
                }
            }
            
            return cartItems;
        },
        
        // Product verwijderen uit winkelwagen
        removeFromCart: function(productId) {
            const itemIndex = cartItems.findIndex(item => item.id === productId);
            
            if (itemIndex !== -1) {
                // Sla naam op voor de notificatie
                const productName = cartItems[itemIndex].name;
                
                cartItems.splice(itemIndex, 1);
                calculateTotal();
                saveCart();
                
                // Toon bevestiging
                showNotification(`${productName} is verwijderd uit je winkelwagen.`);
            }
            
            return cartItems;
        },
        
        // Winkelwagen leegmaken
        clearCart: function() {
            cartItems = [];
            cartTotal = 0;
            saveCart();
            
            // Toon bevestiging
            showNotification('Je winkelwagen is leeggemaakt.');
            
            // Als we op de cart pagina zijn, update de weergave
            if (window.location.pathname.includes('cart.html')) {
                displayCartItems();
            }
        },
        
        // Winkelwagen items ophalen
        getItems: function() {
            return [...cartItems];
        },
        
        // Totaalbedrag ophalen
        getTotal: function() {
            return cartTotal;
        },
        
        // Aantal items in winkelwagen ophalen
        getItemCount: function() {
            return cartItems.reduce((count, item) => count + item.quantity, 0);
        },
        
        // Notificatie tonen
        showNotification: function(message, type = 'success') {
            showNotification(message, type);
        }
    };
})();

// Initialiseer winkelwagen bij laden van de pagina
document.addEventListener('DOMContentLoaded', function() {
    cart.init();
    
    // Event delegation voor "voeg toe aan winkelwagen" knoppen
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-add-cart') || 
            event.target.parentElement.classList.contains('btn-add-cart')) {
            
            const productCard = event.target.closest('.product-card');
            if (productCard) {
                const productId = parseInt(productCard.dataset.id);
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace('€', ''));
                const productImage = productCard.querySelector('.product-image img').src;
                
                const product = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    imageUrl: productImage
                };
                
                cart.addToCart(product);
            }
        }
    });
    
    // Event listener voor checkout knop
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            // Check of gebruiker is ingelogd
            const isLoggedIn = !!localStorage.getItem('authToken');
            
            if (isLoggedIn) {
                window.location.href = 'checkout.html';
            } else {
                // Redirect naar login pagina met redirect parameter
                window.location.href = `login.html?redirect=checkout`;
            }
        });
    }
    
    // Event listener voor "winkelwagen leegmaken" knop
    const clearCartButton = document.getElementById('clear-cart-button');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', function() {
            if (confirm('Weet je zeker dat je de winkelwagen wilt leegmaken?')) {
                cart.clearCart();
            }
        });
    }
});