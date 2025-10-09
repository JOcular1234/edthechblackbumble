import React from 'react';
import { ArrowRight, Play, CheckCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (

    <>
    <section className="relative min-h-screen bg-white overflow-hidden flex items-center py-16 lg:py-20">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden ">
        <video 
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="/Purple and Blue Modern Cyber Security Video (1).mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none z-10 mt-20">
        <div className="absolute top-20 right-10 w-32 h-32 bg-orange-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-32 left-10 w-24 h-24 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-purple-100 rounded-full opacity-25"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 text-orange-300 px-4 py-2 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Trusted by 10,000+ Businesses
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
              Connect with Expert
              <br />
              <span className="text-orange-400">Service Providers</span>
              <br />
              Instantly
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/services">
              <button className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3">
                <Star className="w-5 h-5" />
                Browse Services
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              </Link>
              
              <button className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3">
                <Play className="w-5 h-5" />
                How It Works
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
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

          {/* Right Content */}
          <div className="space-y-8">
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed drop-shadow-md">
              Connect with top-tier professionals and premium services tailored to your needs. From{' '}
              <span className="font-semibold text-white">expert consultations</span> to{' '}
              <span className="font-semibold text-white">custom solutions</span>, we provide everything you need to achieve your goals.
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-1 gap-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-200">Verified Service Providers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-200">24/7 Customer Support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-200">Secure Payment Processing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-200">Quality Guarantee</span>
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