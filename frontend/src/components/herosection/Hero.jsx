import React, { useState } from 'react';
import { ArrowRight, Play, CheckCircle, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to services page with search query
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // If empty search, just go to services page
      navigate('/services');
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (

    <>
    <section className="relative min-h-screen bg-white overflow-hidden flex items-center py-16 lg:py-20">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden mt-16">
        <img 
          src="/hero-delivery-CQt0cyfX.jpg" 
          alt="Professional service delivery background" 
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50"></div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none z-10 mt-20">
        <div className="absolute top-20 right-10 w-32 h-32 bg-orange-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-32 left-10 w-24 h-24 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-purple-100 rounded-full opacity-25"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex items-center min-h-[80vh]">
          {/* Main Content */}
          <div className="text-left max-w-4xl space-y-8">
        
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg mb-8">
             Connect with Expert 
Service <br /> Providers
Instantly
            </h1>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for any service..."
                  className="w-full px-6 py-4 pr-16 text-lg rounded-lg border-0 shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-md hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Service Tags */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/services?category=graphic_design">
                <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                  Graphic Design
                    <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              
              <Link to="/services?category=logo_branding">
                <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                  Logo|Branding
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              
              <Link to="/services?category=motion_graphic">
                <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                  Motion Graphic
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              
              <Link to="/services?category=websites">
                <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                  Websites
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link> 
              
              <Link to="/services?category=sponsorship_deck">
                <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                  Sponsorship Deck
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              
              <Link to="/services?category=app_development">
                <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                  App Development|Software
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-8">
              <div className="text-white">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-gray-300">Happy Clients</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-white">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-gray-300">Service Providers</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-white">
                <div className="text-2xl font-bold">4.9★</div>
                <div className="text-sm text-gray-300">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

</>
  );
};

export default Hero;