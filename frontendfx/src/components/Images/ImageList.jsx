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

  const handleEditImage = (id) => {
    if (!user) {
      alert('Please login to edit images');
      return;
    }
    navigate(`/app/images/edit/${id}`);
  };

  const handleDeleteImage = async (id) => {    
    if (!user) {
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
      });      
      if (!response.ok) throw new Error('Failed to delete image');
      
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

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#3C3C3C]">Educational  ZZZ Images</h1>
        <div className="flex gap-4">
          <select
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium text-[#4b4b4b] bg-white"
          >
            <option value="">All Age Groups</option>
            {ageGroups.map(age => (
              <option key={age} value={age}>{age}</option>
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

      {images.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-[#4b4b4b]">No images found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
              key={image._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden border-2 border-slate-100 hover:border-[#58cc02] transition-colors duration-200"
            >
              <div className="relative aspect-video">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#3C3C3C] mb-2">{image.title}</h3>
                <p className="text-[#4b4b4b] mb-4">{image.description}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-block bg-[#e5e5e5] text-[#4b4b4b] rounded-full px-3 py-1 text-sm font-medium">
                    {image.ageGroup}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditImage(image._id)}
                      className="text-[#1cb0f6] hover:text-[#0095e0] font-bold py-1 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1cb0f6] focus:ring-offset-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      className="text-[#ff4b4b] hover:text-[#e03232] font-bold py-1 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#ff4b4b] focus:ring-offset-2"
                    >
                      Delete
                    </button>
                  </div>
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
