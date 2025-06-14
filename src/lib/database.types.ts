export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          image: string
          base_price: number
          available_quantity: number
          weight: string
          category: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image: string
          base_price: number
          available_quantity?: number
          weight: string
          category: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image?: string
          base_price?: number
          available_quantity?: number
          weight?: string
          category?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      price_slabs: {
        Row: {
          id: string
          product_id: string
          min_quantity: number
          max_quantity: number | null
          price_per_bag: number
          label: string
        }
        Insert: {
          id?: string
          product_id: string
          min_quantity: number
          max_quantity?: number | null
          price_per_bag: number
          label: string
        }
        Update: {
          id?: string
          product_id?: string
          min_quantity?: number
          max_quantity?: number | null
          price_per_bag?: number
          label?: string
        }
      }
      banners: {
        Row: {
          id: string
          title: string
          description: string | null
          image: string
          link: string | null
          is_active: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image: string
          link?: string | null
          is_active?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image?: string
          link?: string | null
          is_active?: boolean
          order_index?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          total_amount: number
          gst_number: string | null
          delivery_address: Json
          order_type: 'instant' | 'preorder'
          payment_status: 'pending' | 'partial' | 'completed'
          order_status: 'pending' | 'prepaid' | 'fully_paid' | 'dispatched' | 'delivered'
          payment_hash: string
          upi_link: string
          scheduled_delivery: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          total_amount: number
          gst_number?: string | null
          delivery_address: Json
          order_type: 'instant' | 'preorder'
          payment_status?: 'pending' | 'partial' | 'completed'
          order_status?: 'pending' | 'prepaid' | 'fully_paid' | 'dispatched' | 'delivered'
          payment_hash: string
          upi_link: string
          scheduled_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          total_amount?: number
          gst_number?: string | null
          delivery_address?: Json
          order_type?: 'instant' | 'preorder'
          payment_status?: 'pending' | 'partial' | 'completed'
          order_status?: 'pending' | 'prepaid' | 'fully_paid' | 'dispatched' | 'delivered'
          payment_hash?: string
          upi_link?: string
          scheduled_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_per_bag: number
          slab_label: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price_per_bag: number
          slab_label: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_per_bag?: number
          slab_label?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_order_amount: number
          max_discount: number | null
          is_active: boolean
          valid_until: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_order_amount?: number
          max_discount?: number | null
          is_active?: boolean
          valid_until: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          min_order_amount?: number
          max_discount?: number | null
          is_active?: boolean
          valid_until?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}