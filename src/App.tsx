import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './components/product/ProductDetail';
import CartPage from './components/cart/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderPage from './pages/OrderPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:id" element={<OrderPage />} />
            <Route path="/preorder" element={<div className="container mx-auto px-4 py-12 text-center"><h2 className="text-2xl font-bold">Pre-order Page - Coming Soon</h2></div>} />
            <Route path="/orders" element={<div className="container mx-auto px-4 py-12 text-center"><h2 className="text-2xl font-bold">Order Tracking - Coming Soon</h2></div>} />
            <Route path="/contact" element={<div className="container mx-auto px-4 py-12 text-center"><h2 className="text-2xl font-bold">Contact Page - Coming Soon</h2></div>} />
            <Route path="/policies" element={<div className="container mx-auto px-4 py-12 text-center"><h2 className="text-2xl font-bold">Policies Page - Coming Soon</h2></div>} />
            <Route path="/admin" element={<div className="container mx-auto px-4 py-12 text-center"><h2 className="text-2xl font-bold">Admin Dashboard - Coming Soon</h2></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;