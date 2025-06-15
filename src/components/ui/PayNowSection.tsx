import React from 'react';

interface PayNowSectionProps {
  upiUrl: string;
  onPayClick?: () => void;
}

const PayNowSection: React.FC<PayNowSectionProps> = ({ upiUrl, onPayClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6 border border-gray-200 mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800">Confirm & Pay</h2>

      <div className="text-gray-600 text-sm space-y-2">
        <p>✅ Please review your order and complete the payment using the button below.</p>
        <p>⏳ Payments may take a few minutes to reflect after completion.</p>
        <p>🚫 Do not retry if the payment is already completed.</p>
        <p>📞 If the status doesn't update after some time, kindly contact our support team.</p>
      </div>

      <a
        href={upiUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onPayClick}
        className="block text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
      >
        Pay Now
      </a>
    </div>
  );
};

export default PayNowSection;
