import { Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../../hooks/useToast';

const CartOptions: React.FC = ({ item, updateQuantity, removeFromCart }) => {
    const { success, error } = useToast();
    const [inputValue, setInputValue] = useState(item.quantity.toString());

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        const parsed = parseInt(inputValue);
        if (!isNaN(parsed) && parsed > 0) {
            handelUpdateQuantity(item.product.id, parsed, item.product.available_quantity);
        } else {
            setInputValue(item.quantity.toString()); // Reset to actual quantity on invalid input
        }
    };

    const handelUpdateQuantity = (product_id: string, quantity: number, available_quantity: number) => {
        if (quantity > available_quantity) {
            setInputValue(item.quantity.toString())
            error("Avalable Quantity Exceded");
        }else{
            setInputValue(quantity)
            updateQuantity(product_id, quantity);
        }
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => handelUpdateQuantity(item.product.id, item.quantity - 1, item.product.available_quantity)}
                    className="bg-white hover:bg-gray-100 text-gray-600 w-7 h-7 rounded-full flex items-center justify-center border border-gray-300 transition-colors"
                >
                    <Minus size={12} />
                </button>

                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleInputBlur();
                        }
                    }}
                    className="w-12 text-center text-sm font-medium border border-gray-300 rounded"
                />

                <button
                    onClick={() => handelUpdateQuantity(item.product.id, item.quantity + 1, item.product.available_quantity)}
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
    );
};


export default CartOptions;