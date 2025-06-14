import React, { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Order } from '../../types';

interface OrderCancellationProps {
  order: Order;
  onCancel: (orderId: string, reason: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const OrderCancellation: React.FC<OrderCancellationProps> = ({
  order,
  onCancel,
  onClose,
  loading = false
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const cancellationReasons = [
    'Changed my mind',
    'Found better price elsewhere',
    'Ordered by mistake',
    'Delivery time too long',
    'Need different quantity',
    'Payment issues',
    'Other'
  ];

  const canCancelOrder = () => {
    // Allow cancellation only if order is pending or prepaid (not dispatched/delivered)
    return ['pending', 'prepaid', 'fully_paid'].includes(order.order_status);
  };

  const handleCancel = async () => {
    if (!selectedReason || !confirmed) return;
    
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    await onCancel(order.id, reason);
  };

  if (!canCancelOrder()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Cannot Cancel Order</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="text-center py-4">
            <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              This order cannot be cancelled as it has already been processed for dispatch.
            </p>
            <p className="text-sm text-gray-500">
              Order Status: <span className="font-medium capitalize">{order.order_status}</span>
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Cancel Order</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={20} className="text-red-500" />
              <p className="text-red-700 font-medium">Are you sure you want to cancel this order?</p>
            </div>
            <p className="text-red-600 text-sm mt-1">
              Order #{order.id} • Total: ₹{order.total_amount}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation *
              </label>
              <div className="space-y-2">
                {cancellationReasons.map((reason) => (
                  <label key={reason} className="flex items-center">
                    <input
                      type="radio"
                      name="cancellationReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mr-2 text-red-500"
                    />
                    <span className="text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Please specify
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Please provide more details..."
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="confirmCancel"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mr-2 text-red-500"
              />
              <label htmlFor="confirmCancel" className="text-sm text-gray-700">
                I understand that this action cannot be undone
              </label>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
          >
            Keep Order
          </button>
          <button
            onClick={handleCancel}
            disabled={!selectedReason || !confirmed || loading || (selectedReason === 'Other' && !customReason.trim())}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <span>Cancel Order</span>
            )}
          </button>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            <strong>Refund Policy:</strong> If payment was made, refund will be processed within 3-5 business days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderCancellation;