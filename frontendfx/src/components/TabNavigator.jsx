import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const TabNavigator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = '/app/videos';

  // Determine active tab based on current path
  const isListView = !location.pathname.includes('/upload');

  return (
    <div className="border-b border-slate-200 mb-6">
      <button
        onClick={() => navigate('/app/videos')}
        className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors duration-200 ${
          isListView
            ? 'text-[#58cc02] border-b-2 border-[#58cc02] bg-[#f7ffec]'
            : 'text-[#4b4b4b] hover:text-[#58cc02] hover:bg-[#f7ffec]'
        }`}
      >
        Video List
      </button>
      <button
        onClick={() => navigate('/app/app/app/videos-upload')}
        className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors duration-200 ${
          !isListView
            ? 'text-[#58cc02] border-b-2 border-[#58cc02] bg-[#f7ffec]'
            : 'text-[#4b4b4b] hover:text-[#58cc02] hover:bg-[#f7ffec]'
        }`}
      >
        Upload Video
      </button>
    </div>
  );
};

export default TabNavigator;
