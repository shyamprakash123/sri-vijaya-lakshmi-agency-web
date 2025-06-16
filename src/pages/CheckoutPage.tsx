import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Package, Clock, Loader2, AlertTriangle, Truck, Store } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { useCoupons } from '../hooks/useCoupons';
import { Address } from '../types';
import LocationPicker from '../components/location/LocationPicker';
import SuggestedVehicleCard from '../components/SuggestedVehicleCard';
import { encryptOrderInfo } from '../lib/EncryptToken';
import { useAuth } from '../hooks/useAuth';
import { generateUpiLink } from '../lib/UPILinkGenerator';
import PayNowSectionCheckout from '../components/ui/PayNowSectionCheckout';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalAmount, clearCart, getTotalWeight } = useCart();
  const { createOrder, loading: orderLoading } = useOrders();
  const { validateCoupon, loading: couponLoading } = useCoupons();

  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    fullAddress: '',
    pincode: '',
    landmark: ''
  });
  const { user } = useAuth();
  const [gstNumber, setGstNumber] = useState('');
  const [orderType, setOrderType] = useState<'instant' | 'preorder'>('instant');
  const [scheduledDelivery, setScheduledDelivery] = useState('');
  const [isValidGst, setIsValidGst] = useState(true);
  const [transportationRequired, setTransportationRequired] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stockErrors, setStockErrors] = useState<string[]>([]);
  const [fetchVehicleLoading, setFetchVehicleLoading] = useState<boolean>(false);
  const [suggestedVehicle, setSuggestedVehicle] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [orderData, setOrderData] = useState(null);

  const subtotal = getTotalAmount();
  const finalAmount = subtotal - discount;

  const checkStockAvailability = async () => {
    const errors: string[] = [];

    // Extract product IDs from cart
    const productIds = cartItems.map(item => item.product.id);

    // Fetch latest product stock from DB
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, available_quantity')
      .in('id', productIds);

    if (error) {
      console.error('Error fetching stock:', error.message);
      setStockErrors(['Failed to verify stock availability. Please try again.']);
      return false;
    }

    // Compare each item in cart with DB stock
    cartItems.forEach(item => {
      const dbProduct = products?.find(p => p.id === item.product.id);
      if (!dbProduct) {
        errors.push(`${item.product.name}: Product not found`);
        return;
      }

      if (dbProduct.available_quantity === 0) {
        errors.push(`${item.product.name}: Out of stock`);
      } else if (item.quantity > dbProduct.available_quantity) {
        errors.push(`${item.product.name}: Only ${dbProduct.available_quantity} bags available (you have ${item.quantity} in cart)`);
      }
    });

    setStockErrors(errors);
    return errors.length === 0;
  };


  useEffect(() => {
    if (!deliveryAddress?.coordinates?.lat || !deliveryAddress?.coordinates?.lng) return;

    setFetchVehicleLoading(true);

    const timeout = setTimeout(async () => {
      const queryParams = new URLSearchParams({
        to_address_lat: deliveryAddress.coordinates.lat,
        to_address_long: deliveryAddress.coordinates.lng,
        weight: getTotalWeight().toString()
      });

      const url = `${import.meta.env.VITE_PORTER_SERVER_URL}/fare-estimate?${queryParams}`;

      try {
        const result = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        });

        if (result.ok) {
          const data = await result.json();
          if (data.vehicle_name) {
            setSuggestedVehicle(data);
            setFetchVehicleLoading(false);
          } else {
            setSuggestedVehicle(null);
            setFetchVehicleLoading(false);
          }
        } else {
          setSuggestedVehicle(null);
          setFetchVehicleLoading(false);
        }
      } catch (error) {
        console.error('Error fetching fare estimate:', error);
        setSuggestedVehicle(null);
        setFetchVehicleLoading(false);
      }
    }, 5000); // Delay: 5 seconds

    return () => clearTimeout(timeout); // Cancel timeout on address change
  }, [deliveryAddress, getTotalWeight()]);

  const validateGst = (value: string) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(value.toUpperCase());
  };

  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setGstNumber(value);
    setIsValidGst(validateGst(value));
  };

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
    // Check stock availability first
    if (gstNumber !== "" && !validateGst(gstNumber)) {
      return;
    }

    const isStockOk = await checkStockAvailability();
    if (!isStockOk) {
      setErrors(prev => ({ ...prev, stock: 'Please resolve stock issues before proceeding' }));
      return;
    }

    if (!validateForm()) return;

    // return;

    try {
      const { status, value } = await createOrder(
        cartItems,
        deliveryAddress,
        orderType,
        gstNumber || undefined,
        scheduledDelivery || undefined,
        transportationRequired,
        appliedCoupon?.code,
        discount
      );

      if (status === 'failed') {
        toast.error("Order cannot be created. Stock is not available or Please complete payment or cancel your existing order.");
        return;
      }

      const orderInfo = {
        order_id: value?.id,
        user_id: user?.id,
        amount: value?.total_amount,
      };

      const encryptedInfo = encryptOrderInfo(orderInfo);

      const upiUrl = generateUpiLink({
        payeeVPA: import.meta.env.VITE_UPI_ID,
        payeeName: 'Sri Vijaya Lakshmi',
        amount: value?.total_amount,
        transactionNote: encryptedInfo
      });

      setPaymentUrl(upiUrl);
      setOrderData(value);

      // Clear cart and redirect to order confirmation
      clearCart();
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to place order'
      }));
    }
  };

  if (orderData !== null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PayNowSectionCheckout
          upiUrl={generateUpiLink({
            payeeVPA: import.meta.env.VITE_UPI_ID,
            payeeName: 'Sri Vijaya Lakshmi',
            amount: orderData.total_amount,
            transactionNote: encryptOrderInfo({
              order_id: orderData.id,
              user_id: user?.id,
              amount: orderData.total_amount,
            })
          })}
        />
      </div>
    );
  }

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
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Availability Warnings */}
          {stockErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle size={20} className="text-red-500" />
                <h3 className="font-semibold text-red-800">Stock Issues</h3>
              </div>
              <ul className="text-red-700 text-sm space-y-1">
                {stockErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
              <p className="text-red-600 text-sm mt-2">
                Please update your cart quantities or remove out-of-stock items.
              </p>
            </div>
          )}

          {/* Cart Review */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map((item) => {
                const isInStock = item.product.available_quantity > 0;
                return (
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
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${isInStock
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}>
                          {isInStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        {item.quantity > item.product.available_quantity && (
                          <span className="text-xs text-red-500">
                            ⚠️ Only {item.product.available_quantity} available
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        ₹{item.selectedSlab.price_per_bag * item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{item.selectedSlab.price_per_bag}/bag
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GST Number */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">GST Information - For Bill of Supply (Optional)</h2>
            <div>
              <input
                type="text"
                placeholder="Enter GST Number"
                value={gstNumber}
                onChange={handleGstChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${isValidGst
                  ? 'border-gray-300 focus:ring-purple-500'
                  : 'border-red-500 focus:ring-red-400'
                  }`}
              />
              {!isValidGst && gstNumber.length > 0 && (
                <p className="text-sm text-red-500 mt-1">Invalid GST number format</p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin size={20} className="mr-2" />
              Delivery Address
            </h2>
            <LocationPicker
              onLocationSelect={(address) => setDeliveryAddress(address)}
              initialAddress={deliveryAddress}
            />
            {errors.address && <p className="text-red-500 text-sm mt-2">{errors.address}</p>}
            {errors.pincode && <p className="text-red-500 text-sm mt-2">{errors.pincode}</p>}
          </div>

          {/* Transportation Option */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Truck size={20} className="mr-2" />
              Transportation via Porter
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="transportation"
                  checked={transportationRequired}
                  onChange={(e) => setTransportationRequired(e.target.checked)}
                  className="w-4 h-4 text-orange-500"
                />
                <label htmlFor="transportation" className="flex-1">
                  <div className="font-medium">Transportation Required</div>
                  <div className="text-sm text-gray-600">
                    Select this option if you require a transportation service. Transportation Payment has to pay upon delivery. Your order will be dispatched within 1 hour.
                  </div>
                </label>
              </div>

              <SuggestedVehicleCard vehicle={suggestedVehicle} loading={fetchVehicleLoading} />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Store size={16} className="text-blue-500" />
                  <h4 className="font-semibold text-blue-800">Store Pickup Available</h4>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${import.meta.env.VITE_STORE_LAT},${import.meta.env.VITE_STORE_LNG}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-500 rounded-lg flex items-center text-white px-3 py-2 justify-center overflow-hidden hover:bg-primary-600 ">
                    Get Directions
                  </a>
                </div>
                <p className="text-sm text-blue-700">
                  New Hafeezpet, Marthanda Nagar,<br />
                  Hyderabad, Telangana - 500049
                  POS machine available - All cards accepted.
                </p>
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
                  <div className="text-sm text-gray-600">
                    Dispatches within 1 hour if transportation service is opted.
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">Payment Summary</h3>
              <p className="text-sm text-gray-500 mt-1">Complete your purchase securely</p>
            </div>

            {/* Coupon Section */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Have a coupon?</label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all disabled:bg-gray-100"
                  disabled={appliedCoupon}
                />
                {appliedCoupon ? (
                  <button
                    onClick={handleRemoveCoupon}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 transition"
                  >
                    {couponLoading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                  </button>
                )}
              </div>
              {errors.coupon && <p className="text-sm text-red-600 mt-2">{errors.coupon}</p>}
              {appliedCoupon && (
                <p className="text-sm text-green-600 mt-2">
                  🎉 Coupon "<span className="font-semibold">{appliedCoupon.code}</span>" applied! You saved ₹{discount}
                </p>
              )}
            </div>

            {/* Amount Breakdown */}
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-orange-500">₹{finalAmount}</span>
                </div>
              </div>
            </div>

            {/* Error Handling */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {errors.stock && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.stock}</p>
              </div>
            )}

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading || stockErrors.length > 0}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
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

            {/* Secure Payment Info */}
            <div className="mt-5 p-3 bg-blue-50 border border-blue-100 rounded-md text-center">
              <p className="text-sm text-blue-700">
                🔐 Secure UPI payment. Your order will be confirmed once payment is detected.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;