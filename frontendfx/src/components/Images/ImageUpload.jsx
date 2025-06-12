import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL } from '../../config';
import ImageTabNavigator from '../../app/components/images/ImageTabNavigator';

const ImageUpload = () => {
  const user = useRecoilValue(userStates);
  const navigate = useNavigate();
  const [imageData, setImageData] = useState({
    imageUrl: '',
    title: '',
    category: '',
    description: '',
    ageGroup: '',
    name: user?.username || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const categoryOptions = [
    { name: 'My World & Daily Life', slug: 'my_world_daily_life' },
    { name: 'Home', slug: 'home' },
    { name: 'School', slug: 'school' },
    { name: 'Therapy', slug: 'therapy' },
    { name: 'Activities', slug: 'activities' },
    { name: 'Family & Friends', slug: 'family_friends' },
    { name: 'Toys & Games', slug: 'toys_games' },
    { name: 'Food & Drink', slug: 'food_drink' },
    { name: 'Places', slug: 'places' },
    { name: 'I Want / Needs', slug: 'i_want_needs' },
    { name: 'Actions / Verbs', slug: 'actions_verbs' },
    { name: 'What Questions', slug: 'what_questions' },
    { name: 'Where Questions', slug: 'where_questions' },
    { name: 'Who Questions', slug: 'who_questions' },
    { name: 'When Questions', slug: 'when_questions' },
    { name: 'Why Questions', slug: 'why_questions' },
    { name: 'How Questions', slug: 'how_questions' },
    { name: 'Choice Questions', slug: 'choice_questions' },
    { name: 'Question Starters', slug: 'question_starters' },
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
  }  const handleChange = (e) => {
    const { name, value } = e.target;
    setImageData(prev => ({
      ...prev,
      [name]: value
    }));

    // Additional validation for imageUrl
    if (name === 'imageUrl' && value) {
      // Check if it's a valid ImgBB URL
      if (!value.match(/^https:\/\/i\.ibb\.co\/.*\.(jpg|jpeg|png|gif)$/i)) {
        setError('Please use a direct image link from ImgBB (https://i.ibb.co/...)');
      } else {
        setError(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/images`, imageData, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess(true);
      setImageData(prev => ({
        imageUrl: '',
        title: '',
        category: '',
        description: '',
        ageGroup: '',
        name: prev.name // Preserve the name when resetting
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto p-4">
      <ImageTabNavigator />
      
      <h1 className="text-2xl font-bold text-[#3C3C3C] mb-6">Upload Educational Image</h1>
      
      <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-[#fff0f0] border-2 border-[#ff4b4b] text-[#ff4b4b] px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-[#e5f8d4] border-2 border-[#58cc02] text-[#58cc02] px-4 py-3 rounded-xl">
              <p>Image successfully uploaded by {imageData.name}!</p>
              <p className="text-sm mt-1">You can upload another image or return to the dashboard.</p>
            </div>
          )}          <div className="mb-8 p-4 bg-[#ddf4ff] rounded-xl">
            <h3 className="text-lg font-bold text-[#1cb0f6] mb-2">How to Upload Images:</h3>
            <ol className="list-decimal list-inside space-y-2 text-[#1899d6]">
              <li>Go to <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-[#1cb0f6] underline hover:text-[#0095e0]">ImgBB.com</a></li>
              <li>Click "Start uploading" or drag & drop your image</li>
              <li>After upload, copy the "Direct link" (ending with .jpg, .png, etc.)</li>
              <li>Paste the link in the Image URL field below</li>
            </ol>
          </div>

          <div>
            <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
              Image URL * <span className="text-sm font-normal text-[#4b4b4b]">(Paste ImgBB direct link here)</span>
            </label>
            <input
              type="url"
              name="imageUrl"
              value={imageData.imageUrl}
              onChange={handleChange}
              placeholder="https://i.ibb.co/xxxxx/image.jpg"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              required
            />
            {imageData.imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-[#4b4b4b] mb-2">Image Preview:</p>
                <img
                  src={imageData.imageUrl}
                  alt="Preview"
                  className="max-w-full h-auto max-h-[300px] object-contain border-2 border-slate-200 rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                    e.target.parentElement.querySelector('p').textContent = 'Unable to load image preview. Please check the URL.';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={imageData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={imageData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
              Age Group
            </label>
            <select
              name="ageGroup"
              value={imageData.ageGroup}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium text-[#4b4b4b] bg-white"
            >
              <option value="">Select Age Group</option>
              {ageGroups.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={imageData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
            />
          </div>

          <div>
            <label className="block text-[#3C3C3C] text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={imageData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ImageUpload;
