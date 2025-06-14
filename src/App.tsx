import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AnnouncementBar from './components/layout/AnnouncementBar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './components/product/ProductDetail';
import CartPage from './components/cart/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderPage from './pages/OrderPage';
import PreOrderPage from './pages/PreOrderPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import Toast from './components/ui/Toast';
import { useToast } from './hooks/useToast';

function App() {
  const { toasts } = useToast();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AnnouncementBar />
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:id" element={<OrderPage />} />
            <Route path="/preorder" element={<PreOrderPage />} />
            <Route path="/orders" element={<TrackOrderPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/policies" element={<div className="container mx-auto px-4 py-12 text-center"><h2 className="text-2xl font-bold">Policies Page - Coming Soon</h2></div>} />
          </Routes>
        </main>
        <Footer />
        
        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map(toast => (
            <Toast key={toast.id} {...toast} />
          ))}
        </div>
      </div>
    </Router>
  );
}

export default App;