import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, User, Phone, Search } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import AuthModal from '../auth/AuthModal';
import CartSlider from '../cart/CartSlider';

const Header: React.FC = () => {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock auth state

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Pre-Order', path: '/preorder' },
    { name: 'Track Order', path: '/orders' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-md">
        {/* Main Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌾</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Sri Vijaya Lakshmi</h1>
                <p className="text-sm text-gray-600">Premium Rice Agency</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-gray-700 hover:text-orange-500 font-medium transition-colors relative ${
                    location.pathname === item.path ? 'text-orange-500' : ''
                  }`}
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-500 rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search - Desktop only */}
              <button className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors">
                <Search size={20} />
              </button>

              {/* WhatsApp Contact */}
              <a
                href="https://wa.me/+919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
              >
                <Phone size={16} />
                <span className="text-sm font-medium">WhatsApp</span>
              </a>

              {/* Auth Buttons */}
              {!isLoggedIn ? (
                <div className="hidden md:flex items-center space-x-2">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                  >
                    Login
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-medium transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">John Doe</span>
                  </div>
                </div>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors"
              >
                <ShoppingCart size={24} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-orange-500"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="lg:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-gray-700 hover:text-orange-500 font-medium transition-colors ${
                      location.pathname === item.path ? 'text-orange-500' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Mobile Auth Buttons */}
                {!isLoggedIn ? (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleAuthClick('login');
                        setIsMenuOpen(false);
                      }}
                      className="text-left text-gray-700 hover:text-orange-500 font-medium transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        handleAuthClick('signup');
                        setIsMenuOpen(false);
                      }}
                      className="text-left bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <span className="font-medium text-gray-700">John Doe</span>
                    </div>
                  </div>
                )}
                
                <a
                  href="https://wa.me/+919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-green-600 font-medium"
                >
                  <Phone size={16} />
                  <span>WhatsApp Support</span>
                </a>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Cart Slider */}
      <CartSlider
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
};

export default Header;