import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { getApiBaseUrl } from '../../config';
import { Trash2 } from 'lucide-react';
import QuizImageTabNavigator from './QuizImageTabNavigator';

const QuizImageManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    quizType: '',
    ageGroup: '',
    category: ''
  });
  const user = useRecoilValue(userStates);
  const API_BASE_URL = getApiBaseUrl();

  useEffect(() => {
    fetchImages();
  }, [filters]);

  const fetchImages = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.quizType) queryParams.append('quizType', filters.quizType);
      if (filters.ageGroup) queryParams.append('ageGroup', filters.ageGroup);
      if (filters.category) queryParams.append('category', filters.category);

      const response = await fetch(`${API_BASE_URL}/api/quiz-images?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      setImages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/quiz-images/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setImages(prevImages => prevImages.filter(image => image.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <QuizImageTabNavigator />
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <select
          name="quizType"
          value={filters.quizType}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Quiz Types</option>
          <option value="TRUE_FALSE">True/False</option>
          <option value="IMAGE_QUIZ">Image Quiz</option>
          <option value="BOTH">Both</option>
        </select>

        <select
          name="ageGroup"
          value={filters.ageGroup}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Age Groups</option>
          <option value="3-5">3-5 years</option>
          <option value="6-8">6-8 years</option>
          <option value="9-12">9-12 years</option>
        </select>

        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          <option value="ANIMALS">Animals</option>
          <option value="PLANTS">Plants</option>
          <option value="NATURE">Nature</option>
          <option value="SCIENCE">Science</option>
          <option value="GENERAL">General</option>
        </select>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div key={image.id} className="border rounded-lg p-4 relative group">
            <img 
              src={image.imageUrl} 
              alt={image.name}
              className="w-full h-48 object-cover rounded mb-2"
            />
            <div className="space-y-1">
              <h3 className="font-semibold">{image.name}</h3>
              <p className="text-sm text-gray-600">Type: {image.quizType}</p>
              <p className="text-sm text-gray-600">Age: {image.ageGroup}</p>
              <p className="text-sm text-gray-600">Category: {image.category}</p>
            </div>
            <button
              onClick={() => handleDelete(image.id)}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No images found matching the selected filters.
        </div>
      )}
    </div>
  );
};

export default QuizImageManagement;
