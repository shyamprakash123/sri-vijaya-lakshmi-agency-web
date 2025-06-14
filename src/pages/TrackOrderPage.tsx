import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle, Truck, MapPin, Phone, Mail } from 'lucide-react';

const TrackOrderPage: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mockOrders = {
    'SVL001': {
      id: 'SVL001',
      status: 'dispatched',
      items: [
        { name: 'Premium Basmati Rice', quantity: 2, weight: '25kg' },
        { name: 'Sona Masoori Rice', quantity: 1, weight: '25kg' }
      ],
      total: 2400,
      orderDate: '2024-01-15T10:30:00Z',
      estimatedDelivery: '2024-01-15T12:30:00Z',
      deliveryAddress: '123 Main Street, Chennai, Tamil Nadu 600001',
      porter: {
        name: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        vehicle: 'TN 01 AB 1234'
      }
    },
    'SVL002': {
      id: 'SVL002',
      status: 'delivered',
      items: [
        { name: 'Jasmine Rice', quantity: 3, weight: '25kg' }
      ],
      total: 2850,
      orderDate: '2024-01-14T14:20:00Z',
      deliveredAt: '2024-01-14T15:45:00Z',
      deliveryAddress: '456 Park Avenue, Chennai, Tamil Nadu 600002'
    }
  };

  const handleSearch = async () => {
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const order = mockOrders[orderId as keyof typeof mockOrders];
      if (order) {
        setOrderData(order);
      } else {
        setError('Order not found. Please check your order ID and try again.');
        setOrderData(null);
      }
      setLoading(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'dispatched':
        return <Truck className="w-6 h-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Pending';
      case 'confirmed':
        return 'Order Confirmed';
      case 'dispatched':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'confirmed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'dispatched':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Track Your Order</h1>
          <p className="text-gray-600">Enter your order ID to get real-time delivery updates</p>
        </div>

        {/* Search Section */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter Order ID (e.g., SVL001)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search size={20} />
                )}
                <span className="hidden sm:inline">{loading ? 'Searching...' : 'Track'}</span>
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}
          </div>
        </div>

        {/* Order Details */}
        {orderData && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Order #{orderData.id}</h2>
                    <p className="opacity-90">
                      Placed on {new Date(orderData.orderDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹{orderData.total}</p>
                    <p className="opacity-90">{orderData.items.length} item(s)</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="p-6 border-b border-gray-200">
                <div className={`flex items-center space-x-3 p-4 rounded-lg border ${getStatusColor(orderData.status)}`}>
                  {getStatusIcon(orderData.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{getStatusText(orderData.status)}</h3>
                    {orderData.status === 'dispatched' && orderData.estimatedDelivery && (
                      <p className="text-sm opacity-75">
                        Estimated delivery: {new Date(orderData.estimatedDelivery).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                    {orderData.status === 'delivered' && orderData.deliveredAt && (
                      <p className="text-sm opacity-75">
                        Delivered on {new Date(orderData.deliveredAt).toLocaleDateString('en-IN', {
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {orderData.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.weight}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin size={20} className="text-orange-500 mt-1" />
                      <div>
                        <p className="font-medium text-gray-800">Delivery Address</p>
                        <p className="text-gray-600">{orderData.deliveryAddress}</p>
                      </div>
                    </div>

                    {orderData.porter && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Porter Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Package size={16} className="text-blue-600" />
                            <span className="text-sm text-blue-700">Driver: {orderData.porter.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone size={16} className="text-blue-600" />
                            <span className="text-sm text-blue-700">{orderData.porter.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Truck size={16} className="text-blue-600" />
                            <span className="text-sm text-blue-700">Vehicle: {orderData.porter.vehicle}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-6">
              If you have any questions about your order or need assistance, we're here to help!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <a
                href="https://wa.me/+919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Phone size={18} />
                <span>WhatsApp Support</span>
              </a>
              <a
                href="mailto:support@svlrice.com"
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Mail size={18} />
                <span>Email Support</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sample Order IDs */}
        <div className="max-w-md mx-auto mt-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Try these sample Order IDs:</h4>
            <div className="space-y-1">
              <button
                onClick={() => setOrderId('SVL001')}
                className="block w-full text-left text-yellow-700 hover:text-yellow-900 font-mono text-sm"
              >
                SVL001 - Out for delivery
              </button>
              <button
                onClick={() => setOrderId('SVL002')}
                className="block w-full text-left text-yellow-700 hover:text-yellow-900 font-mono text-sm"
              >
                SVL002 - Delivered
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;