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
    transportationRequired?: boolean,
    couponCode?: string,
    couponDiscount?: number
  ): Promise<{ status: 'ok'; value: Order } | { status: 'failed'; value: string }> => {
    try {
      setLoading(true);
      setError(null);

      const subtotalAmount = cartItems.reduce(
        (sum, item) => sum + (item.selectedSlab.price_per_bag * item.quantity),
        0
      );

      const totalAmount = subtotalAmount - (couponDiscount || 0);

      const orderData = {
        total_amount: totalAmount,
        subtotal_amount: subtotalAmount,
        coupon_code: couponCode,
        coupon_discount: couponDiscount || 0,
        gst_number: gstNumber,
        delivery_address: deliveryAddress,
        order_type: orderType,
        scheduled_delivery: scheduledDelivery,
        transportation_required: transportationRequired || false,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price_per_bag: item.selectedSlab.price_per_bag,
          slab_label: item.selectedSlab.label,
        })),
      };

      const order = await orderService.create(orderData);
      return { status: 'ok', value: order };
    } catch (err) {
      const errorMessage =
        err
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Failed to create order';

      setError(errorMessage);
      return { status: 'failed', value: errorMessage };
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