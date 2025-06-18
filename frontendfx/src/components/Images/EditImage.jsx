import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL } from '../../config';
import ImageTabNavigator from '../../app/components/images/ImageTabNavigator';

const EditImage = () => {
  const { id } = useParams();
  const user = useRecoilValue(userStates);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageData, setImageData] = useState({
    title: '',
    category: '',
    description: '',
    ageGroup: '',
  });

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

  useEffect(() => {
    if (!user) {
      alert('Please login to edit images');
      navigate('/login');
      return;
    }
    fetchImage();
  }, [id]);

  const fetchImage = async () => {
    try {
      const response = await fetch(`${API_URL}/images/${id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const data = await response.json();
      setImageData({
        title: data.title,
        category: data.category,
        description: data.description || '',
        ageGroup: data.ageGroup,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setImageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/images/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(imageData),
      });

      if (!response.ok) throw new Error('Failed to update image');

      alert('Image updated successfully');
      navigate('/app/images');
    } catch (err) {
      setError(err.message);
      setLoading(false);
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
    <div className="container mx-auto px-4 py-8">
      <ImageTabNavigator />
      
      <div className="bg-white rounded-xl shadow-sm border-2 border-[#e5f5d5] p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-[#3c9202]">Edit Image</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/app/images')}
              className="px-6 py-3 border-2 border-[#e5f5d5] text-[#58cc02] rounded-xl font-bold transition-colors hover:bg-[#e5f5d5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-[#58cc02] hover:bg-[#47b102] active:bg-[#3c9202] text-white rounded-xl font-bold transition-colors border-b-2 border-[#3c9202] hover:border-[#2e7502] ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditImage;
