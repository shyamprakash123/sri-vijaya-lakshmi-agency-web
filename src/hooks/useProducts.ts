import { useState, useEffect } from 'react';
import { Product, SearchFilters } from '../types';
import { productService } from '../lib/supabase';

export const useProducts = (filters?: SearchFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await productService.getAll({
          category: filters?.category,
          search: filters?.search
        });

        // Transform the data to match our Product interface
        const transformedProducts: Product[] = data.map(item => ({
          ...item,
          price_slabs: item.price_slabs || []
        }));

        // Apply client-side sorting and filtering
        let filteredProducts = transformedProducts;

        // Price filtering
        if (filters?.minPrice !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.base_price >= filters.minPrice!);
        }
        if (filters?.maxPrice !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.base_price <= filters.maxPrice!);
        }

        // Sorting
        if (filters?.sortBy) {
          filteredProducts.sort((a, b) => {
            switch (filters.sortBy) {
              case 'name':
                return a.name.localeCompare(b.name);
              case 'price-low':
                return a.base_price - b.base_price;
              case 'price-high':
                return b.base_price - a.base_price;
              case 'availability':
                return b.available_quantity - a.available_quantity;
              default:
                return 0;
            }
          });
        }

        setProducts(filteredProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters?.search, filters?.category, filters?.sortBy, filters?.minPrice, filters?.maxPrice]);

  return { products, loading, error, refetch: () => fetchProducts() };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await productService.getById(id);
        setProduct({
          ...data,
          price_slabs: data.price_slabs || []
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};