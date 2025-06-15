import { useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

interface CancelOrderButtonProps {
  orderId: string;
  onCancel: (orderId: string) => Promise<void>;
}

export default function CancelOrderButton({ orderId, onCancel }: CancelOrderButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onCancel(orderId);
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel order');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div>
      <button
        className="text-red-600 font-semibold hover:underline mt-3"
        onClick={() => setShowConfirm(true)}
      >
        Cancel Order
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm text-center space-y-4">
            <AlertTriangle className="mx-auto text-red-500" size={40} />
            <h3 className="text-lg font-bold text-gray-800">Confirm Cancellation</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
              >
                No, Go Back
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-medium disabled:bg-red-300"
              >
                {loading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
