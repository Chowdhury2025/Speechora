import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL } from '../../config';
import axios from 'axios';

const QuizImageList = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    ageGroup: '',
    quizType: ''
  });

  const user = useRecoilValue(userStates);
  const navigate = useNavigate();

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
    fetchImages();
  }, [filters]);
  const fetchImages = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.ageGroup) queryParams.append('ageGroup', filters.ageGroup);
      if (filters.quizType) queryParams.append('quizTypes', filters.quizType);

      const response = await axios.get(`${API_URL}/api/quiz-images?${queryParams}`);
      // Ensure backward compatibility by converting old quizType to quizTypes array
      const processedImages = response.data.map(image => ({
        ...image,
        quizTypes: image.quizTypes || [image.quizType || 'image_quiz']
      }));
      setImages(processedImages);
    } catch (err) {
      setError(err.message || 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user) {
      alert('Please login to delete images');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this quiz image?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/api/quiz-images/${id}`);
      if (response.status === 204) {
        setImages(prev => prev.filter(image => image.id !== id));
      }
    } catch (err) {
      setError(err.message || 'Failed to delete image');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
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
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#3C3C3C]">Quiz Images</h1>
          {user && (
            <button
              onClick={() => navigate('/app/quiz-images/upload')}
              className="bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502]"
            >
              Upload New Image
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm">
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            name="ageGroup"
            value={filters.ageGroup}
            onChange={handleFilterChange}
            className="px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
          >
            <option value="">All Age Groups</option>
            {ageGroups.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>

          <select
            name="quizType"
            value={filters.quizType}
            onChange={handleFilterChange}
            className="px-4 py-3 border-2 border-[#e5f5d5] rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
          >
            <option value="">All Quiz Types</option>
            <option value="image_quiz">Image Quiz</option>
            <option value="true_false">True/False</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-xl">
          {error}
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-[#4b4b4b]">No quiz images found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map(image => (
            <div
              key={image.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-[#e5f5d5] hover:border-[#58cc02] transition-all duration-200"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={image.imageUrl}
                  alt={image.name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg text-[#3C3C3C] mb-2">{image.name}</h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-[#e5f5d5] text-[#3c9202] px-3 py-1 rounded-full text-sm">
                    {image.category}
                  </span>
                  <span className="bg-[#e5f5d5] text-[#3c9202] px-3 py-1 rounded-full text-sm">
                    {image.ageGroup}
                  </span>                  {image.quizTypes && image.quizTypes.map((type) => (
                    <span key={type} className="bg-[#e5f5d5] text-[#3c9202] px-3 py-1 rounded-full text-sm">
                      {type === 'image_quiz' ? 'Image Quiz' : 'True/False'}
                    </span>
                  ))}
                </div>

                {user && (
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => navigate(`/app/quiz-images/edit/${image.id}`)}
                      className="px-4 py-2 text-[#58cc02] font-bold hover:bg-[#e5f5d5] rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="px-4 py-2 text-[#ff4b4b] font-bold hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizImageList;
