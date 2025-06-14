import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { CartItem, Product, PriceSlab } from '../types';
import { supabase } from '../lib/supabase';

interface CartStore {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, slab: PriceSlab) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
  syncWithDatabase: (userId: string) => Promise<void>;
  loadFromDatabase: (userId: string) => Promise<void>;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (product: Product, quantity = 1, slab: PriceSlab) => {
        const { cartItems } = get();
        
        const existingItem = cartItems.find(item => item.product.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          
          if (newQuantity > product.available_quantity) {
            toast.error(`Only ${product.available_quantity} bags available for ${product.name}`);
            return;
          }

          if (newQuantity > 50) {
            toast.error('Maximum 50 bags per product allowed');
            return;
          }

          set({
            cartItems: cartItems.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: newQuantity, selectedSlab: slab }
                : item
            ),
          });
          
          toast.success(`Updated ${product.name} quantity in cart`);
        } else {
          if (quantity > product.available_quantity) {
            toast.error(`Only ${product.available_quantity} bags available for ${product.name}`);
            return;
          }

          set({
            cartItems: [...cartItems, { product, quantity, selectedSlab: slab }],
          });
          
          toast.success(`Added ${product.name} to cart`);
        }

        // Sync with database if user is logged in
        supabase.auth.getSession().then(({ data }) => {
          const user = data.session?.user;
          if (user) {
            get().syncWithDatabase(user.id);
          }
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        const { cartItems } = get();

        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        const item = cartItems.find(item => item.product.id === productId);
        if (!item) return;

        if (quantity > item.product.available_quantity) {
          toast.error(`Only ${item.product.available_quantity} bags available for ${item.product.name}`);
          return;
        }

        if (quantity > 50) {
          toast.error('Maximum 50 bags per product allowed');
          return;
        }

        set({
          cartItems: cartItems.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          ),
        });

        // Sync with database if user is logged in
        supabase.auth.getSession().then(({ data }) => {
          const user = data.session?.user;
          if (user) {
            get().syncWithDatabase(user.id);
          }
        });
      },

      removeFromCart: (productId: string) => {
        const { cartItems } = get();
        const itemToRemove = cartItems.find(item => item.product.id === productId);

        if (itemToRemove) {
          set({
            cartItems: cartItems.filter(item => item.product.id !== productId),
          });
          
          toast.success(`Removed ${itemToRemove.product.name} from cart`);

          // Sync with database if user is logged in
          supabase.auth.getSession().then(({ data }) => {
            const user = data.session?.user;
            if (user) {
              get().syncWithDatabase(user.id);
            }
          });
        }
      },

      clearCart: () => {
        set({ cartItems: [] });
        
        // Sync with database if user is logged in
        supabase.auth.getSession().then(({ data }) => {
          const user = data.session?.user;
          if (user) {
            get().syncWithDatabase(user.id);
          }
        });
      },

      getTotalAmount: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, item) => {
          return total + (item.selectedSlab.price_per_bag * item.quantity);
        }, 0);
      },

      getTotalItems: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, item) => total + item.quantity, 0);
      },

      syncWithDatabase: async (userId: string) => {
        const { cartItems } = get();

        try {
          // Clear existing cart items for the user
          await supabase
            .from('user_sessions')
            .upsert({
              user_id: userId,
              cart_data: cartItems.map(item => ({
                product: item.product,
                quantity: item.quantity,
                selectedSlab: item.selectedSlab
              }))
            });
        } catch (error) {
          console.error('Error syncing cart with database:', error);
        }
      },

      loadFromDatabase: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('user_sessions')
            .select('cart_data')
            .eq('user_id', userId)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error loading cart from database:', error);
            return;
          }

          if (data?.cart_data && Array.isArray(data.cart_data)) {
            set({ cartItems: data.cart_data });
          }
        } catch (error) {
          console.error('Error loading cart from database:', error);
        }
      },
    }),
    {
      name: 'svl-cart-storage',
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);