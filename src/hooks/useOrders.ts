import { useState } from 'react';
import { Order, CartItem, Address } from '../types';
import { orderService } from '../lib/supabase';

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (
    cartItems: CartItem[],
    deliveryAddress: Address,
    orderType: 'instant' | 'preorder',
    gstNumber?: string,
    scheduledDelivery?: string,
    transportationRequired?: boolean
  ): Promise<Order> => {
    try {
      setLoading(true);
      setError(null);

      const totalAmount = cartItems.reduce((sum, item) => 
        sum + (item.selectedSlab.price_per_bag * item.quantity), 0);

      // Generate payment hash and UPI link
      const paymentHash = generatePaymentHash();
      const upiLink = generateUPILink(totalAmount, paymentHash);

      const orderData = {
        total_amount: totalAmount,
        gst_number: gstNumber,
        delivery_address: deliveryAddress,
        order_type: orderType,
        payment_hash: paymentHash,
        upi_link: upiLink,
        scheduled_delivery: scheduledDelivery,
        transportation_required: transportationRequired || false,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price_per_bag: item.selectedSlab.price_per_bag,
          slab_label: item.selectedSlab.label
        }))
      };

      const order = await orderService.create(orderData);
      return order;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (id: string): Promise<Order> => {
    try {
      setLoading(true);
      setError(null);
      
      const order = await orderService.getById(id);
      return order;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
    try {
      setLoading(true);
      setError(null);
      
      const order = await orderService.updateStatus(id, status);
      return order;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    getOrder,
    updateOrderStatus,
    loading,
    error
  };
};

// Utility functions
const generatePaymentHash = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return `SVL_${timestamp}_${random}`.toUpperCase();
};

const generateUPILink = (amount: number, hash: string): string => {
  const upiId = import.meta.env.VITE_UPI_ID || 'merchant@upi';
  const merchantName = 'Sri Vijaya Lakshmi Agency';
  
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order ${hash}`)}&tr=${hash}`;
};