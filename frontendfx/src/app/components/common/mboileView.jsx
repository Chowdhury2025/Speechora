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
      <div className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Desktop Recommended</h3>
          <button 
            onClick={closePopup}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            This application is designed for desktop screens. Some features and layout elements may not work correctly on mobile devices.
          </p>
          <p className="text-gray-300">
            For the best experience, please access this application from a desktop or laptop computer.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={closePopup}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileWarningPopup;