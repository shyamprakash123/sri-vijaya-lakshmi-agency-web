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
  Plus
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = {
    totalRevenue: 125000,
    totalOrders: 342,
    totalProducts: 24,
    totalCustomers: 156,
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    productGrowth: 4.2,
    customerGrowth: 15.7
  };

  const recentOrders = [
    { id: 'SVL001', customer: 'Priya Sharma', amount: 2400, status: 'delivered', date: '2024-01-15' },
    { id: 'SVL002', customer: 'Rajesh Kumar', amount: 1800, status: 'dispatched', date: '2024-01-15' },
    { id: 'SVL003', customer: 'Meera Patel', amount: 3200, status: 'pending', date: '2024-01-14' },
    { id: 'SVL004', customer: 'Arjun Singh', amount: 1500, status: 'confirmed', date: '2024-01-14' },
    { id: 'SVL005', customer: 'Lakshmi Iyer', amount: 2800, status: 'delivered', date: '2024-01-13' }
  ];

  const topProducts = [
    { name: 'Premium Basmati Rice', sales: 45, revenue: 54000 },
    { name: 'Sona Masoori Rice', sales: 38, revenue: 30400 },
    { name: 'Jasmine Rice', sales: 32, revenue: 30400 },
    { name: 'Brown Basmati Rice', sales: 28, revenue: 39200 },
    { name: 'Ponni Rice', sales: 42, revenue: 29400 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'dispatched':
        return 'text-blue-600 bg-blue-100';
      case 'confirmed':
        return 'text-purple-600 bg-purple-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const StatCard = ({ title, value, growth, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            <TrendingUp size={16} className={`${growth >= 0 ? 'text-green-500' : 'text-red-500'} mr-1`} />
            <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}{growth}%
            </span>
            <span className="text-gray-500 text-sm ml-1">vs last month</span>
          </div>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Today</p>
                <p className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
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
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'customers', label: 'Customers', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
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
                title="Total Revenue"
                value={`₹${stats.totalRevenue.toLocaleString()}`}
                growth={stats.revenueGrowth}
                icon={DollarSign}
                color="bg-green-500"
              />
              <StatCard
                title="Total Orders"
                value={stats.totalOrders}
                growth={stats.orderGrowth}
                icon={ShoppingCart}
                color="bg-blue-500"
              />
              <StatCard
                title="Products"
                value={stats.totalProducts}
                growth={stats.productGrowth}
                icon={Package}
                color="bg-purple-500"
              />
              <StatCard
                title="Customers"
                value={stats.totalCustomers}
                growth={stats.customerGrowth}
                icon={Users}
                color="bg-orange-500"
              />
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                  <button className="text-orange-500 hover:text-orange-600 font-medium text-sm">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">#{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">₹{order.amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Top Products</h3>
                  <button className="text-orange-500 hover:text-orange-600 font-medium text-sm">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.sales} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">₹{product.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Orders Management</h2>
              <div className="flex items-center space-x-3">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>All Orders</option>
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Dispatched</option>
                  <option>Delivered</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
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
                        Status
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
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{order.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye size={16} />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
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
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <Plus size={18} />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topProducts.map((product, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sales:</span>
                      <span className="font-medium">{product.sales} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">₹{product.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Customer Management</h2>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-sm font-bold">
                                {order.customer.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer.toLowerCase().replace(' ', '.')}@email.com
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Math.floor(Math.random() * 10) + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{(order.amount * (Math.floor(Math.random() * 3) + 1)).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye size={16} />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;