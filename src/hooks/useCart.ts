import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { CartItem, Product, PriceSlab } from '../types';
import { supabase } from '../lib/supabase';

interface CartStore {
  cartItems: CartItem[];
  getTotalWeight: () => number;
  addToCart: (product: Product, quantity: number, slab: PriceSlab) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
  syncWithDatabase: (userId: string) => Promise<void>;
  loadFromDatabase: (userId: string) => Promise<void>;
}

// Helper function to get the appropriate slab for a quantity
const getSlabForQuantity = (product: Product, quantity: number): PriceSlab => {
  if (!product.price_slabs || product.price_slabs.length === 0) {
    return {
      id: 'default',
      product_id: product.id,
      min_quantity: 1,
      max_quantity: null,
      price_per_bag: product.base_price,
      label: 'Standard'
    };
  }

  const slab = product.price_slabs.find(slab => 
    quantity >= slab.min_quantity && 
    (slab.max_quantity === null || quantity <= slab.max_quantity)
  );

  return slab || product.price_slabs[0];
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],

      getTotalWeight() {
        const { cartItems } = get();
      
        const weight = cartItems.reduce((total, item) => {
          const itemWeight = parseFloat(item.product.weight.replace(/kg/i, '').trim()) || 0;
          return total + itemWeight * item.quantity;
        }, 0);
      
        return weight;
      },

      addToCart: (product: Product, quantity = 1, slab?: PriceSlab) => {
        const { cartItems } = get();
        
        // Check stock availability
        if (quantity > product.available_quantity) {
          toast.error(`Available Quantity Exceded for ${product.name}`);
          return;
        }
        
        const existingItem = cartItems.find(item => item.product.id === product.id);
        
        // Determine the appropriate slab based on quantity
        const selectedSlab = slab || getSlabForQuantity(product, quantity);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          
          if (newQuantity > product.available_quantity) {
            toast.error(`Available Quantity Exceded for ${product.name}`);
            return;
          }

          // if (newQuantity > 50) {
          //   toast.error('Maximum 70 bags per product allowed');
          //   return;
          // }

          // Update with new quantity and recalculate slab
          const newSlab = getSlabForQuantity(product, newQuantity);
          
          set({
            cartItems: cartItems.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: newQuantity, selectedSlab: newSlab }
                : item
            ),
          });
          
          toast.success(`Updated ${product.name} quantity in cart`);
        } else {
          if (quantity > product.available_quantity) {
            toast.error(`Available Quantity Exceded for ${product.name}`);
            return;
          }

          set({
            cartItems: [...cartItems, { product, quantity, selectedSlab }],
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
          toast.error(`Available Quantity Exceded for ${product.name}`);
          return;
        }

        // if (quantity > 50) {
        //   toast.error('Maximum 50 bags per product allowed');
        //   return;
        // }

        // Recalculate slab based on new quantity
        const newSlab = getSlabForQuantity(item.product, quantity);

        set({
          cartItems: cartItems.map(cartItem =>
            cartItem.product.id === productId
              ? { ...cartItem, quantity, selectedSlab: newSlab }
              : cartItem
          ),
        });

        // Show price change notification if slab changed
        if (newSlab.id !== item.selectedSlab.id) {
          toast.success(`Price updated to ${newSlab.label}: ₹${newSlab.price_per_bag}/bag`);
        }

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
            // Validate and update cart items with current product data
            const validatedItems: CartItem[] = [];
            
            for (const item of data.cart_data) {
              try {
                // Fetch current product data to ensure stock availability and pricing
                const { data: currentProduct } = await supabase
                  .from('products')
                  .select(`
                    *,
                    price_slabs (*)
                  `)
                  .eq('id', item.product.id)
                  .eq('is_active', true)
                  .single();

                if (currentProduct) {
                  // Update quantity if it exceeds current stock
                  const validQuantity = Math.min(item.quantity, currentProduct.available_quantity);
                  
                  if (validQuantity > 0) {
                    // Recalculate slab for current quantity
                    const updatedSlab = getSlabForQuantity(currentProduct, validQuantity);
                    
                    validatedItems.push({
                      product: currentProduct,
                      quantity: validQuantity,
                      selectedSlab: updatedSlab
                    });
                  }
                }
              } catch (error) {
                console.error('Error validating cart item:', error);
              }
            }
            
            set({ cartItems: validatedItems });
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