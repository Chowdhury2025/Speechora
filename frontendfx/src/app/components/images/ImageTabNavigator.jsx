import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ImageTabNavigator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = '/app/images';

  // Determine active tab based on current path
  const isListView = !location.pathname.includes('/upload');

  return (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => navigate('/app/images')}
        className={`px-4 py-2 font-bold text-sm rounded-t-lg ${
          isListView
            ? 'text-[#58cc02] border-b-2 border-[#58cc02] bg-[#f7ffec]'
            : 'text-[#4b4b4b] hover:text-[#58cc02] hover:bg-[#f7ffec]'
        }`}
      >
        Image List
      </button>
      <button
        onClick={() => navigate('/app/images/upload')}
        className={`px-4 py-2 font-bold text-sm rounded-t-lg ${
          location.pathname === `${baseUrl}/upload`
            ? 'text-[#58cc02] border-b-2 border-[#58cc02] bg-[#f7ffec]'
            : 'text-[#4b4b4b] hover:text-[#58cc02] hover:bg-[#f7ffec]'
        }`}
      >
        Upload Image
      </button>
    </div>
  );
};

export default ImageTabNavigator;
