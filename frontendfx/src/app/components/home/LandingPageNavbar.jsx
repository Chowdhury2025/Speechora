import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import appIcon from '../../../assets/appIcon-removebg-preview.png'; 
import { Menu, X, LogIn, UserPlus, ChevronDown } from 'lucide-react'; // Removed unused imports

const LandingPageNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false); // State for language dropdown

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Placeholder for language change logic
  // const handleLanguageChange = (lang) => {
  //   console.log("Language changed to:", lang);
  //   setIsLanguageDropdownOpen(false);
  // };

  const navItems = [
    // { name: 'Features', path: '#features' }, // Simplified for Duolingo style
    // { name: 'About Us', path: '#about' },
    // { name: 'Contact', path: '#contact' },
  ];

  return (
    <nav className="bg-white text-gray-700 shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / App Name */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img src={appIcon} alt="book8 Logo" className="h-10 w-10" /> {/* Using appIcon.png */}
              <span className="text-2xl font-bold text-kelly-500 hover:text-kelly-600 transition-colors">
                book8
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links & Language Selector */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-kelly-500 transition-colors"
              >
                {item.name}
              </a>
            ))}

            {/* Language Selector - Duolingo Style */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-kelly-500 transition-colors uppercase"
              >
                language: English <ChevronDown size={16} className="ml-1" />
              </button>
              {/* {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  <a href="#" onClick={() => handleLanguageChange('en')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">English</a>
                  <a href="#" onClick={() => handleLanguageChange('es')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Español</a>
                  <a href="#" onClick={() => handleLanguageChange('fr')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Français</a>
                </div>
              )} */}
            </div>

            <Link
              to="/login"
              className="flex items-center text-sm font-bold uppercase text-kelly-500 hover:text-kelly-600 border-2 border-gray-300 hover:border-kelly-400 px-4 py-2 rounded-lg transition-colors"
            >
              {/* <LogIn size={18} className="mr-1.5" /> */}
              I ALREADY HAVE AN ACCOUNT
            </Link>
            {/* <Link
              to="/register"
              className="flex items-center bg-kelly-500 hover:bg-kelly-600 text-white px-4 py-2 rounded-md text-lg font-medium transition-colors"
            >
              <UserPlus size={20} className="mr-2" />
              Sign Up
            </Link> */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-kelly-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-kelly-500"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                onClick={() => setIsOpen(false)} // Close menu on click
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-kelly-600 transition-colors"
              >
                {item.name}
              </a>
            ))}
             <div className="mt-2 px-3 py-2">
                <button
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-kelly-500 transition-colors uppercase w-full text-left"
                >
                    language: English <ChevronDown size={16} className="ml-1" />
                </button>
             </div>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full text-left mt-2 px-3 py-2 rounded-md text-base font-medium text-kelly-500 hover:bg-kelly-50 hover:text-kelly-600 transition-colors border border-gray-300"
            >
              I ALREADY HAVE AN ACCOUNT
            </Link>
            <Link
              to="/register" // This will be the "Get Started" button on the main page
              onClick={() => setIsOpen(false)}
              className="block w-full mt-2 bg-kelly-500 hover:bg-kelly-600 text-white px-3 py-2 rounded-md text-base font-medium transition-colors text-center"
            >
              GET STARTED
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingPageNavbar;
