import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { products, loading } = useProducts({ search: debouncedSearch });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleProductClick = () => {
    onClose();
    setSearchTerm('');
  };

  const filteredProducts = products.slice(0, 6); // Limit to 6 results

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center p-6 border-b border-gray-200">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-lg border-0 focus:outline-none"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && searchTerm && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}

          {!loading && searchTerm && filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500">Try searching with different keywords</p>
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="p-4">
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={handleProductClick}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate group-hover:text-orange-500 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{product.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-medium text-orange-500">
                          ₹{product.price_slabs?.[0]?.price_per_bag || product.base_price}
                        </span>
                        <span className="text-xs text-gray-500">{product.weight}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                  </Link>
                ))}
              </div>

              {products.length > 6 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to={`/products?search=${encodeURIComponent(searchTerm)}`}
                    onClick={handleProductClick}
                    className="flex items-center justify-center space-x-2 text-orange-500 hover:text-orange-600 font-medium transition-colors"
                  >
                    <span>View all {products.length} results</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {!searchTerm && (
            <div className="p-6 text-center">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Search Products</h3>
              <p className="text-gray-500">Start typing to find rice varieties, brands, and more</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {!searchTerm && (
          <div className="border-t border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/products?category=basmati"
                onClick={handleProductClick}
                className="p-2 text-sm text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Basmati Rice
              </Link>
              <Link
                to="/products?category=regular"
                onClick={handleProductClick}
                className="p-2 text-sm text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Regular Rice
              </Link>
              <Link
                to="/products?category=premium"
                onClick={handleProductClick}
                className="p-2 text-sm text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Premium Rice
              </Link>
              <Link
                to="/preorder"
                onClick={handleProductClick}
                className="p-2 text-sm text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Pre-Orders
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;