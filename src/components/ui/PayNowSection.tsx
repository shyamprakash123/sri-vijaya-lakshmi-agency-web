import React from 'react';
import {QRCodeSVG} from 'qrcode.react';

interface PayNowSectionProps {
  upiUrl: string;
  onPayClick?: () => void;
}

const PayNowSection: React.FC<PayNowSectionProps> = ({ upiUrl, onPayClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6 border border-gray-200 mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800">Confirm & Pay</h2>

      <div className="text-gray-600 text-sm space-y-2">
        <p>✅ Please review your order and complete the payment using the QR below.</p>
        <p>⏳ Payments may take a few minutes to reflect after completion.</p>
        <p>🚫 Do not retry if the payment is already completed.</p>
        <p>📞 If the status doesn't update after some time, kindly contact our support team.</p>
      </div>

      <div className="flex flex-col items-center space-y-4 bg-white shadow p-6 rounded-xl max-w-sm mx-auto">
      <h2 className="text-xl font-semibold text-gray-800">Scan to Pay</h2>
      <QRCodeSVG value={upiUrl} size={200} fgColor="#000000" />
      <p className="text-sm text-gray-600 text-center">
        Use any UPI app like PhonePe or GPay to scan and pay.
      </p>
    </div>
    </div>
  );
};

export default PayNowSection;
