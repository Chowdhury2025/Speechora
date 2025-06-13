import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import ImageTabNavigator from '../components/images/ImageTabNavigator';
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

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#3C3C3C]">Educational Images</h1>
        <div className="flex gap-4">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium text-[#4b4b4b] bg-white"
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
              onClick={() => navigate('/app/images/upload')}
              className="bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
            >
              Upload New Image
            </button>
          )}
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-[#4b4b4b]">
            {selectedCategory ? 'No images found in this category' : 'No images available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
          {filteredImages.map(image => (
            <div key={image.id} className="bg-white rounded-2xl shadow-md overflow-hidden border-2 border-slate-100 hover:border-[#58cc02] transition-all duration-200 w-full max-w-sm">
              <div className="relative">
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-48 bg-slate-100 flex items-center justify-center">
                        <span className="text-[#4b4b4b]">Image not available</span>
                      </div>
                    `;
                  }}
                />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-[#3C3C3C] line-clamp-2 flex-1 pr-2">{image.title}</h3>
                </div>
                
                <div className="flex items-center text-sm text-[#4b4b4b] mb-3">
                  <span className="mr-3 truncate font-medium">By: {image.name || 'Unknown'}</span>
                  {image.category && (
                    <span className="bg-[#e5e5e5] text-[#4b4b4b] px-3 py-1 rounded-full text-sm font-medium">
                      {image.category}
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-[#4b4b4b] mb-3 font-medium">
                  Age Group: {image.ageGroup || 'All ages'}
                </div>
                
                {image.description && (
                  <p className="text-[#4b4b4b] text-sm line-clamp-3 mb-4">
                    {image.description}
                  </p>
                )}
                
                <div className="flex flex-col gap-3">
                  <a
                    href={image.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-[#1cb0f6] hover:bg-[#0095e0] text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 border-b-2 border-[#1899d6] hover:border-[#0076b8] focus:outline-none focus:ring-2 focus:ring-[#1cb0f6] focus:ring-offset-2"
                  >
                    View Full Image
                  </a>
                  {user && (
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="inline-flex items-center justify-center w-full bg-[#ff4b4b] hover:bg-[#e03232] text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 border-b-2 border-[#dc3131] hover:border-[#c01f1f] focus:outline-none focus:ring-2 focus:ring-[#ff4b4b] focus:ring-offset-2"
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
