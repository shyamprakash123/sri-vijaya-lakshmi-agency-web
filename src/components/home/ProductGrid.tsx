import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';

const ProductGrid: React.FC = () => {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();

  const handleQuickAdd = (product: any) => {
    if (product.price_slabs && product.price_slabs.length > 0) {
      addToCart(product, 1, product.price_slabs[0]);
    }
  };

  const getWhatsAppLink = (product: any) => {
    const message = `Hi! I'm interested in ${product.name} (${product.weight}). Please share more details.`;
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+918374237713';
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Premium Rice Collection</h2>
            <p className="text-gray-600">Fresh, quality rice delivered to your doorstep</p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to load products</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Premium Rice Collection</h2>
          <p className="text-gray-600">Fresh, quality rice delivered to your doorstep</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.slice(0, 6).map((product) => {
            const isInStock = product.available_quantity > 0;
            
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isInStock 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {isInStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-orange-500">
                      ₹{product.price_slabs?.[0]?.price_per_bag || product.base_price}
                    </span>
                    <span className="text-sm text-gray-500">{product.weight}</span>
                  </div>

                  {/* Price Slabs Preview */}
                  {product.price_slabs && product.price_slabs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Bulk discounts available:</p>
                      <div className="flex space-x-2 text-xs">
                        {product.price_slabs.slice(0, 2).map((slab, index) => (
                          <span key={index} className="bg-gray-100 px-2 py-1 rounded">
                            {slab.label}: ₹{slab.price_per_bag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/product/${product.id}`}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium text-center transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleQuickAdd(product)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-lg transition-colors"
                      title="Quick Add to Cart"
                      disabled={!product.price_slabs || product.price_slabs.length === 0 || !isInStock}
                    >
                      <ShoppingCart size={18} />
                    </button>
                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Products */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;