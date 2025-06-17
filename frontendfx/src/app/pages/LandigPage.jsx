import React from 'react';
import { Link } from 'react-router-dom';
import LandingPageNavbar from '../components/home/LandingPageNavbar';
import { ChevronRight, Target, Smile, Users, Gamepad2, Brain, Flame } from 'lucide-react';
import DownloadButtons from '../components/home/DownloadButtons';
import appIcon from '../../assets/appIcon-removebg-preview.png';

// Helper component for language buttons
const LanguageButton = ({ lang, flagSrc, altText, href = '/register' }) => (
  <Link
    to={href}
    className="flex items-center justify-between w-full sm:w-auto text-left px-6 py-4 border-2 border-slate-400 hover:border-primary rounded-2xl transition-all duration-200 hover:bg-primary-light shadow-button hover:shadow-md group bg-white"
  >
    <div className="flex items-center">
      {flagSrc && <img src={flagSrc} alt={altText} className="w-8 h-8 mr-4 rounded-sm" />}
      <span className="text-lg font-bold text-slate-700 group-hover:text-primary">{lang}</span>
    </div>
    <ChevronRight size={24} className="text-slate-400 group-hover:text-primary" />
  </Link>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-button border-2 border-slate-400 hover:border-primary transition-all duration-200 hover:bg-primary-light group">
    <div className="bg-primary-light p-4 rounded-full mb-4 group-hover:bg-white">
      <Icon size={32} className="text-primary" />
    </div>
    <h3 className="text-xl font-bold text-slate-700 mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <LandingPageNavbar />

      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center pt-10 md:pt-16">
        {/* Hero Section */}
        <section className="py-12 md:py-16 max-w-4xl mx-auto">
          <div className="relative mb-8">
            <img 
              src={appIcon}
              alt="book8 Mascot" 
              className="w-32 h-auto mx-auto md:w-40 animate-bounce" 
            />
            <div className="absolute -right-4 top-0 bg-secondary text-white px-3 py-1 rounded-full text-sm font-bold transform rotate-12">
              Fun & Free!
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-700 mb-8 leading-tight">
            Learn anything, <span className="text-primary">have fun</span>, repeat!
          </h1>
          
          <div className="mt-8 mb-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register" 
              className="bg-primary hover:bg-primary-hover text-white text-lg font-bold py-4 px-12 rounded-2xl shadow-button hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 uppercase tracking-wider w-full sm:w-auto"
            >
              Get started
            </Link>
            <Link
              to="/login" 
              className="text-primary hover:text-primary-hover font-bold py-3 px-8 border-2 border-slate-400 hover:border-primary rounded-2xl transition-all duration-200 uppercase tracking-wider text-sm hover:bg-primary-light w-full sm:w-auto"
            >
              I already have an account
            </Link>
          </div>
        </section>

        {/* Subject Selection */}
        <section className="w-full max-w-xl mx-auto mb-16 pt-8">
          <h2 className="text-2xl font-bold text-slate-700 mb-6">Choose what to learn:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LanguageButton lang="Mathematics" flagSrc="/images/icons/math.svg" altText="Math Icon" />
            <LanguageButton lang="English Language" flagSrc="/images/icons/english.svg" altText="English Icon" />
            <LanguageButton lang="Science" flagSrc="/images/icons/science.svg" altText="Science Icon" />
            <LanguageButton lang="History" flagSrc="/images/icons/history.svg" altText="History Icon" />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-20 bg-white w-full">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-700 text-center mb-12">
              Why you'll love learning with <span className="text-primary">book8</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Target}
                title="Learn Effectively"
                description="Our bite-sized lessons and proven methods help you learn and retain information better."
              />
              <FeatureCard 
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
