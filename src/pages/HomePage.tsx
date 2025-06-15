import React from 'react';
import BannerSlider from '../components/home/BannerSlider';
import ProductGrid from '../components/home/ProductGrid';
import { Clock, Shield, Truck, MessageCircle } from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Clock,
      title: '1 Hour Dispatch',
      description: 'Lightning fast delivery for instant orders'
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'Premium quality rice, carefully selected'
    },
    {
      icon: Truck,
      title: 'Porter Delivery',
      description: 'Reliable delivery through Porter network'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Support',
      description: '24/7 customer support via WhatsApp'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Banner */}
      <section className="container mx-auto px-4 py-8">
        <BannerSlider />
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Us?</h2>
            <p className="text-gray-600">Experience the best in rice delivery service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <ProductGrid />

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Looking to Buy Rice for Your Business?
          </h2>
          <p className="text-white text-lg mb-8 opacity-90">
            Get expert assistance in choosing the right rice variety and pricing for your wholesale or retail needs.
          </p>
          <a
            href="https://wa.me/+918374237713?text=Hi! I'm interested in buying rice for my business. Please assist."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-white text-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            <MessageCircle size={20} />
            <span>Talk to Sales</span>
          </a>

        </div>
      </section>
    </div>
  );
};

export default HomePage;