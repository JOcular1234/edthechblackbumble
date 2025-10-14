import React, { useState, useMemo, useEffect } from 'react';
import { FaShare, FaStar, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { FileSearch } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { getActiveCategoriesWithProducts } from '../config/categoryConfig';

const Services = () => {
  const { products, loading, error } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get all active categories with products dynamically
  const activeCategories = getActiveCategoriesWithProducts(products);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Handle URL parameters for search and category
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [location.search]);
  
  // Filter products based on search and selected categories
  const filteredCategories = useMemo(() => {
    return activeCategories.map(category => {
      // If no categories selected, show all categories
      const shouldShowCategory = selectedCategories.length === 0 || selectedCategories.includes(category.key);
      
      if (!shouldShowCategory) return null;
      
      // Filter products within category by search term
      const filteredProducts = category.products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      return {
        ...category,
        products: filteredProducts,
        productCount: filteredProducts.length
      };
    }).filter(Boolean);
  }, [activeCategories, searchTerm, selectedCategories]);

  // Get all matching products for search results (flat list)
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const allProducts = [];
    filteredCategories.forEach(category => {
      allProducts.push(...category.products);
    });
    
    return allProducts;
  }, [filteredCategories, searchTerm]);
  
  // Handle category filter change
  const handleCategoryChange = (categoryKey) => {
    // If we're in search mode and user selects a category, clear search and show that category
    if (searchTerm.trim()) {
      setSearchTerm('');
      setSelectedCategories([categoryKey]);
      // Update URL to remove search and add category
      navigate(`/services?category=${categoryKey}`);
    } else {
      // Normal category toggle behavior when not searching
      setSelectedCategories(prev => 
        prev.includes(categoryKey)
          ? prev.filter(key => key !== categoryKey)
          : [...prev, categoryKey]
      );
    }
  };

  // Close mobile filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterOpen && !event.target.closest('.mobile-filter-panel') && !event.target.closest('.filter-toggle-btn')) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isFilterOpen]);

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading amazing services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Our Digital <span className="text-yellow-300">Services</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
              Comprehensive digital solutions to transform your business and drive exponential growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl">
                Explore Services
              </button>
              <button className="border-3 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${isFilterOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        {/* Background Overlay */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${isFilterOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`}
          onClick={() => setIsFilterOpen(false)}
        ></div>
        
        {/* Slide-in Panel */}
        <div className={`mobile-filter-panel absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-all duration-500 ease-out ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Panel Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Filters</h3>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="text-gray-500" size={18} />
            </button>
          </div>

          {/* Panel Content */}
          <div className="p-6 overflow-y-auto h-full pb-20">
            {/* Category Filter */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-6">Category</h4>
              <div className="space-y-4">
                {activeCategories.map((category) => (
                  <label key={category.key} className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.key)}
                      onChange={() => handleCategoryChange(category.key)}
                      className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-purple-600 transition-colors font-medium">
                      {category.title}
                    </span>
                    <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {category.productCount}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="mt-8">
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="mx-auto px-6 py-12">
        {/* Mobile Search and Filter */}
        <div className="lg:hidden mb-6">
          <div className="flex gap-3 items-center">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-md"
                />
              </div>
            </div>
            
            {/* Filter Toggle */}
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="filter-toggle-btn flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg text-gray-700 font-medium transition-all flex-shrink-0"
            >
              <FaFilter className="text-purple-600" />
              Filters
              {selectedCategories.length > 0 && (
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full ml-1">
                  {selectedCategories.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filter */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              {/* Search */}
              <div className="mb-8">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Category</h3>
                <div className="space-y-4">
                  {activeCategories.map((category) => (
                    <label key={category.key} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.key)}
                        onChange={() => handleCategoryChange(category.key)}
                        className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-purple-600 transition-colors font-medium">
                        {category.title}
                      </span>
                      <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {category.productCount}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Error Message */}
            {error && (
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading services</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results or Category Sections */}
            {searchTerm.trim() ? (
              /* Search Results View */
              <section className="py-12">
                <div className="max-w-7xl mx-auto px-6">
                  {/* Search Results Header */}
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                      Search Results
                    </h2>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-6">
                      Found {searchResults.length} {searchResults.length === 1 ? 'service' : 'services'} matching "{searchTerm}"
                    </p>
                  </div>

                  {/* Search Results Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {searchResults.length === 0 ? (
                      <div className="col-span-full text-center py-16">
                        <FileSearch className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No services found</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          No services match your search for "{searchTerm}". Try adjusting your search terms or browse our categories.
                        </p>
                      </div>
                    ) : (
                      searchResults.map((product) => (
                        <div 
                          key={product._id} 
                          className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-purple-100 flex flex-col w-full max-w-md mx-auto"
                        >
                          {/* Product Image */}
                          <div className="relative h-[240px] overflow-hidden">
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
                              <h3 className="text-2xl font-extrabold mb-1">{product.name}</h3>
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
                                  <span className="text-2xl font-extrabold text-white ml-1"> {product.currency}{product.price}</span>
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
            ) : (
              /* Category Sections View */
              filteredCategories.map((category, idx) => (
                <section key={category.key} className={`py-20 ${idx % 2 === 0 ? 'bg-gradient-to-br from-blue-50 to-cyan-50' : 'bg-gradient-to-br from-pink-50 to-orange-50'}`}>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                      {category.products.length === 0 ? (
                        <div className="col-span-full text-center py-16">
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">No {category.title} Products Available</h3>
                          <p className="text-gray-600 max-w-md mx-auto">We're currently updating our service offerings. Please check back soon for new {category.title.toLowerCase()} solutions.</p>
                        </div>
                      ) : (
                        category.products.map((product) => (
                          <div 
                            key={product._id} 
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-purple-100 flex flex-col w-full max-w-md md:max-w-md mx-auto lg:mx-0"
                          >
                            {/* Product Image */}
                            <div className="relative h-[240px] overflow-hidden">
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
                                <h3 className="text-2xl font-extrabold mb-1">{product.name}</h3>
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
                                    <span className="text-2xl font-extrabold text-white ml-1"> {product.currency}{product.price}</span>
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of satisfied clients who have elevated their brand with our premium services.
          </p>
          <Link
            to="/user/signup"
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-2xl"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;