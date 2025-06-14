import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Percent, Package, CheckCircle, ArrowRight, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import { useCoupons } from '../../hooks/useCoupons';
import { Product, PriceSlab, Address } from '../../types';
import LocationPicker from '../location/LocationPicker';

interface PreOrderItem {
  product: Product;
  quantity: number;
  selectedSlab: PriceSlab;
}

const PreOrderFlow: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts();
  const { createOrder, loading: orderLoading } = useOrders();
  const { validateCoupon, loading: couponLoading } = useCoupons();

  const [currentStep, setCurrentStep] = useState(1);
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    fullAddress: '',
    pincode: '',
    landmark: ''
  });
  const [gstNumber, setGstNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
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
      // Apply 15% preorder discount
      const discountedPrice = Math.round(item.selectedSlab.price_per_bag * 0.85);
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
        if (!deliveryAddress.fullAddress.trim()) {
          newErrors.address = 'Delivery address is required';
        }
        if (!deliveryAddress.pincode.trim()) {
          newErrors.pincode = 'Pincode is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
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
      
      const order = await createOrder(
        preOrderItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
          selectedSlab: {
            ...item.selectedSlab,
            price_per_bag: Math.round(item.selectedSlab.price_per_bag * 0.85) // Apply preorder discount
          }
        })),
        deliveryAddress,
        'preorder',
        gstNumber || undefined,
        scheduledDelivery
      );

      navigate(`/order/${order.id}`);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : 'Failed to place order' 
      }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Products for Pre-Order</h2>
              <p className="text-gray-600">Choose your rice varieties and quantities. Get 15% discount on all items!</p>
            </div>

            {errors.stock && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600">{errors.stock}</p>
              </div>
            )}

            {productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          15% OFF
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Stock: {product.available_quantity}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-lg font-bold text-purple-500">
                            ₹{product.price_slabs?.[0] ? Math.round(product.price_slabs[0].price_per_bag * 0.85) : Math.round(product.base_price * 0.85)}
                          </span>
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{product.price_slabs?.[0]?.price_per_bag || product.base_price}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{product.weight}</span>
                      </div>

                      <button
                        onClick={() => addToPreOrder(product)}
                        disabled={product.available_quantity === 0}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-2 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                      >
                        {product.available_quantity === 0 ? 'Out of Stock' : 'Add to Pre-Order'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Items */}
            {preOrderItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Items</h3>
                <div className="space-y-4">
                  {preOrderItems.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">{item.product.weight} • {item.selectedSlab.label}</p>
                          <p className="text-sm text-purple-600 font-medium">
                            ₹{Math.round(item.selectedSlab.price_per_bag * 0.85)}/bag (15% off)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromPreOrder(item.product.id)}
                          className="text-red-500 hover:text-red-600 ml-4"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Subtotal (with 15% discount)</span>
                    <span className="text-2xl font-bold text-purple-500">₹{getSubtotal()}</span>
                  </div>
                </div>
              </div>
            )}

            {errors.products && (
              <p className="text-red-500 text-center">{errors.products}</p>
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
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        selectedTime === slot
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
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Delivery Address</h2>
              <p className="text-gray-600">Where should we deliver your order?</p>
            </div>

            <LocationPicker
              onLocationSelect={(address) => setDeliveryAddress(address)}
              initialAddress={deliveryAddress}
            />

            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode}</p>}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">GST Information (Optional)</h3>
              <input
                type="text"
                placeholder="Enter GST Number"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Summary</h2>
              <p className="text-gray-600">Review your order and complete payment</p>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3">
                {preOrderItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{Math.round(item.selectedSlab.price_per_bag * 0.85) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Apply Coupon</h3>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={appliedCoupon}
                />
                {appliedCoupon ? (
                  <button
                    onClick={() => {
                      setAppliedCoupon(null);
                      setDiscount(0);
                      setCouponCode('');
                    }}
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

            {/* Payment Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal (with 15% preorder discount)</span>
                  <span className="font-medium">₹{getSubtotal()}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Additional Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold text-purple-500">₹{getFinalAmount()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Pay now: ₹{Math.ceil(getFinalAmount() / 2)} | Pay before dispatch: ₹{Math.floor(getFinalAmount() / 2)}
                  </p>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
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
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                  currentStep >= step.id
                    ? 'bg-purple-500 border-purple-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  <step.icon size={20} />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    Step {step.id}
                  </p>
                  <p className={`text-xs ${
                    currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-purple-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
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
            <button
              onClick={handleNextStep}
              disabled={currentStep === 1 && preOrderItems.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PreOrderFlow;