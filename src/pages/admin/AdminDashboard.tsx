import React, { useState } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Settings,
  Megaphone,
  Image as ImageIcon,
  Tag,
  Percent,
  Hash
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import ProductModal from '../../components/admin/ProductModal';
import BannerModal from '../../components/admin/BannerModal';
import AnnouncementModal from '../../components/admin/AnnouncementModal';
import CouponModal from '../../components/admin/CouponModal';
import CategoryModal from '../../components/admin/CategoryModal';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const {
    stats,
    orders,
    products,
    banners,
    announcements,
    coupons,
    categories,
    loading,
    error,
    updateOrderStatus,
    updatePaymentStatus,
    updateProductStock,
    createProduct,
    updateProduct,
    deleteProduct,
    createBanner,
    updateBanner,
    deleteBanner,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshData
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal states
  const [productModal, setProductModal] = useState({ isOpen: false, product: null });
  const [bannerModal, setBannerModal] = useState({ isOpen: false, banner: null });
  const [announcementModal, setAnnouncementModal] = useState({ isOpen: false, announcement: null });
  const [couponModal, setCouponModal] = useState({ isOpen: false, coupon: null });
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, category: null });
  const [orderDetailsModal, setOrderDetailsModal] = useState({ isOpen: false, order: null });
  const [actionLoading, setActionLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'coupons', label: 'Coupons', icon: Percent }
  ];

  const handleAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      setActionLoading(true);
      await action();
      toast.success(successMessage);
    } catch (error) {
      console.error('Action failed:', error);
      toast.error(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="text-sm ml-1">{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueGrowth}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          change={stats.orderGrowth}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          change={stats.productGrowth}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          change={stats.customerGrowth}
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setProductModal({ isOpen: true, product: null })}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
            <button
              onClick={() => setBannerModal({ isOpen: true, banner: null })}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add New Banner</span>
            </button>
            <button
              onClick={() => setAnnouncementModal({ isOpen: true, announcement: null })}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Announcement</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alerts</h3>
          <div className="space-y-3">
            {stats.pendingOrders > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  <strong>{stats.pendingOrders}</strong> pending orders need attention
                </p>
              </div>
            )}
            {stats.lowStockProducts > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">
                  <strong>{stats.lowStockProducts}</strong> products are low in stock
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Orders Management</h2>
        <div className="flex space-x-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coupon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transportation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders
                .filter(order => selectedStatus === 'all' || order.order_status === selectedStatus)
                .map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.user_id ? 'Registered User' : 'Guest'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-semibold">₹{order.total_amount.toLocaleString()}</div>
                        {order.subtotal_amount && order.subtotal_amount !== order.total_amount && (
                          <div className="text-xs text-gray-500">
                            Subtotal: ₹{order.subtotal_amount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.coupon_code ? (
                        <div className="flex items-center space-x-1">
                          <Tag size={12} className="text-green-500" />
                          <span className="text-green-600 font-medium">{order.coupon_code}</span>
                          <span className="text-green-600">(-₹{order.coupon_discount})</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No coupon</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.order_type === 'preorder' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                        {order.order_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.transportation_required ? (
                        <span className="text-green-600 font-medium">₹{order.transportation_amount}</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setOrderDetailsModal({ isOpen: true, order })}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <select
                          value={order.order_status}
                          onChange={(e) => handleAction(
                            () => updateOrderStatus(order.id, e.target.value),
                            'Order status updated successfully'
                          )}
                          className="text-sm border border-gray-300 rounded px-2 py-1 min-w-[120px]"
                          disabled={actionLoading}
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                          <option value="canceled">Canceled</option>

                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Products Management</h2>
        <button
          onClick={() => setProductModal({ isOpen: true, product: null })}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
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
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-lg object-cover" src={product.image} alt={product.name} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.weight}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{product.base_price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={product.available_quantity}
                      onChange={(e) => handleAction(
                        () => updateProductStock(product.id, parseInt(e.target.value)),
                        'Product stock updated successfully'
                      )}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                      disabled={actionLoading}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setProductModal({ isOpen: true, product })}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleAction(
                        () => deleteProduct(product.id),
                        'Product deleted successfully'
                      )}
                      className="text-red-600 hover:text-red-900"
                      disabled={actionLoading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Categories Management</h2>
        <button
          onClick={() => setCategoryModal({ isOpen: true, category: null })}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Tag size={20} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{category.name}</h3>
                  <p className="text-sm text-gray-500">/{category.slug}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {category.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {category.description && (
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Order: {category.sort_order}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCategoryModal({ isOpen: true, category })}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleAction(
                    () => deleteCategory(category.id),
                    'Category deleted successfully'
                  )}
                  className="text-red-600 hover:text-red-900"
                  disabled={actionLoading}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBanners = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Banners Management</h2>
        <button
          onClick={() => setBannerModal({ isOpen: true, banner: null })}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={banner.image} alt={banner.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{banner.title}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${banner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {banner.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {banner.description && (
                <p className="text-gray-600 text-sm mb-3">{banner.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Order: {banner.order_index}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setBannerModal({ isOpen: true, banner })}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleAction(
                      () => deleteBanner(banner.id),
                      'Banner deleted successfully'
                    )}
                    className="text-red-600 hover:text-red-900"
                    disabled={actionLoading}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Announcements Management</h2>
        <button
          onClick={() => setAnnouncementModal({ isOpen: true, announcement: null })}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Announcement</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    announcement.type === 'success' ? 'bg-green-100 text-green-800' :
                      announcement.type === 'promotion' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {announcement.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${announcement.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {announcement.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-500">Priority: {announcement.priority}</span>
                </div>
                <p className="text-gray-800">{announcement.message}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => setAnnouncementModal({ isOpen: true, announcement })}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleAction(
                    () => deleteAnnouncement(announcement.id),
                    'Announcement deleted successfully'
                  )}
                  className="text-red-600 hover:text-red-900"
                  disabled={actionLoading}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCoupons = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Coupons Management</h2>
        <button
          onClick={() => setCouponModal({ isOpen: true, coupon: null })}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-lg">
                <span className="font-bold">{coupon.code}</span>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {coupon.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <p><strong>Type:</strong> {coupon.discount_type}</p>
              <p><strong>Value:</strong> {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}</p>
              <p><strong>Min Order:</strong> ₹{coupon.min_order_amount}</p>
              {coupon.max_discount && (
                <p><strong>Max Discount:</strong> ₹{coupon.max_discount}</p>
              )}
              {coupon.max_uses && (
                <p><strong>Max Uses:</strong> {coupon.current_uses || 0}/{coupon.max_uses}</p>
              )}
              {coupon.max_uses_per_user && (
                <p><strong>Per User:</strong> {coupon.max_uses_per_user}</p>
              )}
              <p><strong>Valid Until:</strong> {new Date(coupon.valid_until).toLocaleDateString()}</p>
            </div>

            <div className="flex items-center justify-end space-x-2 mt-4">
              <button
                onClick={() => setCouponModal({ isOpen: true, coupon })}
                className="text-blue-600 hover:text-blue-900"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleAction(
                  () => deleteCoupon(coupon.id),
                  'Coupon deleted successfully'
                )}
                className="text-red-600 hover:text-red-900"
                disabled={actionLoading}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error loading dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your rice delivery business</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'categories' && renderCategories()}
          {activeTab === 'banners' && renderBanners()}
          {activeTab === 'announcements' && renderAnnouncements()}
          {activeTab === 'coupons' && renderCoupons()}
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={productModal.isOpen}
        onClose={() => setProductModal({ isOpen: false, product: null })}
        onSave={productModal.product ?
          (data) => handleAction(
            () => updateProduct(productModal.product.id, data),
            'Product updated successfully'
          ) :
          (data) => handleAction(
            () => createProduct(data),
            'Product created successfully'
          )
        }
        product={productModal.product}
        loading={actionLoading}
      />

      <BannerModal
        isOpen={bannerModal.isOpen}
        onClose={() => setBannerModal({ isOpen: false, banner: null })}
        onSave={bannerModal.banner ?
          (data) => handleAction(
            () => updateBanner(bannerModal.banner.id, data),
            'Banner updated successfully'
          ) :
          (data) => handleAction(
            () => createBanner(data),
            'Banner created successfully'
          )
        }
        banner={bannerModal.banner}
        loading={actionLoading}
      />

      <AnnouncementModal
        isOpen={announcementModal.isOpen}
        onClose={() => setAnnouncementModal({ isOpen: false, announcement: null })}
        onSave={announcementModal.announcement ?
          (data) => handleAction(
            () => updateAnnouncement(announcementModal.announcement.id, data),
            'Announcement updated successfully'
          ) :
          (data) => handleAction(
            () => createAnnouncement(data),
            'Announcement created successfully'
          )
        }
        announcement={announcementModal.announcement}
        loading={actionLoading}
      />

      <CouponModal
        isOpen={couponModal.isOpen}
        onClose={() => setCouponModal({ isOpen: false, coupon: null })}
        onSave={couponModal.coupon ?
          (data) => handleAction(
            () => updateCoupon(couponModal.coupon.id, data),
            'Coupon updated successfully'
          ) :
          (data) => handleAction(
            () => createCoupon(data),
            'Coupon created successfully'
          )
        }
        coupon={couponModal.coupon}
        loading={actionLoading}
      />

      <CategoryModal
        isOpen={categoryModal.isOpen}
        onClose={() => setCategoryModal({ isOpen: false, category: null })}
        onSave={categoryModal.category ?
          (data) => handleAction(
            () => updateCategory(categoryModal.category.id, data),
            'Category updated successfully'
          ) :
          (data) => handleAction(
            () => createCategory(data),
            'Category created successfully'
          )
        }
        category={categoryModal.category}
        loading={actionLoading}
      />

      <OrderDetailsModal
        isOpen={orderDetailsModal.isOpen}
        onChangePaymentStatus={(order_id, status) => handleAction(async () => {
          await updatePaymentStatus(order_id, status);
          setOrderDetailsModal((prev) => {
            return {
              ...prev,
              order: {
                ...prev.order,
                payment_status: status,
              },
            };
          });

        }, "Payment Status updated successfully")}
        onClose={() => setOrderDetailsModal({ isOpen: false, order: null })}
        order={orderDetailsModal.order}
      />
    </div>
  );
};

export default AdminDashboard;