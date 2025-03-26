import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = 'yilmaz_cart';

const cartService = {
  // Winkelwagen ophalen uit lokale opslag
  getCart: async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : { items: [], totalAmount: 0 };
    } catch (error) {
      console.error('Error retrieving cart:', error);
      return { items: [], totalAmount: 0 };
    }
  },

  // Winkelwagen opslaan in lokale opslag
  saveCart: async (cart) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      return true;
    } catch (error) {
      console.error('Error saving cart:', error);
      return false;
    }
  },

  // Product toevoegen aan winkelwagen
  addToCart: async (product, quantity = 1) => {
    try {
      const cart = await cartService.getCart();
      
      // Kijk of product al in winkelwagen zit
      const existingItemIndex = cart.items.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update hoeveelheid als product al bestaat
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Voeg nieuw item toe als product nog niet in winkelwagen zit
        cart.items.push({
          product,
          quantity
        });
      }
      
      // Bereken totaalbedrag opnieuw
      cart.totalAmount = cart.items.reduce((total, item) => 
        total + (item.product.price * item.quantity), 0);
      
      await cartService.saveCart(cart);
      return cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Verwijder product uit winkelwagen
  removeFromCart: async (productId) => {
    try {
      const cart = await cartService.getCart();
      
      // Filter item uit de winkelwagen
      cart.items = cart.items.filter(item => item.product.id !== productId);
      
      // Bereken totaalbedrag opnieuw
      cart.totalAmount = cart.items.reduce((total, item) => 
        total + (item.product.price * item.quantity), 0);
      
      await cartService.saveCart(cart);
      return cart;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Update hoeveelheid van een product in winkelwagen
  updateQuantity: async (productId, quantity) => {
    try {
      const cart = await cartService.getCart();
      
      // Zoek het item in de winkelwagen
      const itemIndex = cart.items.findIndex(item => item.product.id === productId);
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Verwijder het product als de hoeveelheid 0 of minder is
          return await cartService.removeFromCart(productId);
        } else {
          // Update de hoeveelheid
          cart.items[itemIndex].quantity = quantity;
          
          // Bereken totaalbedrag opnieuw
          cart.totalAmount = cart.items.reduce((total, item) => 
            total + (item.product.price * item.quantity), 0);
          
          await cartService.saveCart(cart);
        }
      }
      
      return cart;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  },

  // Winkelwagen leegmaken
  clearCart: async () => {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      return { items: [], totalAmount: 0 };
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};

export default cartService;