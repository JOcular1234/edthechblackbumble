import React from 'react';

const About = () => {
  return (
    <div className="about-page pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About edthech
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're passionate about helping businesses succeed in the digital world.
          </p>
        </div>
        
        {/* About content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6">
              To provide world-class digital services that empower businesses to thrive in the modern marketplace. 
              We believe every business deserves access to professional, reliable, and innovative digital solutions.
            </p>
            <p className="text-lg text-gray-600">
              With over 500 satisfied clients and 1000+ successful projects, we've established ourselves as a 
              trusted partner in digital transformation.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-xl text-white">
            <h3 className="text-2xl font-bold mb-6">Why Choose Us?</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>24/7 Professional Support</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Fast Turnaround Times</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Dedicated Account Manager</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>99% Customer Satisfaction</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
