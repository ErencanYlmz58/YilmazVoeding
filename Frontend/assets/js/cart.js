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
            } catch (e) {
                console.error('Error parsing cart from localStorage:', e);
                cartItems = [];
                cartTotal = 0;
            }
        }
    }
    
    // Cart opslaan in local storage
    function saveCart() {
        const cartData = {
            items: cartItems,
            total: cartTotal
        };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
        updateCartBadge();
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
            document.getElementById('cart-totals').style.display = 'none';
            document.getElementById('checkout-button').style.display = 'none';
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
                        <button class="btn-decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-increase">+</button>
                    </div>
                    <div class="cart-item-total">
                        <p>€${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button class="btn-remove">
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
        
        // Checkout knop tonen
        document.getElementById('cart-totals').style.display = 'block';
        document.getElementById('checkout-button').style.display = 'block';
    }
    
    // Event listeners toevoegen aan de winkelwagen items
    function addCartEventListeners() {
        // Event listener voor hoeveelheid verminderen
        document.querySelectorAll('.btn-decrease').forEach(button => {
            button.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                const productId = parseInt(cartItem.dataset.id);
                decreaseQuantity(productId);
                displayCartItems();
            });
        });
        
        // Event listener voor hoeveelheid verhogen
        document.querySelectorAll('.btn-increase').forEach(button => {
            button.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                const productId = parseInt(cartItem.dataset.id);
                increaseQuantity(productId);
                displayCartItems();
            });
        });
        
        // Event listener voor product verwijderen
        document.querySelectorAll('.btn-remove').forEach(button => {
            button.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                const productId = parseInt(cartItem.dataset.id);
                removeFromCart(productId);
                displayCartItems();
            });
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
            // Check of het product al in de winkelwagen zit
            const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
            
            if (existingItemIndex !== -1) {
                // Update hoeveelheid als product al bestaat
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                // Voeg nieuw product toe
                cartItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    quantity: quantity
                });
            }
            
            calculateTotal();
            saveCart();
            
            // Toon bevestiging
            this.showNotification(`${product.name} is toegevoegd aan je winkelwagen.`);
            
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
                cartItems[itemIndex].quantity++;
                calculateTotal();
                saveCart();
            }
            
            return cartItems;
        },
        
        // Product verwijderen uit winkelwagen
        removeFromCart: function(productId) {
            const itemIndex = cartItems.findIndex(item => item.id === productId);
            
            if (itemIndex !== -1) {
                cartItems.splice(itemIndex, 1);
                calculateTotal();
                saveCart();
            }
            
            return cartItems;
        },
        
        // Winkelwagen leegmaken
        clearCart: function() {
            cartItems = [];
            cartTotal = 0;
            saveCart();
            
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
        showNotification: function(message) {
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
            notification.innerHTML = `
                <p>${message}</p>
                <button class="notification-close"><i class="fas fa-times"></i></button>
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
});