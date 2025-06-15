import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle, Truck, MapPin, Phone, Mail, Loader2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { orderService, supabase } from '../lib/supabase';
import { Order } from '../types';
import PayNowSection from '../components/ui/PayNowSection';
import { generateUpiLink } from '../lib/UPILinkGenerator';
import { encryptOrderInfo } from '../lib/EncryptToken';
import { useOrders } from '../hooks/useOrders';
import CancelOrderButton from '../components/ui/CancelOrderButton';
import { LoaderIcon } from 'react-hot-toast';

const TrackOrderPage: React.FC = () => {
  const { updateOrderStatus } = useOrders;
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingUserOrders, setLoadingUserOrders] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;

    setLoadingUserOrders(true);
    try {
      const orders = await orderService.getUserOrders(user.id);
      setUserOrders(orders);
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
    } finally {
      setLoadingUserOrders(false);
    }
  };

  const handleSearch = async () => {
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const order = await orderService.getById(orderId);
      setOrderData(order);
    } catch (err) {
      setError('Order not found. Please check your order ID and try again.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'prepaid':
      case 'fully_paid':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'dispatched':
        return <Truck className="w-6 h-6 text-purple-500" />;
      case 'preparing':
        return <LoaderIcon className="w-6 h-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'canceled':
        return <X className="w-6 h-6 text-red-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Payment Pending';
      case 'prepaid':
        return 'Partially Paid (Pre-order)';
      case 'fully_paid':
        return 'Payment Completed';
      case 'preparing':
        return 'Preparing For Dispatch';
      case 'dispatched':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'canceled':
        return 'Canceled';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'prepaid':
      case 'fully_paid':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'preparing':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'dispatched':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'canceled':
        return 'text-red-600 bg-red-50 border-red-200';
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
            <section id='orderHeader'>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter Order ID"
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
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search size={20} />
                  )}
                  <span className="hidden sm:inline">{loading ? 'Searching...' : 'Track'}</span>
                </button>
              </div>
            </section>

            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}
          </div>
        </div>

        {/* Order Details */}
        {orderData && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Order #{orderData.id}</h2>
                    <p className="opacity-90">
                      Placed on {new Date(orderData.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹{orderData.total_amount}</p>
                    <p className="opacity-90">{orderData.order_items?.length || 0} item(s)</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="p-6 border-b border-gray-200">
                {orderData.payment_status !== "pending" &&
                  <div className={`flex items-center space-x-3 p-4 rounded-lg border mb-2 ${getStatusColor(orderData.payment_status)}`}>
                    {getStatusIcon(orderData.payment_status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{getStatusText(orderData.payment_status)}</h3>
                    </div>
                  </div>}
                <div className={`flex items-center space-x-3 p-4 rounded-lg border ${getStatusColor(orderData.order_status)}`}>
                  {getStatusIcon(orderData.order_status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{getStatusText(orderData.order_status)}</h3>
                    {orderData.scheduled_delivery && (
                      <>
                      <p className="text-sm opacity-75">
                        Scheduled for: {new Date(orderData.scheduled_delivery).toLocaleDateString('en-IN', {
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {orderData.order_type === "preorder" && orderData.payment_status === "pending" &&
                       <p className="text-sm opacity-75">
                          Please Pay the Half Amount to confirm the pre-order (Expire After 24 Hrs)
                      </p>}

                      {orderData.order_type === "preorder" && orderData.payment_status === "partial" &&
                       <p className="text-sm opacity-75">
                          Please Pay remaining Half Amount to before scheduled date (Will be dispatched after payment)
                      </p>}
                      </>
                    )}
                  </div>
                </div>
                {orderData.payment_status === "pending" && orderData.order_status === "pending" &&
                  <CancelOrderButton
                    orderId={orderData.id}
                    onCancel={async (id) => {
                      const { error } = await supabase
                        .from('orders')
                        .update({ order_status: 'canceled' })
                        .eq('id', id);

                      if (error) throw new Error(error.message);

                      setOrderData((prev) => {
                        return {
                          ...prev,
                          order_status: "canceled"
                        }
                      });
                    }}
                  />}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {orderData.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{item.products?.name}</p>
                          <p className="text-sm text-gray-600">{item.products?.weight} • {item.slab_label}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Qty: {item.quantity}</p>
                          <p className="text-sm text-gray-600">₹{item.price_per_bag * item.quantity}</p>
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
                        <p className="text-gray-600">{orderData.delivery_address.fullAddress}</p>
                        <p className="text-gray-600">Pincode: {orderData.delivery_address.pincode}</p>
                        {orderData.delivery_address.landmark && (
                          <p className="text-gray-600">Landmark: {orderData.delivery_address.landmark}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {(orderData.payment_status === "pending" || orderData.payment_status === "partial") &&
                <PayNowSection
                  upiUrl={generateUpiLink({
                    payeeVPA: import.meta.env.VITE_UPI_ID,
                    payeeName: 'Sri Vijaya Lakshmi',
                    amount: orderData.order_type === "instant" ? orderData.total_amount : orderData.total_amount / 2,
                    transactionNote: encryptOrderInfo({
                      order_id: orderData.id,
                      user_id: user?.id,
                      amount: orderData.total_amount,
                    })
                  })}
                />
              }
            </div>
          </div>
        )}

        {/* User Orders Section */}
        {user && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Your Recent Orders</h3>
                <button
                  onClick={fetchUserOrders}
                  disabled={loadingUserOrders}
                  className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  {loadingUserOrders ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {loadingUserOrders ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : userOrders.length > 0 ? (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${orderData?.id === order.id ? "bg-primary-400" : ""}`}
                      onClick={() => {
                        setOrderId(order.id);
                        setOrderData(order);
                        const section = document.getElementById('orderHeader');
                        section?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">#{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">₹{order.total_amount}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.order_status)}`}>
                            {getStatusText(order.order_status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No orders found</p>
                </div>
              )}
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
                href="https://wa.me/+918374237713"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Phone size={18} />
                <span>WhatsApp Support</span>
              </a>
              <a
                href="mailto:contact@srivijayalakshmirice.in"
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Mail size={18} />
                <span>Email Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;