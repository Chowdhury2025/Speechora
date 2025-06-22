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
    quizTypes: [],
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
       'Activities',
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
      // Ensure quizTypes is always an array
      const data = {
        ...response.data,
        quizTypes: response.data.quizTypes || ['image_quiz'] // Default to image_quiz if not set
      };
      setImageData(data);
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

    try {      // Ensure we have at least one quiz type selected
      if (imageData.quizTypes.length === 0) {
        throw new Error('Please select at least one quiz type');
      }

      // Preserve the original imageUrl and only update other fields
      const { imageUrl, ...updateData } = imageData;
      await axios.put(`${API_URL}/api/quiz-images/${id}`, {
        ...updateData,
        userId: user.userId,
        imageUrl: imageData.imageUrl // Keep the original imageUrl
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
      <div className="bg-white rounded-xl shadow-sm border-2 border-[#e5f5d5] p-6 max-w-2xl mx-auto">        <h2 className="text-2xl font-bold mb-6 text-[#3c9202]">Edit Quiz Image Details</h2>

        <div className="mb-6 p-4 bg-[#e5f5d5] rounded-xl">
          <h3 className="text-lg font-bold text-[#3c9202] mb-2">Note:</h3>
          <p className="text-[#58cc02]">
            You can edit the name, category, age group, and quiz type. 
            To change the image itself, please create a new entry.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">          <div className="mb-8">
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Current Image (Cannot be changed)
            </label>
            <div className="relative">
              <img
                src={imageData.imageUrl}
                alt={imageData.name}
                className="max-w-full h-auto max-h-[300px] object-contain border-2 border-[#e5f5d5] rounded-xl opacity-90"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                }}
              />
              <div className="absolute top-2 right-2 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                Read Only
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              * To change the image, please delete this entry and upload a new one
            </p>
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
          </div>          <div>
            <label className="block text-[#3c9202] text-sm font-bold mb-2">
              Quiz Types *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="quizTypes"
                  value="image_quiz"
                  checked={imageData.quizTypes.includes('image_quiz')}
                  onChange={(e) => {
                    const value = e.target.value;
                    setImageData(prev => ({
                      ...prev,
                      quizTypes: e.target.checked 
                        ? [...prev.quizTypes, value]
                        : prev.quizTypes.filter(type => type !== value)
                    }));
                  }}
                  className="w-4 h-4 text-[#58cc02] border-[#e5f5d5] rounded focus:ring-[#58cc02]"
                />
                <span className="ml-2 text-[#3c9202]">Image Quiz</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="quizTypes"
                  value="true_false"
                  checked={imageData.quizTypes.includes('true_false')}
                  onChange={(e) => {
                    const value = e.target.value;
                    setImageData(prev => ({
                      ...prev,
                      quizTypes: e.target.checked 
                        ? [...prev.quizTypes, value]
                        : prev.quizTypes.filter(type => type !== value)
                    }));
                  }}
                  className="w-4 h-4 text-[#58cc02] border-[#e5f5d5] rounded focus:ring-[#58cc02]"
                />
                <span className="ml-2 text-[#3c9202]">True/False Quiz</span>
              </label>
            </div>
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
