import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL } from '../../config';
import axios from 'axios';

const QuizImageEdit = () => {
  const { id } = useParams();
  const user = useRecoilValue(userStates);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageData, setImageData] = useState({
    name: '',
    category: '',
    ageGroup: '',
    quizType: '',
    imageUrl: ''
  });

  const categories = [
    'Animals',
    'Plants',
    'Food',
    'Transportation',
    'Objects',
    'Colors',
    'Shapes',
    'Numbers',
    'Letters',
    'Emotions',
    'Weather',
    'Professions',
    'Sports'
  ];

  const ageGroups = [
    '3-5 years',
    '6-8 years',
    '9-11 years',
    '12-14 years',
    '15-17 years'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchImage();
  }, [id]);

  const fetchImage = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/quiz-images/${id}`);
      setImageData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch image');
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
      await axios.put(`${API_URL}/api/quiz-images/${id}`, {
        ...imageData,
        userId: user.userId
      });

      navigate('/app/quiz-images');
    } catch (err) {
      setError(err.message || 'Failed to update image');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#58cc02]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border-2 border-[#e5f5d5] p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-[#3c9202]">Edit Quiz Image</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Current Image
            </label>
            <img
              src={imageData.imageUrl}
              alt={imageData.name}
              className="max-w-full h-auto max-h-[300px] object-contain border-2 border-[#e5f5d5] rounded-xl"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
              }}
            />
          </div>

          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={imageData.name}
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
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
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
              Quiz Type *
            </label>
            <select
              name="quizType"
              value={imageData.quizType}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              required
            >
              <option value="">Select quiz type</option>
              <option value="image_quiz">Image Quiz</option>
              <option value="true_false">True/False</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/app/quiz-images')}
              className="px-6 py-3 border-2 border-[#e5f5d5] text-[#58cc02] rounded-xl font-bold hover:bg-[#e5f5d5] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-[#58cc02] hover:bg-[#47b102] text-white rounded-xl font-bold transition-colors border-b-2 border-[#3c9202] hover:border-[#2e7502] ${
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

export default QuizImageEdit;
