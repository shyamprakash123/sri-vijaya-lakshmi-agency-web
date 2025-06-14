import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Database service functions
export const productService = {
  async getAll(filters?: { category?: string; search?: string }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        price_slabs (*)
      `)
      .eq('is_active', true)
      .order('name');

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        price_slabs (*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  },

  async updateQuantity(id: string, quantity: number) {
    const { data, error } = await supabase
      .from('products')
      .update({ available_quantity: quantity })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async create(product: any) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const bannerService = {
  async getAll() {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (error) throw error;
    return data;
  },

  async create(banner: any) {
    const { data, error } = await supabase
      .from('banners')
      .insert(banner)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const orderService = {
  async create(orderData: {
    total_amount: number;
    gst_number?: string;
    delivery_address: any;
    order_type: 'instant' | 'preorder';
    payment_hash: string;
    upi_link: string;
    scheduled_delivery?: string;
    items: Array<{
      product_id: string;
      quantity: number;
      price_per_bag: number;
      slab_label: string;
    }>;
  }) {
    const { items, ...order } = orderData;
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert({
        ...order,
        user_id: user?.id || null
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      ...item,
      order_id: orderResult.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return orderResult;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const couponService = {
  async getByCode(code: string) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .single();

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// Cart service for session storage
export const cartService = {
  async saveCart(userId: string, cartItems: any[]) {
    const { data, error } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        cart_data: cartItems,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCart(userId: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('cart_data')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.cart_data || [];
  },

  async clearCart(userId: string) {
    const { error } = await supabase
      .from('user_sessions')
      .update({ cart_data: [] })
      .eq('user_id', userId);

    if (error) throw error;
  }
};

// Announcement service
export const announcementService = {
  async getAll() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(announcement: any) {
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcement)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};