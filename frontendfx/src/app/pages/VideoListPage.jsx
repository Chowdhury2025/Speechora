import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import {TabNavigator} from '../components/common/TabNavigator.jsx';
import { getThumbnailUrl, getYouTubeVideoTitle } from '../utils/youtube';

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
      
      // Fetch YouTube titles for videos
      const videosWithTitles = await Promise.all(
        response.data.map(async (video) => {
          if (video.linkyoutube_link) {
            const youtubeTitle = await getYouTubeVideoTitle(video.linkyoutube_link);
            return {
              ...video,
              title: youtubeTitle || video.title // Use YouTube title if available, fallback to existing title
            };
          }
          return video;
        })
      );
      
      setVideos(videosWithTitles);
      
      // Extract unique categories from video data
      const uniqueCategories = [...new Set(videosWithTitles.map(video => video.category))].filter(Boolean);
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
        <div className="flex items-center space-x-4">
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
        <a
          href="/app/videos-upload"
          className="bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-2 px-6 rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
        >
          Upload Video
        </a>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          {selectedCategory ? 'No videos found in this category' : 'No videos available'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
          {filteredVideos.map(video => (
            <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 w-full max-w-sm">
              <div className="relative">
                {video.linkyoutube_link && (
                  <img
                    src={getThumbnailUrl(video.linkyoutube_link)}
                    alt={video.title}
                    className="w-full h-48 object-cover bg-gray-100"
                    onError={(e) => {
                      if (e.target.src.includes('maxresdefault')) {
                        e.target.src = getThumbnailUrl(video.linkyoutube_link, 'hqdefault');
                      } else {
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-48 bg-gray-100 flex items-center justify-center">
                            <span class="text-gray-400">No thumbnail available</span>
                          </div>
                        `;
                      }
                    }}
                  />
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg line-clamp-2 flex-1 pr-2">{video.title}</h3>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="mr-3 truncate">By: {video.name}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex-shrink-0">
                    {video.category}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 mb-3">
                  Age Group: {video.ageGroup}
                </div>
                
                {video.description && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {video.description}
                  </p>
                )}
                
                <div className="flex flex-col gap-2">
                  <a
                    href={video.linkyoutube_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12.796V3.204L4.519 8 10 12.796zm.001 2.197c-1.145 0-2-.927-2-2V7.079c0-1.145.855-2 2-2s2 .855 2 2v5.914c0 1.073-.855 2-2 2z" />
                    </svg>
                    Watch Video
                  </a>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="inline-flex items-center justify-center w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoListPage;