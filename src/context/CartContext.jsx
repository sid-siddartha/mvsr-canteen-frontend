import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('canteenease_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('canteenease_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.menuItem._id === item._id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.menuItem._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { menuItem: item, quantity: 1 }];
    });
  };

  const decreaseQuantity = (itemId) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.menuItem._id === itemId);
      if (existingItem.quantity === 1) {
        return prevItems.filter((i) => i.menuItem._id !== itemId);
      }
      return prevItems.map((i) =>
        i.menuItem._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.menuItem._id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
  };

  const getItemQuantity = (itemId) => {
    const item = cartItems.find((i) => i.menuItem._id === itemId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        getCartCount,
        getCartTotal,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
