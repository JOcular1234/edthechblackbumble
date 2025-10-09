import React from 'react';
import Hero from '../components/herosection/Hero';
import { useProducts } from '../contexts/ProductContext';
import { getActiveCategoriesWithProducts } from '../config/categoryConfig';
import { FaShare, FaStar } from 'react-icons/fa';

const Home = () => {
  const { products, loading, error } = useProducts();
  
  // Get all active categories with products dynamically
  const activeCategories = getActiveCategoriesWithProducts(products);
  
  // Limit to first 3 categories for home page
  const featuredCategories = activeCategories.slice(0, 3);

  // Share functionality
  const handleShare = async (product) => {
    const productUrl = `${window.location.origin}/services/${product._id}`;
    const shareData = {
      title: product.name,
      text: `Check out this amazing service: ${product.name} - ${product.subtitle}\n\nPrice: ${product.currency}${product.price} ${product.billing}\n\nFeatures:\n${product.features.slice(0, 3).map(f => `• ${f}`).join('\n')}`,
      url: productUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        const shareText = `🌟 ${shareData.title}\n\n${shareData.text}\n\n🔗 ${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        alert(`${product.name} details copied to clipboard!`);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback: Copy product URL only
      try {
        await navigator.clipboard.writeText(productUrl);
        alert(`${product.name} URL copied to clipboard!`);
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  if (loading) {
    return (
      <div className="home-page pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Hero />
      
      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      )}

      {/* Service Categories Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-teal-500 font-medium text-lg mb-4">Service Categories</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Browse Top <span className="text-pink-500 relative">
                Categories
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 2 150 2 198 10" stroke="#ec4899" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h2>
          </div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Virtual Assistant */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Virtual Assistant</h3>
                  <p className="text-gray-500 text-sm">68 Services</p>
                </div>
              </div>
            </div>

            {/* Website Design */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">UI/UX Design</h3>
                  <p className="text-gray-500 text-sm">UI/UX Design</p>
                </div>
              </div>
            </div>

            {/* Mobile Development */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Mobile Apps</h3>
                  <p className="text-gray-500 text-sm">68 Services</p>
                </div>
              </div>
            </div>

            {/* Digital Marketing */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎵</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Digital Marketing</h3>
                  <p className="text-gray-500 text-sm">68 Services</p>
                </div>
              </div>
            </div>

            {/* SEO Services */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">SEO Services</h3>
                  <p className="text-gray-500 text-sm">45 Services</p>
                </div>
              </div>
            </div>

            {/* Business Consulting */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Business Consulting</h3>
                  <p className="text-gray-500 text-sm">68 Services</p>
                </div>
              </div>
            </div>
          </div>

          {/* View All Button */}
          <div className="text-center">
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              View All Categories
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Benefits of choose
              <br />
              our products
            </h2>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Amazing Value */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-600 mb-3">Amazing Value</h3>
                <p className="text-gray-600 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  A sollicitudin libero potenti congue sed interdum at ut.
                </p>
              </div>
            </div>

            {/* Free Delivery */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,7H16V6A4,4 0 0,0 12,2A4,4 0 0,0 8,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M10,6A2,2 0 0,1 12,4A2,2 0 0,1 14,6V7H10V6Z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-600 mb-3">Free Delivery</h3>
                <p className="text-gray-600 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  A sollicitudin libero potenti congue sed interdum at ut.
                </p>
              </div>
            </div>

            {/* Easy Choose */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-600 mb-3">Easy Choose</h3>
                <p className="text-gray-600 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  A sollicitudin libero potenti congue sed interdum at ut.
                </p>
              </div>
            </div>

            {/* Available 24/7 */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-600 mb-3">Available 24/7</h3>
                <p className="text-gray-600 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  A sollicitudin libero potenti congue sed interdum at ut.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Featured Product Sections */}
      {featuredCategories.map((category, sectionIndex) => (
        <section key={category.key} className={`py-20 ${sectionIndex % 2 === 0 ? 'bg-gradient-to-br from-blue-50 to-cyan-50' : 'bg-[gradient-to-br from-pink-50 to-orange-50]'}`}>
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                {category.title}
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-6">
                {category.description}
              </p>
              <div className="inline-flex items-center justify-center px-6 py-3 bg-white rounded-full shadow-lg border-2 border-purple-200">
                <span className="text-base font-bold text-purple-600">
                  {category.productCount} {category.productCount === 1 ? 'Service' : 'Services'} Available
                </span>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {category.products.length === 0 ? (
                <div className="col-span-3 text-center py-16">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No {category.title} Products Available</h3>
                  <p className="text-gray-600 max-w-md mx-auto">We're currently updating our service offerings. Please check back soon for new {category.title.toLowerCase()} solutions.</p>
                </div>
              ) : (
                category.products.map((product) => (
                  <div 
                    key={product._id} 
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-purple-100 flex flex-col h-full"
                  >
                    {/* Product Image */}
                    <div className="relative h-40 overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        </div>
                      )}
                    </div>
                    
                    {/* Content Section */}
                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 flex-grow flex flex-col">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar key={star} className="text-yellow-300 text-sm" />
                        ))}
                        <span className="text-white text-xs ml-2 bg-white/25 px-2 py-1 rounded-full font-bold">
                          5.0 (250)
                        </span>
                      </div>
                      
                      {/* Title and Subtitle */}
                      <div className="mb-4">
                        <h3 className="text-xl font-extrabold mb-1">{product.name}</h3>
                        <p className="text-white/95 text-sm">{product.subtitle}</p>
                      </div>
                      
                      {/* Features */}
                      <div className="flex-grow mb-4">
                        <ul className="space-y-2">
                          {product.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-4 h-4 text-yellow-300 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                              <span className="text-white text-sm font-medium">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Bottom Section */}
                      <div className="flex items-end justify-between mb-3">
                        <div 
                          className="w-10 h-10 bg-white/25 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/35 transition-colors"
                          onClick={() => handleShare(product)}
                          title="Share this service"
                        >
                          <FaShare className="text-white" size={16} />
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-baseline">
                            <span className="text-white/90 text-xl font-bold">{product.currency}</span>
                            <span className="text-3xl font-extrabold text-white ml-1">{product.price}</span>
                          </div>
                          <p className="text-white/90 text-sm font-medium">{product.billing}</p>
                        </div>
                      </div>
                      
                      <hr className="border-white/30 border mb-2" />
                      
                      {product.note && (
                        <p className="text-white/90 text-xs text-center font-medium">{product.note}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      ))}

      {/* Why Choose Edtech Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Section Header */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
                  Why You Should Consider
                  <br />
                  <span className="text-blue-600">Edtech</span>
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Edtech believes in Tech-quity (Tech Equity) for all. This is why we are committed to 
                  intentionally partnering with your company to create a culture of diversity and inclusivity of your 
                  team. Our goal is to create a space for you to leverage our diverse talents in tech & other while you 
                  create impact & equity.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-6">
                {/* Comprehensive Solutions */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Comprehensive Solutions</h3>
                    <p className="text-gray-600">
                      We offer a wide range of services under one roof, meeting all your 
                      business and career needs.
                    </p>
                  </div>
                </div>

                {/* Expertise & Innovation */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Expertise & Innovation</h3>
                    <p className="text-gray-600">
                      Our team of seasoned professionals leverages cutting-edge solutions to 
                      drive your success.
                    </p>
                  </div>
                </div>

                {/* Personalized Approach */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Personalized Approach</h3>
                    <p className="text-gray-600">
                      We tailor our services to your unique needs and provide dedicated 
                      support for optimal outcomes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Happy Clients */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-bl-3xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <div className="pt-4">
                  <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
                  <div className="text-gray-600 text-sm">Happy Clients</div>
                </div>
              </div>

              {/* Customer Satisfaction */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-bl-3xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                  </svg>
                </div>
                <div className="pt-4">
                  <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
                  <div className="text-gray-600 text-sm">Customer Satisfaction</div>
                </div>
              </div>

              {/* Business Transformed */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-bl-3xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                  </svg>
                </div>
                <div className="pt-4">
                  <div className="text-3xl font-bold text-gray-900 mb-2">65+</div>
                  <div className="text-gray-600 text-sm">Business Transformed</div>
                </div>
              </div>

              {/* Team Dedication */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-bl-3xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,4C18.11,4 19.99,5.89 19.99,8C19.99,10.11 18.11,12 16,12C13.89,12 12,10.11 12,8C12,5.89 13.89,4 16,4M24,17V19H16V17C16,14.79 19.58,13 24,13C28.42,13 32,14.79 32,17M8,4C10.11,4 12,5.89 12,8C12,10.11 10.11,12 8,12C5.89,12 4,10.11 4,8C4,5.89 5.89,4 8,4M8,13C12.42,13 16,14.79 16,17V19H0V17C0,14.79 3.58,13 8,13Z"/>
                  </svg>
                </div>
                <div className="pt-4">
                  <div className="text-3xl font-bold text-gray-900 mb-2">100%</div>
                  <div className="text-gray-600 text-sm">Team Dedication</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our <span className="text-blue-600">Clients Say</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our satisfied clients have to say about working with Edtech.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Quote Icon */}
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
                </svg>
              </div>
              
              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Edtech transformed our entire digital presence. Their graphic design team created stunning visuals that perfectly captured our brand identity. The results exceeded our expectations!"
              </p>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                  </svg>
                ))}
              </div>
              
              {/* Client Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  SM
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Mitchell</div>
                  <div className="text-gray-600 text-sm">CEO, TechStart Inc.</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Quote Icon */}
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
                </svg>
              </div>
              
              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The virtual assistant service has been a game-changer for our business. Professional, reliable, and incredibly efficient. We've saved countless hours and improved our productivity significantly."
              </p>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                  </svg>
                ))}
              </div>
              
              {/* Client Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  MJ
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Michael Johnson</div>
                  <div className="text-gray-600 text-sm">Founder, Digital Solutions</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Quote Icon */}
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
                </svg>
              </div>
              
              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Outstanding logo design and branding services! They understood our vision perfectly and delivered a brand identity that truly represents our company values. Highly recommended!"
              </p>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                  </svg>
                ))}
              </div>
              
              {/* Client Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  ER
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Emily Rodriguez</div>
                  <div className="text-gray-600 text-sm">Marketing Director, InnovateCorp</div>
                </div>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Quote Icon */}
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
                </svg>
              </div>
              
              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The mobile app development service was exceptional. They delivered a user-friendly, feature-rich app that our customers love. The project was completed on time and within budget."
              </p>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                  </svg>
                ))}
              </div>
              
              {/* Client Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  DT
                </div>
                <div>
                  <div className="font-semibold text-gray-900">David Thompson</div>
                  <div className="text-gray-600 text-sm">CTO, MobileFirst Ltd.</div>
                </div>
              </div>
            </div>

            {/* Testimonial 5 */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Quote Icon */}
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
                </svg>
              </div>
              
              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Edtech's SEO services boosted our website traffic by 300% in just 6 months. Their strategic approach and attention to detail made all the difference. Incredible results!"
              </p>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                  </svg>
                ))}
              </div>
              
              {/* Client Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  LC
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Lisa Chen</div>
                  <div className="text-gray-600 text-sm">Owner, E-commerce Plus</div>
                </div>
              </div>
            </div>

            {/* Testimonial 6 */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Quote Icon */}
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
                </svg>
              </div>
              
              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The website design service was phenomenal. They created a beautiful, responsive site that perfectly represents our brand. Our online conversions have increased dramatically!"
              </p>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                  </svg>
                ))}
              </div>
              
              {/* Client Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  RW
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Robert Wilson</div>
                  <div className="text-gray-600 text-sm">President, Creative Agency</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">
              Ready to join our satisfied clients?
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              Start Your Project Today
            </button>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default Home;
