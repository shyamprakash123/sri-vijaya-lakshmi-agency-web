import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, User, Phone } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const Header: React.FC = () => {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Pre-Order', path: '/preorder' },
    { name: 'Track Order', path: '/orders' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top Strip */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 text-center text-sm font-medium">
        🚚 Orders dispatched within 1 hour | 📞 Pre-order 24hrs in advance for discounts!
      </div>

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
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-gray-700 hover:text-orange-500 font-medium transition-colors ${
                  location.pathname === item.path ? 'text-orange-500 border-b-2 border-orange-500' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
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

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors"
            >
              <ShoppingCart size={24} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-orange-500"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-200">
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
  );
};

export default Header;