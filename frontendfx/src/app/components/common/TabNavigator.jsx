
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const TabNavigator = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current path
  const isListView = !location.pathname.includes('/upload');

  return (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => navigate('/videos')}
        className={`px-6 py-3 font-medium text-sm mr-2 focus:outline-none rounded-t-lg transition-colors ${
          isListView
            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
      >
        Video List
      </button>
      <button
        onClick={() => navigate('/videos/upload')}
        className={`px-6 py-3 font-medium text-sm focus:outline-none rounded-t-lg transition-colors ${
          !isListView
            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
      >
        Upload Video
      </button>
    </div>
  );
};

export default TabNavigator;
