import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL } from '../../config';
import { r2Service } from '../../config/cloudflare';
import ImageTabNavigator from '../../app/components/images/ImageTabNavigator';

const ImageUpload = () => {
  const user = useRecoilValue(userStates);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageData, setImageData] = useState({
    imageUrl: '',
    title: '',
    category: '',
    description: '',
    ageGroup: '',
    name: user?.username || '',
    position: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const categoryOptions = [
    { name: 'Daily routine', slug: 'my_world_daily_life' },
    { name: 'Home', slug: 'home' },
    { name: 'School', slug: 'school' },
    { name: 'Therapy', slug: 'therapy' },
    { name: 'Activities', slug: 'activities' },
    { name: 'Family & Friends', slug: 'family_friends' },
    { name: 'Toys & Games', slug: 'toys_games' },
    { name: 'Food & Drink', slug: 'food_drink' },
    { name: 'Places', slug: 'places' },
 
    { name: 'Others', slug: 'others' }
  ];

  const ageGroups = [
    '3-5 years',
    '6-8 years',
    '9-11 years',
    '12-14 years',
    '15-17 years',
    '18+ years'
  ];
  // Redirect if not logged in (required for uploading)
  if (!user) {
    alert('Please login to upload images');
    navigate('/login');
    return null;
  }  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        r2Service.validateFile(file, ['image/jpeg', 'image/png', 'image/gif'], 5 * 1024 * 1024);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } catch (error) {
        console.error('File validation error:', error);
        alert(error.message);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setImageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!selectedFile) {
        throw new Error('Please select an image to upload');
      }

      // Upload image to R2
      const imageUrl = await r2Service.uploadFile(selectedFile, 'images');
      setImageData(prev => ({ ...prev, imageUrl }));
      
      // Create image record with R2 URL
      await axios.post(`${API_URL}/api/images`, 
        { ...imageData, imageUrl },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess(true);
      // Reset form
      setImageData(prev => ({
        imageUrl: '',
        title: '',
        category: '',
        description: '',
        ageGroup: '',
        name: prev.name
      }));
      setSelectedFile(null);
      setPreviewUrl('');
      
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <ImageTabNavigator />
      
      <div className="bg-white rounded-xl shadow-sm border-2 border-[#e5f5d5] p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-[#3c9202]">Upload New Image</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-[#e5f5d5] border-l-4 border-[#58cc02] text-[#3c9202] rounded-xl">
            <p>Image successfully uploaded!</p>
            <p className="text-sm mt-1">You can upload another image or return to the image list.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-8 p-4 bg-[#e5f5d5] rounded-xl">
            <h3 className="text-lg font-bold text-[#3c9202] mb-2">How to Upload Images:</h3>
            <ol className="list-decimal list-inside space-y-2 text-[#58cc02]">
              <li>Click the 'Choose File' button or drag & drop your image</li>
              <li>Select a JPEG, PNG, GIF, or WebP image (max 5MB)</li>
              <li>Fill in the image details</li>
              <li>Click 'Upload Image' to submit</li>
            </ol>
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Choose Image * <span className="text-sm font-normal text-[#58cc02]">(JPEG, PNG, GIF, or WebP)</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium text-[#3c9202]"
              required
            />
            {previewUrl && (
              <div className="mt-2">
                <p className="text-sm text-[#58cc02] mb-2">Image Preview:</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto max-h-[300px] object-contain border-2 border-[#e5f5d5] rounded-xl transition-opacity duration-300 ease-in-out opacity-0"
                  onLoad={(e) => e.target.classList.remove('opacity-0')}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={imageData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Category *
            </label>
            <select
              name="category"
              value={imageData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              required
            >
              <option value="">Select a category</option>
              {categoryOptions.map(category => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Age Group *
            </label>
            <select
              name="ageGroup"
              value={imageData.ageGroup}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              required
            >
              <option value="">Select an age group</option>
              {ageGroups.map(age => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Position
            </label>
            <input
              type="number"
              name="position"
              value={imageData.position}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
            />
            <p className="text-sm text-[#58cc02] mt-1">Used for ordering images in a sequence</p>
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={imageData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              placeholder="Add a description of the image..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className={`w-full px-6 py-3 bg-[#58cc02] hover:bg-[#47b102] active:bg-[#3c9202] text-white rounded-xl font-bold transition-colors border-b-2 border-[#3c9202] hover:border-[#2e7502] ${
              (loading || !selectedFile) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ImageUpload;
