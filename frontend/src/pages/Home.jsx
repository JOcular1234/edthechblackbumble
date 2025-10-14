import React from 'react';
import Hero from '../components/herosection/Hero';
import { useProducts } from '../contexts/ProductContext';
import { getActiveCategoriesWithProducts } from '../config/categoryConfig';
import { FaShare, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

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
      text: `Check out this amazing service: ${product.name} - ${product.subtitle}\n\nFeatures:\n${product.features.slice(0, 3).map(f => `• ${f}`).join('\n')}`,
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

  // Render skeleton while loading instead of blocking
  const renderSkeleton = () => (
    <div className="home-page pt-20">
      <Hero />
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Show skeleton loading while data loads
  if (loading) {
    return renderSkeleton();
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <div className="relative h-48 overflow-hidden">
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
                            <span className="text-white/90 text-xl font-bold">From</span>
                            <span className="text-2xl font-extrabold text-white ml-1">{product.currency}{product.price}</span>
                          </div>
                          <p className="text-white/90 text-sm font-medium">{product.billing}</p>
                        </div>
                      </div>
                      
                      <hr className="border-white/30 border mb-4" />
                      
                      {/* Book Now Button */}
                      <Link
                        to={`/checkout/${product._id}`}
                        state={{ service: product }}
                        className="w-full bg-white text-pink-600 py-3 px-4 rounded-lg font-bold text-center hover:bg-gray-100 transition-colors block"
                      >
                        Book Now
                      </Link>
                      
                      {product.note && (
                        <p className="text-white/90 text-xs text-center font-medium mt-2">{product.note}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      ))}


      {/* Why Choose BlackBumble Section */}
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
                  <span className="text-pink-500">BlackBumble Business Packages</span>
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  BlackBumble Business Packages delivers comprehensive digital solutions that transform your business vision into reality. 
                  From stunning graphic design and professional websites to compelling pitch decks and innovative app development, 
                  we provide end-to-end services that elevate your brand and accelerate your growth. Our expert team combines 
                  creativity with technical excellence to deliver results that exceed expectations.
                </p>
              </div>

                          </div>

            {/* Right Stats Grid */}
            <div className="w-full h-full">
             <img src="/writer.jpg" alt="writer" className="w-full h-full object-cover rounded-lg"/>
            </div>
          </div>
        </div>
      </section>

      {/* Need a Website Developer Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl px-8 py-12 lg:px-16 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Need a website developer?
              </h2>
              <p className="text-xl text-pink-100 leading-relaxed">
                Get matched with the right expert to keep building and marketing your project
              </p>
              <Link 
                to="/services?category=websites"
                className="inline-block bg-white text-pink-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-pink-50 transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
              >
                Find an expert
              </Link>
            </div>

            {/* Right Video */}
            <div className="relative">
              <div className="bg-pink-400/30 rounded-2xl backdrop-blur-sm">
                <div className="aspect-video bg-black/20 rounded-xl overflow-hidden shadow-2xl">
                  <video 
                    className="w-full h-full object-cover"
                    autoPlay 
                    muted 
                    loop
                    playsInline
                  >
                    <source src="/websitedevelopment.mp4" type="video/mp4" />
                    {/* Fallback for browsers that don't support video */}
                    <div className="w-full h-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center ">
                      <div className="text-center text-white">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                        </svg>
                        <p className="text-lg font-medium">Demo Video</p>
                      </div>
                    </div>
                  </video>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
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
             
              
              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "BlackBumble transformed our entire digital presence. Their graphic design team created stunning visuals that perfectly captured our brand identity. The results exceeded our expectations!"
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
              
              
              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Outstanding logo design and branding services! They understood our vision perfectly and delivered a brand identity that truly represents our company values. Highly recommended!"
              </p>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(4)].map((_, i) => (
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


          </div>


          {/* Industrial Motion Design Showcase */}
          <section className="mt-16 mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Industrial Motion Design
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience our cutting-edge motion graphics and industrial design capabilities
              </p>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-black">
              {/* Video Container */}
              <div className="relative" style={{ aspectRatio: '21/9' }}>
                <video 
                  src="/industrialmotiondesign.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                
                {/* Play Button Overlay (for visual appeal) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/10">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Bottom Info Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h4 className="font-semibold text-lg">Industrial Motion Graphics</h4>
                    <p className="text-white/80 text-sm">Professional 3D Animation & Design</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/>
                      </svg>
                      <span className="text-xs">HD Quality</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M15.5,8L10,12L15.5,16V8Z"/>
                      </svg>
                      <span className="text-xs">Auto Play</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="text-center mt-8">
              <Link
                to="/services?category=video_creation"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
                </svg>
                Explore Video Services
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">
              Ready to join our satisfied clients?
            </p>
            <Link to="/user/signup"><button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              Start Your Project Today
            </button></Link>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default Home;
