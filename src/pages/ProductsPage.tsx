import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, Loader2, AlertCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { ShoppingCart, MessageCircle } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";
import { SearchFilters } from "../types";

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [sortBy, setSortBy] = useState<SearchFilters["sortBy"]>("name");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // Update search term from URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlCategory = searchParams.get("category");

    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [searchParams]);

  const filters = useMemo(
    () => ({
      search: searchTerm,
      category: selectedCategory,
      sortBy,
      minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
    }),
    [searchTerm, selectedCategory, sortBy, priceRange]
  );

  const { products, loading, error } = useProducts(filters);
  const { addToCart } = useCart();

  const categories = [
    { value: "all", label: "All Products" },
    { value: "basmati", label: "Basmati Rice" },
    { value: "regular", label: "Regular Rice" },
    { value: "premium", label: "Premium Rice" },
  ];

  const sortOptions = [
    { value: "name", label: "Name A-Z" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "availability", label: "Availability" },
  ];

  const handleQuickAdd = (product: any) => {
    if (product.price_slabs && product.price_slabs.length > 0) {
      addToCart(product, 1, product.price_slabs[0]);
    }
  };

  const getWhatsAppLink = (product: any) => {
    const message = `Hi! I'm interested in ${product.name} (${product.weight}). Please share more details.`;
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "+919550607240";
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  // Update URL when filters change
  const updateURL = (newSearchTerm: string, newCategory: string) => {
    const params = new URLSearchParams();
    if (newSearchTerm) params.set("search", newSearchTerm);
    if (newCategory && newCategory !== "all")
      params.set("category", newCategory);
    setSearchParams(params);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateURL(value, selectedCategory);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    updateURL(searchTerm, value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Our Products</h1>
        <p className="text-gray-600">
          Discover our premium collection of rice varieties
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as SearchFilters["sortBy"])
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, min: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, max: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-center">
          <span className="text-gray-600">
            {loading
              ? "Loading..."
              : `${products.length} product${
                  products.length !== 1 ? "s" : ""
                } found`}
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Failed to load products
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
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
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        In Stock: {product.available_quantity}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-orange-500">
                        ₹
                        {product.price_slabs?.[0]?.price_per_bag ||
                          product.base_price}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.weight}
                      </span>
                    </div>

                    {/* Price Slabs Preview */}
                    {product.price_slabs && product.price_slabs.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">
                          Bulk discounts available:
                        </p>
                        <div className="flex space-x-2 text-xs">
                          {product.price_slabs
                            .slice(0, 2)
                            .map((slab, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 px-2 py-1 rounded"
                              >
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
                        disabled={
                          !product.price_slabs ||
                          product.price_slabs.length === 0
                        }
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-4">
                No products found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filter criteria
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    updateURL("", "all");
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;
