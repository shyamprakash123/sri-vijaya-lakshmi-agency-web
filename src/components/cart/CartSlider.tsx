import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

interface CartSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlider: React.FC<CartSliderProps> = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalAmount, getTotalItems } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slider */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center space-x-3">
              <ShoppingBag size={24} className="text-orange-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
                <p className="text-sm text-gray-600">{getTotalItems()} items</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag size={64} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some premium rice to get started!</p>
                <Link
                  to="/products"
                  onClick={onClose}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-1">{item.product.weight}</p>
                        <div className="flex items-center space-x-1 mb-2">
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            {item.selectedSlab.label}
                          </span>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="bg-white hover:bg-gray-100 text-gray-600 w-7 h-7 rounded-full flex items-center justify-center border border-gray-300 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="bg-white hover:bg-gray-100 text-gray-600 w-7 h-7 rounded-full flex items-center justify-center border border-gray-300 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-500 hover:text-red-600 p-1 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        ₹{item.selectedSlab.price_per_bag}/bag
                      </span>
                      <span className="font-bold text-orange-500">
                        ₹{item.selectedSlab.price_per_bag * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-orange-500">
                  ₹{getTotalAmount()}
                </span>
              </div>
              
              <div className="space-y-3">
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors text-center block"
                >
                  View Cart
                </Link>
                
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 px-6 rounded-lg font-semibold transition-all text-center block flex items-center justify-center space-x-2"
                >
                  <span>Checkout</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
              
              <div className="mt-3 p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 text-center">
                  🚚 Free delivery within 1 hour via Porter
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSlider;