import { useState, useEffect } from 'react';
import { CartItem, Product, PriceSlab } from '../types';
import { useAuth } from './useAuth';
import { cartService } from '../lib/supabase';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const savedCart = await cartService.getCart(user.id);
          setCartItems(savedCart);
        } catch (error) {
          console.error('Failed to load cart from server:', error);
          // Fallback to localStorage
          const localCart = localStorage.getItem('cart');
          if (localCart) {
            setCartItems(JSON.parse(localCart));
          }
        }
      } else {
        // Load from localStorage for non-authenticated users
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }
    };

    loadCart();
  }, [user]);

  useEffect(() => {
    const saveCart = async () => {
      if (user) {
        try {
          await cartService.saveCart(user.id, cartItems);
        } catch (error) {
          console.error('Failed to save cart to server:', error);
        }
      }
      // Always save to localStorage as backup
      localStorage.setItem('cart', JSON.stringify(cartItems));
    };

    saveCart();
  }, [cartItems, user]);

  const addToCart = (product: Product, quantity: number, slab: PriceSlab) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, selectedSlab: slab }
            : item
        );
      }
      return [...prev, { product, quantity, selectedSlab: slab }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user) {
      try {
        await cartService.clearCart(user.id);
      } catch (error) {
        console.error('Failed to clear cart on server:', error);
      }
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.selectedSlab.price_per_bag * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalAmount,
    getTotalItems
  };
};