import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import {TabNavigator} from '../components/common/TabNavigator.jsx';
import { getThumbnailUrl } from '../utils/youtube';
const VideoListPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/videos`);
      setVideos(response.data);
      
      // Extract unique categories from video data
      const uniqueCategories = [...new Set(response.data.map(video => video.category))].filter(Boolean);
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = selectedCategory
    ? videos.filter(video => video.category === selectedCategory)
    : videos;
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/videos/${id}`);
      // Remove the deleted video from the state
      setVideos(prevVideos => prevVideos.filter(video => video.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete video');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <TabNavigator />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Educational Videos</h1>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          {selectedCategory ? 'No videos found in this category' : 'No videos available'}
        </div>      ) : (        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 justify-items-center">
          {filteredVideos.map(video => (            <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-102" style={{ width: '640px', height: '600px' }}>              {video.linkyoutube_link ? (
                <img
                  src={getThumbnailUrl(video.linkyoutube_link)}
                  alt={video.title}
                  className="w-full h-[300px] object-cover bg-gray-100"
                  style={{ width: '640px', height: '300px' }}
                  onError={(e) => {
                    // If maxresdefault fails, try hqdefault
                    if (e.target.src.includes('maxresdefault')) {
                      e.target.src = getThumbnailUrl(video.linkyoutube_link, 'hqdefault');
                    } else {
                      // If both thumbnails fail, show placeholder
                      e.target.parentElement.innerHTML = `                        <div class="w-full h-[300px] bg-gray-100 flex items-center justify-center">
                          <span class="text-gray-400">No thumbnail available</span>
                        </div>
                      `;
                    }
                  }}
                />              ) : (
                <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No thumbnail available</span>
                </div>
              )}              <div className="p-6 h-[300px] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{video.title}</h3>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete video"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="mr-4">By: {video.name}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {video.category}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Age Group: {video.ageGroup}
                </div>
                {video.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {video.description}
                  </p>
                )}
                <a
                  href={video.linkyoutube_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12.796V3.204L4.519 8 10 12.796zm.001 2.197c-1.145 0-2.072-.927-2.072-2.072V7.079c0-1.145.927-2.072 2.072-2.072 1.145 0 2.072.927 2.072 2.072v5.842c0 1.145-.927 2.072-2.072 2.072z" />
                  </svg>
                  Watch Video
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoListPage;
