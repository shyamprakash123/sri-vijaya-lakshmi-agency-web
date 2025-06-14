import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Shield, Truck } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🌾</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Sri Vijaya Lakshmi</h3>
                <p className="text-sm text-gray-400">Premium Rice Agency</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Delivering premium quality rice with fast, reliable service. 
              Your trusted partner for all rice varieties.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/preorder" className="text-gray-400 hover:text-white transition-colors">Pre-Order</Link></li>
              <li><Link to="/orders" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/policies" className="text-gray-400 hover:text-white transition-colors">Policies</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-orange-500" />
                <span className="text-gray-400 text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-orange-500" />
                <span className="text-gray-400 text-sm">info@svlrice.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin size={16} className="text-orange-500 mt-1" />
                <span className="text-gray-400 text-sm">
                  123 Rice Market Street<br />
                  Chennai, Tamil Nadu 600001
                </span>
              </li>
            </ul>
          </div>

          {/* Service Features */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Promise</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Clock size={16} className="text-green-500" />
                <span className="text-gray-400 text-sm">1 Hour Delivery</span>
              </li>
              <li className="flex items-center space-x-3">
                <Shield size={16} className="text-blue-500" />
                <span className="text-gray-400 text-sm">Quality Assured</span>
              </li>
              <li className="flex items-center space-x-3">
                <Truck size={16} className="text-purple-500" />
                <span className="text-gray-400 text-sm">Porter Delivery</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 Sri Vijaya Lakshmi Agency. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link to="/policies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/policies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/policies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Shipping Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;