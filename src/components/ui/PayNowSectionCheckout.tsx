import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

interface PayNowSectionProps {
  upiUrl: string;
  onPayClick?: () => void; // Optional for custom handling
}

const PayNowSectionCheckout: React.FC<PayNowSectionProps> = ({ upiUrl, onPayClick }) => {
  const navigate = useNavigate();

  const handleDoneClick = () => {
    if (onPayClick) {
      onPayClick();
    } else {
      navigate('/orders');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6 border border-gray-200 mx-auto max-w-2xl">
      <h2 className="text-2xl font-semibold text-gray-800">Order Placed</h2>
      
      <div className="text-gray-600 text-sm space-y-2">
        <p>🧾 Your order has been successfully placed.</p>
        <p>✅ Please complete the payment using the QR code below.</p>
        <p>⏳ Payments may take a few minutes to reflect.</p>
        <p>🚫 If payment is completed, do not retry.</p>
        <p>📞 If status doesn’t update, please contact support.</p>
      </div>

      <div className="flex flex-col items-center space-y-4 bg-gray-50 shadow p-6 rounded-xl max-w-sm mx-auto">
        <h3 className="text-xl font-semibold text-gray-800">Scan to Pay</h3>
        <QRCodeSVG value={upiUrl} size={200} fgColor="#000000" />
        <p className="text-sm text-gray-600 text-center">
          Use any UPI app like PhonePe or GPay to scan and pay.
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleDoneClick}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default PayNowSectionCheckout;
