import { useState, useEffect } from 'react';
import { supabase, productService, orderService, bannerService, announcementService } from '../lib/supabase';
import { Product, Order, Banner } from '../types';

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  orderGrowth: number;
  productGrowth: number;
  customerGrowth: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export const useAdmin = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    productGrowth: 0,
    customerGrowth: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
    const channel = supabase
    .channel('orders_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      () => {
        fetchAdminData();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel); // Clean up on unmount
  };
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [ordersData, productsData, bannersData, announcementsData] = await Promise.all([
        orderService.getAll(),
        productService.getAll(),
        bannerService.getAll(),
        announcementService.getAll()
      ]);

      setOrders(ordersData);
      setProducts(productsData);
      setBanners(bannersData);
      setAnnouncements(announcementsData);

      // Calculate stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthOrders = ordersData.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });

      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const lastMonthOrders = ordersData.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
      });

      const totalRevenue = currentMonthOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.total_amount, 0);
      
      const revenueGrowth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
      const orderGrowth = lastMonthOrders.length > 0 ? ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 : 0;

      const pendingOrders = ordersData.filter(order => order.order_status === 'pending').length;
      const lowStockProducts = productsData.filter(product => product.available_quantity < 10).length;

      // Get unique customers
      const uniqueCustomers = new Set(ordersData.filter(order => order.user_id).map(order => order.user_id));

      setStats({
        totalRevenue,
        totalOrders: currentMonthOrders.length,
        totalProducts: productsData.length,
        totalCustomers: uniqueCustomers.size,
        revenueGrowth,
        orderGrowth,
        productGrowth: 4.2, // Mock data
        customerGrowth: 15.7, // Mock data
        pendingOrders,
        lowStockProducts
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to orders changes
    const ordersSubscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchAdminData(); // Refresh all data when orders change
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
    };
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await orderService.updateStatus(orderId, status);
      // Data will be refreshed via real-time subscription
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  const updateProductStock = async (productId: string, quantity: number) => {
    try {
      await productService.updateQuantity(productId, quantity);
      // Data will be refreshed via real-time subscription
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update product stock');
    }
  };

  const createProduct = async (productData: any) => {
    try {
      await productService.create(productData);
      // Data will be refreshed via real-time subscription
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create product');
    }
  };

  const updateProduct = async (productId: string, updates: any) => {
    try {
      await productService.update(productId, updates);
      // Data will be refreshed via real-time subscription
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await productService.delete(productId);
      // Data will be refreshed via real-time subscription
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const createBanner = async (bannerData: any) => {
    try {
      await bannerService.create(bannerData);
      fetchAdminData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create banner');
    }
  };

  const updateBanner = async (bannerId: string, updates: any) => {
    try {
      await bannerService.update(bannerId, updates);
      fetchAdminData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update banner');
    }
  };

  const deleteBanner = async (bannerId: string) => {
    try {
      await bannerService.delete(bannerId);
      fetchAdminData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete banner');
    }
  };

  const createAnnouncement = async (announcementData: any) => {
    try {
      await announcementService.create(announcementData);
      fetchAdminData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create announcement');
    }
  };

  const updateAnnouncement = async (announcementId: string, updates: any) => {
    try {
      await announcementService.update(announcementId, updates);
      fetchAdminData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update announcement');
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    try {
      await announcementService.delete(announcementId);
      fetchAdminData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete announcement');
    }
  };

  return {
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
    createBanner,
    updateBanner,
    deleteBanner,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refreshData: fetchAdminData
  };
};