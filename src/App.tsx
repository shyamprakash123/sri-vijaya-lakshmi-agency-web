import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AnnouncementBar from "./components/layout/AnnouncementBar";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetail from "./components/product/ProductDetail";
import CartPage from "./components/cart/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderPage from "./pages/OrderPage";
import PreOrderPage from "./pages/PreOrderPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import ContactPage from "./pages/ContactPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { DialogProvider } from "./hooks/useDialog";
import PrivacyPolicy from "./pages/policies/PrivacyPolicy";
import TermsOfService from "./pages/policies/TermsOfService";
import ShippingPolicy from "./pages/policies/ShippingPolicy";
import ScrollToTop from "./components/ui/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginToContinue from "./pages/LoginToContinue";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <DialogProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <AnnouncementBar />
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/preorder"
                element={
                  <ProtectedRoute>
                    <PreOrderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <TrackOrderPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/login" element={<LoginToContinue />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />

          {/* Toast Container */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 10000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                style: {
                  background: "#10B981",
                },
              },
              error: {
                style: {
                  background: "#EF4444",
                },
              },
            }}
          />
        </div>
      </Router>
    </DialogProvider>
  );
}

export default App;
