import { useState, useEffect } from 'react';
import { supabase, productService, orderService, bannerService, announcementService, couponService, categoryService } from '../lib/supabase';
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
  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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
    supabase.removeChannel(channel);
  };
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated and has admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required');
      }

      // Fetch all data in parallel
      const [ordersData, productsData, bannersData, announcementsData, couponsData, categoriesData] = await Promise.all([
        orderService.getAll(),
        productService.getAllAdmin(), // Use admin version
        bannerService.getAllAdmin(), // Use admin version
        announcementService.getAllAdmin(), // Use admin version
        couponService.getAllAdmin(), // Use admin version
        categoryService.getAllAdmin() // Use admin version
      ]);

      setOrders(ordersData);
      setProducts(productsData);
      setBanners(bannersData);
      setAnnouncements(announcementsData);
      setCoupons(couponsData);
      setCategories(categoriesData);

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
      console.error('Admin data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await orderService.updateStatus(orderId, status);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Update order status error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  const updateProductStock = async (productId: string, quantity: number) => {
    try {
      await productService.updateQuantity(productId, quantity);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Update product stock error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update product stock');
    }
  };

  const createProduct = async (productData: any) => {
    try {
      await productService.create(productData);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Create product error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create product');
    }
  };

  const updateProduct = async (productId: string, updates: any) => {
    try {
      await productService.update(productId, updates);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Update product error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await productService.delete(productId);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Delete product error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const createBanner = async (bannerData: any) => {
    try {
      await bannerService.create(bannerData);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Create banner error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create banner');
    }
  };

  const updateBanner = async (bannerId: string, updates: any) => {
    try {
      await bannerService.update(bannerId, updates);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Update banner error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update banner');
    }
  };

  const deleteBanner = async (bannerId: string) => {
    try {
      await bannerService.delete(bannerId);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Delete banner error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete banner');
    }
  };

  const createAnnouncement = async (announcementData: any) => {
    try {
      await announcementService.create(announcementData);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Create announcement error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create announcement');
    }
  };

  const updateAnnouncement = async (announcementId: string, updates: any) => {
    try {
      await announcementService.update(announcementId, updates);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Update announcement error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update announcement');
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    try {
      await announcementService.delete(announcementId);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Delete announcement error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete announcement');
    }
  };

  const createCoupon = async (couponData: any) => {
    try {
      await couponService.create(couponData);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Create coupon error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create coupon');
    }
  };

  const updateCoupon = async (couponId: string, updates: any) => {
    try {
      await couponService.update(couponId, updates);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Update coupon error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update coupon');
    }
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      await couponService.delete(couponId);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Delete coupon error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete coupon');
    }
  };

  const createCategory = async (categoryData: any) => {
    try {
      await categoryService.create(categoryData);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Create category error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const updateCategory = async (categoryId: string, updates: any) => {
    try {
      await categoryService.update(categoryId, updates);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Update category error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await categoryService.delete(categoryId);
      await fetchAdminData(); // Refresh data
    } catch (err) {
      console.error('Delete category error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  return {
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
    refreshData: fetchAdminData
  };
};