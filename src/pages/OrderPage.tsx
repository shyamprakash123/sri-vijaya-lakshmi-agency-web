import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, MapPin, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { Order } from '../types';

const OrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrder, loading } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        const orderData = await getOrder(id);
        setOrder(orderData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      }
    };

    fetchOrder();
  }, [id, getOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'prepaid':
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'fully_paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'dispatched':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
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
      case 'dispatched':
        return 'Dispatched via Porter';
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
      case 'prepaid':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fully_paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'dispatched':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-green-700 bg-green-100 border-green-300';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested order could not be found.'}</p>
          <Link
            to="/orders"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Details</h1>
        <p className="text-gray-600">Order ID: {order.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Status and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Status</h2>
            <div className={`flex items-center space-x-3 p-4 rounded-lg border ${getStatusColor(order.order_status)}`}>
              {getStatusIcon(order.order_status)}
              <div>
                <p className="font-semibold">{getStatusText(order.order_status)}</p>
                <p className="text-sm opacity-75">
                  {order.order_type === 'preorder' ? 'Pre-order' : 'Instant order'} • 
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Payment Link for Pending Orders */}
            {order.order_status === 'pending' && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">Complete Payment</h3>
                <p className="text-sm text-orange-700 mb-3">
                  Click the link below to complete your payment via UPI:
                </p>
                <a
                  href={order.upi_link}
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Pay Now via UPI
                </a>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-3 border-b border-gray-200 last:border-b-0">
                  {item.products && (
                    <>
                      <img
                        src={item.products.image}
                        alt={item.products.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.products.name}</h3>
                        <p className="text-sm text-gray-600">{item.products.weight} • {item.slab_label}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          ₹{item.price_per_bag * item.quantity}
                        </p>
                        <p className="text-sm text-gray-600">₹{item.price_per_bag}/bag</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin size={20} className="mr-2" />
              Delivery Address
            </h2>
            <div className="text-gray-700">
              <p>{order.delivery_address.fullAddress}</p>
              <p>Pincode: {order.delivery_address.pincode}</p>
              {order.delivery_address.landmark && (
                <p>Landmark: {order.delivery_address.landmark}</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Type</span>
                <span className="font-medium capitalize">{order.order_type}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span className="font-medium capitalize">{order.payment_status}</span>
              </div>
              
              {order.gst_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">GST Number</span>
                  <span className="font-medium">{order.gst_number}</span>
                </div>
              )}
              
              {order.scheduled_delivery && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled</span>
                  <span className="font-medium">
                    {new Date(order.scheduled_delivery).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                  <span className="text-2xl font-bold text-orange-500">₹{order.total_amount}</span>
                </div>
                
                {order.order_type === 'preorder' && order.payment_status === 'partial' && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Paid: ₹{Math.ceil(order.total_amount / 2)}</p>
                    <p>Remaining: ₹{Math.floor(order.total_amount / 2)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/products"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors text-center block"
              >
                Continue Shopping
              </Link>
              
              <Link
                to="/orders"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold transition-colors text-center block"
              >
                View All Orders
              </Link>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                📦 Delivery handled by Porter. Track your order status above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;