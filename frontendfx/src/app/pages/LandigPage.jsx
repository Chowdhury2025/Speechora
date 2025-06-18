import React from 'react';
import { Link } from 'react-router-dom';
import LandingPageNavbar from '../components/home/LandingPageNavbar';
import { ChevronRight, Target, Smile, Users, Gamepad2, Brain, Flame, Smartphone, Apple, Download, Globe } from 'lucide-react';
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


// vidoe/

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-button border-2 border-slate-400 hover:border-primary transition-all duration-200 hover:bg-primary-light group">
    <div className="bg-primary-light p-4 rounded-full mb-4 group-hover:bg-white">
      <Icon size={32} className="text-primary" />
    </div>
    <h3 className="text-xl font-bold text-slate-700 mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

const DownloadButton = ({ icon: Icon, text, href, primary = false }) => (
  <a
    href={href}
    className={`inline-flex items-center justify-center px-6 py-3 border-2 text-base font-bold rounded-2xl transition-all duration-200 w-full sm:w-auto shadow-button hover:shadow-xl transform hover:-translate-y-1 ${
      primary 
        ? 'border-primary bg-primary hover:bg-primary-hover text-white' 
        : 'border-slate-400 bg-white hover:border-primary hover:bg-primary-light text-slate-700'
    }`}
  >
    <Icon className={`mr-3 -ml-1 h-6 w-6 ${primary ? 'text-white' : 'text-primary'}`} />
    {text}
  </a>
);

const FooterLink = ({ href, children }) => (
  <a
    href={href}
    className="text-slate-600 hover:text-primary transition-colors duration-200 text-sm"
  >
    {children}
  </a>
);

const LanguageLink = ({ lang, native }) => (
  <a
    href="#"
    className="text-slate-600 hover:text-primary transition-colors duration-200 text-sm block py-1"
    onClick={(e) => {
      e.preventDefault();
      // Add language change logic here
    }}
  >
    <span className="block">{native}</span>
  </a>
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
                icon={Gamepad2}
                title="Game-like Experience"
                description="Learn through fun challenges, earn points, and track your progress."
              />
              <FeatureCard 
                icon={Brain}
                title="Smart Learning"
                description="Personalized learning path adapts to your style and pace."
              />
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section className="py-16 bg-white w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-primary-light rounded-2xl p-8 sm:p-12">
              <h2 className="text-3xl font-extrabold text-slate-700 mb-4">
                Take your learning anywhere
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Download our mobile app for a seamless learning experience on the go
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <DownloadButton
                  icon={Smartphone}
                  text="Get it on Google Play"
                  href="#"
                  primary
                />
                <DownloadButton
                  icon={Apple}
                  text="Download on App Store"
                  href="https://raw.githubusercontent.com/Jamadrac/book8app/refs/heads/main/build/app/outputs/flutter-apk/app-release.apk"
                />
                <DownloadButton
                  icon={Download}
                  text="Download APK"
                  href="https://raw.githubusercontent.com/Jamadrac/book8app/refs/heads/main/build/app/outputs/flutter-apk/app-release.apk"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Start Learning CTA */}
        <section className="py-16 bg-primary-light w-full">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="relative">
              <img 
                src={appIcon}
                alt="book8 Mascot" 
                className="w-24 h-auto mx-auto mb-6 md:absolute md:-top-20 md:right-0 md:w-32"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-700 mb-8">
              Ready to start your learning journey?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white text-lg font-bold py-4 px-12 rounded-2xl shadow-button hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 uppercase tracking-wider"
              >
                Start Learning Now
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto text-primary hover:text-primary-hover font-bold py-3 px-8 border-2 border-slate-400 hover:border-primary rounded-2xl transition-all duration-200 uppercase tracking-wider text-sm hover:bg-primary-light"
              >
                I have an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Languages Column 1 */}
            <div className="col-span-1">
              <h3 className="flex items-center text-slate-700 font-bold mb-4">
                <Globe className="w-4 h-4 mr-2" />
                Site Languages
              </h3>
              <div className="space-y-1">
                <LanguageLink lang="en" native="English" />
                <LanguageLink lang="es" native="Español" />
                <LanguageLink lang="fr" native="Français" />
              </div>
            </div>

            {/* Languages Column 2 */}
            <div className="col-span-1">
              <h3 className="text-transparent mb-4 select-none">.</h3>
              <div className="space-y-1">
                <LanguageLink lang="de" native="Deutsch" />
                <LanguageLink lang="pt" native="Português" />
                <LanguageLink lang="it" native="Italiano" />
              </div>
            </div>

            {/* Languages Column 3 */}
            <div className="col-span-1">
              <h3 className="text-transparent mb-4 select-none">.</h3>
              <div className="space-y-1">
                <LanguageLink lang="ja" native="日本語" />
                <LanguageLink lang="ko" native="한국어" />
                <LanguageLink lang="zh" native="中文" />
              </div>
            </div>

            {/* Company Links */}
            <div className="col-span-2 lg:col-span-1">
              <h3 className="text-slate-700 font-bold mb-4">Company</h3>
              <div className="grid grid-cols-2 gap-2">
                <FooterLink href="/about">About</FooterLink>
                <FooterLink href="/careers">Careers</FooterLink>
                <FooterLink href="/investors">Investors</FooterLink>
                <FooterLink href="/terms">Terms</FooterLink>
                <FooterLink href="/privacy">Privacy</FooterLink>
                <FooterLink href="/help">Help Center</FooterLink>
              </div>
            </div>

            {/* Logo and Copyright */}
            <div className="col-span-2 lg:col-span-1 flex flex-col items-start justify-between">
              <div className="flex items-center space-x-2 mb-4">
                <img src={appIcon} alt="book8 Logo" className="h-8 w-8" />
                <span className="text-xl font-bold text-primary">book8</span>
              </div>
              <div className="text-slate-600 text-sm">
                © {new Date().getFullYear()} book8. All rights reserved.
              </div>
            </div>
          </div>

          {/* Mobile View - Grid Layout */}
          <div className="mt-8 pt-8 border-t border-slate-200 md:hidden">
            <div className="grid grid-cols-2 gap-4 text-center">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/investors">Investors</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/help">Help Center</FooterLink>
            </div>
            <div className="mt-8 text-center text-slate-600 text-sm">
              © {new Date().getFullYear()} book8. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
