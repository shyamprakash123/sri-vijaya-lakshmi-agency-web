// TermsOfService.tsx
import React from 'react';

const TermsOfService = () => {
  return (
    <div className="bg-primary-500 text-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto my-10">
      <h1 className="text-4xl font-bold mb-6 border-b border-accent pb-2">Terms of Service</h1>
      <p className="text-secondary-100 mb-4">
        By accessing or using our services, you agree to be bound by the following terms and conditions:
      </p>
      <ul className="list-disc pl-6 text-secondary-100 space-y-3">
        <li>Orders are dispatched within 1 hour after full payment is received, subject to availability.</li>
        <li>We use Porter for deliveries. Delivery charges are not included in the order and must be paid to the delivery partner upon receipt.</li>
        <li>Pre-orders require a 50% advance payment. These orders are eligible for special discounts and are confirmed only after receiving the initial payment.</li>
        <li>Pre-orders are dispatched only after the remaining balance is paid in full.</li>
        <li>We strive to fulfill same-day delivery, but delays may occur due to transportation or operational issues.</li>
        <li>All transactions are final. Refunds are processed only in case of undeliverable orders or confirmed cancellation.</li>
      </ul>
    </div>
  );
};

export default TermsOfService;