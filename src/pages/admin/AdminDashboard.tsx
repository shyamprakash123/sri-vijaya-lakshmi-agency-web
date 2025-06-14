import React, { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Calendar,
  DollarSign,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  Truck,
  X,
  Megaphone,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { Order } from '../../types';
import ProductModal from '../../components/admin/ProductModal';
import AnnouncementModal from '../../components/admin/AnnouncementModal';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string) => Promise<void>;
  loading?: boolean;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
  loading = false
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!isOpen || !order) return null;

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await onStatusUpdate(order.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'prepaid':
      case 'fully_paid':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'dispatched':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAvailableStatusUpdates = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return [
          { value: 'fully_paid', label: 'Mark as Paid', color: 'bg-blue-500' },
          { value: 'cancelled', label: 'Cancel Order', color: 'bg-red-500' }
        ];
      case 'prepaid':
        return [
          { value: 'fully_paid', label: 'Mark as Fully Paid', color: 'bg-blue-500' },
          { value: 'dispatched', label: 'Prepare for Dispatch', color: 'bg-purple-500' },
          { value: 'cancelled', label: 'Cancel Order', color: 'bg-red-500' }
        ];
      case 'fully_paid':
        return [
          { value: 'dispatched', label: 'Mark as Dispatched', color: 'bg-purple-500' },
          { value: 'cancelled', label: 'Cancel Order', color: 'bg-red-500' }
        ];
      case 'dispatched':
        return [
          { value: 'delivered', label: 'Mark as Delivered', color: 'bg-green-500' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Order Details</h2>
            <p className="opacity-90">#{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status and Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Status</h3>
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(order.order_status)}
                <div>
                  <p className="font-semibold capitalize">{order.order_status.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-600">
                    {order.order_type === 'preorder' ? 'Pre-order' : 'Instant order'}
                  </p>
                </div>
              </div>
              
              {/* Status Update Actions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Update Status:</p>
                <div className="flex flex-wrap gap-2">
                  {getAvailableStatusUpdates(order.order_status).map((action) => (
                    <button
                      key={action.value}
                      onClick={() => handleStatusUpdate(action.value)}
                      disabled={updatingStatus}
                      className={`${action.color} hover:opacity-90 disabled:opacity-50 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1`}
                    >
                      {updatingStatus ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        getStatusIcon(action.value)
                      )}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-orange-500">₹{order.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-medium capitalize">{order.payment_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{order.order_items?.length || 0}</span>
                </div>
                {order.gst_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST Number:</span>
                    <span className="font-medium">{order.gst_number}</span>
                  </div>
                )}
                {order.scheduled_delivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scheduled:</span>
                    <span className="font-medium">
                      {new Date(order.scheduled_delivery).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price/Bag</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Slab</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.order_items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            {item.products && (
                              <>
                                <img
                                  src={item.products.image}
                                  alt={item.products.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div>
                                  <p className="font-medium text-gray-800">{item.products.name}</p>
                                  <p className="text-sm text-gray-600">{item.products.weight}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">{item.quantity}</td>
                        <td className="px-4 py-3">₹{item.price_per_bag}</td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {item.slab_label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold">₹{item.price_per_bag * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin size={20} className="mr-2 text-orange-500" />
                Delivery Address
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 mb-2">{order.delivery_address.fullAddress}</p>
                <p className="text-gray-600">Pincode: {order.delivery_address.pincode}</p>
                {order.delivery_address.landmark && (
                  <p className="text-gray-600">Landmark: {order.delivery_address.landmark}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CreditCard size={20} className="mr-2 text-orange-500" />
                Payment Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Hash:</span>
                  <span className="font-mono text-sm">{order.payment_hash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">UPI Link:</span>
                  <a
                    href={order.upi_link}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Payment Link
                  </a>
                </div>
                {order.order_type === 'preorder' && order.payment_status === 'partial' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Pre-order Payment:</strong><br />
                      Paid: ₹{Math.ceil(order.total_amount / 2)}<br />
                      Remaining: ₹{Math.floor(order.total_amount / 2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FileText size={16} />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const {
    stats,
    orders,
    products,
    banners,
    announcements,
    loading,
    error,
    updateOrderStatus,
    updateProductStock,
    createProduct,
    updateProduct,
    deleteProduct,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refreshData
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      setActionLoading(orderId);
      await updateOrderStatus(orderId, status);
      
      // Update the selected order if it's currently being viewed
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStock = async (productId: string, quantity: number) => {
    try {
      setActionLoading(productId);
      await updateProductStock(productId, quantity);
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleProductSave = async (productData: any) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      setShowProductModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  };

  const handleAnnouncementSave = async (announcementData: any) => {
    try {
      if (selectedAnnouncement) {
        await updateAnnouncement(selectedAnnouncement.id, announcementData);
      } else {
        await createAnnouncement(announcementData);
      }
      setShowAnnouncementModal(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
      throw error;
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'prepaid':
      case 'fully_paid':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'dispatched':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'prepaid':
      case 'fully_paid':
        return 'text-blue-600 bg-blue-100';
      case 'dispatched':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const StatCard = ({ title, value, growth, icon: Icon, color, alert }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow relative">
      {alert && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {growth !== undefined && (
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className={`${growth >= 0 ? 'text-green-500' : 'text-red-500'} mr-1`} />
              <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
              </span>
              <span className="text-gray-500 text-sm ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  // Filter orders based on search, status, and date
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.delivery_address.fullAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter.startDate || dateFilter.endDate) {
      const orderDate = new Date(order.created_at);
      const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
      const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
      
      if (startDate && orderDate < startDate) matchesDate = false;
      if (endDate && orderDate > endDate) matchesDate = false;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your rice delivery business</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshData}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600">Last updated</p>
                <p className="font-semibold text-gray-800">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: stats.pendingOrders },
              { id: 'products', label: 'Products', icon: Package, badge: stats.lowStockProducts },
              { id: 'announcements', label: 'Announcements', icon: Megaphone }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Monthly Revenue"
                value={`₹${stats.totalRevenue.toLocaleString()}`}
                growth={stats.revenueGrowth}
                icon={DollarSign}
                color="bg-green-500"
              />
              <StatCard
                title="Monthly Orders"
                value={stats.totalOrders}
                growth={stats.orderGrowth}
                icon={ShoppingCart}
                color="bg-blue-500"
                alert={stats.pendingOrders > 0}
              />
              <StatCard
                title="Total Products"
                value={stats.totalProducts}
                growth={stats.productGrowth}
                icon={Package}
                color="bg-purple-500"
                alert={stats.lowStockProducts > 0}
              />
              <StatCard
                title="Total Customers"
                value={stats.totalCustomers}
                growth={stats.customerGrowth}
                icon={Users}
                color="bg-orange-500"
              />
            </div>

            {/* Alerts */}
            {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle size={20} className="text-red-500" />
                  <h3 className="font-semibold text-red-800">Attention Required</h3>
                </div>
                <div className="space-y-1 text-red-700">
                  {stats.pendingOrders > 0 && (
                    <p>• {stats.pendingOrders} orders pending payment</p>
                  )}
                  {stats.lowStockProducts > 0 && (
                    <p>• {stats.lowStockProducts} products running low on stock</p>
                  )}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.order_status)}
                      <div>
                        <p className="font-medium text-gray-800">#{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">₹{order.total_amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Orders Management</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="prepaid">Pre-paid</option>
                  <option value="fully_paid">Fully Paid</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Date Filter */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
                </div>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Start Date"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="End Date"
                />
                <button
                  onClick={() => setDateFilter({ startDate: '', endDate: '' })}
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleOrderExpansion(order.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {expandedOrders.has(order.id) ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  #{order.id.slice(0, 8)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(order.created_at).toLocaleDateString()} • {order.order_type}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {order.order_items?.length || 0} items
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {order.delivery_address.fullAddress.slice(0, 30)}...
                            </div>
                            <div className="text-sm text-gray-500">
                              PIN: {order.delivery_address.pincode}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{order.total_amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(order.order_status)}
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.order_status)}`}>
                                {order.order_status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {order.order_status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'fully_paid')}
                                  disabled={actionLoading === order.id}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  title="Mark as Paid"
                                >
                                  {actionLoading === order.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <CheckCircle size={16} />
                                  )}
                                </button>
                              )}
                              {(order.order_status === 'fully_paid' || order.order_status === 'prepaid') && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'dispatched')}
                                  disabled={actionLoading === order.id}
                                  className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                                  title="Mark as Dispatched"
                                >
                                  {actionLoading === order.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <Truck size={16} />
                                  )}
                                </button>
                              )}
                              {order.order_status === 'dispatched' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                  disabled={actionLoading === order.id}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  title="Mark as Delivered"
                                >
                                  {actionLoading === order.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <CheckCircle size={16} />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowOrderModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedOrders.has(order.id) && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-800">Order Items:</h4>
                                {order.order_items?.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between text-sm">
                                    <span>{item.products?.name} × {item.quantity}</span>
                                    <span>₹{item.price_per_bag * item.quantity}</span>
                                  </div>
                                ))}
                                {order.scheduled_delivery && (
                                  <p className="text-sm text-gray-600">
                                    <strong>Scheduled:</strong> {new Date(order.scheduled_delivery).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Products Management</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setShowProductModal(true);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.available_quantity < 10 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        Stock: {product.available_quantity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <span className={`w-3 h-3 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{product.description.slice(0, 80)}...</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium capitalize">{product.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium">{product.weight}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base Price:</span>
                        <span className="font-medium">₹{product.base_price}</span>
                      </div>
                    </div>

                    {/* Stock Update */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Update Stock
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          defaultValue={product.available_quantity}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                          onBlur={(e) => {
                            const newQuantity = parseInt(e.target.value);
                            if (newQuantity !== product.available_quantity && newQuantity >= 0) {
                              handleUpdateStock(product.id, newQuantity);
                            }
                          }}
                        />
                        {actionLoading === product.id && (
                          <Loader2 size={16} className="animate-spin text-orange-500 mt-1" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductModal(true);
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            deleteProduct(product.id);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
              <button
                onClick={() => {
                  setSelectedAnnouncement(null);
                  setShowAnnouncementModal(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Add Announcement</span>
              </button>
            </div>

            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          announcement.type === 'success' ? 'bg-green-100 text-green-800' :
                          announcement.type === 'promotion' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {announcement.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          Priority: {announcement.priority}
                        </span>
                        <span className={`w-3 h-3 rounded-full ${announcement.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      </div>
                      <p className="text-gray-800 mb-2">{announcement.message}</p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedAnnouncement(announcement);
                          setShowAnnouncementModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-2"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this announcement?')) {
                            deleteAnnouncement(announcement.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        onSave={handleProductSave}
        product={selectedProduct}
      />

      <AnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => {
          setShowAnnouncementModal(false);
          setSelectedAnnouncement(null);
        }}
        onSave={handleAnnouncementSave}
        announcement={selectedAnnouncement}
      />

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }}
        onStatusUpdate={handleUpdateOrderStatus}
        loading={actionLoading === selectedOrder?.id}
      />
    </div>
  );
};

export default AdminDashboard;