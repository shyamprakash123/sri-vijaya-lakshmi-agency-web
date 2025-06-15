// ShippingPolicy.tsx
import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="bg-primary-500 text-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto my-10">
      <h1 className="text-4xl font-bold mb-6 border-b border-accent pb-2">Shipping Policy</h1>
      <p className="text-secondary-100 mb-4">
        Our shipping process is optimized for fast delivery and customer convenience:
      </p>
      <ul className="list-disc pl-6 text-secondary-100 space-y-3 mb-4">
        <li>We dispatch orders within 1 hour after receiving full payment.</li>
        <li>All deliveries are handled via Porter. Delivery charges are not included in the order total.</li>
        <li>Customers are required to pay the delivery fee directly to the Porter upon delivery.</li>
        <li>Delivery may be delayed due to weather conditions, strikes, or unforeseen logistics issues.</li>
      </ul>
      <h2 className="text-2xl font-semibold text-accent mb-2">Pre-Order Shipping</h2>
      <p className="text-secondary-100 mb-4">
        Pre-orders are processed with a 50% advance payment. These orders are dispatched post final payment and are given priority handling. Extra discounts may apply.
      </p>
      <h2 className="text-2xl font-semibold text-accent mb-2">Same-Day Delivery Exceptions</h2>
      <p className="text-secondary-100">
        While we aim for same-day delivery, factors like traffic, weather, or Porter availability may cause delays. We appreciate your patience and will notify you of any changes in delivery status.
      </p>
    </div>
  );
};

export default ShippingPolicy;