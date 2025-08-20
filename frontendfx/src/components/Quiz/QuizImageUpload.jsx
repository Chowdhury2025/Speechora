import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { r2Service } from '../../config';
import { API_BASE_URL } from '../../config/constants';

const QuizImageUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm();
  const [previewUrl, setPreviewUrl] = useState('');

  const quizTypes = [
    { value: 'true_false', label: 'True/False Quiz' },
    { value: 'image_quiz', label: 'Image Quiz' },
    { value: 'both', label: 'Both' },
  ];

  const ageGroups = [
    '3-5 years',
    '6-8 years',
    '9-11 years',
    '12-14 years',
    '15-17 years',
    '18+ years'
  ];

  const categories = [
    'animals',
    'fruits',
    'vehicles',
    'household',
    'nature',
    'food',
    'shapes',
    'colors',
    'numbers',
    'letters'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Upload image to R2
      const imageFile = data.image[0];
      const imageUrl = await r2Service.uploadFile(imageFile, 'quiz-images');

      // Create quiz image record
      const response = await fetch(`${API_BASE_URL}/api/quiz-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          imageUrl,
          name: data.name,
          category: data.category,
          ageGroup: data.ageGroup,
          quizType: data.quizType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create quiz image');
      }

      setSuccess(true);
      reset();
      setPreviewUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Upload Quiz Image</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            Image uploaded successfully!
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('image', { required: true })}
              onChange={handleImageChange}
              className="mt-1 block w-full"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="mt-2 max-h-48 rounded"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              {...register('name', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              {...register('category', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Age Group
            </label>
            <select
              {...register('ageGroup', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Select age group</option>
              {ageGroups.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quiz Type
            </label>
            <select
              {...register('quizType', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Select quiz type</option>
              {quizTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizImageUpload;
