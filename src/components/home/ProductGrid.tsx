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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Premium Rice Collection
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Fresh, quality rice delivered to your doorstep
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.slice(0, 6).map((product) => {
            const isInStock = product.available_quantity > 0;
            const price = product.price_slabs?.[0]?.price_per_bag || product.base_price;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${isInStock ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}>
                    {isInStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-orange-500 font-semibold text-base sm:text-lg">
                        ₹{price}
                      </span>
                      <span className="text-gray-500">{product.weight}</span>
                    </div>

                    {/* Price Slabs */}
                    {product.price_slabs?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Bulk discounts available:</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {product.price_slabs.slice(0, 2).map((slab, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 px-2 py-1 rounded font-medium"
                            >
                              {slab.label}: ₹{slab.price_per_bag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 mt-4">
                    <Link
                      to={`/product/${product.id}`}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm text-center px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleQuickAdd(product)}
                      disabled={!product.price_slabs?.length || !isInStock}
                      className={`p-2 rounded-lg ${!isInStock ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'
                        } transition-colors`}
                      title="Quick Add to Cart"
                    >
                      <ShoppingCart size={18} />
                    </button>
                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
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

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 rounded-full font-semibold transition-transform transform hover:scale-105"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;