import React from 'react';

const Pricing = () => {
  return (
    <div className="pricing-page pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your business needs. No hidden fees, no surprises.
          </p>
        </div>
        
        {/* Pricing content will be added here */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-12 rounded-xl">
            <h2 className="text-3xl font-bold mb-4">Pricing Plans Coming Soon</h2>
            <p className="text-xl opacity-90">
              We're crafting the perfect pricing structure for our services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
