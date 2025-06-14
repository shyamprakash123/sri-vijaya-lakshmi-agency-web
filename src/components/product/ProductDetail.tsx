import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Package, Truck, Shield, Loader2, AlertCircle } from 'lucide-react';
import { useProduct } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { PriceSlab } from '../../types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id!);
  const [selectedSlab, setSelectedSlab] = useState<PriceSlab | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (product && product.price_slabs && product.price_slabs.length > 0) {
      setSelectedSlab(product.price_slabs[0]);
    }
  }, [product]);

  useEffect(() => {
    if (product && product.price_slabs && selectedSlab) {
      // Update selected slab based on quantity
      const newSlab = product.price_slabs.find(slab => 
        quantity >= slab.min_quantity && 
        (slab.max_quantity === null || quantity <= slab.max_quantity)
      );
      if (newSlab && newSlab !== selectedSlab) {
        setSelectedSlab(newSlab);
      }
    }
  }, [quantity, product, selectedSlab]);

  const handleAddToCart = () => {
    if (product && selectedSlab) {
      addToCart(product, quantity, selectedSlab);
      // Show success message or redirect to cart
      navigate('/cart');
    }
  };

  const getWhatsAppLink = () => {
    if (!product) return '';
    const message = `Hi! I want to order ${quantity} bags of ${product.name} (${product.weight}). Total: ₹${(selectedSlab?.price_per_bag || 0) * quantity}`;
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+919876543210';
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested product could not be found.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Package size={20} className="text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-semibold">{product.weight}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield size={20} className="text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="font-semibold">{product.available_quantity} bags</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          {product.price_slabs && product.price_slabs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Price Breakdown</h3>
              <div className="space-y-2">
                {product.price_slabs.map((slab, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedSlab?.id === slab.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSlab(slab)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{slab.label}</span>
                      <span className="text-lg font-bold text-orange-500">
                        ₹{slab.price_per_bag}/bag
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Quantity (bags)
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-10 h-10 rounded-lg font-semibold"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
                max={product.available_quantity}
              />
              <button
                onClick={() => setQuantity(Math.min(product.available_quantity, quantity + 1))}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-10 h-10 rounded-lg font-semibold"
              >
                +
              </button>
            </div>
          </div>

          {/* Total Price */}
          {selectedSlab && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total for {quantity} bags</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{selectedSlab.price_per_bag * quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Price per bag</p>
                  <p className="text-lg font-semibold">₹{selectedSlab.price_per_bag}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSlab || product.available_quantity === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart size={20} />
              <span>Add to Cart</span>
            </button>
            
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle size={20} />
              <span>Chat to Order on WhatsApp</span>
            </a>
          </div>

          {/* Delivery Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Truck size={20} className="text-blue-500" />
              <h4 className="font-semibold text-blue-800">Delivery Information</h4>
            </div>
            <p className="text-sm text-blue-700">
              📦 Delivery handled by Porter within 1 hour for instant orders, 
              and as per selected slot for pre-orders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;