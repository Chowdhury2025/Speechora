import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const MobileWarningPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if screen width is mobile-sized (typically under 768px)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on initial render
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Show popup if it's a mobile device
    setIsVisible(window.innerWidth < 768);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const closePopup = () => {
    setIsVisible(false);
  };

  if (!isVisible || !isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 border-2 border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#3C3C3C]">Desktop Recommended</h3>
          <button 
            onClick={closePopup}
            className="text-[#4b4b4b] hover:text-[#3C3C3C] transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-[#4b4b4b] mb-4">
            This application is designed for desktop screens. Some features and layout elements may not work correctly on mobile devices.
          </p>
          <p className="text-[#4b4b4b]">
            For the best experience, please access this application from a desktop or laptop computer.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={closePopup}
            className="bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileWarningPopup;