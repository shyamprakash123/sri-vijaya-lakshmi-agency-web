import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Package, Truck, Shield, Loader2, AlertCircle, Store, MapPin, CreditCard } from 'lucide-react';
import { useProduct } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { PriceSlab } from '../../types';
import toast from 'react-hot-toast';
import QuantityInput from '../ui/QuntityInput';
import { OlaMaps } from 'olamaps-web-sdk';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id!);
  const [selectedSlab, setSelectedSlab] = useState<PriceSlab | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const imageUrl = `https://api.olamaps.io/tiles/v1/styles/default-light-standard/static/78.356371,17.475702,15/800x600.png?marker=78.356371,17.475702|red|scale:1&api_key=${import.meta.env.VITE_OLA_MAPS_API_KEY || 'demo-key'}`;

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
    }
  };

  const handleBuyNow = () => {
    if (product && selectedSlab) {
      addToCart(product, quantity, selectedSlab);
      navigate('/checkout');
    }
  };

  const getWhatsAppLink = () => {
    if (!product) return '';
    const message = `Hi! I want to order ${quantity} bags of ${product.name} (${product.weight}). Total: ₹${(selectedSlab?.price_per_bag || 0) * quantity}`;
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+918374237713';
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const isInStock = product && product.available_quantity > 0;

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
          <div className="aspect-square rounded-xl overflow-hidden shadow-lg relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Stock Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${isInStock
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
                }`}>
                {isInStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
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
              <Shield size={20} className={isInStock ? "text-green-500" : "text-red-500"} />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-semibold ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                  {isInStock ? 'In Stock' : 'Out of Stock'}
                </p>
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
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedSlab?.id === slab.id
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
          <QuantityInput product={product} quantity={quantity} setQuantity={setQuantity} isInStock={isInStock} />

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
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSlab || !isInStock}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!selectedSlab || !isInStock}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Store size={20} />
                <span>Buy Now</span>
              </button>
            </div>

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

          {/* Store Information */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Store size={20} className="text-blue-500" />
              <h4 className="font-semibold text-blue-800">Visit Our Store</h4>
            </div>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>New Hafeezpet, Marthanda Nagar,<br />
                  Hyderabad, Telangana - 500049</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard size={16} />
                <span>POS machine available - All cards accepted</span>
              </div>
              <p>📍 Physical store open for walk-in customers</p>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Truck size={20} className="text-green-500" />
              <h4 className="font-semibold text-green-800">Delivery Information</h4>
            </div>
            <p className="text-sm text-green-700">
              📦 Delivery handled by Porter within 1 hour for instant orders,
              and as per selected slot for pre-orders.
            </p>
          </div>
        </div>
      </div>

      {/* Store Location Map */}
      <div className="mt-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <MapPin size={24} className="mr-2 text-orange-500" />
            Store Location
          </h3>

          {/* Map Placeholder - Replace with actual map integration */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${import.meta.env.VITE_STORE_LAT},${import.meta.env.VITE_STORE_LNG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4 overflow-hidden">
            <img src={imageUrl} alt="Static Map" className="object-cover w-full h-full " />
          </a>
          <div className="text-center">
            <MapPin size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">Sri Vijaya Lakshmi Agency</p>
            <p className="text-sm text-gray-400">New Hafeezpet, Marthanda Nagar,<br />
              Hyderabad, Telangana - 500049</p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-6">
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Store Hours</h4>
              <p className="text-sm text-orange-700">Mon - Sat: 6:00 AM - 10:00 PM</p>
              <p className="text-sm text-orange-700">Sunday: 7:00 AM - 9:00 PM</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Contact</h4>
              <p className="text-sm text-blue-700">📞 +91 8374237713</p>
              <p className="text-sm text-blue-700">📧 contact@vijayalakshmirice.in</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Facilities</h4>
              <p className="text-sm text-green-700">💳 Card Payments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;