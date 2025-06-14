
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const TabNavigator = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current path
  const isListView = !location.pathname.includes('/upload');

  return (    <div className="flex mb-6">
      <button
        onClick={() => navigate('/app/videos')}
        className={`px-6 py-3 font-bold text-sm mr-2 focus:outline-none rounded-t-xl transition-all ${
          isListView
            ? 'text-[#58cc02] border-b-4 border-[#58cc02] bg-[#e5f5d5]'
            : 'text-gray-500 hover:text-[#58cc02] hover:bg-[#e5f5d5] border-b-4 border-transparent'
        }`}
      >
        Video List
      </button>
      <button
        onClick={() => navigate('/app/videos-upload')}
        className={`px-6 py-3 font-bold text-sm focus:outline-none rounded-t-xl transition-all ${
          !isListView
            ? 'text-[#58cc02] border-b-4 border-[#58cc02] bg-[#e5f5d5]'
            : 'text-gray-500 hover:text-[#58cc02] hover:bg-[#e5f5d5] border-b-4 border-transparent'
        }`}
      >
        Upload Video
      </button>
    </div>
  );
};

export default TabNavigator;
