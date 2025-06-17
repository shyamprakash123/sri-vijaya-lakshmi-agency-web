import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Percent, Package, CheckCircle, ArrowRight, MapPin, CreditCard, Loader2, Truck, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import { useCoupons } from '../../hooks/useCoupons';
import { Product, PriceSlab, Address } from '../../types';
import LocationPicker from '../location/LocationPicker';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { generateUpiLink } from '../../lib/UPILinkGenerator';
import { encryptOrderInfo } from '../../lib/EncryptToken';
import PayNowSectionCheckout from '../ui/PayNowSectionCheckout';
import { useAuth } from '../../hooks/useAuth';

interface PreOrderItem {
  product: Product;
  quantity: number;
  selectedSlab: PriceSlab;
}

const PreOrderFlow: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const { createOrder, loading: orderLoading } = useOrders();
  const { validateCoupon, loading: couponLoading } = useCoupons();
  const [gstNumber, setGstNumber] = useState('');
  const [isValidGst, setIsValidGst] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    fullAddress: '',
    pincode: '',
    landmark: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [transportationRequired, setTransportationRequired] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeSlots = [
    '6:00 AM - 8:00 AM',
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM'
  ];

  const steps = [
    { id: 1, title: 'Select Products', icon: Package },
    { id: 2, title: 'Schedule Delivery', icon: Calendar },
    { id: 3, title: 'Delivery Address', icon: MapPin },
    { id: 4, title: 'Payment', icon: CreditCard }
  ];

  const validateGst = (value: string) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(value.toUpperCase());
  };

  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setGstNumber(value);
    setIsValidGst(validateGst(value));
  };

  const addToPreOrder = (product: Product, quantity: number = 1) => {
    if (!product.price_slabs || product.price_slabs.length === 0) return;

    const existingItem = preOrderItems.find(item => item.product.id === product.id);
    const selectedSlab = getSlabForQuantity(product, quantity);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.available_quantity) {
        setErrors(prev => ({ ...prev, stock: `Only ${product.available_quantity} bags available for ${product.name}` }));
        return;
      }

      setPreOrderItems(prev => prev.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: newQuantity, selectedSlab: getSlabForQuantity(product, newQuantity) }
          : item
      ));
    } else {
      if (quantity > product.available_quantity) {
        setErrors(prev => ({ ...prev, stock: `Only ${product.available_quantity} bags available for ${product.name}` }));
        return;
      }

      setPreOrderItems(prev => [...prev, { product, quantity, selectedSlab }]);
    }

    setErrors(prev => ({ ...prev, stock: '' }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromPreOrder(productId);
      return;
    }

    setPreOrderItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        if (quantity > item.product.available_quantity) {
          setErrors(prevErrors => ({
            ...prevErrors,
            stock: `Only ${item.product.available_quantity} bags available for ${item.product.name}`
          }));
          return item;
        }

        setErrors(prevErrors => ({ ...prevErrors, stock: '' }));
        return {
          ...item,
          quantity,
          selectedSlab: getSlabForQuantity(item.product, quantity)
        };
      }
      return item;
    }));
  };

  const removeFromPreOrder = (productId: string) => {
    setPreOrderItems(prev => prev.filter(item => item.product.id !== productId));
  };

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

  const getSubtotal = () => {
    return preOrderItems.reduce((total, item) => {
      // Apply ₹10 preorder discount
      const discountedPrice = Math.ceil(item.selectedSlab.price_per_bag - 10);
      return total + (discountedPrice * item.quantity);
    }, 0);
  };

  const getFinalAmount = () => {
    return getSubtotal() - discount;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (preOrderItems.length === 0) {
          newErrors.products = 'Please select at least one product';
        }
        break;
      case 2:
        if (!selectedDate) {
          newErrors.date = 'Please select delivery date';
        }
        if (!selectedTime) {
          newErrors.time = 'Please select delivery time';
        }
        break;
      case 3:
        if (!deliveryAddress.fullName.trim()) {
          newErrors.fullName = 'Full Name is required';
        }
    
        if (!deliveryAddress.phoneNumber?.trim()) {
          newErrors.phoneNumber = 'Phone Number is required';
        } else if (!/^[6-9]\d{9}$/.test(deliveryAddress.phoneNumber)) {
          newErrors.phoneNumber = 'Enter a valid 10-digit phone number';
        }
        
        if (!deliveryAddress.fullAddress.trim()) {
          newErrors.address = 'Delivery address is required';
        }
        if (!deliveryAddress.pincode.trim()) {
          newErrors.pincode = 'Pincode is required';
        }
        if (gstNumber !== "" && !isValidGst) {
          newErrors.GST = 'Valid Gst is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      const section = document.getElementById('processSection');
      section?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const result = await validateCoupon(couponCode, getSubtotal());
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

  const handlePlaceOrder = async () => {
    if (!validateStep(3)) return;

    try {
      const scheduledDelivery = `${selectedDate}T${selectedTime.split(' - ')[0]}`;
      const { status, value } = await createOrder(
        preOrderItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
          selectedSlab: {
            ...item.selectedSlab,
            price_per_bag: Math.ceil(item.selectedSlab.price_per_bag - 10) // Apply preorder discount
          }
        })),
        deliveryAddress,
        'preorder',
        gstNumber || undefined,
        scheduledDelivery
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

      setOrderData(value);

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
            amount: orderData.total_amount / 2,
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Heading */}
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Select Products for Pre-Order
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Choose your rice varieties and quantities. Get ₹10 discount on all items!
              </p>
            </div>

            {/* Stock Error */}
            {errors.stock && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
                {errors.stock}
              </div>
            )}

            {/* Product List */}
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const price =
                    product.price_slabs?.[0]?.price_per_bag || product.base_price;
                  const discountedPrice = Math.round(price - 10);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col"
                    >
                      <div className="relative h-44 sm:h-48 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          ₹10 OFF
                        </span>
                        <span
                          className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${product.available_quantity > 0
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                            }`}
                        >
                          {product.available_quantity > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mb-4 text-sm">
                            <div>
                              <span className="text-purple-600 font-bold text-base">
                                ₹{discountedPrice}
                              </span>
                              <span className="line-through ml-2 text-gray-500">
                                ₹{price}
                              </span>
                            </div>
                            <span className="text-gray-500">{product.weight}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            addToPreOrder(product);
                            const section = document.getElementById("nextBtn");
                            section?.scrollIntoView({ behavior: "smooth" });
                          }}
                          disabled={product.available_quantity === 0}
                          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-2 rounded-lg font-semibold transition transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
                        >
                          {product.available_quantity === 0
                            ? "Out of Stock"
                            : "Add to Pre-Order"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Items Section */}
            {preOrderItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Selected Items
                </h3>
                <div className="space-y-4">
                  {preOrderItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.product.weight} • {item.selectedSlab.label}
                          </p>
                          <p className="text-sm text-purple-600 font-medium">
                            ₹{Math.ceil(item.selectedSlab.price_per_bag - 10)}/bag
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-3 mt-2 sm:mt-0">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromPreOrder(item.product.id)}
                          className="text-red-500 hover:text-red-600 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-base font-semibold text-gray-800">
                    Subtotal (₹10 off per bag)
                  </span>
                  <span className="text-xl font-bold text-purple-600">
                    ₹{getSubtotal()}
                  </span>
                </div>
              </div>
            )}

            {/* Product Error */}
            {errors.products && (
              <p className="text-red-500 text-center text-sm">{errors.products}</p>
            )}
          </div>
        );


      case 2:
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Schedule Your Delivery</h2>
              <p className="text-gray-600">Choose your preferred delivery date and time slot</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar size={20} className="mr-2 text-purple-500" />
                  Select Date
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.date && <p className="text-red-500 text-sm mt-2">{errors.date}</p>}
                <p className="text-sm text-gray-500 mt-2">
                  Minimum 24 hours advance booking required
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock size={20} className="mr-2 text-purple-500" />
                  Select Time Slot
                </h3>
                <div className="space-y-2">
                  {timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTime(slot)}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${selectedTime === slot
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-white hover:bg-purple-50 border-gray-300'
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {errors.time && <p className="text-red-500 text-sm mt-2">{errors.time}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Section Heading */}
            <div className="text-center pb-2 bg-white rounded-md shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Delivery Address</h2>
              <p className="text-sm sm:text-base text-gray-600">Where should we deliver your order?</p>
            </div>

            {/* Location Picker */}
            <LocationPicker
              onLocationSelect={(selectedAddress) => {
                setDeliveryAddress((prev) => {
                  return (
                   { ...prev,
                    ...selectedAddress
                  }
                  )
                });
              }}
              initialAddress={deliveryAddress}
            />

            {/* Address Errors */}
            {errors.fullName && <p className="text-red-500 text-sm mt-2">{errors.fullName}</p>}
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>}
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode}</p>}

            {/* Info Panels */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* GST Information */}
              <div className="flex-1 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  GST Information – For Bill of Supply (Optional)
                </h3>
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

              {/* Transportation & Store Pickup */}
              <div className="flex-1 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Truck size={20} className="mr-2 text-orange-500" />
                  Transportation via Porter
                </h3>

                {/* Checkbox Option */}
                <div className="flex items-start space-x-3 mb-5">
                  <input
                    type="checkbox"
                    id="transportation"
                    checked={transportationRequired}
                    onChange={(e) => setTransportationRequired(e.target.checked)}
                    className="w-5 h-5 mt-1 text-orange-500 accent-orange-500"
                  />
                  <label htmlFor="transportation" className="flex-1 cursor-pointer">
                    <p className="font-medium text-gray-800">Transportation Required</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Select this option if you require a transportation service.
                      Transportation payment is made upon delivery.
                      Your order will be dispatched within 1 hour.
                    </p>
                  </label>
                </div>

                {/* Store Pickup Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <Store size={18} className="text-blue-500" />
                      <h4 className="font-semibold text-blue-800">Store Pickup Available</h4>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${import.meta.env.VITE_STORE_LAT},${import.meta.env.VITE_STORE_LNG}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                    >
                      Get Directions
                    </a>
                  </div>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    New Hafeezpet, Marthanda Nagar,<br />
                    Hyderabad, Telangana - 500049<br />
                    POS machine available – All cards accepted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );


      case 4:
        return (
          <div className="max-w-2xl mx-auto space-y-8 px-4 sm:px-0">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Payment Summary</h2>
              <p className="text-gray-600 text-sm sm:text-base">Review your order and complete the payment</p>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3">
                {preOrderItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm text-gray-700">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span className="font-medium text-gray-900">
                      ₹{Math.ceil(item.selectedSlab.price_per_bag - 10) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Apply Coupon</h3>
              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 mb-3">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70"
                  disabled={appliedCoupon}
                />
                {appliedCoupon ? (
                  <button
                    onClick={() => {
                      setAppliedCoupon(null);
                      setDiscount(0);
                      setCouponCode('');
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
                  >
                    {couponLoading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                  </button>
                )}
              </div>
              {errors.coupon && <p className="text-red-500 text-sm">{errors.coupon}</p>}
              {appliedCoupon && (
                <p className="text-green-600 text-sm">
                  🎉 Coupon "<span className="font-medium">{appliedCoupon.code}</span>" applied! You saved ₹{discount}
                </p>
              )}
            </div>

            {/* Final Payment Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal <span className="text-xs">(includes ₹10/bag pre-order discount)</span></span>
                  <span className="font-medium text-gray-900">₹{getSubtotal()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <hr className="border-gray-200" />

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                  <span className="text-2xl font-bold text-purple-600">₹{getFinalAmount()}</span>
                </div>

                <p className="text-xs text-gray-500">
                  Pay now: ₹{Math.ceil(getFinalAmount() / 2)} | Remaining before dispatch: ₹{Math.floor(getFinalAmount() / 2)}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-60 text-white py-4 px-6 rounded-lg font-semibold text-base transition-all flex items-center justify-center space-x-2"
            >
              {orderLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>Place Pre-Order</span>
                </>
              )}
            </button>
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-10 px-4">
          <section id="processSection">
            <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1 min-w-[120px]">
                  {/* Step Circle */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 shadow-sm
              ${currentStep >= step.id
                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                        : 'bg-white border-gray-300 text-gray-400'
                      }`}
                  >
                    <step.icon size={20} />
                  </div>

                  {/* Step Labels */}
                  <div className="ml-3 block sm:block">
                    <p
                      className={`text-sm font-semibold leading-4 transition-colors 
                ${currentStep >= step.id ? 'text-purple-700' : 'text-gray-500'}`}
                    >
                      Step {step.id}
                    </p>
                    <p className={`text-xs ${currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1">
                      <div
                        className={`h-0.5 mx-4 transition-all duration-300
                  ${currentStep > step.id ? 'bg-purple-500' : 'bg-gray-300'}`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>


        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="max-w-2xl mx-auto mt-8 flex justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 rounded-lg font-semibold transition-colors"
          >
            Previous
          </button>

          {currentStep < 4 ? (
            <section id='nextBtn'>
              <button
                onClick={handleNextStep}
                disabled={currentStep === 1 && preOrderItems.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight size={18} />
              </button>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PreOrderFlow;