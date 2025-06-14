import React, { useState } from 'react';
import { Calendar, Clock, Percent, Package, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';

const PreOrderPage: React.FC = () => {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const benefits = [
    {
      icon: Percent,
      title: '15% Discount',
      description: 'Save money on all pre-orders placed 24 hours in advance'
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Choose your preferred delivery date and time slot'
    },
    {
      icon: Package,
      title: 'Guaranteed Stock',
      description: 'Your order is reserved and guaranteed to be available'
    },
    {
      icon: CheckCircle,
      title: 'Quality Assured',
      description: 'Fresh stock prepared specially for your delivery'
    }
  ];

  const timeSlots = [
    '6:00 AM - 8:00 AM',
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM'
  ];

  const handlePreOrder = (product: any) => {
    if (product.price_slabs && product.price_slabs.length > 0) {
      // Apply 15% discount for pre-orders
      const discountedSlab = {
        ...product.price_slabs[0],
        price_per_bag: Math.round(product.price_slabs[0].price_per_bag * 0.85)
      };
      addToCart(product, 1, discountedSlab);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Pre-Order & Save
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Order 24 hours in advance and get 15% discount on all rice varieties
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-full">
                <span className="text-lg font-semibold">💰 Save up to 15%</span>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-full">
                <span className="text-lg font-semibold">📅 Flexible Delivery</span>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-full">
                <span className="text-lg font-semibold">✅ Guaranteed Stock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Pre-Order?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pre-ordering gives you better prices, guaranteed availability, and the convenience 
              of scheduling your delivery exactly when you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <benefit.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scheduling Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Schedule Your Delivery</h2>
              <p className="text-gray-600">
                Choose your preferred delivery date and time slot for your pre-order
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Date Selection */}
              <div className="bg-gray-50 p-6 rounded-xl">
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
                <p className="text-sm text-gray-500 mt-2">
                  Minimum 24 hours advance booking required
                </p>
              </div>

              {/* Time Selection */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock size={20} className="mr-2 text-purple-500" />
                  Select Time Slot
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTime(slot)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        selectedTime === slot
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'bg-white hover:bg-purple-50 border-gray-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Available for Pre-Order</h2>
            <p className="text-gray-600">
              All our premium rice varieties are available for pre-order with 15% discount
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        15% OFF
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
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
                      onClick={() => handlePreOrder(product)}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <span>Pre-Order Now</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-block bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Pre-Order?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start saving today with our pre-order system
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PreOrderPage;