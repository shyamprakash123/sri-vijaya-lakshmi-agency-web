import { useState } from 'react';
import { Coupon } from '../types';
import { couponService } from '../lib/supabase';

export const useCoupons = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCoupon = async (code: string, orderAmount: number): Promise<{
    isValid: boolean;
    coupon?: Coupon;
    discount?: number;
    message: string;
  }> => {
    try {
      setLoading(true);
      setError(null);

      const coupon = await couponService.getByCode(code);
      
      if (orderAmount < coupon.min_order_amount) {
        return {
          isValid: false,
          message: `Minimum order amount of ₹${coupon.min_order_amount} required`
        };
      }

      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (orderAmount * coupon.discount_value) / 100;
        if (coupon.max_discount && discount > coupon.max_discount) {
          discount = coupon.max_discount;
        }
      } else {
        discount = coupon.discount_value;
      }

      return {
        isValid: true,
        coupon,
        discount,
        message: `Coupon applied! You saved ₹${discount}`
      };
    } catch (err) {
      return {
        isValid: false,
        message: 'Invalid or expired coupon code'
      };
    } finally {
      setLoading(false);
    }
  };

  const getAvailableCoupons = async (): Promise<Coupon[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const coupons = await couponService.getAll();
      return coupons;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coupons');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    validateCoupon,
    getAvailableCoupons,
    loading,
    error
  };
};