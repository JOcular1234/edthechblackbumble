import React from 'react';
import { ArrowRight, Play, CheckCircle, Star } from 'lucide-react';

const Hero = () => {
  return (

    <>
    <section className="relative min-h-screen bg-white overflow-hidden flex items-center py-16 lg:py-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-orange-100 rounded-full opacity-60"></div>
        <div className="absolute bottom-32 left-10 w-24 h-24 bg-blue-100 rounded-full opacity-40"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-purple-100 rounded-full opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Launch your
              <br />
              <span className="text-orange-500">service site</span> in
              <br />
              minutes.
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
              edthech has everything you need to easily{' '}
              <span className="font-semibold text-gray-900">create, launch, and scale</span>{' '}
              services from your own professional business website.
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <button className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3">
                <Star className="w-5 h-5" />
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Right Visual - Service Dashboard Mockup */}
          <div className="relative">
            {/* Main Dashboard Container */}
            <div className="relative bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Browser Header */}
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-4 text-gray-400 text-sm">AwesomeBrand</div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 bg-white">
                {/* Video Section */}
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden mb-6">
                  <div className="aspect-video flex items-center justify-center relative">
                    {/* Fake video thumbnails */}
                    <div className="grid grid-cols-2 gap-2 w-full h-full p-4">
                      <div className="bg-blue-400/30 rounded-lg flex items-center justify-center">
                        <div className="text-white text-xs font-medium">Team Member 1</div>
                      </div>
                      <div className="bg-purple-400/30 rounded-lg flex items-center justify-center">
                        <div className="text-white text-xs font-medium">Team Member 2</div>
                      </div>
                      <div className="bg-indigo-400/30 rounded-lg flex items-center justify-center">
                        <div className="text-white text-xs font-medium">Team Member 3</div>
                      </div>
                      <div className="bg-pink-400/30 rounded-lg flex items-center justify-center">
                        <div className="text-white text-xs font-medium">Team Member 4</div>
                      </div>
                    </div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <Play className="w-8 h-8 text-white fill-current" />
                      </div>
                    </div>
                    
                    {/* Video Title */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg mb-1">Why Choose LifterLMS?</h3>
                    </div>
                  </div>
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-2 left-4 right-4 flex items-center gap-2">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="text-xs">Progress</span>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Progress</h4>
                    <span className="text-sm text-gray-600">Lessons</span>
                  </div>
                  
                  {/* Progress Items */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">INTRODUCTION</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Getting Started</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-400">Advanced Features</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-bounce">
              Live Support
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-pulse">
              24/7 Available
            </div>
            
            <div className="absolute top-1/2 -right-8 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg transform rotate-12">
              Premium Quality
            </div>

            {/* Decorative dots */}
            <div className="absolute -top-8 right-1/4 grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-orange-300 rounded-full opacity-60"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

</>
  );
};

export default Hero;