import React, { useState, useEffect } from 'react';
import { X, Loader2, Percent, DollarSign } from 'lucide-react';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (couponData: any) => Promise<void>;
  coupon?: any | null;
  loading?: boolean;
}

const CouponModal: React.FC<CouponModalProps> = ({
  isOpen,
  onClose,
  onSave,
  coupon,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_discount: '',
    is_active: true,
    valid_until: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value.toString(),
        min_order_amount: coupon.min_order_amount.toString(),
        max_discount: coupon.max_discount?.toString() || '',
        is_active: coupon.is_active,
        valid_until: coupon.valid_until.split('T')[0] // Format for date input
      });
    } else {
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '',
        max_discount: '',
        is_active: true,
        valid_until: ''
      });
    }
    setErrors({});
  }, [coupon, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    }
    if (formData.code.length < 3) {
      newErrors.code = 'Coupon code must be at least 3 characters';
    }
    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      newErrors.discount_value = 'Valid discount value is required';
    }
    if (formData.discount_type === 'percentage' && parseFloat(formData.discount_value) > 100) {
      newErrors.discount_value = 'Percentage discount cannot exceed 100%';
    }
    if (!formData.min_order_amount || parseFloat(formData.min_order_amount) < 0) {
      newErrors.min_order_amount = 'Valid minimum order amount is required';
    }
    if (!formData.valid_until) {
      newErrors.valid_until = 'Expiry date is required';
    }
    if (formData.valid_until && new Date(formData.valid_until) <= new Date()) {
      newErrors.valid_until = 'Expiry date must be in the future';
    }
    if (formData.max_discount && parseFloat(formData.max_discount) <= 0) {
      newErrors.max_discount = 'Maximum discount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const couponData = {
        ...formData,
        code: formData.code.toUpperCase(),
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: parseFloat(formData.min_order_amount),
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        valid_until: new Date(formData.valid_until).toISOString()
      };

      await onSave(couponData);
      onClose();
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {coupon ? 'Edit Coupon' : 'Create Coupon'}
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
                Coupon Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                placeholder="SAVE20"
                maxLength={20}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.discount_type === 'percentage' ? (
                    <Percent size={16} className="text-gray-400" />
                  ) : (
                    <DollarSign size={16} className="text-gray-400" />
                  )}
                </div>
                <input
                  type="number"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={formData.discount_type === 'percentage' ? '20' : '100'}
                  min="0"
                  max={formData.discount_type === 'percentage' ? '100' : undefined}
                  step="0.01"
                />
              </div>
              {errors.discount_value && <p className="text-red-500 text-sm mt-1">{errors.discount_value}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">₹</span>
                </div>
                <input
                  type="number"
                  name="min_order_amount"
                  value={formData.min_order_amount}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="500"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.min_order_amount && <p className="text-red-500 text-sm mt-1">{errors.min_order_amount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Discount (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">₹</span>
                </div>
                <input
                  type="number"
                  name="max_discount"
                  value={formData.max_discount}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="200"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.max_discount && <p className="text-red-500 text-sm mt-1">{errors.max_discount}</p>}
              <p className="text-gray-500 text-xs mt-1">Only for percentage discounts</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until *
              </label>
              <input
                type="date"
                name="valid_until"
                value={formData.valid_until}
                onChange={handleInputChange}
                min={getMinDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.valid_until && <p className="text-red-500 text-sm mt-1">{errors.valid_until}</p>}
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
              Coupon is active
            </label>
          </div>

          {/* Preview */}
          {formData.code && formData.discount_value && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{formData.code}</p>
                    <p className="text-sm opacity-90">
                      {formData.discount_type === 'percentage' 
                        ? `${formData.discount_value}% OFF` 
                        : `₹${formData.discount_value} OFF`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-75">Min. order ₹{formData.min_order_amount}</p>
                    {formData.max_discount && formData.discount_type === 'percentage' && (
                      <p className="text-xs opacity-75">Max. ₹{formData.max_discount}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                <span>{coupon ? 'Update' : 'Create'} Coupon</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponModal;