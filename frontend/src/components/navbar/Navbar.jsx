import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Phone, Mail, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const { user, isAuthenticated, signout, loading } = useUserAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/20' 
        : 'bg-black'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">DS</span>
              </div>
              <span className={`font-bold text-xl transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                edthech
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <div key={item.name} className="relative group">
                {item.dropdown ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(index)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-white/10 ${
                        isScrolled ? 'text-gray-700 hover:text-indigo-600' : 'text-white'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                        activeDropdown === index ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/20 backdrop-blur-md transition-all duration-300 ${
                      activeDropdown === index 
                        ? 'opacity-100 visible translate-y-0' 
                        : 'opacity-0 invisible -translate-y-2'
                    }`}>
                      <div className="py-2">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.href}
                            className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-white/10 ${
                      isScrolled ? 'text-gray-700 hover:text-indigo-600' : 'text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Contact Info & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            {!loading && (
              isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-white/10 ${
                      isScrolled ? 'text-gray-700 hover:text-indigo-600' : 'text-white'
                    }`}
                  >
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <span>{user?.firstName}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                      userDropdown ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {/* User Dropdown */}
                  <div className={`absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/20 backdrop-blur-md transition-all duration-300 ${
                    userDropdown 
                      ? 'opacity-100 visible translate-y-0' 
                      : 'opacity-0 invisible -translate-y-2'
                  }`}>
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-200/50">
                        <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/user/dashboard"
                        className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => setUserDropdown(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          signout();
                          setUserDropdown(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/user/signin"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      isScrolled 
                        ? 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/user/signup"
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-2 bg-white/95 backdrop-blur-md rounded-xl mt-2 border border-gray-200/20">
            {navItems.map((item, index) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(index)}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                    >
                      <span className="font-medium">{item.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                        activeDropdown === index ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {activeDropdown === index && (
                      <div className="bg-gray-50 border-t border-gray-200/50">
                        {item.dropdown.map((dropdownItem) => (
                          <a
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block px-8 py-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                            onClick={() => {
                              setIsOpen(false);
                              setActiveDropdown(null);
                            }}
                          >
                            {dropdownItem.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
            
            {/* Mobile Contact & CTA */}
            <div className="px-4 py-3 border-t border-gray-200/50 space-y-3">
              {!loading && (
                isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/user/dashboard"
                      className="flex items-center space-x-2 w-full p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        signout();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full p-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <a href="tel:+1234567890" className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>+1 (234) 567-890</span>
                      </a>
                      <a href="mailto:info@edthech.com" className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>info@edthech.com</span>
                      </a>
                    </div>
                    <div className="space-y-2">
                      <Link
                        to="/user/signin"
                        className="block w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/user/signup"
                        className="block w-full text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 py-3 rounded-lg font-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        Get Started
                      </Link>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
