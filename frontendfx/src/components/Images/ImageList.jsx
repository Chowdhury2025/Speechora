import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL } from '../../config';
import { TabNavigator } from '../../app/components/common/TabNavigator.jsx';

const ImageList = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useRecoilValue(userStates);
  const navigate = useNavigate();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');

  const ageGroups = [
    '3-5 years',
    '6-8 years',
    '9-11 years',
    '12-14 years',
    '15-17 years',
    '18+ years',
  ];

  useEffect(() => {
    fetchImages();
  }, [selectedAgeGroup]);
  const fetchImages = async () => {
    try {
      const url = selectedAgeGroup
        ? `${API_URL}/api/images?ageGroup=${encodeURIComponent(selectedAgeGroup)}`
        : `${API_URL}/api/images`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error loading images');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {    if (!user) {
      alert('Please login to delete images');
      return;
    }

    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`${API_URL}/images/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });      if (!response.ok) throw new Error('Failed to delete image');
      
      alert('Image deleted successfully');
      fetchImages(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting image');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-4">
      <TabNavigator />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Educational Images</h1>
        <div className="flex gap-4">
          <select
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Age Groups</option>
            {ageGroups.map(age => (
              <option key={age} value={age}>{age}</option>
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

      {images.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          {selectedAgeGroup ? 'No images found in this age group' : 'No images available'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 w-full max-w-sm">
              <div className="relative">
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-48 object-cover bg-gray-100"
                  onClick={() => navigate(`/images/${image.id}`)}
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    View Full Image
                  </a>
                  {user && (
                    <>
                      <button
                        onClick={() => navigate(`/images/edit/${image.id}`)}
                        className="inline-flex items-center justify-center w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="inline-flex items-center justify-center w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </>
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

export default ImageList;
