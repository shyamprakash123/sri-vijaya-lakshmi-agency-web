import React, { useState, useEffect } from 'react';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { Product, PriceSlab } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => Promise<void>;
  product?: Product | null;
  loading?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    base_price: '',
    available_quantity: '',
    weight: '',
    category: '',
    is_active: true
  });
  const [priceSlabs, setPriceSlabs] = useState<Omit<PriceSlab, 'id' | 'product_id'>[]>([
    { min_quantity: 1, max_quantity: 5, price_per_bag: 0, label: 'Small (1-5 bags)' },
    { min_quantity: 6, max_quantity: 20, price_per_bag: 0, label: 'Medium (6-20 bags)' },
    { min_quantity: 21, max_quantity: null, price_per_bag: 0, label: 'Bulk (21+ bags)' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        image: product.image,
        base_price: product.base_price.toString(),
        available_quantity: product.available_quantity.toString(),
        weight: product.weight,
        category: product.category,
        is_active: product.is_active
      });
      
      if (product.price_slabs && product.price_slabs.length > 0) {
        setPriceSlabs(product.price_slabs.map(slab => ({
          min_quantity: slab.min_quantity,
          max_quantity: slab.max_quantity,
          price_per_bag: slab.price_per_bag,
          label: slab.label
        })));
      }
    } else {
      setFormData({
        name: '',
        description: '',
        image: '',
        base_price: '',
        available_quantity: '',
        weight: '',
        category: '',
        is_active: true
      });
      setPriceSlabs([
        { min_quantity: 1, max_quantity: 5, price_per_bag: 0, label: 'Small (1-5 bags)' },
        { min_quantity: 6, max_quantity: 20, price_per_bag: 0, label: 'Medium (6-20 bags)' },
        { min_quantity: 21, max_quantity: null, price_per_bag: 0, label: 'Bulk (21+ bags)' }
      ]);
    }
    setErrors({});
  }, [product, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSlabChange = (index: number, field: keyof Omit<PriceSlab, 'id' | 'product_id'>, value: any) => {
    setPriceSlabs(prev => prev.map((slab, i) => 
      i === index ? { ...slab, [field]: value } : slab
    ));
  };

  const addPriceSlab = () => {
    setPriceSlabs(prev => [...prev, {
      min_quantity: 1,
      max_quantity: null,
      price_per_bag: 0,
      label: 'New Slab'
    }]);
  };

  const removePriceSlab = (index: number) => {
    setPriceSlabs(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      newErrors.base_price = 'Valid base price is required';
    }
    if (!formData.available_quantity || parseInt(formData.available_quantity) < 0) {
      newErrors.available_quantity = 'Valid quantity is required';
    }
    if (!formData.weight.trim()) newErrors.weight = 'Weight is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';

    // Validate price slabs
    priceSlabs.forEach((slab, index) => {
      if (!slab.label.trim()) {
        newErrors[`slab_${index}_label`] = 'Label is required';
      }
      if (slab.price_per_bag <= 0) {
        newErrors[`slab_${index}_price`] = 'Valid price is required';
      }
      if (slab.min_quantity <= 0) {
        newErrors[`slab_${index}_min`] = 'Valid minimum quantity is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const productData = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        available_quantity: parseInt(formData.available_quantity),
        price_slabs: priceSlabs
      };

      await onSave(productData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select category</option>
                <option value="basmati">Basmati Rice</option>
                <option value="regular">Regular Rice</option>
                <option value="premium">Premium Rice</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight *
              </label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 25kg bag"
              />
              {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (₹) *
              </label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter base price"
                min="0"
                step="0.01"
              />
              {errors.base_price && <p className="text-red-500 text-sm mt-1">{errors.base_price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Quantity *
              </label>
              <input
                type="number"
                name="available_quantity"
                value={formData.available_quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter quantity"
                min="0"
              />
              {errors.available_quantity && <p className="text-red-500 text-sm mt-1">{errors.available_quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter image URL"
              />
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter product description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Price Slabs</h3>
              <button
                type="button"
                onClick={addPriceSlab}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
              >
                <Plus size={16} />
                <span>Add Slab</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {priceSlabs.map((slab, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                    <input
                      type="text"
                      value={slab.label}
                      onChange={(e) => handleSlabChange(index, 'label', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    {errors[`slab_${index}_label`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`slab_${index}_label`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Min Qty</label>
                    <input
                      type="number"
                      value={slab.min_quantity}
                      onChange={(e) => handleSlabChange(index, 'min_quantity', parseInt(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      min="1"
                    />
                    {errors[`slab_${index}_min`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`slab_${index}_min`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max Qty</label>
                    <input
                      type="number"
                      value={slab.max_quantity || ''}
                      onChange={(e) => handleSlabChange(index, 'max_quantity', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="No limit"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={slab.price_per_bag}
                      onChange={(e) => handleSlabChange(index, 'price_per_bag', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      min="0"
                      step="0.01"
                    />
                    {errors[`slab_${index}_price`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`slab_${index}_price`]}</p>
                    )}
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removePriceSlab(index)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white p-1 rounded text-sm transition-colors"
                      disabled={priceSlabs.length === 1}
                    >
                      <Trash2 size={14} className="mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Product is active
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <span>{product ? 'Update Product' : 'Create Product'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;