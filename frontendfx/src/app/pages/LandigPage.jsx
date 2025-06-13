import React from 'react';
import { Link } from 'react-router-dom';
import LandingPageNavbar from '../components/home/LandingPageNavbar';
import { ChevronRight, Target, Smile, Users, Gamepad2, Brain, Flame } from 'lucide-react';
import DownloadButtons from '../components/home/DownloadButtons';
import appIcon from '../../assets/appIcon-removebg-preview.png'; // Import the image

// Helper component for language buttons
const LanguageButton = ({ lang, flagSrc, altText, href = '/register' }) => (
  <Link
    to={href} // Link to registration or a language-specific page
    className="flex items-center justify-between w-full sm:w-auto text-left px-6 py-4 border-2 border-duo-gray-300 hover:border-duo-green-500 rounded-xl transition-all duration-200 hover:bg-duo-green-500/10 shadow-sm hover:shadow-md group" // Added group for group-hover
  >
    <div className="flex items-center">
      {flagSrc && <img src={flagSrc} alt={altText} className="w-8 h-8 mr-4 rounded-sm" />}
      <span className="text-lg font-bold text-duo-gray-700 group-hover:text-duo-green-600">{lang}</span> {/* Changed text-sky_blue-700 to text-gray-700 */}
    </div>
    <ChevronRight size={24} className="text-duo-gray-400 group-hover:text-duo-green-500" />
  </Link>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingPageNavbar /> {/* Restoring Navbar */}

      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center pt-10 md:pt-16">
      
        {/* Hero Section - Duolingo Style */}
        <section className="py-12 md:py-16 max-w-4xl mx-auto">
          <img 
            src={appIcon} // Use the imported image variable
            alt="book8 Mascot" 
            className="w-32 h-auto mx-auto mb-6 md:w-40" 
          />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-8 leading-tight">
            The free, fun, and effective way to learn!
          </h1>
          
          <div className="mt-8 mb-6 flex justify-center">
            <Link
              to="/register" 
              className="bg-duo-green-500 hover:bg-duo-green-600 text-white text-lg font-bold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-transform duration-150 ease-in-out transform hover:scale-105 uppercase tracking-wider"
            >
              Get started
            </Link>
          </div>
          <div className="flex justify-center">
            <Link
              to="/login" 
              className="text-duo-green-500 hover:text-duo-green-600 font-bold py-3 px-8 border-2 border-duo-gray-300 hover:border-duo-green-400 rounded-xl transition-all duration-200 uppercase tracking-wider text-sm hover:bg-duo-green-500/10"
            >
              I already have an account
            </Link>
          </div>
        </section>

     
        <section className="w-full max-w-xl mx-auto mb-16 pt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">I want to learn...</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           
            <LanguageButton lang="Mathematics" flagSrc="/images/icons/math.svg" altText="Math Icon" />
            <LanguageButton lang="English Language" flagSrc="/images/icons/english.svg" altText="English Icon" />
            <LanguageButton lang="Science" flagSrc="/images/icons/science.svg" altText="Science Icon" />
            <LanguageButton lang="History" flagSrc="/images/icons/history.svg" altText="History Icon" />
       
          </div>
        </section>

        {/* Why you'll love book8 Section - Updated to 2x2 grid */}
        <section className="py-16 md:py-20 bg-duo-gray-200 w-full">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-duo-gray-900 text-center mb-12">
              Why you'll love learning with book8
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="bg-duo-green-100 p-4 rounded-full mb-4">
                  <Target size={32} className="text-duo-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-duo-gray-700 mb-2">Effective and efficient</h3>
                <p className="text-duo-gray-600 text-sm">
                  Our courses are designed to help you learn quickly and retain information effectively.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-duo-green-100 p-4 rounded-full mb-4">
                  <Smile size={32} className="text-duo-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-duo-gray-700 mb-2">Fun and engaging</h3>
                <p className="text-duo-gray-600 text-sm">
                  Learning doesn't have to be boring! Enjoy interactive lessons and gamified experiences.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-duo-green-100 p-4 rounded-full mb-4">
                  <Users size={32} className="text-duo-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-duo-gray-700 mb-2">Personalized for you</h3>
                <p className="text-duo-gray-600 text-sm">
                  Tailor your learning path to your own pace and preferences for a customized education.
                </p>
              </div>
              {/* New items */}
              <div className="flex flex-col items-center text-center">
                <div className="bg-duo-green-100 p-4 rounded-full mb-4">
                  <Gamepad2 size={32} className="text-duo-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-duo-gray-700 mb-2">Stay motivated</h3>
                <p className="text-duo-gray-600 text-sm">
                  Gamified features, points, and virtual rewards make learning addictive and fun.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-duo-green-100 p-4 rounded-full mb-4">
                  <Brain size={32} className="text-duo-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-duo-gray-700 mb-2">Boost your knowledge</h3>
                <p className="text-duo-gray-600 text-sm">
                  Expand your understanding with expertly crafted content across various subjects.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-duo-green-100 p-4 rounded-full mb-4">
                  <Flame size={32} className="text-duo-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-duo-gray-700 mb-2">Build a habit</h3>
                <p className="text-duo-gray-600 text-sm">
                  Track your progress and maintain streaks to make learning a daily part of your life.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Learn on the Go Section */}
        <section className="py-16 md:py-20 w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-duo-gray-900 mb-6">
              Learn with book8 on the go!
            </h2>
            <p className="text-duo-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Take your learning anywhere with our mobile apps. Download now and make progress even when you're offline.
            </p>
            {/* Placeholder for a phone mockup image if you have one */}
            {/* <img src="/images/phone-mockup.png" alt="book8 on Mobile" className="max-w-xs mx-auto mb-8" /> */}
            <DownloadButtons /> {/* Restoring DownloadButtons */}
          </div>
        </section>

      </main>

      <footer className="py-8 text-center border-t border-duo-gray-300 bg-duo-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg font-semibold text-duo-gray-700 mb-4">Site Languages</h3>
            <div className="flex flex-wrap justify-center space-x-2 sm:space-x-3 text-sm text-duo-gray-500 mb-8">
              {/* Placeholder languages - make these actual links or buttons if implementing language switching */}
              <span className="hover:text-duo-green-600 cursor-pointer">English</span>
              <span className="hover:text-duo-green-600 cursor-pointer">Español</span>
              <span className="hover:text-duo-green-600 cursor-pointer">Français</span>
              <span className="hover:text-duo-green-600 cursor-pointer">Deutsch</span>
              <span className="hover:text-duo-green-600 cursor-pointer">Português</span>
              <span className="hover:text-duo-green-600 cursor-pointer">Italiano</span>
              <span className="hover:text-duo-green-600 cursor-pointer">日本語</span>
              <span className="hover:text-duo-green-600 cursor-pointer">한국어</span>
              <span className="hover:text-duo-green-600 cursor-pointer">中文</span>
              {/* Add more languages as needed */}
            </div>
            <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6 mb-6">
                <Link to="/about" className="text-sm text-duo-gray-500 hover:text-duo-green-600">About</Link>
                <Link to="/careers" className="text-sm text-duo-gray-500 hover:text-duo-green-600">Careers</Link>
                <Link to="/investors" className="text-sm text-duo-gray-500 hover:text-duo-green-600">Investors</Link>
                <Link to="/terms" className="text-sm text-duo-gray-500 hover:text-duo-green-600">Terms</Link>
                <Link to="/privacy" className="text-sm text-duo-gray-500 hover:text-duo-green-600">Privacy</Link>
                <Link to="/help" className="text-sm text-duo-gray-500 hover:text-duo-green-600">Help Center</Link>
            </div>
            <p className="text-duo-gray-400 text-xs">
            &copy; {new Date().getFullYear()} book8. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
