export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  base_price: number;
  available_quantity: number;
  weight: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  price_slabs: PriceSlab[];
}

export interface PriceSlab {
  id: string;
  product_id: string;
  min_quantity: number;
  max_quantity: number | null;
  price_per_bag: number;
  label: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSlab: PriceSlab;
}

export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  gst_number?: string;
  delivery_address: Address;
  order_type: 'instant' | 'preorder';
  payment_status: 'pending' | 'partial' | 'completed';
  order_status: 'pending' | 'prepaid' | 'fully_paid' | 'dispatched' | 'delivered';
  payment_hash: string;
  upi_link: string;
  created_at: string;
  updated_at: string;
  scheduled_delivery?: string;
  transportation_required?: boolean;
  transportation_amount?: number;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_per_bag: number;
  slab_label: string;
  products?: Product;
}

export interface Address {
  fullAddress: string;
  pincode: string;
  landmark?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  is_active: boolean;
  valid_until: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  search?: string;
  category?: string;
  sortBy?: 'name' | 'price-low' | 'price-high' | 'availability';
  minPrice?: number;
  maxPrice?: number;
}