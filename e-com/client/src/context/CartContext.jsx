import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('verve_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('verve_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  const showNotification = (message, type = 'success') => {
    setCartFeedback({ message, type });
    setTimeout(() => {
      setCartFeedback(null);
    }, 3000);
  };

  /**
   * Add product to cart with stock validation
   */
  const addToCart = (product, quantity = 1) => {
    if (!product || product.stock <= 0) {
      showNotification('This item is currently out of stock.', 'error');
      return false;
    }

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product._id === product._id);

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = currentQty + quantity;

        if (newQty > product.stock) {
          showNotification(
            `Cannot add more. Only ${product.stock} units currently available in stock.`,
            'error'
          );
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        };
        showNotification(`Updated quantity of "${product.name}" in cart.`);
        return updated;
      } else {
        if (quantity > product.stock) {
          showNotification(`Only ${product.stock} units available in stock.`, 'error');
          return prevItems;
        }

        showNotification(`Added "${product.name}" to cart.`);
        return [...prevItems, { product, quantity }];
      }
    });

    setIsCartOpen(true);
    return true;
  };

  /**
   * Update quantity of item in cart
   */
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product._id === productId) {
          const maxStock = item.product.stock;
          if (quantity > maxStock) {
            showNotification(`Maximum available stock reached (${maxStock} units).`, 'error');
            return { ...item, quantity: maxStock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product._id !== productId));
    showNotification('Item removed from cart.', 'info');
  };

  /**
   * Clear cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Derived calculations
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const estimatedShipping = subtotal > 300 || subtotal === 0 ? 0 : 25;
  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = subtotal + estimatedShipping + estimatedTax;

  const value = {
    cartItems,
    isCartOpen,
    cartFeedback,
    totalItemsCount,
    subtotal,
    estimatedShipping,
    estimatedTax,
    grandTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    openCart,
    closeCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
