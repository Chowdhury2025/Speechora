import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import ImageTabNavigator from '../components/Images/ImageTabNavigator';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { useNavigate } from 'react-router-dom';

const ImagesPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const user = useRecoilValue(userStates);
  const navigate = useNavigate();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/images`);
      setImages(response.data);
      
      // Extract unique categories from image data
      const uniqueCategories = [...new Set(response.data.map(image => image.category))].filter(Boolean);
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = selectedCategory
    ? images.filter(image => image.category === selectedCategory)
    : images;
  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDelete = async (id) => {
    if (!user) {
      alert('Please login to delete images');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/images/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      // Remove the deleted image from the state
      setImages(prevImages => prevImages.filter(image => image.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete image');
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
      <ImageTabNavigator />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Educational Images</h1>
        <div className="flex gap-4">
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
          {user && (
            <button
              onClick={() => navigate('/images/upload')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Upload New Image
            </button>
          )}
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          {selectedCategory ? 'No images found in this category' : 'No images available'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
          {filteredImages.map(image => (
            <div key={image.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 w-full max-w-sm">
              <div className="relative">                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-48 object-cover bg-gray-100"
                  onError={(e) => {
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <span class="text-gray-400">Image not available</span>
                      </div>
                    `;
                  }}
                />
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg line-clamp-2 flex-1 pr-2">{image.title}</h3>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="mr-3 truncate">By: {image.name || 'Unknown'}</span>
                  {image.category && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex-shrink-0">
                      {image.category}
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-500 mb-3">
                  Age Group: {image.ageGroup || 'All ages'}
                </div>
                
                {image.description && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {image.description}
                  </p>
                )}
                
                <div className="flex flex-col gap-2">
                  <a
                    href={image.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                  >
                    View Full Image
                  </a>                  {user && (
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="inline-flex items-center justify-center w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagesPage;
