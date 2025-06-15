import { useState, useEffect } from 'react';

const QuantityInput: React.FC = ({ product, quantity, setQuantity, isInStock }) => {
  const [inputValue, setInputValue] = useState(quantity.toString());

  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const handleBlurOrEnter = () => {
    const parsed = parseInt(inputValue);
    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.min(product.available_quantity, Math.max(1, parsed));
      setInputValue(clamped);
      setQuantity(clamped);
    } else {
      setInputValue(quantity.toString()); // reset if invalid
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Quantity (bags)
      </label>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-10 h-10 rounded-lg font-semibold"
          disabled={!isInStock}
        >
          -
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlurOrEnter}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleBlurOrEnter();
            }
          }}
          className="w-20 text-center py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          disabled={!isInStock}
        />
        <button
          onClick={() => setQuantity(Math.min(product.available_quantity, quantity + 1))}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-10 h-10 rounded-lg font-semibold"
          disabled={!isInStock}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default QuantityInput;