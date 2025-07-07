// PrivacyPolicy.tsx
import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="bg-primary-500 text-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto my-10">
      <h1 className="text-4xl font-bold mb-6 border-b border-accent pb-2">
        Privacy Policy
      </h1>
      <p className="text-gray-100 mb-4">
        At Sri Vijaya Lakshmi Agency, we are committed to protecting your
        privacy. This Privacy Policy outlines how your personal information is
        collected, used, and safeguarded.
      </p>
      <h2 className="text-2xl font-semibold text-accent mb-2">
        Information We Collect
      </h2>
      <p className="text-gray-100 mb-4">
        We collect information you provide directly to us such as name, phone
        number, address, and payment details when placing an order.
      </p>
      <h2 className="text-2xl font-semibold text-accent mb-2">
        How We Use Your Information
      </h2>
      <ul className="list-disc pl-6 text-gray-100 mb-4 space-y-2">
        <li>To process and fulfill your orders</li>
        <li>To communicate about your order and provide customer support</li>
        <li>To improve our website and service experience</li>
      </ul>
      <h2 className="text-2xl font-semibold text-accent mb-2">Data Security</h2>
      <p className="text-gray-100 mb-4">
        We implement appropriate security measures to protect your data from
        unauthorized access, alteration, or disclosure.
      </p>
      <p className="text-gray-100">
        We do not sell or share your personal data with third parties.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
