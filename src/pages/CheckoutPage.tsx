import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Package, Clock, Loader2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { useCoupons } from '../hooks/useCoupons';
import { Address } from '../types';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalAmount, clearCart } = useCart();
  const { createOrder, loading: orderLoading } = useOrders();
  const { validateCoupon, loading: couponLoading } = useCoupons();

  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    fullAddress: '',
    pincode: '',
    landmark: ''
  });
  const [gstNumber, setGstNumber] = useState('');
  const [orderType, setOrderType] = useState<'instant' | 'preorder'>('instant');
  const [scheduledDelivery, setScheduledDelivery] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getTotalAmount();
  const finalAmount = subtotal - discount;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!deliveryAddress.fullAddress.trim()) {
      newErrors.address = 'Delivery address is required';
    }
    if (!deliveryAddress.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    }
    if (orderType === 'preorder' && !scheduledDelivery) {
      newErrors.scheduledDelivery = 'Please select delivery date and time for pre-order';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const result = await validateCoupon(couponCode, subtotal);
      if (result.isValid && result.coupon && result.discount) {
        setAppliedCoupon(result.coupon);
        setDiscount(result.discount);
        setErrors(prev => ({ ...prev, coupon: '' }));
      } else {
        setErrors(prev => ({ ...prev, coupon: result.message }));
        setAppliedCoupon(null);
        setDiscount(0);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, coupon: 'Failed to validate coupon' }));
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
    setErrors(prev => ({ ...prev, coupon: '' }));
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      const order = await createOrder(
        cartItems,
        deliveryAddress,
        orderType,
        gstNumber || undefined,
        scheduledDelivery || undefined
      );

      // Clear cart and redirect to order confirmation
      clearCart();
      navigate(`/order/${order.id}`);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : 'Failed to place order' 
      }));
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some products to proceed with checkout</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Review */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-4 py-3 border-b border-gray-200 last:border-b-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">{item.product.weight} • {item.selectedSlab.label}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ₹{item.selectedSlab.price_per_bag * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GST Number */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">GST Information (Optional)</h2>
            <input
              type="text"
              placeholder="Enter GST Number"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin size={20} className="mr-2" />
              Delivery Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address *
                </label>
                <textarea
                  value={deliveryAddress.fullAddress}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, fullAddress: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Enter complete delivery address"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.pincode}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter pincode"
                  />
                  {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.landmark}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, landmark: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter landmark"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Type */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Clock size={20} className="mr-2" />
              Order Type
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="instant"
                  name="orderType"
                  value="instant"
                  checked={orderType === 'instant'}
                  onChange={(e) => setOrderType(e.target.value as 'instant')}
                  className="w-4 h-4 text-orange-500"
                />
                <label htmlFor="instant" className="flex-1">
                  <div className="font-medium">Instant Order (Full Payment)</div>
                  <div className="text-sm text-gray-600">Delivered within 1 hour via Porter</div>
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="preorder"
                  name="orderType"
                  value="preorder"
                  checked={orderType === 'preorder'}
                  onChange={(e) => setOrderType(e.target.value as 'preorder')}
                  className="w-4 h-4 text-orange-500"
                />
                <label htmlFor="preorder" className="flex-1">
                  <div className="font-medium">Pre-order (50% Now, 50% Before Dispatch)</div>
                  <div className="text-sm text-gray-600">Schedule delivery for later with discount</div>
                </label>
              </div>

              {orderType === 'preorder' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Delivery *
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDelivery}
                    onChange={(e) => setScheduledDelivery(e.target.value)}
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {errors.scheduledDelivery && <p className="text-red-500 text-sm mt-1">{errors.scheduledDelivery}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
            
            {/* Coupon Section */}
            <div className="mb-4">
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={appliedCoupon}
                />
                {appliedCoupon ? (
                  <button
                    onClick={handleRemoveCoupon}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition-colors"
                  >
                    {couponLoading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                  </button>
                )}
              </div>
              {errors.coupon && <p className="text-red-500 text-sm">{errors.coupon}</p>}
              {appliedCoupon && (
                <p className="text-green-600 text-sm">
                  Coupon "{appliedCoupon.code}" applied! You saved ₹{discount}
                </p>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-orange-500">₹{finalAmount}</span>
                </div>
                {orderType === 'preorder' && (
                  <p className="text-sm text-gray-600 mt-1">
                    Pay now: ₹{Math.ceil(finalAmount / 2)} | Pay later: ₹{Math.floor(finalAmount / 2)}
                  </p>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {orderLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>Place Order</span>
                </>
              )}
            </button>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                🔐 Secure UPI payment. Order confirmed upon payment detection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;